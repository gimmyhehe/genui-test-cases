import {
  BaseModelProvider,
  type ChatCompletionRequest,
  type ChatCompletionStreamResponse,
} from '@opentiny/tiny-robot-kit';
import { PatternExtractor, type IChatMessage } from '@opentiny/genui-sdk-core';
import { reactive } from 'vue';

function appendMarkdown(content: string, chatMessage: IChatMessage) {
  const lastMessage = chatMessage.messages[chatMessage.messages.length - 1];
  if (lastMessage?.type === 'markdown') {
    lastMessage.content += content;
  } else {
    chatMessage.messages.push({ type: 'markdown', content });
  }
}

function appendSchemaCard(content: string, chatMessage: IChatMessage) {
  const lastMessage = chatMessage.messages[chatMessage.messages.length - 1];
  if (lastMessage?.type === 'schema-card') {
    lastMessage.content += content;
  } else {
    chatMessage.messages.push({ type: 'schema-card', content });
  }
}

function useSchemaStream() {
  let chatMessageRef: IChatMessage | null = null;

  const patternExtractor = new PatternExtractor({
    onNormalWrite: (value) => {
      if (!chatMessageRef) return;
      chatMessageRef.content += value;
      appendMarkdown(value, chatMessageRef);
    },
    onHandledWrite: (value) => {
      if (!chatMessageRef) return;
      chatMessageRef.content += value;
      appendSchemaCard(value, chatMessageRef);
    },
  });

  const handleSchemaStream = (content: string, chatMessage: IChatMessage) => {
    if (!content || typeof content !== 'string') return;
    chatMessageRef = chatMessage;
    patternExtractor.handleContent(content);
  };

  return { handleSchemaStream };
}

export class CustomModelProvider extends BaseModelProvider {
  constructor(
    private options: {
      url: string;
      apiKey: string;
      systemPrompt: string;
      model?: string;
    },
  ) {
    super({ provider: 'custom' });
  }

  async chatStream(
    request: ChatCompletionRequest,
    handler: {
      onData: (data: ChatCompletionStreamResponse) => void;
      onDone: () => void;
      onError: (error: any) => void;
    },
  ) {
    const { onDone, onData } = handler;
    let response: Response;

    try {
      response = await fetch(this.options.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: this.options.systemPrompt },
            ...request.messages,
          ],
          model: this.options.model ?? 'deepseek-v4-flash',
          thinking: { type: 'disabled' },
          stream: true,
        }),
        signal: request.options?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      onDone({ type: 'error', error } as any);
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    const { handleSchemaStream } = useSchemaStream();

    const chatMessage = reactive<IChatMessage>({
      role: 'assistant',
      content: '',
      messages: [],
    });
    onData(chatMessage as any);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }

          try {
            const chunk = JSON.parse(data);
            const delta = chunk.choices?.[0]?.delta;
            const content = delta?.content;

            if (content) {
              handleSchemaStream(content, chatMessage);
              const lastMessage = chatMessage.messages[chatMessage.messages.length - 1];
              if (lastMessage && lastMessage.type === 'schema-card' && !lastMessage.id) {
                lastMessage.id = Math.random().toString(36).substring(2, 15);
              }
              onData(chatMessage as any);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }

    onDone();
  }
}

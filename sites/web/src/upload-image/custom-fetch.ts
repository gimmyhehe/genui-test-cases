import type { CustomFetch } from '@opentiny/genui-sdk-vue';

function toOpenAIContentPart(part: Record<string, unknown>) {
  if (part?.type === 'image') {
    return {
      type: 'image_url',
      image_url: { url: part.image },
    };
  }
  return part;
}

function transformBody(body: string) {
  const data = JSON.parse(body);
  if (!Array.isArray(data.messages)) return body;

  data.messages = data.messages.map((msg: { content?: unknown }) => {
    if (!Array.isArray(msg.content)) return msg;
    return { ...msg, content: msg.content.map(toOpenAIContentPart) };
  });
  return JSON.stringify(data);
}

export const customFetch: CustomFetch = (url, options) =>
  fetch(url, {
    ...options,
    body: options.body ? transformBody(options.body) : options.body,
  });

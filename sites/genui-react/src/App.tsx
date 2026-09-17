import { useRef, useState, type KeyboardEvent } from 'react';
import { genPrompt } from '@opentiny/genui-sdk-core';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import { materialsMeta } from '@opentiny/genui-sdk-materials-react-antd/meta';
import { fetchSchemaStream } from './fetch-schema-stream';
import './App.css';

const systemPrompt = genPrompt('React', materialsMeta);

function App() {
  const [inputText, setInputText] = useState('');
  const [schema, setSchema] = useState('');
  const [rendererKey, setRendererKey] = useState(0);
  const generatingRef = useRef(false);

  const handleSend = async () => {
    if (!inputText.trim() || generatingRef.current) return;

    const baseURL = import.meta.env.VITE_BASE_URL as string | undefined;
    const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
    const model = (import.meta.env.VITE_MODEL as string | undefined) || 'deepseek-v4-flash';

    if (!baseURL || !apiKey) {
      console.error('请先配置 VITE_BASE_URL 与 VITE_API_KEY（可参考 .env.example）');
      return;
    }

    generatingRef.current = true;
    setSchema('');
    setRendererKey((key) => key + 1);
    const userInput = inputText;
    setInputText('');

    try {
      await fetchSchemaStream(
        userInput,
        (schemaChunk) => {
          setSchema((prev) => prev + schemaChunk);
        },
        { baseURL, apiKey, model, systemPrompt },
      );
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      generatingRef.current = false;
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      void handleSend();
    }
  };

  return (
    <GenuiConfigProvider materials={materials}>
      <div className="demo-container">
        <div className="input-group">
          <input
            value={inputText}
            placeholder="请输入问题..."
            onChange={(event) => setInputText(event.target.value)}
            onKeyUp={handleKeyUp}
          />
          <button type="button" onClick={() => void handleSend()}>
            发送
          </button>
        </div>
        <GenuiRenderer key={rendererKey} content={schema} />
      </div>
    </GenuiConfigProvider>
  );
}

export default App;

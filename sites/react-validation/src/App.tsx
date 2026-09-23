import { useState } from 'react';
import { GenuiConfigProvider, GenuiRenderer } from '@opentiny/genui-sdk-react';
import { materials } from '@opentiny/genui-sdk-materials-react-antd/materials';
import { fetchSchemaStream } from './custom-fetch';
import 'antd/dist/reset.css';

export function App() {
  const [inputText, setInputText] = useState('');
  const [schema, setSchema] = useState('');
  const [generating, setGenerating] = useState(false);

  async function handleSend() {
    if (!inputText.trim() || generating) return;

    setGenerating(true);
    setSchema('');
    const userInput = inputText;
    setInputText('');

    try {
      await fetchSchemaStream('http://localhost:3200/chat/completions', userInput, (schemaChunk) => {
        setSchema((prev) => prev + schemaChunk);
      });
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="demo-container">
      <div className="input-group">
        <input
          value={inputText}
          type="text"
          placeholder="请输入问题..."
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button onClick={handleSend}>发送</button>
      </div>
      <GenuiConfigProvider materials={materials}>
        <GenuiRenderer content={schema} generating={generating} />
      </GenuiConfigProvider>
    </div>
  );
}
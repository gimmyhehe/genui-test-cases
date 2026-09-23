<template>
  <GenuiConfigProvider :materials="materials">
    <div class="demo-container">
      <div class="input-group">
        <input v-model="inputText" placeholder="请输入问题..." @keyup.enter="handleSend" />
        <button @click="handleSend">发送</button>
      </div>
      <GenuiRenderer :content="schema" :key="rendererKey" />
    </div>
    <GenuiLegacyRenderer :content="schema" :key="rendererKey" />
  </GenuiConfigProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { GenuiRenderer, GenuiConfigProvider, GenuiLegacyRenderer } from '@opentiny/genui-sdk-vue';
import { repairJson } from '@opentiny/genui-sdk-core';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';
import { fetchSchemaStream } from './fetch-schema-stream';

const inputText = ref('');
const schema = ref<any>({
  "componentName": "Page",
  "state": {
    "selectValue": "",
    "options": [],
    "loading": false,
    "allOptions": [
      {
        "value": "1",
        "label": "选项1"
      },
      {
        "value": "2",
        "label": "选项2"
      },
      {
        "value": "3",
        "label": "选项3"
      }
    ]
  },
  "lifeCycles": {
    "onMounted": {
      "type": "JSFunction",
      "value": "function () { console.log(123);this.remoteMethod() }"
    }
  },
  "methods": {
    "handleExpandAll": {
      "type": "JSFunction",
      "value": "function handleExpandAll() { console.log('展开全部') }"
    },
    "remoteMethod": {
      "type": "JSFunction",
      "value": "function remoteMethod(query) { if (query !== undefined) { this.state.loading = true; setTimeout(() => { this.state.loading = false; this.state.options = this.state.allOptions.filter((item) => { return item.label.toLowerCase().includes(query.toLowerCase()) }); }, 200); } else { this.state.options = this.state.allOptions; } }"
    }
  },
  "children": [
    {
      "componentName": "TinyCard",
      "children": [
        {
          "componentName": "TinySelect",
          "props": {
            "modelValue": {
              "type": "JSExpression",
              "model": true,
              "value": "this.state.selectValue"
            },
            "placeholder": "请选择",
            "searchable": true,
            "remote": true,
            "options": {
              "type": "JSExpression",
              "value": "this.state.options"
            },
            "loading": {
              "type": "JSExpression",
              "value": "this.state.loading"
            },
            "onRemoteQuery": {
              "type": "JSExpression",
              "value": "this.remoteMethod"
            }
          },
          "children": [
            {
              "componentName": "Template",
              "props": {
                "slot": "footer"
              },
              "children": [
                {
                  "componentName": "div",
                  "props": {
                    "style": "text-align: center; padding: 8px 0; cursor: pointer;"
                  },
                  "children": [
                    {
                      "componentName": "TinyButton",
                      "props": {
                        "text": "展开全部",
                        "type": "text",
                        "onClick": {
                          "type": "JSExpression",
                          "value": "this.handleExpandAll"
                        }
                      },
                      "index": 0,
                      "id": "28a64000ea6e4dfd"
                    }
                  ],
                  "index": 0,
                  "id": "be12180155f148cc"
                }
              ]
            }
          ],
          "index": 0,
          "id": "1e019090e5c54a27"
        }
      ],
      "index": 0,
      "id": "02784db5f951437f"
    }
  ],
  "id": "68b1fd64ae994169"
});
const rendererKey = ref(0);
const generating = ref(false);

const handleSend = async () => {
  if (!inputText.value.trim() || generating.value) return;

  generating.value = true;
  schema.value = '';
  rendererKey.value++;
  const userInput = inputText.value;
  inputText.value = '';

  try {
    await fetchSchemaStream('http://localhost:3100/chat/completions', userInput, (schemaChunk) => {
      schema.value += schemaChunk;
    });
  } catch (error) {
    console.error('请求失败:', error);
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped>
.demo-container {
  padding: 16px;
  box-sizing: border-box;
}

.input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

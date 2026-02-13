<template>
  <div class="demo-container">
    <div class="input-group">
      <input v-model="inputText" placeholder="请输入问题..." @keyup.enter="handleSend" />
      <button @click="handleSend">发送</button>
    </div>
    <genui-renderer :content="schema" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchSchemaStream } from './fetch-schema-stream';
import '../../../../../packages/frameworks/vue/output/web-component/genui-renderer.js';

const inputText = ref('');
const schema = ref<any>({
  'state': {
    'formData': {
      'name': '',
      'email': '',
      'gender': '',
      'department': '',
      'subscribe': false,
      'hobbies': [],
    },
  },
  'methods': {
    'handleSubmit': {
      'type': 'JSFunction',
      'value':
        "function() { this.callAction('saveState', null); this.callAction('continueChat', { message: '表单已提交，数据：' + JSON.stringify(this.state.formData) }); }",
    },
  },
  'componentName': 'Page',
  'props': {
    'style': 'width: 414px; padding: 20px;',
  },
  'children': [
    {
      'componentName': 'TinyCard',
      'children': [
        {
          'componentName': 'h3',
          'props': {},
          'children': '用户信息登记表',
        },
        {
          'componentName': 'TinyForm',
          'props': {
            'model': {
              'type': 'JSExpression',
              'value': 'this.state.formData',
            },
            'label-position': 'top',
          },
          'children': [
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '姓名',
                'prop': 'name',
                'required': true,
              },
              'children': [
                {
                  'componentName': 'TinyInput',
                  'props': {
                    'placeholder': '请输入您的姓名',
                    'modelValue': {
                      'type': 'JSExpression',
                      'model': true,
                      'value': 'this.state.formData.name',
                    },
                  },
                },
              ],
            },
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '电子邮箱',
                'prop': 'email',
                'required': true,
              },
              'children': [
                {
                  'componentName': 'TinyInput',
                  'props': {
                    'placeholder': 'example@domain.com',
                    'modelValue': {
                      'type': 'JSExpression',
                      'model': true,
                      'value': 'this.state.formData.email',
                    },
                  },
                },
              ],
            },
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '性别',
                'prop': 'gender',
              },
              'children': [
                {
                  'componentName': 'TinyRadioGroup',
                  'props': {
                    'options': [
                      {
                        'text': '男',
                        'label': 'male',
                      },
                      {
                        'text': '女',
                        'label': 'female',
                      },
                      {
                        'text': '其他',
                        'label': 'other',
                      },
                    ],
                    'modelValue': {
                      'type': 'JSExpression',
                      'model': true,
                      'value': 'this.state.formData.gender',
                    },
                  },
                },
              ],
            },
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '所属部门',
                'prop': 'department',
              },
              'children': [
                {
                  'componentName': 'TinySelect',
                  'props': {
                    'placeholder': '请选择部门',
                    'modelValue': {
                      'type': 'JSExpression',
                      'model': true,
                      'value': 'this.state.formData.department',
                    },
                    'options': [
                      {
                        'value': 'hr',
                        'label': '人力资源部',
                      },
                      {
                        'value': 'tech',
                        'label': '技术研发部',
                      },
                      {
                        'value': 'sales',
                        'label': '市场营销部',
                      },
                      {
                        'value': 'finance',
                        'label': '财务部',
                      },
                      {
                        'value': 'admin',
                        'label': '行政部',
                      },
                    ],
                  },
                },
              ],
            },
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '兴趣爱好',
                'prop': 'hobbies',
              },
              'children': [
                {
                  'componentName': 'TinyCheckboxGroup',
                  'props': {
                    'modelValue': {
                      'type': 'JSExpression',
                      'model': true,
                      'value': 'this.state.formData.hobbies',
                    },
                    'type': 'checkbox',
                    'options': [
                      {
                        'text': '阅读',
                        'label': 'reading',
                      },
                      {
                        'text': '运动',
                        'label': 'sports',
                      },
                      {
                        'text': '音乐',
                        'label': 'music',
                      },
                      {
                        'text': '旅行',
                        'label': 'travel',
                      },
                      {
                        'text': '美食',
                        'label': 'food',
                      },
                    ],
                  },
                },
              ],
            },
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '订阅通知',
                'prop': 'subscribe',
              },
              'children': [
                {
                  'componentName': 'TinySwitch',
                  'props': {
                    'modelValue': {
                      'type': 'JSExpression',
                      'model': true,
                      'value': 'this.state.formData.subscribe',
                    },
                  },
                },
              ],
            },
            {
              'componentName': 'TinyFormItem',
              'props': {
                'label': '',
              },
              'children': [
                {
                  'componentName': 'TinyButton',
                  'props': {
                    'text': '提交表单',
                    'type': 'primary',
                    'onClick': {
                      'type': 'JSExpression',
                      'value': 'this.handleSubmit',
                    },
                  },
                },
                {
                  'componentName': 'TinyButton',
                  'props': {
                    'text': '重置',
                    'style': 'margin-left: 10px;',
                    'onClick': {
                      'type': 'JSFunction',
                      'value':
                        "function() { this.state.formData = { name: '', email: '', gender: '', department: '', subscribe: false, hobbies: [] }; }",
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
const generating = ref(false);

const handleSend = async () => {
  if (!inputText.value.trim() || generating.value) return;

  generating.value = true;
  schema.value = '';
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

<style>
#app {
  overflow: auto;
}
</style>
<style scoped>
.demo-container {
  padding: 16px;
  box-sizing: border-box;
  height: 200vh;
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

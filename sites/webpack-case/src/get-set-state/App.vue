<template>
  <div class="page">
    <header class="toolbar">
      <h1>GenuiRenderer 的 setState / getState 示例</h1>
      <p class="desc">
        <code>@opentiny/genui-sdk-vue@1.3.2-alpha.1</code> 的
        <code>GenuiRenderer</code> 通过 <code>ref</code> 对外暴露了
        <code>setState</code> / <code>getState</code> / <code>getContext</code> /
        <code>setContext</code> 四个方法。下面是宿主（Vue 组件）侧调用它们的完整用法。
      </p>
      <p class="desc">
        注意：<strong>Schema 内部</strong>没有 <code>this.setState</code>，直接读写
        <code>this.state.xxx</code> 即可；<code>setState</code> / <code>getState</code>
        是给<strong>宿主</strong>用的。
      </p>

      <div class="actions">
        <button type="button" class="btn primary" @click="handleGetState">getState() 读取</button>
        <button type="button" class="btn" @click="handleSetCount">setState({ count })</button>
        <button type="button" class="btn" @click="handleSetUser">setState({ user }) 整体替换</button>
        <button type="button" class="btn" @click="handleSetStatus">setState({ status }) 异步更新</button>
        <button type="button" class="btn" @click="handleMergeAll">setState() 批量合并</button>
        <button type="button" class="btn danger" @click="handleReset">重置 state</button>
      </div>
    </header>

    <section class="panel">
      <div class="panel-head">
        <span>getState() 返回值（快照）</span>
        <span class="hint">每次 setState / getState 后自动刷新</span>
      </div>
      <pre class="snapshot">{{ snapshot }}</pre>
    </section>

    <section class="renderer-wrap">
      <GenuiConfigProvider :materials="materials">
        <GenuiRenderer ref="rendererRef" :content="schema" :generating="false" />
      </GenuiConfigProvider>
    </section>

    <section class="panel">
      <div class="panel-head">
        <span>调用日志</span>
        <button type="button" class="btn small" @click="logs = []">清空</button>
      </div>
      <ul class="logs">
        <li v-for="(log, index) in logs" :key="index">
          <span class="time">{{ log.time }}</span>
          <span class="tag" :class="log.type">{{ log.type }}</span>
          <span class="msg">{{ log.message }}</span>
        </li>
        <li v-if="!logs.length" class="empty">暂无日志，点击上方按钮开始</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { GenuiRenderer, GenuiConfigProvider } from '@opentiny/genui-sdk-vue';
import { materials } from '@opentiny/genui-sdk-materials-vue-opentiny-vue/materials';

const rendererRef = ref(null);
const snapshot = ref('（尚未调用 getState()）');
const logs = ref([]);

/** 初始 state 也可以写在 schema.state 里，渲染器挂载时会自动灌入 */
const schema = {
  componentName: 'Page',
  props: { style: 'display: flex; flex-direction: column; gap: 12px;' },
  state: {
    count: 0,
    keyword: '',
    status: 'idle',
    user: { name: 'Tiny', vip: false },
    history: []
  },
  methods: {
    // Schema 内部：直接改 this.state，没有 this.setState
    addCount: {
      type: 'JSFunction',
      value:
        'function addCount() { this.state.count += 1; this.state.history = [...this.state.history, "Schema 内自增 -> " + this.state.count] }'
    },
    clearKeyword: {
      type: 'JSFunction',
      value: 'function clearKeyword() { this.state.keyword = "" }'
    }
  },
  children: [
    {
      componentName: 'TinyCard',
      props: { title: 'Schema 渲染结果（会跟随 state 实时更新）' },
      children: [
        {
          componentName: 'Text',
          props: {
            text: {
              type: 'JSExpression',
              value:
                '"count = " + this.state.count + " ｜ keyword = " + (this.state.keyword || "（空）") + " ｜ status = " + this.state.status + " ｜ user = " + this.state.user.name + (this.state.user.vip ? "（VIP）" : "")'
            }
          }
        },
        {
          componentName: 'TinyInput',
          props: {
            // model: true 表示双向绑定，输入内容会写回 this.state.keyword
            modelValue: { type: 'JSExpression', model: true, value: 'this.state.keyword' },
            placeholder: '输入后点 getState()，可以看到 state 已同步',
            clearable: true
          }
        },
        {
          componentName: 'div',
          props: { style: 'display: flex; gap: 8px;' },
          children: [
            {
              componentName: 'TinyButton',
              props: {
                text: 'Schema 内 count +1',
                type: 'primary',
                onClick: { type: 'JSExpression', value: 'this.addCount' }
              }
            },
            {
              componentName: 'TinyButton',
              props: {
                text: 'Schema 内清空 keyword',
                onClick: { type: 'JSExpression', value: 'this.clearKeyword' }
              }
            }
          ]
        },
        {
          componentName: 'ul',
          props: { style: 'margin: 0; padding-left: 18px; line-height: 1.9; color: #6b7280;' },
          children: [
            {
              componentName: 'li',
              loop: { type: 'JSExpression', value: 'this.state.history' },
              loopArgs: ['item'],
              children: [{ componentName: 'Text', props: { text: { type: 'JSExpression', value: 'item' } } }]
            }
          ]
        }
      ]
    }
  ]
};

const addLog = (type, message) => {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
    now.getSeconds()
  ).padStart(2, '0')}`;
  logs.value.unshift({ time, type, message });
  if (logs.value.length > 30) logs.value.pop();
};

/** getState() 返回的是渲染器内部的响应式 state 对象，这里做一次深拷贝用于展示 */
const refreshSnapshot = () => {
  const state = rendererRef.value?.getState();
  if (!state) {
    snapshot.value = '（渲染器尚未挂载完成，请稍后再试）';
    return null;
  }
  snapshot.value = JSON.stringify(state, null, 2);
  return state;
};

const handleGetState = () => {
  const state = refreshSnapshot();
  if (state) addLog('get', `getState() -> ${JSON.stringify(state)}`);
};

/** setState 是「浅合并」：只传需要改的字段，其余字段保持不变 */
const handleSetCount = () => {
  const current = rendererRef.value?.getState()?.count ?? 0;
  rendererRef.value?.setState({ count: current + 10 });
  refreshSnapshot();
  addLog('set', `setState({ count: ${current + 10} })`);
};

/** 传入对象/数组时会整体替换该字段 */
const handleSetUser = () => {
  const vip = !(rendererRef.value?.getState()?.user?.vip ?? false);
  rendererRef.value?.setState({ user: { name: vip ? 'GenUI' : 'Tiny', vip } });
  refreshSnapshot();
  addLog('set', `setState({ user: { name: '${vip ? 'GenUI' : 'Tiny'}', vip: ${vip} } })`);
};

/** setState 后可以配合异步逻辑，界面会跟着 state 自动重渲染 */
const handleSetStatus = () => {
  rendererRef.value?.setState({ status: 'loading' });
  refreshSnapshot();
  addLog('set', "setState({ status: 'loading' })");
  window.setTimeout(() => {
    rendererRef.value?.setState({ status: 'done' });
    refreshSnapshot();
    addLog('set', "setState({ status: 'done' }) · 800ms 后");
  }, 800);
};

/** 一次传多个字段，等价于浅合并多个 key */
const handleMergeAll = () => {
  const count = (rendererRef.value?.getState()?.count ?? 0) + 1;
  rendererRef.value?.setState({
    count,
    keyword: `host-${count}`,
    user: { name: 'Host', vip: true }
  });
  refreshSnapshot();
  addLog('set', `setState({ count: ${count}, keyword: 'host-${count}', user: {...} })`);
};

const handleReset = () => {
  rendererRef.value?.setState({
    count: 0,
    keyword: '',
    status: 'idle',
    user: { name: 'Tiny', vip: false },
    history: []
  });
  refreshSnapshot();
  addLog('set', 'setState(初始值) 重置');
};
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f8fa;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #1f2329;
}

.toolbar h1 {
  margin: 0 0 8px;
  font-size: 20px;
}

.desc {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #4e5969;
}

.desc code {
  padding: 1px 5px;
  border-radius: 4px;
  background: #eef0f4;
  font-size: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid #d0d3d9;
  border-radius: 6px;
  background: #fff;
  color: #1f2329;
  font-size: 13px;
  cursor: pointer;
}

.btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn.primary {
  border-color: #1890ff;
  background: #1890ff;
  color: #fff;
}

.btn.primary:hover {
  background: #0f7ae5;
  color: #fff;
}

.btn.danger {
  border-color: #f5222d;
  color: #f5222d;
}

.btn.small {
  padding: 2px 10px;
  font-size: 12px;
}

.panel {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f0f1f3;
  font-size: 13px;
  font-weight: 600;
}

.hint {
  font-weight: 400;
  color: #86909c;
  font-size: 12px;
}

.snapshot {
  margin: 0;
  padding: 12px 14px;
  max-height: 220px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  color: #0e7a3c;
  background: #fbfcfd;
}

.renderer-wrap {
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.logs {
  margin: 0;
  padding: 8px 14px 12px;
  list-style: none;
  max-height: 200px;
  overflow: auto;
  font-size: 12px;
}

.logs li {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  line-height: 1.6;
  border-bottom: 1px dashed #f2f3f5;
}

.logs li.empty {
  color: #86909c;
}

.time {
  flex: none;
  color: #86909c;
}

.tag {
  flex: none;
  width: 34px;
  text-align: center;
  border-radius: 3px;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
}

.tag.get {
  background: #1890ff;
}

.tag.set {
  background: #00b42a;
}

.msg {
  word-break: break-all;
  color: #4e5969;
}
</style>

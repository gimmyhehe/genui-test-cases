<script setup lang="ts">
import { ref } from 'vue';
import {
  TinyButton,
  TinyCard,
  TinyGrid,
  TinyGridColumn,
} from '@opentiny/vue';

interface FmeaItem {
  id: string;
  mode: string;
  description: string;
  source: string;
}

const fmeaList = ref<FmeaItem[]>([
  { id: '1', mode: '电源失效', description: '电源模块无法正常供电', source: '历史故障库' },
  { id: '2', mode: '传感器漂移', description: '温度传感器读数偏差超过阈值', source: '供应商手册' },
  { id: '3', mode: '通信中断', description: 'CAN总线通信超时', source: '测试报告' },
]);

const selectedList = ref<FmeaItem[]>([]);

const handleSelectionChange = (selection: any) => {
  console.log(selection);
  selectedList.value = selection;
};

const handleConfirm = () => {
  if (selectedList.value.length === 0) return;
  console.log('[saveState]');
  console.log(
    '[continueChat]',
    `已选择以下FMEA故障模式进行汇总：${selectedList.value.map((item) => item.mode).join('、')}`,
  );
};
</script>

<template>
  <div class="page">
    <tiny-card class="card">
      <h3>FMEA故障模式选择</h3>
      <p class="desc">请勾选需要汇总的故障模式，点击确认后将显示汇总结果。</p>

      <tiny-grid :data="fmeaList" :select-config="{ checkMethod: handleSelectionChange }">
        <tiny-grid-column type="selection" width="60" />
        <tiny-grid-column field="mode" title="FMEA故障模式" width="200" />
        <tiny-grid-column field="description" title="描述说明" width="300" />
        <tiny-grid-column field="source" title="参考来源" width="200" />
      </tiny-grid>

      <tiny-button type="primary" class="confirm-btn" @click="handleConfirm">
        确认汇总
      </tiny-button>
    </tiny-card>

    <tiny-card v-if="selectedList.length > 0" class="card summary-card">
      <h3>已选故障模式</h3>
      <ul>
        <li v-for="item in selectedList" :key="item.id">
          {{ item.mode }} — {{ item.description }}
        </li>
      </ul>
    </tiny-card>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f7fa;
}

.card {
  margin-bottom: 16px;
}

h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.desc {
  margin: 0 0 16px;
  color: #595959;
  font-size: 14px;
}

.confirm-btn {
  margin-top: 16px;
}

.summary-card ul {
  margin: 0;
  padding-left: 20px;
  color: #262626;
  line-height: 1.8;
}
</style>

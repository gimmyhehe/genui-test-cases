<template>
    <div>
      <tiny-card>
        <h3>数据图表展示</h3>
        <tiny-huicharts-histogram
          :options="{
            theme: 'hdesign-light',
            padding: [50, 30, 50, 20],
            data: [
              { Month: 'Jan', Domestic: 33, Abroad: 1 },
              { Month: 'Feb', Domestic: 27, Abroad: 39 },
              { Month: 'Mar', Domestic: 31, Abroad: 20 },
              { Month: 'Apr', Domestic: 30, Abroad: 15 },
              { Month: 'May', Domestic: 37, Abroad: 1 },
              { Month: 'Jun', Domestic: 36, Abroad: 17 },
              { Month: 'Jul', Domestic: 42, Abroad: 22 },
              { Month: 'Aug', Domestic: 22, Abroad: 12 },
              { Month: 'Sep', Domestic: 17, Abroad: 30 },
              { Month: 'Oct', Domestic: 40, Abroad: 33 },
              { Month: 'Nov', Domestic: 42, Abroad: 22 },
              { Month: 'Dec', Domestic: 32, Abroad: 1 }
            ],
            xAxis: { data: 'Month' },
            yAxis: { name: 'Percentage(%)' }
          }"
        ></tiny-huicharts-histogram>
      </tiny-card>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  import { TinyHuichartsHistogram } from '@opentiny/vue-huicharts'
  import { TinyCard } from '@opentiny/vue'
  
  const state = reactive({})
  </script>
  
  <style scoped></style>
  
const dataDashBoard = {
    "componentName": "Page",
    "css": ".page-base-style{position:relative;min-height:100vh;padding:24px;color:#e6f7ff;font-family:Inter,\"PingFang SC\",\"Microsoft YaHei\",Arial,sans-serif;background:radial-gradient(1200px 600px at 20% 0%, rgba(0,255,209,.16), transparent 55%),radial-gradient(900px 500px at 95% 20%, rgba(64,169,255,.18), transparent 60%),linear-gradient(135deg,#071325 0%,#0a1f3d 45%,#071325 100%);} .page-base-style:before{content:\"\";position:absolute;inset:0;pointer-events:none;opacity:.22;background-image:linear-gradient(rgba(64,169,255,.12) 1px, transparent 1px),linear-gradient(90deg, rgba(64,169,255,.12) 1px, transparent 1px);background-size:36px 36px;mask-image:radial-gradient(900px 520px at 50% 15%, rgba(0,0,0,1), rgba(0,0,0,0));} .page-title{position:relative;letter-spacing:.10em;text-align:center;margin:0 0 28px;font-weight:800;font-size:22px;background:linear-gradient(90deg,#e6f7ff 0%,#a5e7ff 35%,#00ffd1 70%,#40a9ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 22px rgba(0,255,209,.16),0 0 34px rgba(64,169,255,.14);filter: drop-shadow(0 0 8px rgba(64,169,255,.12));} .tech-card{position:relative;border-radius:14px;padding:18px 18px 14px;background:linear-gradient(180deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.05) 100%);border:1px solid rgba(64,169,255,.18);backdrop-filter: blur(10px);-webkit-backdrop-filter: blur(10px);box-shadow:0 10px 30px rgba(0,0,0,.34), inset 0 0 0 1px rgba(0,255,209,.06);} .tech-card:before{content:\"\";position:absolute;inset:-1px;border-radius:14px;pointer-events:none;background:linear-gradient(135deg, rgba(0,255,209,.45), rgba(64,169,255,0) 40%, rgba(114,46,209,.28));opacity:.28;filter: blur(10px);} .card-title{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:14px;font-weight:800;letter-spacing:.08em;color:#bfefff;text-transform:uppercase;} .card-title span:last-child{background:linear-gradient(90deg, rgba(230,247,255,.98) 0%, rgba(191,239,255,.92) 30%, rgba(0,255,209,.92) 72%, rgba(64,169,255,.92) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 14px rgba(0,255,209,.14),0 0 22px rgba(64,169,255,.10);} .title-dot{width:8px;height:8px;border-radius:999px;background:radial-gradient(circle at 30% 30%, #bfffe8 0%, #00ffd1 35%, rgba(0,255,209,.2) 70%, rgba(0,255,209,0) 100%);box-shadow:0 0 10px rgba(0,255,209,.55), 0 0 18px rgba(64,169,255,.22);} .chart-wrap{position:relative;} .chart-wrap:after{content:\"\";position:absolute;inset:auto 0 0 0;height:1px;background:linear-gradient(90deg, transparent, rgba(0,255,209,.22), rgba(64,169,255,.16), transparent);opacity:.7;pointer-events:none;}",
    "id": "root",
    "state": {
      "dashboardData": {
        "lineChartData": {
          "columns": ["时间", "访问量", "转化率", "用户数"],
          "rows": [
            { "时间": "1月", "访问量": 3200, "转化率": 0.78, "用户数": 2800 },
            { "时间": "2月", "访问量": 4200, "转化率": 0.82, "用户数": 3500 },
            { "时间": "3月", "访问量": 3800, "转化率": 0.75, "用户数": 3100 },
            { "时间": "4月", "访问量": 5200, "转化率": 0.88, "用户数": 4500 },
            { "时间": "5月", "访问量": 4800, "转化率": 0.85, "用户数": 4100 },
            { "时间": "6月", "访问量": 6100, "转化率": 0.92, "用户数": 5600 }
          ]
        },
        "pieChartData": {
          "columns": ["类别", "销售额"],
          "rows": [
            { "类别": "电子产品", "销售额": 42000 },
            { "类别": "服装鞋帽", "销售额": 28000 },
            { "类别": "家居用品", "销售额": 19000 },
            { "类别": "食品饮料", "销售额": 15000 },
            { "类别": "图书文具", "销售额": 9000 }
          ]
        },
        "barChartData": {
          "columns": ["部门", "Q1", "Q2", "Q3", "Q4"],
          "rows": [
            { "部门": "技术部", "Q1": 320, "Q2": 380, "Q3": 420, "Q4": 480 },
            { "部门": "市场部", "Q1": 280, "Q2": 320, "Q3": 350, "Q4": 400 },
            { "部门": "销售部", "Q1": 450, "Q2": 520, "Q3": 580, "Q4": 650 },
            { "部门": "人事部", "Q1": 120, "Q2": 130, "Q3": 140, "Q4": 150 },
            { "部门": "财务部", "Q1": 180, "Q2": 200, "Q3": 220, "Q4": 240 }
          ]
        },
        "histogramData": {
          "columns": ["月份", "收入", "支出", "利润"],
          "rows": [
            { "月份": "1月", "收入": 450, "支出": 280, "利润": 170 },
            { "月份": "2月", "收入": 520, "支出": 320, "利润": 200 },
            { "月份": "3月", "收入": 480, "支出": 300, "利润": 180 },
            { "月份": "4月", "收入": 620, "支出": 380, "利润": 240 },
            { "月份": "5月", "收入": 580, "支出": 350, "利润": 230 },
            { "月份": "6月", "收入": 720, "支出": 420, "利润": 300 }
          ]
        },
        "radarChartData": {
          "columns": ["指标", "产品A", "产品B", "产品C"],
          "rows": [
            { "指标": "性能", "产品A": 85, "产品B": 90, "产品C": 78 },
            { "指标": "易用性", "产品A": 92, "产品B": 88, "产品C": 85 },
            { "指标": "可靠性", "产品A": 88, "产品B": 92, "产品C": 90 },
            { "指标": "安全性", "产品A": 95, "产品B": 90, "产品C": 92 },
            { "指标": "性价比", "产品A": 80, "产品B": 85, "产品C": 88 },
            { "指标": "售后服务", "产品A": 87, "产品B": 90, "产品C": 82 }
          ]
        },
        "ringChartData": {
          "columns": ["渠道", "占比"],
          "rows": [
            { "渠道": "移动端", "占比": 45 },
            { "渠道": "PC端", "占比": 35 },
            { "渠道": "平板端", "占比": 12 },
            { "渠道": "其他", "占比": 8 }
          ]
        }
      }
    },
    "methods": {},
    "children": [
      {
        "componentName": "div",
        "props": {
          "className": "page-base-style"
        },
        "children": [
          {
            "componentName": "h1",
            "props": {
              "className": "page-title"
            },
            "children": "数据看板 - 业务分析平台"
          },
          {
            "componentName": "TinyLayout",
            "props": {
              "cols": 24
            },
            "children": [
              {
                "componentName": "TinyRow",
                "props": {
                  "style": "margin-bottom: 20px;"
                },
                "children": [
                  {
                    "componentName": "TinyCol",
                    "props": {
                      "span": 12
                    },
                    "children": [
                      {
                        "componentName": "div",
                        "props": {
                          "className": "tech-card"
                        },
                        "children": [
                          {
                            "componentName": "h3",
                            "props": {
                              "className": "card-title"
                            },
                            "children": [
                              { "componentName": "span", "props": { "className": "title-dot" } },
                              { "componentName": "span", "children": "月度访问趋势" }
                            ]
                          },
                          {
                            "componentName": "TinyChartLine",
                            "props": {
                              "data": {
                                "type": "JSExpression",
                                "value": "this.state.dashboardData.lineChartData"
                              },
                              "settings": {
                                "type": "JSExpression",
                                "value": "{\"labelMap\": {\"访问量\": \"访问量（次）\", \"转化率\": \"转化率（%）\", \"用户数\": \"用户数（人）\"}, \"area\": true}"
                              },
                              "width": "100%",
                              "height": "300px",
                              "extend": {
                                "type": "JSExpression",
                                "value": "{\"backgroundColor\":\"transparent\",\"color\":[\"#40a9ff\",\"#00ffd1\",\"#ffd666\"],\"grid\":{\"top\":42,\"left\":18,\"right\":18,\"bottom\":28,\"containLabel\":true},\"tooltip\":{\"trigger\":\"axis\",\"confine\":true,\"axisPointer\":{\"type\":\"line\",\"lineStyle\":{\"color\":\"rgba(191,239,255,.35)\"}},\"textStyle\":{\"color\":\"rgba(230,247,255,.92)\"},\"backgroundColor\":\"rgba(7,19,37,.86)\",\"borderColor\":\"rgba(64,169,255,.26)\",\"borderWidth\":1},\"xAxis\":{\"axisLabel\":{\"color\":\"rgba(191,239,255,.88)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.22)\",\"textShadowBlur\":8},\"axisLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}},\"axisTick\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}}},\"yAxis\":{\"axisLabel\":{\"color\":\"rgba(0,255,209,.78)\",\"fontSize\":12,\"textShadowColor\":\"rgba(0,255,209,.18)\",\"textShadowBlur\":8},\"axisLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}},\"splitLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.14)\"}}},\"legend\":{\"textStyle\":{\"color\":\"rgba(230,247,255,.90)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.18)\",\"textShadowBlur\":10},\"itemWidth\":10,\"itemHeight\":10,\"itemGap\":14}}"
                              }
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "componentName": "TinyCol",
                    "props": {
                      "span": 12
                    },
                    "children": [
                      {
                        "componentName": "div",
                        "props": {
                          "className": "tech-card"
                        },
                        "children": [
                          {
                            "componentName": "h3",
                            "props": {
                              "className": "card-title"
                            },
                            "children": [
                              { "componentName": "span", "props": { "className": "title-dot" } },
                              { "componentName": "span", "children": "销售额分布" }
                            ]
                          },
                          {
                            "componentName": "TinyChartPie",
                            "props": {
                              "data": {
                                "type": "JSExpression",
                                "value": "this.state.dashboardData.pieChartData"
                              },
                              "settings": {
                                "type": "JSExpression",
                                "value": "{\"dimension\": \"类别\", \"metrics\": \"销售额\"}"
                              },
                              "width": "100%",
                              "height": "300px",
                              "extend": {
                                "type": "JSExpression",
                                "value": "{\"backgroundColor\":\"transparent\",\"color\":[\"#40a9ff\",\"#00ffd1\",\"#ffd666\",\"#ff4d4f\",\"#9254de\"],\"tooltip\":{\"trigger\":\"item\",\"confine\":true,\"formatter\":\"{b}<br/>销售额：{c}<br/>占比：{d}%\",\"textStyle\":{\"color\":\"rgba(230,247,255,.92)\"},\"backgroundColor\":\"rgba(7,19,37,.86)\",\"borderColor\":\"rgba(64,169,255,.26)\",\"borderWidth\":1},\"legend\":{\"type\":\"scroll\",\"orient\":\"horizontal\",\"bottom\":0,\"textStyle\":{\"color\":\"rgba(230,247,255,.92)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.18)\",\"textShadowBlur\":10},\"itemWidth\":10,\"itemHeight\":10,\"itemGap\":14,\"pageTextStyle\":{\"color\":\"rgba(191,239,255,.78)\"}},\"series\":{\"type\":\"pie\",\"radius\":[\"46%\",\"72%\"],\"center\":[\"50%\",\"46%\"],\"avoidLabelOverlap\":true,\"itemStyle\":{\"borderColor\":\"rgba(7,19,37,.8)\",\"borderWidth\":2,\"shadowBlur\":18,\"shadowColor\":\"rgba(0,255,209,.14)\"},\"label\":{\"show\":true,\"formatter\":\"{name|{b}}\\n{percent|{d}%}\",\"rich\":{\"name\":{\"color\":\"rgba(191,239,255,.92)\",\"fontSize\":12,\"lineHeight\":16,\"textShadowColor\":\"rgba(64,169,255,.18)\",\"textShadowBlur\":10},\"percent\":{\"color\":\"rgba(255,214,102,.92)\",\"fontSize\":12,\"fontWeight\":\"bold\",\"lineHeight\":16,\"textShadowColor\":\"rgba(255,214,102,.18)\",\"textShadowBlur\":10}}},\"labelLine\":{\"show\":true,\"length\":10,\"length2\":10,\"lineStyle\":{\"color\":\"rgba(191,239,255,.60)\"}},\"emphasis\":{\"scale\":true,\"scaleSize\":8,\"itemStyle\":{\"shadowBlur\":26,\"shadowColor\":\"rgba(64,169,255,.22)\"},\"label\":{\"rich\":{\"name\":{\"fontSize\":13,\"fontWeight\":\"bold\"},\"percent\":{\"fontSize\":13,\"fontWeight\":\"bold\"}}}}}}"
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "componentName": "TinyRow",
                "props": {
                  "style": "margin-bottom: 20px;"
                },
                "children": [
                  {
                    "componentName": "TinyCol",
                    "props": {
                      "span": 12
                    },
                    "children": [
                      {
                        "componentName": "div",
                        "props": {
                          "className": "tech-card"
                        },
                        "children": [
                          {
                            "componentName": "h3",
                            "props": {
                              "className": "card-title"
                            },
                            "children": [
                              { "componentName": "span", "props": { "className": "title-dot" } },
                              { "componentName": "span", "children": "部门季度业绩" }
                            ]
                          },
                          {
                            "componentName": "TinyChartBar",
                            "props": {
                              "data": {
                                "type": "JSExpression",
                                "value": "this.state.dashboardData.barChartData"
                              },
                              "settings": {
                                "type": "JSExpression",
                                "value": "{\"stack\": {\"总量\": [\"Q1\", \"Q2\", \"Q3\", \"Q4\"]}, \"labelMap\": {\"Q1\": \"第一季度\", \"Q2\": \"第二季度\", \"Q3\": \"第三季度\", \"Q4\": \"第四季度\"}}"
                              },
                              "width": "100%",
                              "height": "300px",
                              "extend": {
                                "type": "JSExpression",
                                "value": "{\"backgroundColor\":\"transparent\",\"color\":[\"#40a9ff\",\"#00ffd1\",\"#ffd666\",\"#9254de\"],\"grid\":{\"top\":42,\"left\":18,\"right\":18,\"bottom\":28,\"containLabel\":true},\"tooltip\":{\"trigger\":\"axis\",\"confine\":true,\"axisPointer\":{\"type\":\"shadow\",\"shadowStyle\":{\"color\":\"rgba(64,169,255,.08)\"}},\"textStyle\":{\"color\":\"rgba(230,247,255,.92)\"},\"backgroundColor\":\"rgba(7,19,37,.86)\",\"borderColor\":\"rgba(64,169,255,.26)\",\"borderWidth\":1},\"xAxis\":{\"axisLabel\":{\"color\":\"rgba(191,239,255,.88)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.22)\",\"textShadowBlur\":8},\"axisLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}},\"axisTick\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}}},\"yAxis\":{\"axisLabel\":{\"color\":\"rgba(0,255,209,.78)\",\"fontSize\":12,\"textShadowColor\":\"rgba(0,255,209,.18)\",\"textShadowBlur\":8},\"axisLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}},\"splitLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.14)\"}}},\"legend\":{\"textStyle\":{\"color\":\"rgba(230,247,255,.90)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.18)\",\"textShadowBlur\":10},\"itemWidth\":10,\"itemHeight\":10,\"itemGap\":14}}"
                              }
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "componentName": "TinyCol",
                    "props": {
                      "span": 12
                    },
                    "children": [
                      {
                        "componentName": "div",
                        "props": {
                          "className": "tech-card"
                        },
                        "children": [
                          {
                            "componentName": "h3",
                            "props": {
                              "className": "card-title"
                            },
                            "children": [
                              { "componentName": "span", "props": { "className": "title-dot" } },
                              { "componentName": "span", "children": "财务数据统计" }
                            ]
                          },
                          {
                            "componentName": "TinyChartHistogram",
                            "props": {
                              "data": {
                                "type": "JSExpression",
                                "value": "this.state.dashboardData.histogramData"
                              },
                              "settings": {
                                "type": "JSExpression",
                                "value": "{\"labelMap\": {\"收入\": \"收入（万元）\", \"支出\": \"支出（万元）\", \"利润\": \"利润（万元）\"}}"
                              },
                              "width": "95%",
                              "height": "300px",
                              "extend": {
                                "type": "JSExpression",
                                "value": "{\"backgroundColor\":\"transparent\",\"color\":[\"#00ffd1\",\"#ff4d4f\",\"#40a9ff\"],\"grid\":{\"top\":42,\"left\":18,\"right\":18,\"bottom\":28,\"containLabel\":true},\"tooltip\":{\"trigger\":\"axis\",\"confine\":true,\"axisPointer\":{\"type\":\"shadow\",\"shadowStyle\":{\"color\":\"rgba(64,169,255,.08)\"}},\"textStyle\":{\"color\":\"rgba(230,247,255,.92)\"},\"backgroundColor\":\"rgba(7,19,37,.86)\",\"borderColor\":\"rgba(64,169,255,.26)\",\"borderWidth\":1},\"xAxis\":{\"axisLabel\":{\"color\":\"rgba(191,239,255,.88)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.22)\",\"textShadowBlur\":8},\"axisLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}},\"axisTick\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}}},\"yAxis\":{\"axisLabel\":{\"color\":\"rgba(0,255,209,.78)\",\"fontSize\":12,\"textShadowColor\":\"rgba(0,255,209,.18)\",\"textShadowBlur\":8},\"axisLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.22)\"}},\"splitLine\":{\"lineStyle\":{\"color\":\"rgba(64,169,255,.14)\"}}},\"legend\":{\"textStyle\":{\"color\":\"rgba(230,247,255,.90)\",\"fontSize\":12,\"textShadowColor\":\"rgba(64,169,255,.18)\",\"textShadowBlur\":10},\"itemWidth\":10,\"itemHeight\":10,\"itemGap\":14}}"
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
export const customExamples = [
  {
    name: '数据看板',
    description: '展示数据看板, 使用规范配色打造的数据看板',
    schema: dataDashBoard,
  },
];


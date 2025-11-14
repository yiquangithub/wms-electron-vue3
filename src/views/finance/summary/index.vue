<template>
  <div class="payable-contract-page">
    <el-card class="box-card header-card" shadow="never">
      <div class="card-header">
        <span> 收支汇总 </span>
      </div>
      <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="选择项目" prop="projectId">
          <el-select
            placeholder="请选择"
            clearable
            style="width: 240px"
            v-model="queryParams.projectId"
          >
            <el-option
              v-for="dict in projectList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择日期" prop="refMainId">
          <el-date-picker
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="summary-grid" style="margin-bottom: 20px">
      <div class="summary-box received-amount">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Bottom /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">总收入</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.amount?.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) ?? '0.00'
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box ">
        <div class="summary-item total-receivable">
          <div class="item-icon-wrapper">
            <el-icon><Top /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">总支出</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.expenditure?.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) ?? '0.00'
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box unreceived-amount">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Filter /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">净利润</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.profit?.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) ?? '0.00'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="box-card plan-card" shadow="never">
      <template #header>
        <div class="title-with-bar">
          <span>按类型汇总</span>
        </div>
      </template>
      <div class="chart-content-flex">
        <div ref="statusChart" class="chart-container"></div>
        <div class="status-details">
          <div
            class="status-item"
            v-for="item in projectsStatus"
            :key="item.name"
          >
            <span
              class="status-dot"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span>{{ item.name }}</span>
            <span class="status-count">{{ item.value }}</span>
            <span class="status-percent">{{ getPercentage(item.value) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card plan-card" shadow="never">
      <template #header>
        <div class="title-with-bar">
          <span>收支趋势分析</span>
          <div class="filter-buttons">
            <el-button round @click="getTrendTypeHandler(1)">月度</el-button>
            <el-button round @click="getTrendTypeHandler(2)">季度</el-button>
            <el-button round @click="getTrendTypeHandler(3)">年度</el-button>
          </div>
        </div>
      </template>
      <div ref="chartContainer" style="width: 100%; height: 400px"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  getCostSummary,
  getCostType,
  trendType,
  getAlls,
} from '@/api/finance/cost.js'
const dateRange = ref()
const handleDateChange = (val) => {
  if (val && val.length === 2) {
    queryParams.value.startDate = val[0]
    queryParams.value.endDate = val[1]
  } else {
    queryParams.value.startDate = ''
    queryParams.value.endDate = ''
  }
}

const data = reactive({
  queryParams: {
    endDate: '',
    projectId: '',
    startDate: '',
  },
})
const { queryParams } = toRefs(data)
// 所有项目
const projectList = ref()
const getProjectList = () => {
  getAlls().then((res) => {
    projectList.value = res.data
  })
}
// 汇总收入
const paymentSummary = ref()
const getCostSummaryHandler = async () => {
  getCostSummary(queryParams.value).then((res) => {
    paymentSummary.value = res.data
  })
}
//// 按类型汇总
const projectsStatus = ref([])
const statusChart = ref(null)

const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(Math.random() * 30) + 70
  const l = Math.floor(Math.random() * 20) + 60
  return `hsl(${h}, ${s}%, ${l}%)`
}
const getPercentage = (value) => {
  if (!projectsStatus.value || projectsStatus.value.length === 0) return '0%'
  const total = projectsStatus.value.reduce(
    (sum, item) => sum + parseInt(item.value || '0', 10),
    0
  )
  if (total === 0) return '0%'
  const percentage = (parseInt(value || '0', 10) / total) * 100
  return `${percentage.toFixed(0)}%`
}

const getProjectsStatusHandler = () => {
  getCostType(queryParams.value).then((response) => {
    projectsStatus.value = response.data.map((item) => ({
      name: item.name,
      value: parseInt(item.value, 10) || 0,
      color: getRandomColor(),
    }))
    initStateChart()
  })
}

const initStateChart = () => {
  if (!statusChart.value) return
  const chart = echarts.init(statusChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    series: [
      {
        name: '项目状态',
        type: 'pie',
        radius: ['50%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'center',
          formatter: (params) => {
            const total = projectsStatus.value.reduce(
              (sum, item) => sum + item.value,
              0
            )
            return `{title|总计}\n\n{value|${total}}`
          },
          rich: {
            title: {
              fontSize: 14,
              fontWeight: 'normal',
              color: '#909399',
            },
            value: {
              fontSize: 28,
              fontWeight: 'bold',
              color: '#303133',
              padding: [5, 0],
            },
          },
        },
        labelLine: { show: false },
        data: projectsStatus.value.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 收支趋势分析
const paymentTrend = ref()
const chartContainer = ref(null)
let myChart = null

const getTrendTypeHandler = async (type) => {
  trendType(type).then((res) => {
    paymentTrend.value = res.data
    processChartData(paymentTrend.value)
  })
}

const processChartData = (apiData) => {
  const processedData = {
    xaxisData: apiData.xaxisData,
    seriesData: {
      income: [],
      expenditure: [],
      profit: [],
    },
  }
  apiData.seriesDataAry.forEach((series) => {
    const valuesAsNumbers = series.values.map(Number)
    if (series.name === '收入') {
      processedData.seriesData.income = valuesAsNumbers
    } else if (series.name === '支出') {
      processedData.seriesData.expenditure = valuesAsNumbers
    } else if (series.name === '利润') {
      processedData.seriesData.profit = valuesAsNumbers
    }
  })

  paymentTrend.value = processedData
  renderChart()
}

const renderChart = () => {
  if (!chartContainer.value || !paymentTrend.value) return
  if (myChart) {
    myChart.dispose()
  }
  myChart = echarts.init(chartContainer.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        let tooltipStr = params[0]?.name + '<br/>'
        params.forEach((item) => {
          tooltipStr += `${item.marker}${item.seriesName}: ¥${Number(
            item.value
          ).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}<br/>`
        })
        return tooltipStr
      },
    },
    legend: {
      data: ['收入', '支出', '利润'],
      top: 10,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: paymentTrend.value.xaxisData,
        axisTick: { alignWithLabel: true },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额 (¥)',
        axisLabel: {
          formatter: (value) => value.toLocaleString('zh-CN'),
        },
      },
      {
        type: 'value',
        name: '利润 (¥)',
        position: 'right',
        axisLabel: {
          formatter: (value) => value.toLocaleString('zh-CN'),
        },
      },
    ],
    series: [
      {
        name: '收入',
        type: 'bar',
        barWidth: '30',
        data: paymentTrend.value.seriesData.income,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          opacity: 0.8,
          color: '#67C23A',
        },
      },
      {
        name: '支出',
        type: 'bar',
        barWidth: '30',
        data: paymentTrend.value.seriesData.expenditure,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          opacity: 0.8,
          color: '#F56C6C',
        },
      },
      {
        name: '利润',
        type: 'line',
        data: paymentTrend.value.seriesData.profit,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: '#409EFF' },
        itemStyle: { color: '#409EFF' },
      },
    ],
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart?.resize())
}

function handleQuery() {
  getCostSummaryHandler()
  getProjectsStatusHandler()
  getTrendTypeHandler(1)
}

function resetQuery() {
  queryParams.value.projectId = ''
  dateRange.value = []
  queryParams.value.startDate = ''
  queryParams.value.endDate = ''
  handleQuery()
}

onMounted(() => {
  getProjectList()
  getCostSummaryHandler()
  getProjectsStatusHandler()
  getTrendTypeHandler(1)
})
</script>

<style scoped>
.table-btns :deep(.el-text) {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}
.title-with-bar {
  position: relative;
  padding-left: 10px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-with-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #409eff;
  border-radius: 2px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-buttons .el-button--text {
  color: #606266;
  font-size: 14px;
  padding: 0 5px;
}
.filter-buttons .el-button--text:hover {
  color: #409eff;
}

.payable-contract-page {
  padding: 20px;
  background-color: #f5f7fa;
}

.box-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  font-size: 20px;
  margin-bottom: 20px;
}

.contract-info-table {
  margin-bottom: 20px;
}

.contract-info-table :deep(.el-table__header) {
  background-color: #f5f7fa;
}

.contract-info-table :deep(.el-table__body .el-table__row) {
  background-color: #fafafa;
}

.contract-info-table :deep(.el-table__body .el-table__row:hover) {
  background-color: #f0f9ff;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-grid {
  display: flex;
  gap: 20px;
}

.summary-box {
  flex: 1;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 25px;
  height: 100%;
}

.item-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: #fff;
}

.total-receivable .item-icon-wrapper {
  background-color: #F56C6C;
}
.received-amount .item-icon-wrapper {
  background-color: #67c23a;
}
.unreceived-amount .item-icon-wrapper {
  background-color: #3D6CF6;
}

.item-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.item-title {
  font-size: 14px;
  margin-bottom: 4px;
}

.item-value {
  font-size: 26px;
  font-weight: bold;
  color: #303133;
}

.no-data {
  color: #c0c4cc;
  font-size: 14px;
}

.footer-actions {
  text-align: right;
}
.chart-content-flex {
  display: flex;
  align-items: center;
}
.chart-container {
  flex: 1;
  height: 300px; /* 设置图表高度 */
}
.status-details {
  flex: 0.8;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 100px;
}
.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}
.status-count {
  margin-left: auto;
  margin-right: 10px;
  color: #141414;
}
.status-percent {
  color: #787373;
}
</style>

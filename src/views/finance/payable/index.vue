<template>
  <div class="payable-contract-page">
    <el-card class="box-card header-card" shadow="never">
      <div class="card-header">
        <span>
          项目合同应付款项<br /><span style="font-size: 14px; color: gray">
            管理和跟踪所有项目合同的应付款项、已付款项及未付款项
          </span>
        </span>
      </div>
    </el-card>
    <div class="summary-grid" style="margin-bottom: 20px">
      <div class="summary-box total-Payable">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Document /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">总应付金额</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.totalAmount.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box received-amount">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Check /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">已付金额</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.processedAmount.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box unreceived-amount">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">未付金额</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.pendingAmount.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box progress-box">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">逾期金额</div>
            <div class="item-value">
              ¥{{
                paymentSummary?.overdueAmount.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-card class="box-card plan-card" shadow="never">
      <template #header>
        <div class="title-with-bar">
          <span>应付款项趋势</span>
          <div class="filter-buttons">
            <el-button round @click="getPayableTrendHandler(1)">月度</el-button>
            <el-button round @click="getPayableTrendHandler(2)">季度</el-button>
            <el-button round @click="getPayableTrendHandler(3)">年度</el-button>
          </div>
        </div>
      </template>
      <div ref="chartContainer" style="width: 100%; height: 400px"></div>
    </el-card>

    <el-card class="box-card plan-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="title-with-bar">
          <span>项目合同应付款项明细</span>
          <!-- <div class="filter-buttons">
            <el-input
              placeholder="按项目名称搜索应付款"
              :suffix-icon="Search"
            ></el-input>
          </div> -->
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="paymentPlan"
        border
        style="width: 100%"
      >
        <el-table-column label="编码" prop="projectCode" align="center" />
        <el-table-column label="项目名称" prop="projectName" align="center" />
        <el-table-column label="合同号" prop="contractCode" align="center">
          <!-- <template #default="scope">
            <el-tag
              style="cursor: pointer"
              type="primary"
              @click="previewCommand(scope.row)"
              >{{ scope.row.contractCode }}</el-tag
            >
          </template> -->
        </el-table-column>
        <el-table-column label="客户名称" prop="contractName" align="center" />
        <el-table-column label="应付金额" prop="planAmount" align="center" />
        <el-table-column label="已付金额" prop="actualAmount" align="center" />
        <el-table-column label="未付金额" prop="pendingAmount" align="center" />
        <el-table-column label="到期日期" prop="planDate" align="center" />
        <el-table-column
          label="付款状态"
          prop="payStatus"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="
                scope.row.payStatus === '已付款' ||
                scope.row.payStatus === '全部付款'
                  ? 'success'
                  : scope.row.payStatus === '部分付款' ||
                    scope.row.payStatus === '已逾期'
                  ? 'danger'
                  : 'info'
              "
            >
              {{ scope.row.payStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="150">
          <template #default="scope">
            <div class="table-btns">
              <el-text type="primary" @click="handleCommand(scope.row)"
                >上传凭证</el-text
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getReceivableDetailsHandler"
      />
    </el-card>
  </div>
  <previewDialog ref="dialogPreviewRef" />
  <addDialog ref="dialogRef" @get-table-data="getList" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
  Document,
  Check,
  Clock,
  WarningFilled,
  Search,
} from '@element-plus/icons-vue'
import {
  getPayableSummary,
  getPayableTrend,
  getPayableDetails,
} from '@/api/finance/payable'
import addDialog from './components/addDialog.vue'
import previewDialog from '../../purchase/contracts/components/previewDialog.vue'

const dialogPreviewRef = ref()
const dialogRef = ref()

const previewCommand = (row) => {
  dialogPreviewRef.value?.acceptParams({
    title: '查看',
    row: { ...row },
  })
}
const handleCommand = (row) => {
  dialogRef.value?.acceptParams({
    title: '上传凭证',
    row: { ...row },
  })
}
// 01.应付款项汇总
const paymentSummary = ref()
const getPayableSummaryHandler = async () => {
  await getPayableSummary().then((res) => {
    paymentSummary.value = res.data
  })
}
// 02.应付款项趋势
const paymentTrend = ref()
const getPayableTrendHandler = async (id) => {
  await getPayableTrend(id).then((res) => {
    paymentTrend.value = res.data
    renderChart()
  })
}
// 03.应付款项明细
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
})
const total = ref(0)
const { queryParams } = toRefs(data)
const paymentPlan = ref()
const getPayableDetailsHandler = async () => {
  await getPayableDetails(queryParams.value).then((res) => {
    paymentPlan.value = res.rows
    total.value = res.total
  })
}

const chartContainer = ref(null)
let myChart = null
const renderChart = () => {
  if (!chartContainer.value) return
  if (myChart) {
    myChart.dispose()
  }
  myChart = echarts.init(chartContainer.value)
  const seriesData = paymentTrend.value.seriesDataAry.map((item) => ({
    name: item.name,
    type: 'bar',
    barWidth: '30',
    data: item.values.map(Number),
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      opacity: 0.8,
      color:
        item.name === '应付款项'
          ? '#409EFF'
          : item.name === '已付款项'
          ? '#67C23A'
          : item.name === '逾期金额'
          ? '#F56C6C'
          : '#909399',
    },
  }))

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        let tooltipStr = params[0]?.name + '<br/>'
        params.forEach((item) => {
          tooltipStr += `${item.marker}${item.seriesName}: ¥${Number(
            item.value
          ).toLocaleString()}<br/>`
        })
        return tooltipStr
      },
    },
    legend: {
      data: ['应付款项', '已付款项', '逾期金额'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: paymentTrend.value.xaxisData,
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额 (¥)',
        axisLabel: {
          formatter: function (value) {
            return value.toLocaleString()
          },
        },
      },
    ],
    series: seriesData,
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => {
    if (myChart) {
      myChart.resize()
    }
  })
}
onMounted(() => {
  getPayableSummaryHandler()
  getPayableDetailsHandler()
  getPayableTrendHandler(3)
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

.total-Payable .item-icon-wrapper {
  background-color: #409eff;
}
.received-amount .item-icon-wrapper {
  background-color: #67c23a;
}
.unreceived-amount .item-icon-wrapper {
  background-color: #e6a23c;
}
.progress-box .item-icon-wrapper {
  background-color: #f56c6c;
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

.progress-box .item-content {
  display: block;
}

.progress-box .el-progress {
  margin-top: 8px;
}

.progress-text {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
  margin-left: 0;
  display: block;
  margin-top: 5px;
}

.plan-card {
  margin-top: 10px;
}
.voucher-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-data {
  color: #c0c4cc;
  font-size: 14px;
}

.footer-actions {
  text-align: right;
}
</style>

<template>
  <div class="sales-contract-page">
    <el-card class="box-card header-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>
            销售合同回款计划<br /><span style="font-size: 14px; color: gray">
              跟踪合同回款进度与回款计划详情
            </span>
          </span>
          <div class="header-right" style="text-align: right">
            <el-tag type="primary">{{ returnList?.contractName }}</el-tag
            ><br />
            <el-link underline="always" type="success" @click="downloadContract"
              >查看合同</el-link
            >
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border class="contract-info">
        <el-descriptions-item label="合同ID">{{
          returnList?.id
        }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{
          returnList?.supplierName
        }}</el-descriptions-item>
        <el-descriptions-item label="合同金额">{{
          returnList?.planAmount
        }}</el-descriptions-item>
        <el-descriptions-item label="实际支付日期" width="200px">{{
          returnList?.actualDate
        }}</el-descriptions-item>
        <el-descriptions-item label="合同计划日期" width="200px">
          {{ returnList?.planDate }}
        </el-descriptions-item>
        <el-descriptions-item label="支付状态" v-if="returnList">
          <div class="status-actions">
            <el-tag
              :type="
                returnList?.payStatusStr === '已收款'
                  ? 'success'
                  : returnList?.payStatusStr === '部分收款'
                  ? 'warning'
                  : 'info'
              "
            >
              {{ returnList?.payStatusStr }}
            </el-tag>
            <!-- <el-button type="text" size="small" :icon="Download"
              >下载合同</el-button
            > -->
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div class="summary-grid" style="margin-bottom: 10px">
      <div class="summary-box total-receivable" shadow="hover">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Document /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">总应收金额</div>
            <div class="item-value">
              ¥{{ paymentSummary?.totalAmount || 0 }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box received-amount" shadow="hover">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Check /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">已收金额</div>
            <div class="item-value">
              ¥{{ paymentSummary?.receivedAmount || 0 }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box unreceived-amount" shadow="hover">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">未收金额</div>
            <div class="item-value">
              ¥{{ paymentSummary?.uncollectedAmount || 0 }}
            </div>
          </div>
        </div>
      </div>
      <div class="summary-box progress-box" shadow="hover">
        <div class="summary-item">
          <div class="item-icon-wrapper">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="item-content">
            <div class="item-title">收款进度</div>
            <el-progress
              :percentage="paymentSummary?.percent"
              :show-text="false"
              :stroke-width="10"
            />
            <span class="progress-text"
              >{{ paymentSummary?.percent || 0 }}%</span
            >
          </div>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card plan-card" shadow="never">
          <template #header>
            <div class="title-with-bar">
              <span>收款计划明细</span>
            </div>
          </template>
          <el-table
            v-loading="loading"
            :data="paymentPlan"
            border
            style="width: 100%"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
            />
            <!-- <el-table-column label="合同名称" prop="contractName" width="200" /> -->
            <el-table-column
              label="收款阶段"
              prop="payPhaseStr"
              width="150"
              align="center"
            />
            <el-table-column
              label="收款比例 %"
              prop="percent"
              width="120"
              align="center"
            />
            <el-table-column
              label="计划收款金额"
              prop="planAmount"
              width="150"
              align="center"
            >
              <template #default="scope">
                ¥{{ scope.row.planAmount }}
              </template>
            </el-table-column>
            <el-table-column
              label="计划收款日期"
              prop="planDate"
              width="120"
              align="center"
            />
            <el-table-column
              label="到期状态"
              prop="maturityDurationStr"
              width="120"
              align="center"
            >
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.maturityDuration < 0
                      ? 'danger'
                      : scope.row.maturityDuration === 0
                      ? 'warning'
                      : 'success'
                  "
                >
                  {{ scope.row.maturityDurationStr }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="实际收款金额"
              prop="actualAmount"
              width="150"
              align="center"
            >
              <template #default="scope">
                <span v-if="scope.row.actualAmount > 0"
                  >¥{{ scope.row.actualAmount }}</span
                >
                <span v-else class="no-data">-</span>
              </template>
            </el-table-column>
            <el-table-column
              label="实际收款日期"
              prop="actualDate"
              width="120"
              align="center"
            >
              <template #default="scope">
                <span v-if="scope.row.actualDate">{{
                  scope.row.actualDate
                }}</span>
                <span v-else class="no-data">-</span>
              </template>
            </el-table-column>
            <el-table-column
              label="收款状态"
              prop="payStatusStr"
              width="120"
              align="center"
            >
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.payStatusStr === '已收款'
                      ? 'success'
                      : scope.row.payStatusStr === '部分收款'
                      ? 'warning'
                      : 'info'
                  "
                >
                  {{ scope.row.payStatusStr }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" min-width="200">
              <template #default="scope">
                <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
                <span v-else class="no-data">-</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="box-card record-card" shadow="never">
      <template #header>
        <div class="title-with-bar">
          <span>收款记录</span>
        </div>
      </template>

      <el-table
        v-loading="recordLoading"
        :data="paymentRecords"
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          label="收款状态"
          prop="payStatusStr"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="
                scope.row.payStatusStr === '已收款' ? 'success' : 'warning'
              "
            >
              {{ scope.row.payStatusStr }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="收款金额"
          prop="actualAmount"
          width="120"
          align="center"
        >
          <template #default="scope"> ¥{{ scope.row.actualAmount }} </template>
        </el-table-column>
        <el-table-column label="收款日期" prop="actualDate" align="center" />
        <el-table-column label="收款方式" prop="payType" align="center" />
        <el-table-column
          label="收款人"
          prop="financialHandlerName"
          align="center"
        />
        <el-table-column label="发票状态" prop="invoiceStatus" align="center" />
        <el-table-column label="银行回单" width="120" align="center">
          <template #default="scope">
            <div v-if="scope.row.bankReceipt" class="voucher-preview">
              <el-image
                :src="baseUrl + scope.row.bankReceipt"
                :preview-src-list="[baseUrl + scope.row.bankReceipt]"
                fit="cover"
                style="
                  width: 40px;
                  height: 40px;
                  border-radius: 4px;
                  cursor: pointer;
                "
                preview-teleported
              />
            </div>
            <span v-else class="no-data">无</span>
          </template>
        </el-table-column>
        <el-table-column label="发票" width="120" align="center">
          <template #default="scope">
            <div v-if="scope.row.invoice" class="voucher-preview">
              <el-image
                :src="baseUrl + scope.row.invoice"
                :preview-src-list="[baseUrl + scope.row.invoice]"
                fit="cover"
                style="
                  width: 40px;
                  height: 40px;
                  border-radius: 4px;
                  cursor: pointer;
                "
                preview-teleported
              />
            </div>
            <span v-else class="no-data">无</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="payRemark">
          <template #default="scope">
            <span v-if="scope.row.payRemark">{{ scope.row.payRemark }}</span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <div class="footer-actions">
      <el-button @click="handleContract" :icon="Back">返回合同管理</el-button>
    </div>
  </div>
  <previewDialog ref="dialogPreviewRef" />
</template>
<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import {
  Download,
  Document,
  Check,
  Clock,
  TrendCharts,
  Back,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import previewDialog from '../contracts/components/previewDialog.vue'
import {
  getPaymentSummary,
  getPayment,
  getPaymentAll,
  getPaymentRecords,
} from '@/api/sales/payment'
const baseUrl = import.meta.env.VITE_APP_BASE_API
const { proxy } = getCurrentInstance()
import { useRoute } from 'vue-router'
const route = useRoute()
const queryID = parseInt(route.query.id)
const paymentSummary = ref()
const paymentPlan = ref()
const paymentRecords = ref()
const returnList = ref()
const loading = ref(true)
const recordLoading = ref(false)
const contractLoading = ref(false)
const dialogPreviewRef = ref()
// 下载合同
const downloadContract = async () => {
  const row = { id: queryID }
  dialogPreviewRef.value?.acceptParams({
    title: '查看',
    row: { ...row },
  })
}

// 获取头部合同信息列表
const getContractInfoHandle = async () => {
  contractLoading.value = true
  try {
    const res = await getPayment(queryID)
    if (res.code === 200) {
      returnList.value = res.data
    }
  } catch (error) {
    console.error('获取合同信息失败:', error)
    returnList.value = []
  } finally {
    contractLoading.value = false
  }
}

// 计划汇总信息
const getSummaryHandle = async () => {
  const res = await getPaymentSummary(queryID)
  if (res.code === 200) {
    paymentSummary.value = res.data
  }
}

// 初始化数据加载
const initializeData = async () => {
  await Promise.all([
    getContractInfoHandle(),
    getSummaryHandle(),
    getPaymentHandle(),
    getPaymentRecordsHandle(),
  ])
}
// 获取合同回款计划列表
const getPaymentHandle = async () => {
  loading.value = true
  const res = await getPaymentAll(queryID)
  if (res.code === 200) {
    paymentPlan.value = res.data
    loading.value = false
  }
}

// 收款记录
const getPaymentRecordsHandle = async () => {
  recordLoading.value = true
  try {
    const res = await getPaymentRecords(queryID)
    if (res.code === 200) {
      paymentRecords.value = res.data
    }
  } catch (error) {
    console.error('获取收款记录失败:', error)
    paymentRecords.value = []
  } finally {
    recordLoading.value = false
  }
}

// 初始化所有数据
initializeData()

// 跳回合同
const handleContract = (row) => {
  proxy.$router.push({
    path: '/sales/salesContracts',
  })
}
</script>

<style scoped>
.title-with-bar {
  position: relative;
  padding-left: 10px;
  font-weight: bold;
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
.sales-contract-page {
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
  padding: 15px;
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
  background-color: #409eff;
}
.received-amount .item-icon-wrapper {
  background-color: #67c23a;
}
.unreceived-amount .item-icon-wrapper {
  background-color: #e6a23c;
}
.progress-box .item-icon-wrapper {
  background-color: #909399;
}

.item-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.item-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.item-value {
  font-size: 20px;
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

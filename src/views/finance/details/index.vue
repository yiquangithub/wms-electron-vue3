<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="成本类型" prop="costType">
        <el-select
          placeholder="请选择"
          clearable
          style="width: 240px"
          v-model="queryParams.costType"
        >
          <el-option
            v-for="dict in project_cost_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收支类型" prop="incomeAndExpenseType">
        <el-select
          placeholder="请选择"
          clearable
          style="width: 240px"
          v-model="queryParams.incomeAndExpenseType"
        >
          <el-option
            v-for="dict in income_and_expense_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
    <el-table v-loading="loading" :data="tableList" ref="tableRef">
      <el-table-column label="序号" type="index" width="50" />
      <el-table-column
        label="名称"
        prop="projectName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="成本项目"
        prop="costName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="成本类型"
        prop="costTypeStr"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="¥ 金额"
        prop="actualAmount"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="责任人"
        prop="responsiblePeopleName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="计划支付日期"
        prop="planPayDate"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="实际支付日期"
        prop="actualPayDate"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态" prop="status">
        <template v-slot="scope">
          <el-tag v-if="scope.row.status === '已完成'" type="success"
            >已完成</el-tag
          >
          <el-tag v-else-if="scope.row.status === '已逾期'" type="danger"
            >已逾期</el-tag
          >
          <el-tag v-else type="info">未付款</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="附件发票" align="center" fixed="right">
        <template #default="scope">
          <el-image
            style="width: 50; height: 50px"
            :src="baseUrl + scope.row.invoice"
            :preview-src-list="[baseUrl + scope.row.invoice]"
            preview-teleported
            v-if="scope.row.invoice"
          >
          </el-image>
          <el-text v-else type="info">暂无</el-text>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>
<script setup name="details">
import { getCostDetails } from '@/api/finance/cost.js'
const { proxy } = getCurrentInstance()
const { income_and_expense_type } = proxy.useDict('income_and_expense_type')
const { project_cost_type } = proxy.useDict('project_cost_type')
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const dateRange = ref()
const tableRef = ref()
const baseUrl = import.meta.env.VITE_APP_BASE_API
const handleDateChange = (val) => {
  if (val && val.length === 2) {
    queryParams.value.startDate = val[0]
    queryParams.value.endDate = val[1]
  } else {
    queryParams.value.startDate = ''
    queryParams.value.endDate = ''
  }
}
// 查询列表
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    costType: '',
    endDate: '',
    incomeAndExpenseType: '',
    projectName: '',
    startDate: '',
  },
})
const { queryParams } = toRefs(data)
function getList() {
  loading.value = true
  return getCostDetails(queryParams.value).then((response) => {
    tableList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  tableList.value = []
  getList()
}
/** 重置查询 */
function resetQuery() {
  proxy.resetForm('queryRef')
  tableList.value = []
  handleQuery()
}
getList()
</script>
<style lang="scss" scoped>
.el-text,
.el-tag {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}
.expand-container {
  padding-left: 50px;
}
</style>

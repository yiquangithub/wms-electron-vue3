<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleCommand('新增', null)"
          >添加付款计划</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" width="55" align="center" label="序号" />
      <el-table-column label="ID" prop="id" width="100"> </el-table-column>
      <el-table-column
        label="合同名称"
        prop="contractName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="收款比例 %"
        prop="percent"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="¥ 收款金额"
        prop="planAmount"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="计划收款日期"
        prop="planDate"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="实际收款日期"
        prop="actualDate"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="收款状态"
        prop="payPhaseStr"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template #default="scope">
          <div class="table-btns">
            <el-text
              type="primary"
              @click="handleCommand('编辑', scope.row)"
              v-if="scope.row.isSubmit !== 1"
              >编辑</el-text
            >
            <el-text
              type="danger"
              @click="handleDelete(scope.row)"
              v-if="scope.row.isSubmit !== 1"
              >删除</el-text
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <addDialog ref="dialogRef" @get-table-data="getList" />
</template>

<script setup name="myQuotation">
import { getPaymentList, deletePayment } from '@/api/purchase/payment'
import addDialog from './components/addDialog.vue'
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const queryID = parseInt(route.query.id)
function getList() {
  loading.value = true
  getPaymentList(queryID).then(async (res) => {
    tableList.value = res.rows
    loading.value = false
  })
}
getList()
// 打开 dialog(新增、查看、编辑)
const dialogRef = ref()
function handleCommand(title, row) {
  dialogRef.value?.acceptParams({
    title,
    contractId: queryID,
    row: { ...row },
    isView: title === '查看',
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value[0]
  proxy.$modal
    .confirm('是否确认删除付款计划ID为"' + id + '"的数据项?')
    .then(function () {
      return deletePayment(id)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
</script>
<style lang="scss" scoped>
.table-btns :deep(.el-text) {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}
</style>

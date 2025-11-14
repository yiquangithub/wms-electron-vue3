<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="关键词" prop="keyWord">
        <el-input
          v-model="queryParams.keyWord"
          placeholder="请输入合同名称/合同编号查询"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item>
        <right-toolbar
          v-model:showSearch="showSearch"
          @queryTable="getList"
        ></right-toolbar>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" width="55" align="center" label="序号" />
      <el-table-column
        label="合同名称"
        prop="contractName"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="物料名称"
        prop="productsName"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="规格型号"
        prop="specifications"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="检验单名称"
        prop="inspectionName"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="检验日期"
        prop="inspectionDate"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="检验人"
        prop="checkUserName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="接收数量"
        prop="receivedNum"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="检验数量"
        prop="checkNum"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="不合格数量"
        prop="unqualifiedNum"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="状态"
        prop="processStatus"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template #default="scope">
          <div class="table-btns">
            <el-text
              type="primary"
              @click="handleCommand('修改', scope.row)"
              v-if="scope.row.processStatus === '已处理'"
              >修改</el-text
            >
            <el-text
              v-else
              type="primary"
              @click="handleCommand('处理', scope.row)"
              >处理</el-text
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
      @pagination="getList"
    />
  </div>
  <addDialog ref="dialogRef" @get-table-data="getList" />
</template>

<script setup name="myQuotation">
import { getAfterList } from '@/api/purchase/after'
import addDialog from './components/addDialog.vue'
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([]) 
const total=ref(0)
// 查询列表
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyWord: undefined,
    refMainId: undefined,
  },
})

const { queryParams } = toRefs(data)
function getList() {
  loading.value = true
  getAfterList(queryParams.value).then(async (res) => {
    tableList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}
getList()
// 打开 dialog(新增、查看、编辑)
const dialogRef = ref()
function handleCommand(title, row) {
  dialogRef.value?.acceptParams({
    title, 
    row: { ...row },
    isView: title === '查看',
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value[0]
  proxy.$modal
    .confirm('是否确认删除该的数据项?')
    .then(function () {
      return deletePayment(id)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
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
</script>
<style lang="scss" scoped>
.table-btns :deep(.el-text) {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}
</style>

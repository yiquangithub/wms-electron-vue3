<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="关键词" prop="name">
        <el-input
          v-model="queryParams.query.name"
          placeholder="请输入报价名称/编码查询"
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
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          v-hasPermi="['sales:myQuotation:add']"
          @click="handleCommand('新增', null)"
          >新增报价单</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          :disabled="single"
          @click="handleExport"
          v-hasPermi="['sales:myQuotation:export']"
          >导出</el-button
        >
      </el-col> -->
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      @expand-change="expandChange"
      ref="tableRef"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="expand-container">
            <el-table
              :data="materialList"
              border
              style="width: 100%"
              class="material-table"
              v-if="props.row.id === currentExpandedRowId"
            >
              <el-table-column
                type="index"
                label="序号"
                width="80"
                align="center"
              />
              <el-table-column
                prop="name"
                label="物料名称"
                width="120"
                align="center"
              />
              <el-table-column
                prop="brand"
                label="品牌"
                width="120"
                align="center"
              />
              <el-table-column
                prop="specifications"
                label="型号"
                width="120"
                align="center"
              />
              <el-table-column
                prop="price"
                label="未税单价 (元)"
                width="150"
                align="center"
              />
              <el-table-column
                prop="taxRate"
                label="税率"
                width="120"
                align="center"
              >
                <template v-slot="scope">
                  {{ scope.row.taxRate * 100 }}%
                </template>
              </el-table-column>
              <el-table-column
                prop="priceIncludeTax"
                label="含税单价 (元)"
                width="150"
                align="center"
              />
              <el-table-column
                prop="deliveryDate"
                label="货期 (天)"
                width="120"
                align="center"
              />
              <el-table-column
                prop="demandQuantity"
                label="数量"
                width="120"
                align="center"
              />
              <el-table-column
                prop="unitName"
                label="单位"
                width="120"
                align="center"
              />
              <el-table-column
                prop="priceTotal"
                label="未税总价 (元)"
                width="150"
                align="center"
              />
              <el-table-column
                prop="priceTotalIncludeTax"
                label="含税总价 (元)"
                width="150"
                align="center"
              />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="编码" prop="code" width="180">
        <template #default="scope">
          <el-tag
            style="cursor: pointer"
            type="primary"
            @click="handleCommand('查看', scope.row)"
            >{{ scope.row.code }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        label="名称"
        prop="name"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="询价单位"
        prop="inquiryUnitName"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="询价单位联系人"
        prop="inquiryUnitContacts"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="询价单位联系人电话"
        prop="inquiryUnitContactsPhone"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="报价单位"
        prop="quoteUnitName"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="报价单位联系人"
        prop="quoteUnitContacts"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="报价单位联系人电话"
        prop="quoteUnitContactsPhone"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="报价单总金额"
        prop="quotePrice"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column label="关联合同" prop="contractNum" width="100">
        <template #default="scope">
          <el-tag
            style="cursor: pointer"
            type="primary"
            @click="handleContract(scope.row)"
            >{{ scope.row.contractNum }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="报价次数" prop="quoteNum" width="100">
        <template #default="scope">
          <el-tag
            style="cursor: pointer"
            type="primary"
            @click="handleCommand('多次', scope.row)"
            >{{ scope.row.quoteNum }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="300">
        <template #default="scope">
          <div class="table-btns">
            <el-text
              type="primary"
              @click="handleCommand('报价单', scope.row)"
              v-hasPermi="['sales:myQuotation:quotation']"
              >报价单</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('创建合同', scope.row)"
              v-hasPermi="['sales:myQuotation:contract']"
              >创建合同</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('再次', scope.row)"
              v-hasPermi="['sales:myQuotation:againQuotation']"
              >再次报价</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('编辑', scope.row)"
              v-hasPermi="['sales:myQuotation:edit']"
              v-if="scope.row.isSubmit !== 1"
              >编辑</el-text
            >
            <el-text
              type="danger"
              @click="handleDelete(scope.row)"
              v-hasPermi="['sales:myQuotation:remove']"
              v-if="scope.row.isSubmit !== 1"
              >删除</el-text
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
  <addAgainDialog ref="dialogAgainRef" @get-table-data="getList" />
  <addContractDialog ref="addContractDialogRef" />
  <quotationDialog ref="quotationDialogRef" />
  <addMoreAgainDialog ref="dialogMoreAgainRef" @get-table-data="getList" />
</template>

<script setup name="myQuotation">
import {
  getMyQuotation,
  deleteQuotation,
  materialsQuotation,
} from '@/api/sales/myQuotation'
import addDialog from './components/addDialog.vue'
import quotationDialog from './components/quotationDialog.vue'
import addAgainDialog from './components/addAgainDialog.vue'
import addMoreAgainDialog from './components/addMoreAgainDialog.vue'
import addContractDialog from '../contracts/components/addDialog.vue'

const { proxy } = getCurrentInstance()
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const ids = ref([])
const codes = ref([])
const currentExpandedRowId = ref(null) // 用于记录当前展开的行的ID
const tableRef = ref()
const data = reactive({
  form: {},
  queryParams: {
    first: 0,
    pageNum: 1,
    pageSize: 10,
    query: {
      id: 0,
      name: '',
    },
    queryid: 0,
    sort: '',
    sortField: '',
  },
})
const { queryParams } = toRefs(data)
function getList() {
  loading.value = true
  getMyQuotation(queryParams.value).then((response) => {
    tableList.value = response.data.rows
    total.value = response.total
    loading.value = false
  })
}
const materialList = ref([])
// 获取报价单关联的物料信息
const getMyQuotationDetail = async (id) => {
  await materialsQuotation({ id: id }).then(async (res) => {
    materialList.value = res.data
  })
}
const expandChange = (row, expandedRows) => {
  const isExpanded = expandedRows.some(
    (expandedRow) => expandedRow.id === row.id
  )
  if (isExpanded) {
    if (currentExpandedRowId.value && currentExpandedRowId.value !== row.id) {
      tableRef.value.toggleRowExpansion(
        tableList.value.find((item) => item.id === currentExpandedRowId.value),
        false
      )
    }
    currentExpandedRowId.value = row.id
    getMyQuotationDetail(row.id)
  } else {
    currentExpandedRowId.value = null
    materialList.value = []
  }
} 
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置查询 */
function resetQuery() {
  proxy.resetForm('queryRef')
  currentExpandedRowId.value = null
  materialList.value = []
  handleQuery()
}
getList()
// 关联合同
const handleContract = (row) => {
  // 跳转到合同列表页面
  proxy.$router.push({
    path: '/sales/salesContracts',
    query: {
      refMainId: row.id,
    },
  })
}
// 打开 dialog(新增、查看、编辑)
const dialogRef = ref()
const dialogAgainRef = ref()
const quotationDialogRef = ref()
const addContractDialogRef = ref()
const dialogMoreAgainRef = ref()
function handleCommand(title, row) {
  if (title === '新增' || title === '编辑' || title === '查看') {
    dialogRef.value?.acceptParams({
      title,
      row: { ...row },
      isView: title === '查看',
    })
  } else if (title === '报价单') {
    quotationDialogRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  } else if (title === '创建合同') {
    addContractDialogRef.value?.acceptParams({
      isQuote: true,
      title: '创建报价单',
      row: { ...row },
    })
  } else if (title === '再次') {
    dialogAgainRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  } else if (title === '多次') {
    dialogMoreAgainRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  }
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value[0]
  const code = row.code || codes.value[0]
  proxy.$modal
    .confirm('是否确认删除报价编码为"' + code + '"的数据项?')
    .then(function () {
      return deleteQuotation({ id: id })
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  console.log('handleExport', ids.value)
  proxy.download(
    'quote/price/export/pdf',
    { id: ids.value },
    `报价单_${new Date().getTime()}.pdf`
  )
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  codes.value = selection.map((item) => item.name)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
</script>
<style lang="scss" scoped>
.table-btns :deep(.el-text) {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}
.expand-container {
  padding-left: 50px;
}
</style>

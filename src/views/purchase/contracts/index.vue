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
      <el-form-item label="采购单" prop="refMainId">
        <el-select
          v-model="queryParams.refMainId"
          placeholder="请选择"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in purchaseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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
                prop="inStockNum"
                label="入库数量"
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
              <el-table-column
                prop="remark"
                label="备注"
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
            @click="handleCommand('详情', scope.row)"
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
        label="供方"
        prop="supplierName"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="需方"
        prop="buyerName"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="合同总金额"
        prop="contractPrice"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column label="付款计划" prop="quoteNum" width="120">
        <template v-slot="scope">
          <el-text type="primary" @click="handlePay(2, scope.row)"
            >查看付款计划</el-text
          >
        </template>
      </el-table-column>
      <el-table-column label="付款计划" prop="quoteNum" width="120">
        <template v-slot="scope">
          <el-text type="primary" @click="handlePay(1, scope.row)"
            >添加付款计划</el-text
          >
        </template>
      </el-table-column>
      <el-table-column label="审核状态" prop="quoteNum" width="150">
        <template v-slot="scope">
          <el-text type="info" v-if="scope.row.checkStateStr === '无需审核'">{{
            scope.row.checkStateStr
          }}</el-text>
          <el-tag
            type="warning"
            v-else
            @click="handleCommand('审核详情', scope.row)"
          >
            {{ scope.row.checkStateStr }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        label="计划开始日期"
        prop="planBeginDate"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="计划结束日期"
        prop="planEndDate"
        :show-overflow-tooltip="true"
        width="120"
      />

      <el-table-column
        label="创建人"
        prop="creatorName"
        :show-overflow-tooltip="true"
        width="120"
      />

      <el-table-column label="操作" align="center" fixed="right" width="300">
        <template #default="scope">
          <div class="table-btns">
            <el-text
              type="primary"
              @click="handleCommand('查看', scope.row)"
              v-hasPermi="['sales:contracts:details']"
              >查看合同</el-text
            >
            <el-text type="primary" @click="handleCommand('导出', scope.row)"
              >导出价格明细</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('提审', scope.row)"
              v-if="scope.row.isCheck === 1 && scope.row.published === 2"
              >提审</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('取消提审', scope.row)"
              v-if="scope.row.checkState === -2 && scope.row.published === 1"
              >取消提审</el-text
            >
            <el-text
              type="primary"
              v-if="scope.row.checkState === -1 && scope.row.published === 2"
              @click="handleCommand('提审', scope.row)"
              >重新提审</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('编辑', scope.row)"
              v-hasPermi="['sales:contracts:edit']"
              v-if="scope.row.published !== 1"
              >编辑</el-text
            >
            <el-text
              type="danger"
              @click="handleDelete(scope.row)"
              v-hasPermi="['sales:contracts:remove']"
              v-if="scope.row.published !== 1"
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
  <previewDialog ref="dialogPreviewRef" />
  <auditDialog ref="dialogAuditRef" />
</template>

<script setup name="contracts">
import {
  getContactList,
  deleteContact,
  publishedContact,
  getContactMaterialShow,
  exportContactPrice,
} from '@/api/purchase/contract.js'
import { getPurchaseAll } from '@/api/purchase/purchase.js'
import addDialog from './components/addDialog.vue'
import previewDialog from './components/previewDialog.vue'
import auditDialog from './components/auditDialog.vue'
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const codes = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const purchaseList = ref()
const currentExpandedRowId = ref(null)
const tableRef = ref()

// 采购单
function getPurchaseList() {
  return getPurchaseAll().then((res) => {
    purchaseList.value = res.data || []
  })
}
// 查询列表
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    contractType: 1,
    keyWord: undefined,
    refMainId: undefined,
  },
})
const { queryParams } = toRefs(data)
function getList() {
  loading.value = true
  return getContactList(queryParams.value).then((response) => {
    tableList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}
// 打开 dialog(新增、查看、编辑)
const dialogRef = ref()
const dialogPreviewRef = ref()
const dialogAuditRef = ref()
function handleCommand(title, row) {
  if (title === '新增' || title === '编辑' || title === '详情') {
    dialogRef.value?.acceptParams({
      title,
      row: { ...row },
      isView: title === '详情',
    })
  } else if (title === '查看') {
    dialogPreviewRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  } else if (title === '审核详情') {
    dialogAuditRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  } else if (title === '提审') {
    publishedContact({ id: row.id, published: 1 }).then((response) => {
      proxy.$modal.msgSuccess('操作成功')
    })
    setTimeout(() => {
      resetQuery()
    }, 2000)
  } else if (title === '取消提审') {
    publishedContact({ id: row.id, published: 2 }).then((response) => {
      proxy.$modal.msgSuccess('操作成功')
    })
    setTimeout(() => {
      resetQuery()
    }, 2000)
  } else if (title === '导出') {
     exportContactPrice({ id: row.id })
    .then((response) => {
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      import('file-saver').then(({ saveAs }) => {
        saveAs(blob, `采购合同_${row.name}_价格明细.xlsx`)
      })
      proxy.$modal.msgSuccess('导出成功')
    })
    .catch((error) => {
      console.error('导出失败:', error)
      proxy.$modal.msgError('导出失败，请检查网络或联系管理员')
    })
  }
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  currentExpandedRowId.value = null
  materialList.value = []
  getList()
}
/** 重置查询 */
function resetQuery() {
  proxy.resetForm('queryRef')
  currentExpandedRowId.value = null
  materialList.value = []
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  codes.value = selection.map((item) => item.code)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 删除按钮操作 */
function handleDelete(row) {
  const code = row.code || codes.value
  const arr = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除合同编号为"' + code + '"的数据项？')
    .then(function () {
      return deleteContact(arr)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
const materialList = ref([])
// 获取合同关联的物料信息
const getContactDetail = async (id) => {
  await getContactMaterialShow(id).then(async (res) => {
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
    getContactDetail(row.id)
  } else {
    if (currentExpandedRowId.value === row.id) {
      currentExpandedRowId.value = null
      materialList.value = []
    }
  }
}
const initializeData = async () => {
  await Promise.all([getList(), getPurchaseList()])
  if (route.query.refMainId) {
    queryParams.value.refMainId = parseInt(route.query.refMainId)
    handleQuery()
  }
}
const handlePay = (type, row) => {
  if (type === 2) {
    proxy.$router.push({
      path: '/purchase/contracts/paymentContract',
      query: {
        id: row.id,
      },
    })
  } else {
    proxy.$router.push({
      path: '/purchase/contracts/paymentContractDetail',
      query: {
        id: row.id,
      },
    })
  }
}
initializeData()
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

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
          placeholder="请输入采购名称/采购编号查询"
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
          :disabled="multiple"
          v-hasPermi="['purchase:info:batchAdd']"
          @click="handleCommand('批量', null)"
          >批量生成采购合同</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          :disabled="multiple"
          v-hasPermi="['purchase:info:add']"
          @click="handleCommand('批量询价', null)"
          >批量询价</el-button
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
                width="120"
                align="center"
              />
              <el-table-column
                prop="taxRate"
                label="税率"
                width="100"
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
                label="需求数量"
                width="100"
                align="center"
              />
              <el-table-column
                prop="purchaseQuantity"
                label="采购数量"
                width="100"
                align="center"
              />
              <el-table-column
                prop="inventoryNum"
                label="库存数量"
                width="100"
                align="center"
              />
              <el-table-column
                prop="unitName"
                label="单位"
                width="100"
                align="center"
              />
              <el-table-column
                prop="priceTotal"
                label="未税总价 (元)"
                width="120"
                align="center"
              />
              <el-table-column
                prop="priceTotalIncludeTax"
                label="含税总价 (元)"
                width="120"
                align="center"
              />
              <el-table-column
                prop="demandPersonName"
                label="需求人"
                width="120"
                align="center"
              />
              <el-table-column
                prop="demandDate"
                label="需求时间"
                width="150"
                align="center"
              />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="selection" width="55" align="center" />
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
        label="采购单名称"
        prop="name"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="销售合同名称"
        prop="contractName"
        :show-overflow-tooltip="true"
        width="180"
      />
      <el-table-column
        label="采购总价"
        prop="purchasePrice"
        :show-overflow-tooltip="true"
        width="150"
      />
      <!-- <el-table-column
        label="实际价格"
        prop="actualPrice"
        :show-overflow-tooltip="true"
        width="150"
      /> -->
      <el-table-column
        label="最大货期"
        prop="maxDeliveryDate"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="最大需求日期"
        prop="maxDemandDate"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="采购日期"
        prop="purchaseDate"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="交货日期"
        prop="deliveryDate"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column label="采购合同" prop="contractNum" width="100">
        <template #default="scope">
          <el-tag
            style="cursor: pointer"
            type="primary"
            @click="handleContract(scope.row)"
            >{{ scope.row.contractNum }}</el-tag
          >
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="是否入库"
        prop="storageStatusStr"
        :show-overflow-tooltip="true"
        width="150"
      /> -->
      <el-table-column label="操作" align="center" fixed="right" width="250">
        <template #default="scope">
          <div class="table-btns">
            <el-text
              type="primary"
              @click="handleCommand('合同', scope.row)"
              v-hasPermi="['purchase:inquiry:list']"
              >创建合同</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('询价', scope.row)"
              v-hasPermi="['purchase:inquiry:list']"
              >询价</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('编辑', scope.row)"
              v-hasPermi="['purchase:info:edit']"
              v-if="scope.row.published !== 1"
              >编辑</el-text
            >
            <el-text
              type="danger"
              @click="handleDelete(scope.row)"
              v-hasPermi="['purchase:info:remove']"
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
  <addPurchaseDialog ref="dialogPurchaseRef" @get-table-data="getList" />
  <addDialog ref="dialogRef" @get-table-data="getList" />
  <addInquiryDialog ref="dialogInquiryRef" @get-table-data="getList" />
</template>

<script setup name="purchaseInfo">
import addPurchaseDialog from '../../purchase/components/addPurchaseDialog.vue'
import addDialog from '../../purchase/contracts/components/addDialog.vue'
import addInquiryDialog from '../../purchase/inquiry/components/addDialog.vue'
import {
  showMaterialsPurchase,
  getPurchaseList,
  deletePurchase,
} from '@/api/purchase/purchase.js'
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
const currentExpandedRowId = ref(null)
const tableRef = ref()

// 查询销售合同列表
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
  return getPurchaseList(queryParams.value).then((response) => {
    tableList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const code = row.code || codes.value
  const arr = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除采购编号为"' + code + '"的数据项？')
    .then(function () {
      return deletePurchase(arr)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
// 打开 dialog(新增、查看、编辑)
const dialogPurchaseRef = ref()
const dialogInquiryRef = ref()
const dialogRef = ref()
function handleCommand(title, row) {
  if (title === '询价') {
    proxy.$router.push({
      path: '/purchase/contracts/inquiryComparison',
      query: {
        id: row.id,
      },
    })
  } else if (title === '编辑') {
    dialogPurchaseRef.value?.acceptParams({
      title: '编辑采购单',
      ids: [row.id],
      isBatch: false,
      isEdit: true,
    })
  } else if (title === '批量') {
    dialogRef.value?.acceptParams({
      title: '批量创建采购',
      ids: ids.value,
      isBatch: true,
      refMainId: ids.value.toString(),
    })
  } else if (title === '合同') {
    dialogRef.value?.acceptParams({
      title: '创建采购',
      ids: [row.id], // 单个合同也使用数组
      isBatch: false,
      refMainId: row.id,
    })
  } else if (title === '批量询价') {
    dialogInquiryRef.value?.acceptParams({
      title: '批量新增',
      purchaseId: ids.value,
      isBatch: true,
    })
  }
}
// 关联合同
const handleContract = (row) => {
  // 跳转到合同列表页面
  proxy.$router.push({
    path: '/purchase/purchaseContracts',
    query: {
      refMainId: row.id,
    },
  })
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
const materialList = ref([])
// 获取采购关联的物料信息
const getPurchaseDetail = async (id) => {
  await showMaterialsPurchase(id).then(async (res) => {
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
    getPurchaseDetail(row.id)
  } else {
    if (currentExpandedRowId.value === row.id) {
      currentExpandedRowId.value = null
      materialList.value = []
    }
  }
}
const initializeData = async () => {
  await Promise.all([getList()])
  if (route.query.refMainId) {
    queryParams.value.refMainId = parseInt(route.query.refMainId)
    handleQuery()
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

<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleCommand('新增', null)"
          >添加询价单</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      row-key="id"
      @expand-change="expandChange"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="expand-container">
            <el-table
              :data="detailInquiry"
              border
              style="width: 100%"
              class="material-table"
              v-if="props.row.id === currentExpandedRowId"
            >
              <el-table-column
                type="index"
                label="序号"
                width="60"
                align="center"
              />
              <el-table-column prop="name" label="物料名称" align="center" />
              <el-table-column prop="brand" label="品牌" align="center" />
              <el-table-column prop="model" label="型号" align="center" />
              <el-table-column
                prop="purchaseQuantity"
                label="数量"
                align="center"
              />
              <el-table-column prop="unitName" label="单位" align="center" />
              <el-table-column
                prop="priceIncludeTax"
                label="报价单价（元）"
                align="center"
              />
              <el-table-column
                prop="priceTotalIncludeTax"
                label="报价金额（元）"
                align="center"
              />
              <el-table-column
                prop="balance"
                label="与预估差异（元）"
                align="center"
              >
                <template #default="{ row }">
                  <span :style="{ color: row.balance < 0 ? 'red' : 'green' }">
                    ¥ {{ row.balance }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="supplierName" label="供应商" align="center" />
      <el-table-column prop="inquiryPrice" label="报价总金额" align="center" />
      <el-table-column prop="inquiryDate" label="报价日期" align="center" />
      <el-table-column
        prop="maxDeliveryDate"
        label="最大货期（天）"
        align="center"
      />
      <el-table-column label="操作" align="center" fixed="right" width="200">
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
import {
  deleteInquiry,
  listInquiryPage,
  detailsInquiry,
} from '@/api/purchase/inquiry.js'
import addDialog from './components/addDialog.vue'
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const tableRef = ref()
const route = useRoute()
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const queryID = 0
const total = ref(0)
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
})
const { queryParams } = toRefs(data)
function getList() {
  loading.value = true
  listInquiryPage(queryParams.value).then(async (res) => {
    tableList.value = res.rows
    loading.value = false
    total.value = res.total
  })
}
getList()
const detailInquiry = ref()
const currentExpandedRowId = ref(null)
// 表格展开事件
const expandChange = async (row, expandedRows) => {
  const isExpanded = expandedRows.some((item) => item.id === row.id)

  if (isExpanded) {
    try {
      const res = await detailsInquiry(row.id)
      detailInquiry.value = res.data?.meterials || []
      currentExpandedRowId.value = row.id
    } catch (error) {
      proxy.$modal.msgError('加载详情失败')
    }
  } else {
    // 收起时清空数据
    if (currentExpandedRowId.value === row.id) {
      currentExpandedRowId.value = null
      detailInquiry.value = []
    }
  }
}
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
    .confirm('是否确认删除该数据项?')
    .then(function () {
      return deleteInquiry(id)
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

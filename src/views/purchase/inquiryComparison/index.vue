<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title-with-bar"
            >采购单询价比价
            <span style="font-size: 12px; color: gray; font-weight: normal">
              对比供应商报价并创建采购合同
            </span></span
          >
          <div class="header-actions">
            <el-select
              placeholder="请选择询价单"
              v-model="purchaseId"
              @change="getPurchase"
            >
              <el-option
                v-for="item in allPurchase"
                :key="item.id"
                :value="item.id.toString()"
                :label="item.name"
              >
              </el-option>
            </el-select>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="info-item">
            <span class="label">采购单号</span>
            <span class="value">{{ baseInfo?.code }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="info-item">
            <span class="label">采购单名称</span>
            <span class="value">{{ baseInfo?.name }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="info-item">
            <span class="label">关联合同</span>
            <span class="value">{{ baseInfo?.contractName }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="info-item">
            <span class="label">采购日期</span>
            <span class="value">{{ baseInfo?.purchaseDate }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="info-item">
            <span class="label">预计到货日期</span>
            <span class="value">{{ baseInfo?.deliveryDate }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="info-item">
            <span class="label">
              <el-button type="info" round>询价中</el-button>
            </span>
            <span class="value">
              <el-button link type="primary" @click="editCommand"
                >编辑采购单</el-button
              >
            </span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card mt-20">
      <template #header>
        <div class="card-header">
          <span class="title-with-bar">采购物品明细</span>
        </div>
      </template>
      <el-table :data="materialList" style="width: 100%" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="物料名称" align="center" />
        <el-table-column prop="brand" label="品牌" align="center" />
        <el-table-column prop="model" label="型号" align="center" />
        <el-table-column prop="purchaseQuantity" label="数量" align="center" />
        <el-table-column prop="unitName" label="单位" align="center" />
        <el-table-column
          prop="priceIncludeTax"
          label="预估单价"
          align="center"
        />
        <el-table-column
          prop="priceTotalIncludeTax"
          label="预估金额"
          align="center"
        />
      </el-table>
      <div class="total-summary">合计：¥ {{ totalEstimatedPrice }}</div>
    </el-card>

    <el-card class="box-card mt-20">
      <template #header>
        <div class="card-header">
          <span class="title-with-bar">供应商报价对比</span>
          <el-button type="primary" @click="handleCommand('新增', null)"
            >添加供应商报价</el-button
          >
        </div>
      </template>
      <el-table
        ref="tableRef"
        :data="supplierQuotes"
        style="width: 100%"
        border
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
        <el-table-column prop="supplierName" label="供应商" align="center">
          <template #default="{ row, $index }">
            {{ row.supplierName }}
            <el-button
              type="success"
              circle
              style="margin-left: 5px"
              v-if="$index === 0"
            >
              优
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="inquiryPrice"
          label="报价总金额"
          align="center"
        />
        <el-table-column prop="balance" label="较预估" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.balance < 0 ? 'red' : 'green' }">
              ¥ {{ row.balance }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inquiryDate" label="报价日期" align="center" />
        <el-table-column
          prop="maxDeliveryDate"
          label="货期（天）"
          align="center"
        />
        <el-table-column prop="paymentTerms" label="付款条件" align="center" />
        <el-table-column label="操作" width="300" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)"
              >查看详情</el-button
            >
            <el-button link type="primary" @click="handleCommand('创建', row)"
              >创建合同</el-button
            >
            <el-button link type="primary" @click="handleCommand('编辑', row)"
              >编辑</el-button
            >
            <el-button link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="box-card mt-20">
      <template #header>
        <div class="card-header">
          <span class="recommend-title"
            ><el-icon color="#67c23a"><TrophyBase /></el-icon>推荐供应商</span
          >
        </div>
      </template>
      <el-table
        :data="recommendedSupplier"
        style="width: 100%"
        border
        class="recommend-table"
      >
        <el-table-column prop="supplierName" label="供应商" align="center" />
        <el-table-column
          prop="inquiryPrice"
          label="询价总金额"
          align="center"
        />
        <el-table-column
          prop="maxDeliveryDate"
          label="最大货期"
          align="center"
        />
        <el-table-column prop="balance" label="价格优势" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.balance < 0 ? 'red' : 'green' }">
              ¥ {{ row.balance }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inquiryDate" label="报价日期" align="center" />
      </el-table>
      <div class="recommend-actions">
        <el-button
          type="primary"
          @click="handleCommand('推荐', null)"
          v-if="recommendedSupplier.length > 0"
          >选择此供应商创建采购合同</el-button
        >
      </div>
    </el-card>
  </div>
  <addPurchaseDialog
    ref="dialogPurchaseRef"
    @get-table-data="getPurchaseAllHandler"
  />
  <addDialog ref="dialogRef" @get-table-data="loadData" />
  <addContractDialog ref="dialogContractRef" />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue'
import { getPurchaseAll, detailsPurchase } from '@/api/purchase/purchase.js'
import addPurchaseDialog from '../../purchase/components/addPurchaseDialog.vue'
import addContractDialog from '../../purchase/contracts/components/addDialog.vue'
import addDialog from './components/addDialog.vue'
import {
  purchaseInquiry,
  deleteInquiry,
  listInquiry,
  detailsInquiry,
  recommendInquiry,
} from '@/api/purchase/inquiry.js'
import { useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const route = useRoute()

const purchaseId = ref(null)
const allPurchase = ref([])
const baseInfo = ref(null)
const materialList = ref([])
const supplierQuotes = ref([])
const recommendedSupplier = ref([])
const detailInquiry = ref([])
const currentExpandedRowId = ref(null)

const dialogPurchaseRef = ref()
const dialogRef = ref()
const tableRef = ref()
const totalEstimatedPrice = computed(() => {
  if (!materialList.value || materialList.value.length === 0) return '0.00'
  const total = materialList.value.reduce(
    (sum, item) => sum + (parseFloat(item.priceTotalIncludeTax) || 0),
    0
  )
  return total.toFixed(2)
})

// 监听purchaseId变化
watch(purchaseId, (newValue) => {
  if (newValue) {
    localStorage.setItem('selectedPurchaseId', newValue)
  }
})

// 获取所有采购单
const getPurchaseAllHandler = async () => {
  const res = await getPurchaseAll()
  allPurchase.value = res.data || []
  const savedId = localStorage.getItem('selectedPurchaseId')
  const urlId = Array.isArray(route.query.id)
    ? route.query.id[0]
    : route.query.id

  if (urlId) {
    purchaseId.value = urlId.toString()
  } else if (
    savedId &&
    allPurchase.value.some((item) => item.id.toString() === savedId)
  ) {
    purchaseId.value = savedId
  } else if (allPurchase.value.length > 0) {
    purchaseId.value = allPurchase.value[0].id.toString()
  }

  if (purchaseId.value) {
    loadData()
  }
}

// 统一数据加载
const loadData = async () => {
  if (!purchaseId.value) return
  const [baseRes, materialRes, quotesRes, recommendRes] = await Promise.all([
    detailsPurchase(purchaseId.value),
    purchaseInquiry(purchaseId.value),
    listInquiry(purchaseId.value),
    recommendInquiry(purchaseId.value),
  ])
  baseInfo.value = baseRes.data
  materialList.value = materialRes.data || []
  supplierQuotes.value = quotesRes.rows || []
  recommendedSupplier.value = recommendRes.data ? [recommendRes.data] : []
}

// 下拉选择事件
const getPurchase = () => {
  currentExpandedRowId.value = null
  detailInquiry.value = []
  loadData()
}

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

// 查看详情按钮 - 直接触发展开
const handleDetail = (row) => {
  if (!tableRef.value) {
    return
  }
  tableRef.value.toggleRowExpansion(row, true)
}

// 删除操作
const handleDelete = async (row) => {
  try {
    await proxy.$modal.confirm(`是否确认删除该数据项？`)
    await deleteInquiry(row.id)
    await getPurchaseAllHandler()
    proxy.$modal.msgSuccess('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      proxy.$modal.msgError('删除失败')
    }
  }
}

// 编辑采购单
const editCommand = () => {
  if (!purchaseId.value) return
  dialogPurchaseRef.value?.acceptParams({
    title: '编辑采购单',
    ids: [purchaseId.value],
    isBatch: false,
    isEdit: true,
  })
}

// 打开对话框
const dialogContractRef = ref()
const handleCommand = (title, row) => {
  if (!purchaseId.value) return
  tableRef.value.toggleRowExpansion(row, false)
  if (title === '编辑' || title === '新增') {
    dialogRef.value?.acceptParams({
      title: title + '供应商',
      purchaseId: purchaseId.value,
      row: row,
    })
  } else if (title === '创建' || title === '推荐') {
    dialogContractRef.value?.acceptParams({
      title,
      refMainId: purchaseId.value,
      row: title === '创建' ? row : recommendedSupplier.value[0],
      isInquiry: true,
      ids: [purchaseId.value], // 单个合同也使用数组
    })
  }
}

onMounted(() => {
  getPurchaseAllHandler()
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
.box-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.header-actions {
  display: flex;
  align-items: center;
}
.header-actions .el-button + .el-button {
  margin-left: 10px;
}
.info-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  line-height: 2;
}
.info-item .label {
  color: #909399;
  font-size: 14px;
}
.info-item .value {
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}
.mt-10 {
  margin-top: 10px;
}
.mt-20 {
  margin-top: 20px;
}
.total-summary {
  text-align: right;
  padding: 10px;
  font-weight: bold;
  font-size: 16px;
  color: #e6a23c;
}
.recommend-title {
  .el-icon {
    font-size: 18px;
    margin-right: 10px;
    font-weight: bold;
  }
}
.recommend-actions {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}
.el-table--border {
  border-radius: 8px;
  overflow: hidden;
}
.title-with-bar {
  position: relative;
  padding-left: 10px;
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
.expand-container {
  padding: 0px 20px;
}
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}报价单`"
    :destroy-on-close="true"
    width="75%"
    draggable
  >
    <div class="main-content">
      <el-form
        ref="ruleFormRef"
        label-width="120px"
        :model="baseInfoData"
        :rules="rules"
        class="elegant-form"
        :disabled="dialogProps.isView"
      >
        <div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-card">
                <div class="info-header">
                  <el-icon class="info-icon"><Avatar /></el-icon>
                  <span class="info-title">询价信息</span>
                </div>
                <div class="info-content">
                  <div class="info-item">
                    <span class="info-label">询价单位：</span>
                    <span class="info-value">{{
                      baseInfoData.inquiryUnitName
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">询价人员：</span>
                    <span class="info-value">{{
                      baseInfoData.inquiryUnitContacts
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">联系方式：</span>
                    <span class="info-value">{{
                      baseInfoData.inquiryUnitContactsPhone
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">询价日期：</span>
                    <span class="info-value">{{
                      baseInfoData.inquiryDate
                    }}</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-card">
                <div class="info-header">
                  <el-icon class="info-icon"><UserFilled /></el-icon>
                  <span class="info-title">报价信息</span>
                </div>
                <div class="info-content">
                  <div class="info-item">
                    <span class="info-label">报价单位：</span>
                    <span class="info-value">{{
                      baseInfoData.quoteUnitName
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">报价人员：</span>
                    <span class="info-value">{{
                      baseInfoData.quoteUnitContacts
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">联系方式：</span>
                    <span class="info-value">{{
                      baseInfoData.quoteUnitContactsPhone
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">报价日期：</span>
                    <span class="info-value">{{ baseInfoData.quoteDate }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="card-section">
          <div class="table-actions">
            <p>
              选择报价单：<el-select
                v-model="countId"
                size="medium"
                @change="changRefList"
              >
                <el-option
                  v-for="item in countList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </p>
            <el-button
              type="primary"
              :icon="Plus"
              plain
              size="default"
              @click="chooseMaterial"
              v-if="!dialogProps.isView"
              >选择物料</el-button
            >
          </div>
          <el-table
            :data="formData.meterials"
            border
            style="width: 100%"
            class="material-table"
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
              label="规格型号"
              width="120"
              align="center"
            />
            <el-table-column label="未税单价 (元)" width="120" align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.price"
                  size="medium"
                  @change="updateTaxPrice(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="税率" width="150" align="center">
              <template #default="{ row }">
                <el-select
                  v-model="row.taxRateType"
                  size="medium"
                  @change="updateTaxPrice(row)"
                >
                  <el-option
                    v-for="dict in products_tax_rate"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="含税单价 (元)"
              width="120"
              align="center"
              prop="taxPrice"
            >
            </el-table-column>
            <el-table-column label="需求数量" width="100" align="center">
              <template #default="{ row }">
                <el-input 
                  v-model="row.demandQuantity" 
                  :min="1" 
                  size="medium" 
                />
              </template>
            </el-table-column>
            <el-table-column label="货期 (天)" width="100" align="center">
              <template #default="{ row }">
                <el-input v-model="row.deliveryDate" :min="1" size="medium" />
              </template>
            </el-table-column>
            <el-table-column
              prop="unitName"
              label="计量单位"
              align="center"
                width="100"
            />
            <el-table-column
              label="操作"
              width="100"
              fixed="right"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="handleDeleteMaterial(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <!-- 总价显示区域 -->
          <div class="total-price-row">
            <div class="total-price-content">
              <span class="total-label">{{ totalPriceLabel }}：</span>
              <span class="total-value"
                >￥{{ displayTotalPrice }}</span
              >
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="handleSubmit()"
        v-if="!dialogProps.isView"
        >保存</el-button
      >
      <el-button @click="closeDialog">关闭</el-button>
    </template>
  </el-dialog>

  <MaterialSelectDialog
    v-model="showMaterialSelect"
    @confirm="onMaterialSelect"
    title="选择产品/物料"
    selectionMode="multiple"
    :defaultSelected="defaultSelected"
  />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Plus,
  Delete,
  Search,
  Avatar,
  UserFilled,
} from '@element-plus/icons-vue'
import CustomDivider from '@/components/CustomDivider/index.vue'
import MaterialSelectDialog from '../../components/MaterialSelectDialog.vue'
import {
  getQuotationDetail,
  materialsQuotation,
  countQuotation,
  againSaveQuotation,
} from '@/api/sales/myQuotation'
const { proxy } = getCurrentInstance()
const { products_tax_rate } = proxy.useDict('products_tax_rate')
const dialogVisible = ref(false)
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: '',
  row: {},
})
const baseInfoData = ref({})
const countList = ref([])
const countId = ref(null)

const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  if (params.row.id) {
    formData.value.refId = params.row.id
    // 获取报价次数
    await countQuotation({ id: params.row.id }).then(async (res) => {
      countList.value = res.data
      // 设置默认选中最后一个选项
      if (res.data && res.data.length > 0) {
        countId.value = res.data[res.data.length - 1].id
        // 获取报价单关联的物料信息
        await getMyQuotationDetail(countId.value)
      }
    })
    // 获取基础信息
    await getQuotationDetail({ id: params.row.id }).then(async (res) => {
      baseInfoData.value = res.data
      // 设置价格显示类型，默认为显示未税价格
      baseInfoData.value.priceShowType = res.data.priceShowType || 1
    })
  }
}
// 获取报价单关联的物料信息
const getMyQuotationDetail = async (id) => {
  await materialsQuotation({ id: id }).then(async (res) => {
    const data = res.data
    formData.value.meterials = (data || []).map((item) => ({
      id: item.id,
      materialsId: item.materialsId,
      name: item.name,
      specifications: item.specifications,
      unitName: item.unitName,
      brand: item.brand,
      price: item.price, // 未税单价
      deliveryDate: item.deliveryDate,
      demandQuantity: item.demandQuantity,
      taxRateType: String(item.taxRateType),
      taxPrice: item.priceIncludeTax, // 含税单价
    }))
  })
}

// 选择报价单变化时的处理函数
const changRefList = async (countId) => {
  if (countId) {
    await getMyQuotationDetail(countId)
  }
}
const formData = ref({
  id: 0,
  meterials: [],
  refId: null,
})

const rules = reactive({})
// 选择产品/物料信息
const showMaterialSelect = ref(false)
const defaultSelected = ref([])
const chooseMaterial = () => {
  // 将已选择的物料传递给对话框，使用 materialsId 作为标识
  defaultSelected.value = formData.value.meterials.map((item) => ({
    id: item.materialsId, // 使用 materialsId 作为物料的唯一标识
    materialsId: item.materialsId,
    name: item.name,
    specifications: item.specifications,
    unitName: item.unitName,
    brand: item.brand,
    price: item.price,
    demandQuantity: item.demandQuantity,
    taxRateType: item.taxRateType,
    taxPrice: item.taxPrice,
  }))
  showMaterialSelect.value = true
}
// 计算含税价格
const updateTaxPrice = (row) => {
  const price = parseFloat(row.price)
  if (isNaN(price)) {
    row.taxPrice = ''
    return
  }
  const selectedRateItem = products_tax_rate.value.find(
    (rate) => rate.value === String(row.taxRateType)
  )
  // 获取找到的税率，如果没找到则默认为 0
  const taxRate = selectedRateItem
    ? parseFloat(selectedRateItem.value) / 100
    : 0
  // 计算含税单价
  const calculatedTaxPrice = (price * (1 + taxRate)).toFixed(2)
  row.taxPrice = calculatedTaxPrice
}

const onMaterialSelect = (selectedData) => {
  if (!selectedData || selectedData.length === 0) {
    ElMessage.info('未选择任何物料')
    return
  }

  // 获取已存在的物料ID列表，避免重复添加
  const existingMaterialIds = formData.value.meterials.map(
    (item) => item.materialsId
  )

  // 只添加新的物料，过滤已存在的
  const newMaterials = []
  selectedData.forEach((item) => {
    // 检查是否已经存在
    if (!existingMaterialIds.includes(item.id)) {
      const defaultTaxRateType =
        products_tax_rate.value && products_tax_rate.value.length > 0
          ? products_tax_rate.value[0].value
          : '0'
      const selectedRateItem = products_tax_rate.value.find(
        (rate) => rate.value === defaultTaxRateType
      )
      const taxRate = selectedRateItem
        ? parseFloat(selectedRateItem.value) / 100
        : 0
      const initialPrice = parseFloat(item.price) || 0
      const calculatedTaxPrice = (initialPrice * (1 + taxRate)).toFixed(2)
      const newMaterial = {
        id: item.id,
        materialsId: item.id,
        name: item.name,
        specifications: item.specifications,
        unitName: item.unitName,
        brand: item.brand,
        price: initialPrice, // 设置未税单价
        deliveryDate: '',
        demandQuantity: '',
        taxRateType: defaultTaxRateType, // 设置默认税率
        taxPrice: calculatedTaxPrice, // 设置计算出的含税单价
      }
      newMaterials.push(newMaterial)
    }
  })

  // 将新物料添加到现有列表中
  formData.value.meterials.push(...newMaterials)

  if (newMaterials.length > 0) {
    ElMessage.success(`成功添加 ${newMaterials.length} 条新物料`)
  } else {
    ElMessage.info('所选物料已存在，未添加新物料')
  }

  showMaterialSelect.value = false
}
const handleSubmit = async () => {
  if (formData.value.meterials.length === 0) {
    ElMessage.error('请添加物料')
    return
  }
  for (let i = 0; i < formData.value.meterials.length; i++) {
    const material = formData.value.meterials[i]
    if (!material.price) {
      ElMessage.error(`第 ${i + 1} 行物料的未税单价为必填项`)
      return
    }
    if (!material.demandQuantity) {
      ElMessage.error(`第 ${i + 1} 行物料的需求数量为必填项`)
      return
    }
  }
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = await againSaveQuotation(formData.value)
      if (res.code === 200) {
        ElMessage.success('提交成功')
        closeDialog()
        emits('getTableData')
      } else {
        ElMessage.error(res.msg)
      }
    } else {
      ElMessage.error('请完整填写表单必填项')
    }
  })
}

const handleDeleteMaterial = (row) => {
  const index = formData.value.meterials.findIndex((item) => item.id === row.id)
  if (index > -1) {
    formData.value.meterials.splice(index, 1)
    ElMessage.success('物料删除成功')
  }
}
// 计算含税总价函数
const calculateTotalPrice = (materials) => {
  if (!materials || materials.length === 0) {
    return '0.00'
  }
  const total = materials.reduce((sum, material) => {
    // 使用含税单价 * 数量 计算每一项的总价
    const taxPrice = parseFloat(material.taxPrice) || 0
    const quantity = parseFloat(material.demandQuantity) || 0
    return sum + (taxPrice * quantity)
  }, 0)

  return total.toFixed(2)
}

// 计算未税总价函数
const calculateUntaxedTotalPrice = (materials) => {
  if (!materials || materials.length === 0) {
    return '0.00'
  }
  const total = materials.reduce((sum, material) => {
    // 使用未税单价 * 数量 计算每一项的总价
    const price = parseFloat(material.price) || 0
    const quantity = parseFloat(material.demandQuantity) || 0
    return sum + (price * quantity)
  }, 0)
  return total.toFixed(2)
}

// 响应式计算属性，实时计算含税总价
const totalPrice = computed(() => {
  return calculateTotalPrice(formData.value.meterials)
})

// 响应式计算属性，实时计算未税总价
const untaxedTotalPrice = computed(() => {
  return calculateUntaxedTotalPrice(formData.value.meterials)
})

// 动态显示总价标签
const totalPriceLabel = computed(() => {
  return baseInfoData.value.priceShowType === 1 ? '未税总价' : '含税总价'
})

// 动态显示总价数值
const displayTotalPrice = computed(() => {
  return baseInfoData.value.priceShowType === 1 ? untaxedTotalPrice.value : totalPrice.value
})

const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    id: 0,
    meterials: [],
    refId: null,
  }
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss">
.total-price-row {
  margin-top: 0;
  border: 1px solid #ebeef5;
  border-top: none;
  background-color: #fafafa;

  .total-price-content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 12px 16px;

    .total-label {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-right: 12px;
    }

    .total-value {
      font-size: 16px;
      font-weight: 700;
      color: #e6a23c;
      background: #fdf6ec;
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid #f5dab1;
    }
  }
}
.elegant-form {
  .card-section {
    background-color: var(--el-bg-color);
    border-radius: 8px;
    padding: 10px 20px;
    margin-bottom: 20px;
    margin-top: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e4e7ed;
  }

  .el-form-item {
    margin-bottom: 20px;
    .remark-content {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed rgb(87, 126, 255);
  padding-bottom: 10px;
  p {
    font-size: 14px;
    font-weight: 700;
  }
}

.material-table {
  margin-top: 20px;
  min-height: 250px;
}
.info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .info-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;

    .info-icon {
      color: #409eff;
      font-size: 18px;
      margin-right: 8px;
    }

    .info-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .info-content {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 6px 0;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        flex-shrink: 0;
        width: 80px;
        font-size: 14px;
        font-weight: 500;
        color: #606266;
        margin-right: 8px;
      }

      .info-value {
        flex: 1;
        font-size: 14px;
        color: #303133;
        background: rgba(255, 255, 255, 0.8);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        min-height: 22px;
        line-height: 22px;
      }
    }
  }
}
</style>

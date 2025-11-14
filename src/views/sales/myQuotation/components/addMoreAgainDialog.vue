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
        :model="formData"
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
                      formData.inquiryUnitName
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">询价人员：</span>
                    <span class="info-value">{{
                      formData.inquiryUnitContacts
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">联系方式：</span>
                    <span class="info-value">{{
                      formData.inquiryUnitContactsPhone
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">询价日期：</span>
                    <span class="info-value">{{ formData.inquiryDate }}</span>
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
                    <span class="info-value">{{ formData.quoteUnitName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">报价人员：</span>
                    <span class="info-value">{{
                      formData.quoteUnitContacts
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">联系方式：</span>
                    <span class="info-value">{{
                      formData.quoteUnitContactsPhone
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">报价日期：</span>
                    <span class="info-value">{{ formData.quoteDate }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 报价记录列表 -->
        <div
          class="card-section"
          v-for="quotation in quotationList"
          :key="quotation.id"
        >
          <div class="table-actions">
            <p>
              {{ quotation.times }}
              <span
                class="submit-status"
                :class="quotation.isSubmit === 1 ? 'submitted' : 'draft'"
              >
                {{ quotation.isSubmit === 1 ? '已提交' : '草稿' }}
              </span>
            </p>
            <div class="action-buttons" v-if="quotation.isSubmit !== 1">
              <el-button
                type="primary"
                :icon="Plus"
                plain
                @click="chooseMaterial(quotation)"
                v-if="!dialogProps.isView"
                >选择物料</el-button
              >
            </div>
          </div>
          <el-table
            :data="quotation.meterials"
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
                  :disabled="quotation.isSubmit === 1"
                />
              </template>
            </el-table-column>
            <el-table-column label="税率" width="150" align="center">
              <template #default="{ row }">
                <el-select
                  v-model="row.taxRateType"
                  size="medium"
                  @change="updateTaxPrice(row)"
                  :disabled="quotation.isSubmit === 1"
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
              prop="priceIncludeTax"
            >
            </el-table-column>
            <el-table-column label="需求数量" width="100" align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.demandQuantity"
                  :min="1"
                  size="medium"
                  :disabled="quotation.isSubmit === 1"
                />
              </template>
            </el-table-column>
            <el-table-column label="货期 (天)" width="100" align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.deliveryDate"
                  :min="1"
                  size="medium"
                  :disabled="quotation.isSubmit === 1"
                />
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
              v-if="quotation.isSubmit !== 1"
            >
              <template #default="{ row }">
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="handleDeleteMaterial(row, quotation)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <!-- 总价显示行（仅在已提交状态时显示） -->
          <div class="total-price-row" v-if="quotation.isSubmit === 1">
            <div class="total-price-content">
              <span class="total-label">总价：</span>
              <span class="total-value"
                >￥{{ calculateTotalPrice(quotation.meterials) }}</span
              >
            </div>
          </div>

          <!-- 表格底部操作按钮 -->
          <div class="table-footer-actions">
            <div class="right-actions">
              <template v-if="quotation.isSubmit === 1">
                <el-button
                  type="primary"
                  size="default"
                  @click="handleQuotation(quotation)"
                  >查看报价单</el-button
                >
              </template>
              <template v-else>
                <el-button
                  type="success"
                  size="default"
                  @click="handleEdit(quotation)"
                  >保存修改</el-button
                >
                <el-button
                  type="danger"
                  size="default"
                  @click="handleDelete(quotation)"
                  >删除</el-button
                >
                <el-button
                  type="primary"
                  size="default"
                  @click="handleQuotation(quotation)"
                  >查看报价单</el-button
                >
              </template>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <template #footer>
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
  <quotationDialog ref="quotationDialogRef" />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import {
  Plus,
  Delete,
  Search,
  Avatar,
  UserFilled,
} from '@element-plus/icons-vue'
import MaterialSelectDialog from '../../components/MaterialSelectDialog.vue'
import {
  moreQuotation,
  deleteQuotation,
  againSaveQuotation,
} from '@/api/sales/myQuotation'
import quotationDialog from './quotationDialog.vue'
const { proxy } = getCurrentInstance()
const { products_tax_rate } = proxy.useDict('products_tax_rate')
const dialogVisible = ref(false)
const quotationDialogRef = ref(false)
const keyID = ref()
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: '',
  row: {},
})
const formData = ref({})
const quotationList = ref([]) // 存储所有报价记录
const currentQuotation = ref(null) // 当前操作的报价记录
const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  if (params.row.id) {
    keyID.value = params.row.id
    getMyQuotationDetail(params.row.id)
  }
}
// 获取多次报价详情接口
const getMyQuotationDetail = async (id) => {
  await moreQuotation({ id: id }).then(async (res) => {
    const data = res.data
    formData.value = data
    // 将childs数据映射到quotationList
    quotationList.value = formData.value.childs.map((child) => ({
      ...child,
      meterials: child.meterials.map((material) => ({
        ...material,
        taxRateType: String(material.taxRateType),
      })),
    }))
  })
}

const rules = reactive({})
// 选择产品/物料信息
const showMaterialSelect = ref(false)
const defaultSelected = ref([])
const chooseMaterial = (quotation) => {
  currentQuotation.value = quotation
  // 将已选择的物料传递给对话框，使用 materialsId 作为标识
  defaultSelected.value = quotation.meterials.map((item) => ({
    id: item.materialsId, // 使用 materialsId 作为物料的唯一标识
    materialsId: item.materialsId,
    name: item.name,
    specifications: item.specifications,
    unitName: item.unitName,
    brand: item.brand,
    price: item.price,
    demandQuantity: item.demandQuantity,
    taxRateType: item.taxRateType,
    priceIncludeTax: item.priceIncludeTax,
  }))
  showMaterialSelect.value = true
}
// 计算总价
const calculateTotalPrice = (materials) => {
  if (!materials || materials.length === 0) {
    return '0.00'
  }
  const total = materials.reduce((sum, material) => {
    const price = parseFloat(material.priceIncludeTax) || 0
    const quantity = parseFloat(material.demandQuantity) || 0
    return sum + price * quantity
  }, 0)

  return total.toFixed(2)
}

// 计算含税价格
const updateTaxPrice = (row) => {
  const price = parseFloat(row.price)
  if (isNaN(price)) {
    row.priceIncludeTax = ''
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
  row.priceIncludeTax = calculatedTaxPrice
}
const onMaterialSelect = (selectedData) => {
  if (!selectedData || selectedData.length === 0 || !currentQuotation.value) {
    ElMessage.info('未选择任何物料')
    return
  }
  // 获取已存在的物料ID列表，避免重复添加
  const existingMaterialIds = currentQuotation.value.meterials.map(
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
        priceIncludeTax: calculatedTaxPrice, // 设置计算出的含税单价
      }
      newMaterials.push(newMaterial)
    }
  })

  // 将新物料添加到当前报价记录中
  currentQuotation.value.meterials.push(...newMaterials)

  if (newMaterials.length > 0) {
    ElMessage.success(`成功添加 ${newMaterials.length} 条新物料`)
  } else {
    ElMessage.info('所选物料已存在，未添加新物料')
  }
  showMaterialSelect.value = false
  currentQuotation.value = null
}
// 提交修改
const handleEdit = async (quotation) => {
  // 验证物料数据
  if (quotation.meterials.length === 0) {
    ElMessage.error('请添加物料')
    return
  }
  for (let i = 0; i < quotation.meterials.length; i++) {
    const material = quotation.meterials[i]
    if (!material.price) {
      ElMessage.error(`第 ${i + 1} 行物料的未税单价为必填项`)
      return
    }
    if (!material.demandQuantity) {
      ElMessage.error(`第 ${i + 1} 行物料的需求数量为必填项`)
      return
    }
  }
  try {
    const submitData = {
      id: quotation.id,
      refId: quotation.refId,
      meterials: quotation.meterials,
    }
    const res = await againSaveQuotation(submitData)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      getMyQuotationDetail(keyID.value)
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  }
}
// 删除报价
const handleDelete = (quotation) => {
  const id = quotation.id
  proxy.$modal
    .confirm('是否确认删除该报价记录?')
    .then(function () {
      return deleteQuotation({ id: id })
    })
    .then(() => {
      getMyQuotationDetail(keyID.value)
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

// 查看报价单
const handleQuotation = (quotation) => {
  quotationDialogRef.value?.acceptParams({
    row: { ...quotation },
  })
}
const handleDeleteMaterial = (row, quotation) => {
  const index = quotation.meterials.findIndex((item) => item.id === row.id)
  if (index > -1) {
    quotation.meterials.splice(index, 1)
    ElMessage.success('物料删除成功')
  }
}

const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {}
  quotationList.value = []
  currentQuotation.value = null
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss">
.el-dialog__body {
  padding-top: 10px;
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
  max-height: 300px;
  min-height: 200px;
  overflow-y: scroll;
}

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
.submit-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
  &.submitted {
    background-color: #f0f9ff;
    color: #1890ff;
    border: 1px solid #d1e9ff;
  }

  &.draft {
    background-color: #fff7e6;
    color: #fa8c16;
    border: 1px solid #ffd591;
  }
}
.table-footer-actions {
  display: flex;
  justify-content: right;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;
  border-top: 1px solid #e4e7ed;
  .right-actions {
    display: flex;
    gap: 8px;
  }
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

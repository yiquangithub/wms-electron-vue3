<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}报价`"
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
        <div class="card-section">
          <CustomDivider title="询价信息"></CustomDivider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="供应商" prop="supplierName" required>
                <el-input
                  v-model="formData.supplierName"
                  placeholder="请选择供应商"
                  readonly
                  @click="chooseContact"
                >
                  <template #suffix>
                    <el-icon class="el-input__icon" style="cursor: pointer">
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="付款条件" prop="paymentTerms">
                <el-input
                  v-model="formData.paymentTerms"
                  placeholder="填写付款条件"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报价日期" prop="inquiryDate">
                <el-date-picker
                  v-model="formData.inquiryDate"
                  type="date"
                  placeholder="请选择日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" placeholder="填写备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="card-section">
          <div class="table-actions">
            <p>采购物品明细</p>
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
              label="规格型号"
              width="120"
              align="center"
            />

            <!-- <el-table-column
              label="需求数量"
              width="120"
              align="center"
              prop="demandQuantity"
            >
            </el-table-column> -->
            <el-table-column label="采购数量" width="120" align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.purchaseQuantity"
                  :min="1"
                  size="medium"
                  @change="updatePrice(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="报价单价 (元)" width="120" align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.price"
                  size="medium"
                  @change="updatePrice(row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="报价金额 (元)"
              width="120"
              align="center"
              prop="purchasePrice"
            >
            </el-table-column>
            <el-table-column label="货期 (天)" width="120" align="center">
              <template #default="{ row }">
                <el-input v-model="row.deliveryDate" :min="1" size="medium" />
              </template>
            </el-table-column>
            <el-table-column prop="unitName" label="单位" align="center" />
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
        </div>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="handleSubmit(1)"
        v-if="!dialogProps.isView"
        >提交</el-button
      >
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
  <MaterialSelectDialog
    v-model="showMaterialSelect"
    @confirm="onMaterialSelect"
    title="选择产品/物料"
    selectionMode="multiple"
    :defaultSelected="defaultSelected"
  />
  <ContactSelectDialog
    v-model="showContactSelect"
    @confirm="onContactSelect"
    title="选择供应商/公司"
    selectionMode="single"
    :defaultSelected="defaultContactSelected"
  />
</template>

<script setup>
import ContactSelectDialog from '../../../sales/components/ContactSelectDialog.vue'
import MaterialSelectDialog from '../../../sales/components/MaterialSelectDialog.vue'
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
import {
  addInquiry,
  updateInquiry,
  detailsInquiry,
} from '@/api/purchase/inquiry.js'
import { showMaterialsPurchase } from '@/api/purchase/purchase.js'
const { proxy } = getCurrentInstance()
const dialogVisible = ref(false)
const purchaseId = ref()
const dialogProps = ref({
  isView: false,
  purchaseId: '',
  title: '',
  row: {},
})
const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  purchaseId.value = parseInt(params.purchaseId)
  formData.value.purchaseId = purchaseId.value
  // 编辑供应商报价
  if (params.row && params.row.id) {
    detailsInquiry(params.row.id).then((res) => {
      formData.value = res.data
      formData.value.meterials = res.data.meterials.map((item) => ({
        id: item.id,
        materialsId: item.materialsId,
        name: item.name,
        specifications: item.specifications,
        unitName: item.unitName,
        brand: item.brand,
        price: item.priceIncludeTax || 0, // 含税单价
        deliveryDate: item.deliveryDate,
        demandQuantity: item.demandQuantity, //需求数量
        purchaseQuantity: item.purchaseQuantity, // 采购数量
        purchasePrice: item.priceTotalIncludeTax, // 报价金额,
      }))
    })
  }
}

const formData = ref({
  id: 0,
  inquiryDate: '',
  meterials: [],
  paymentTerms: '',
  purchaseId: 0,
  supplierId: 0,
  supplierName: '',
  remark: '',
})
// 选择供应商
const showContactSelect = ref(false)
const defaultContactSelected = ref([])
const chooseContact = () => {
  defaultContactSelected.value = {
    supplierName: formData.value.supplierName,
    supplierId: formData.value.supplierId,
  }
  showContactSelect.value = true
}
const onContactSelect = (selectedData) => {
  if (!selectedData || selectedData.length === 0) {
    ElMessage.info('未选择任何公司')
    return
  }
  const contact = selectedData
  formData.value.supplierName = contact.name
  formData.value.supplierId = contact.id
  ElMessage.success('选择供应商成功')
  showContactSelect.value = false
}

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
    deliveryDate: item.deliveryDate,
    demandQuantity: item.demandQuantity, //需求数量
    purchaseQuantity: item.purchaseQuantity, // 采购数量
    purchasePrice: item.price * item.purchaseQuantity, // 报价金额,
  }))
  showMaterialSelect.value = true
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
      const initialPrice = parseFloat(item.price) || 0
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
        demandQuantity: item.demandQuantity, //需求数量
        purchaseQuantity: '', // 采购数量
        purchasePrice: '', // 报价金额,
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
const rules = reactive({
  supplierName: [
    { required: true, message: '请选择供应商', trigger: 'change' },
  ],
})
// 计算报价金额
const updatePrice = (row) => {
  const price = parseFloat(row.price) || 0
  const purchaseQuantity = parseFloat(row.purchaseQuantity) || 0
  row.purchasePrice = (price * purchaseQuantity).toFixed(2)
}
// 提交 0：暂存 1：提交
const handleSubmit = async () => {
  if (formData.value.meterials.length === 0) {
    ElMessage.error('请添加物料')
    return
  }
  for (let i = 0; i < formData.value.meterials.length; i++) {
    const material = formData.value.meterials[i]
    if (!material.price) {
      ElMessage.error(`第 ${i + 1} 行物料的报价单价为必填项`)
      return
    }
    if (!material.purchaseQuantity) {
      ElMessage.error(`第 ${i + 1} 行物料的采购数量为必填项`)
      return
    }
    if (!material.deliveryDate) {
      ElMessage.error(`第 ${i + 1} 行物料的货期天数为必填项`)
      return
    }
  }
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      let res
      if (formData.value.id) {
        // 修改操作
        res = await updateInquiry(formData.value)
      } else {
        // 新增操作
        res = await addInquiry(formData.value)
      }
      if (res.code === 200) {
        ElMessage.success(formData.value.id ? '修改成功' : '新增成功')
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

const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    id: 0,
    inquiryDate: '',
    meterials: [],
  }
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss">
.elegant-form {
  .el-select {
    width: 100%;
  }
  .card-section {
    background-color: var(--el-bg-color);
    border-radius: 8px;
    padding: 10px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e4e7ed;
    .el-row {
      margin-top: 10px;
    }
  }

  .el-form-item {
    margin-bottom: 15px;
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

.material-table {
  margin-top: 20px;
  min-height: 250px;
}

.total-price-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.total-price-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-value {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
  background-color: #fff;
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #e6a23c;
  box-shadow: 0 2px 4px rgba(230, 162, 60, 0.1);
}
</style>

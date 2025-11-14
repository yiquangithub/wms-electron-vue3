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
        <div class="card-section">
          <CustomDivider title="报价单信息"></CustomDivider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="所属项目" prop="projectId">
                <el-select
                  v-model="formData.projectId"
                  placeholder="请选择所属项目"
                >
                  <el-option
                    v-for="item in projectList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="报价编码" prop="code">
                <el-input
                  v-model="formData.code"
                  placeholder="可不填写，自动生成"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报价名称" prop="name">
                <el-input v-model="formData.name" placeholder="填写报价名称" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="card-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-header">
                <el-icon class="info-icon"><Avatar /></el-icon>
                <span class="info-title">询价单位</span>
              </div>
              <el-form-item label="公司名称" prop="inquiryUnitName">
                <el-input
                  v-model="formData.inquiryUnitName"
                  placeholder="请选择公司"
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
              <el-form-item label="公司联系人" prop="inquiryUnitContactsId">
                <el-select
                  v-model="formData.inquiryUnitContactsId"
                  placeholder="请选择公司联系人"
                  clearable
                >
                  <el-option
                    v-for="item in contactUnitsList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="询价日期" prop="inquiryDate">
                <el-date-picker
                  v-model="formData.inquiryDate"
                  type="date"
                  placeholder="请选择日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="报价单显示价格" prop="priceShowType">
                <el-radio-group v-model="formData.priceShowType">
                  <el-radio :label="1">显示未税价格</el-radio>
                  <el-radio :label="2">显示含税价格</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <div class="info-header">
                <el-icon class="info-icon"><UserFilled /></el-icon>
                <span class="info-title">报价单位</span>
              </div>
              <el-form-item label="公司名称" prop="quoteUnitName">
                <el-input
                  v-model="formData.quoteUnitName"
                  placeholder="请输入公司名称"
                />
              </el-form-item>
              <el-form-item label="联系人" prop="quoteUnitContacts">
                <el-input
                  v-model="formData.quoteUnitContacts"
                  placeholder="默认当前用户名称"
                />
              </el-form-item>
              <el-form-item label="联系电话" prop="quoteUnitContactsPhone">
                <el-input
                  v-model="formData.quoteUnitContactsPhone"
                  placeholder="默认报价单设置的联系方式信息"
                />
              </el-form-item>
              <el-form-item label="报价日期" prop="quoteDate">
                <el-date-picker
                  v-model="formData.quoteDate"
                  type="date"
                  placeholder="请选择日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="card-section">
          <div class="table-actions">
            <p>物料清单</p>
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
            <el-table-column label="未税单价 (元)" width="120" align="center">
              <template #default="{ row }">
                <el-input
                  v-model="row.price"
                  size="medium"
                  @change="updateTaxPrice(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="税率" width="170" align="center">
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
            <el-table-column label="需求数量" width="120" align="center">
              <template #default="{ row }">
                <el-input v-model="row.demandQuantity" :min="1" size="medium" />
              </template>
            </el-table-column>
            <el-table-column label="货期 (天)" width="120" align="center">
              <template #default="{ row }">
                <el-input v-model="row.deliveryDate" :min="1" size="medium" />
              </template>
            </el-table-column>
            <el-table-column
              prop="unitName"
              label="计量单位"
              align="center"
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
              <span class="total-value">￥{{ displayTotalPrice }}</span>
            </div>
          </div>
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
      <el-button
        type="success"
        @click="handleSubmit(0)"
        v-if="!dialogProps.isView"
        >暂存</el-button
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
import ContactSelectDialog from '../../components/ContactSelectDialog.vue'
import {
  saveQuotation,
  getQuotationDetail,
  getProject,
} from '@/api/sales/myQuotation'
import { getQuotationSetting } from '@/api/sales/quotationSet'
import { getContactUnitsList } from '@/api/sales/contactUnits.js'
const { proxy } = getCurrentInstance()
const { products_tax_rate } = proxy.useDict('products_tax_rate')
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const dialogVisible = ref(false)
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: '',
  row: {},
})

const projectList = ref([])
const getProjectHandle = async () => {
  return getProject().then((res) => {
    projectList.value = res.data
  })
}

const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true

  // 先加载项目列表和报价设置
  await Promise.all([getQuotationSettingHandle(), getProjectHandle()])

  if (params.row.id) {
    await getQuotationDetail({ id: params.row.id }).then(async (res) => {
      const data = res.data
      // 对应后端返回的数据结构进行映射
      formData.value = {
        projectId: data.projectId || null,
        code: data.code || '',
        id: data.id || 0,
        inquiryDate: data.inquiryDate || new Date().toISOString().split('T')[0],
        inquiryUnitContactsId: data.inquiryUnitContactsId || null,
        inquiryUnitId: data.inquiryUnitId || null,
        inquiryUnitName: data.inquiryUnitName || '',
        isSubmit: data.isSubmit || 0,
        meterials: (data.meterials || []).map((item) => ({
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
        })),
        name: data.name || '',
        priceShowType: data.priceShowType || 1,
        quoteDate: data.quoteDate || new Date().toISOString().split('T')[0],
        quoteUnitContacts: data.quoteUnitContacts || '',
        quoteUnitContactsPhone: data.quoteUnitContactsPhone || '',
        quoteUnitName: data.quoteUnitName || '',
        remark: data.remark ? data.remark.replace(/\n/g, '<br>') : '',
      }
      // 如果有询价单位ID，获取对应的联系人列表
      if (formData.value.inquiryUnitId) {
        getContactUnitsListHandle(formData.value.inquiryUnitId)
      }
    })
  }
}

const formData = ref({
  projectId: null,
  code: '',
  id: 0,
  inquiryDate: new Date().toISOString().split('T')[0], // 默认为当日
  inquiryUnitContactsId: null, // 询价单位联系人id
  inquiryUnitId: null,
  inquiryUnitName: '', // 询价单位名称
  isSubmit: 0,
  meterials: [],
  name: '',
  priceShowType: 1,
  quoteDate: new Date().toISOString().split('T')[0], // 默认为当日
  quoteUnitContacts: '',
  quoteUnitContactsPhone: '',
  quoteUnitName: '',
  remark: '',
})

const rules = reactive({
  projectId: [{ required: true, message: '请选择项目', trigger: 'blur' }],
  name: [{ required: true, message: '请输入报价名称', trigger: 'blur' }],
  inquiryUnitName: [
    { required: true, message: '请输入询价单位名称', trigger: 'blur' },
  ],
  inquiryUnitContactsId: [
    { required: true, message: '请输入询价单位联系人', trigger: 'blur' },
  ],
  inquiryDate: [
    { required: true, message: '请选择询价日期', trigger: 'change' },
  ],
  quoteDate: [{ required: true, message: '请选择报价日期', trigger: 'change' }],
  quoteUnitName: [
    { required: true, message: '请输入报价单位名称', trigger: 'blur' },
  ],
  quoteUnitContacts: [
    { required: true, message: '请输入报价单位联系人', trigger: 'blur' },
  ],
  quoteUnitContactsPhone: [
    { required: true, message: '请输入报价单位联系电话', trigger: 'blur' },
  ],
})
// 获取报价单设置信息
const getQuotationSettingHandle = async () => {
  const res = await getQuotationSetting()
  if (res.code === 200) {
    formData.value.quoteUnitName = res.data.name
    formData.value.quoteUnitContactsPhone = res.data.contacts
    formData.value.quoteUnitContacts = userStore.name
  }
  return res
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

// 计算含税总价函数
const calculateTotalPrice = (materials) => {
  if (!materials || materials.length === 0) {
    return '0.00'
  }
  const total = materials.reduce((sum, material) => {
    // 使用含税单价 * 数量 计算每一项的总价
    const taxPrice = parseFloat(material.taxPrice) || 0
    const quantity = parseFloat(material.demandQuantity) || 0
    return sum + taxPrice * quantity
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
    return sum + price * quantity
  }, 0)
  return total.toFixed(2)
}

//  实时计算含税总价
const totalPrice = computed(() => {
  return calculateTotalPrice(formData.value.meterials)
})

//  实时计算未税总价
const untaxedTotalPrice = computed(() => {
  return calculateUntaxedTotalPrice(formData.value.meterials)
})

// 动态显示总价标签
const totalPriceLabel = computed(() => {
  return formData.value.priceShowType === 1 ? '未税总价' : '含税总价'
})

// 动态显示总价数值
const displayTotalPrice = computed(() => {
  return formData.value.priceShowType === 1
    ? untaxedTotalPrice.value
    : totalPrice.value
})
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

// 选择询价公司信息
const showContactSelect = ref(false)
const defaultContactSelected = ref([])
const chooseContact = () => {
  // 设置当前已选中的联系人信息
  defaultContactSelected.value = {
    inquiryUnitName: formData.value.inquiryUnitName,
    inquiryUnitId: formData.value.inquiryUnitId,
  }
  showContactSelect.value = true
}
const onContactSelect = (selectedData) => {
  if (!selectedData || selectedData.length === 0) {
    ElMessage.info('未选择任何公司')
    return
  }
  const contact = selectedData
  formData.value.inquiryUnitName = contact.name
  formData.value.inquiryUnitId = contact.id
  // 清空联系人字段
  formData.value.inquiryUnitContactsId = null
  ElMessage.success('选择公司成功')
  showContactSelect.value = false
  getContactUnitsListHandle(formData.value.inquiryUnitId)
}

// 获取询价单位联系人信息
const contactUnitsList = ref([])
const getContactUnitsListHandle = async (id) => {
  const res = await getContactUnitsList({
    id: id,
  })
  console.log(res)
  res.data.forEach((item) => {
    item.label = item.name + '-' + item.phone
    item.value = item.id
  })
  contactUnitsList.value = res.data
}

// 提交 0：暂存 1：提交
const handleSubmit = async (isSubmit) => {
  formData.value.isSubmit = isSubmit
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
      const res = await saveQuotation(formData.value)
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

const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    projectId: null,
    code: '',
    id: 0,
    inquiryDate: new Date().toISOString().split('T')[0], // 默认为当日
    inquiryUnitContactsId: null, // 询价单位联系人id
    inquiryUnitId: null,
    inquiryUnitName: '', // 询价单位名称
    isSubmit: 0,
    meterials: [],
    name: '',
    priceShowType: 1,
    quoteDate: new Date().toISOString().split('T')[0], // 默认为当日
    quoteUnitContacts: '',
    quoteUnitContactsPhone: '',
    quoteUnitName: '',
    remark: '',
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

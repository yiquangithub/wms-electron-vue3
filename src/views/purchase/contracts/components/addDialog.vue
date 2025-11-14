<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}合同`"
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
          <CustomDivider title="合同信息"></CustomDivider
          >
          <!-- {{ formData.refMainId }} -->
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="合同编号" prop="code">
                <el-input
                  v-model="formData.code"
                  placeholder="可不填写，自动生成"
                />
              </el-form-item>
              <el-form-item label="计划开始日期" prop="planBeginDate">
                <el-date-picker
                  v-model="formData.planBeginDate"
                  type="date"
                  placeholder="请选择日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同名称" prop="name">
                <el-input v-model="formData.name" placeholder="填写合同名称" />
              </el-form-item>
              <el-form-item label="计划结束日期" prop="planEndDate">
                <el-date-picker
                  v-model="formData.planEndDate"
                  type="date"
                  placeholder="请选择日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="card-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-header">
                <el-icon class="info-icon"><Avatar /></el-icon>
                <span class="info-title">供方信息</span>
              </div>
              <el-form-item label="供方名称" prop="supplierId">
                <el-input
                  v-model="formData.supplierName"
                  placeholder="请选择供方"
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
              <el-form-item label="供方联系人" prop="supplierContactsId">
                <el-select
                  v-model="formData.supplierContactsId"
                  placeholder="请选择供方联系人"
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
              <el-form-item label="交货时间" prop="deliveryTime">
                <el-input
                  v-model="formData.deliveryTime"
                  placeholder="请输入交货时间，如：下单后10天"
                />
              </el-form-item>
              <el-form-item label="合同模板" prop="template">
                <el-select v-model="formData.template">
                  <el-option
                    v-for="dict in contract_template"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="合同附件" prop="attachments">
                <FileUpload
                  v-model="attachmentFiles"
                  :file-type="['pdf', 'doc', 'docx']"
                  :limit="9"
                  :fileSize="50"
                ></FileUpload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <div class="info-header">
                <el-icon class="info-icon"><Avatar /></el-icon>
                <span class="info-title">需方信息</span>
              </div>
              <el-form-item label="需方名称" prop="buyerId">
                <el-input
                  v-model="formData.buyerName"
                  placeholder="请选择需方"
                  readonly
                  @click="chooseBuyer"
                >
                  <template #suffix>
                    <el-icon class="el-input__icon" style="cursor: pointer">
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="需方联系人" prop="buyerContactsId">
                <el-select
                  v-model="formData.buyerContactsId"
                  placeholder="请选择需方联系人"
                  clearable
                >
                  <el-option
                    v-for="item in buyerContactsList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="结算方式" prop="paymentType">
                <el-select v-model="formData.paymentType">
                  <el-option
                    v-for="dict in contract_payment_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="价格备注" prop="priceRemark">
                <el-input
                  v-model="formData.priceRemark"
                  placeholder="请输入价格备注，如：含13%税含运费 累计满3000开具发票"
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
              width="100"
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
                  @change="handlePriceChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="税率" width="150" align="center">
              <template #default="{ row }">
                <el-select
                  v-model="row.taxRateType"
                  size="medium"
                  @change="handleTaxRateChange(row)"
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
            <el-table-column label="需求数量" width="100" align="center" prop="demandQuantity">
              <!-- <template #default="{ row }">
                <el-input v-model="row.demandQuantity" :min="1" size="medium" />
              </template> -->
            </el-table-column>
            <el-table-column label="采购数量" width="100" align="center">
              <template #default="{ row }">
                <el-input v-model="row.purchaseQuantity" :min="1" size="medium" />
              </template>
            </el-table-column>
            <el-table-column label="货期 (天)" width="100" align="center">
              <template #default="{ row }">
                <el-input v-model="row.deliveryDate" :min="1" size="medium" />
              </template>
            </el-table-column>
            <el-table-column label="备注" width="120" align="center">
              <template #default="{ row }">
                <el-input v-model="row.remark" size="medium" />
              </template>
            </el-table-column>
            <el-table-column
              prop="inventoryNum"
              label="库存数量"
              align="center"
            />
            <el-table-column prop="unitName" label="计量单位" align="center" />
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
              <span class="total-label">含税总价：</span>
              <span class="total-value">￥{{ totalPrice }}</span>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="handlePreview"
        v-if="!dialogProps.isView"
        >预览</el-button
      >
      <el-button type="success" @click="handleSubmit" v-if="!dialogProps.isView"
        >保存</el-button
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
  <previewDialog ref="dialogPreviewRef" />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, watch, computed } from 'vue'
import {
  Plus,
  Delete,
  Search,
  Avatar,
  UserFilled,
} from '@element-plus/icons-vue'
import CustomDivider from '@/components/CustomDivider/index.vue'
import MaterialSelectDialog from '../../../sales/components/MaterialSelectDialog.vue'
import ContactSelectDialog from '../../../sales/components/ContactSelectDialog.vue'
import {
  addContact,
  updateContact,
  contactInfo,
} from '@/api/purchase/contract.js'
import { showMaterialsPurchase } from '@/api/purchase/purchase.js'
import { getContactUnitsList } from '@/api/sales/contactUnits.js'
import FileUpload from '@/components/FileUpload/index.vue'
import previewDialog from './previewDialog.vue'
import { materialsQuotation, getQuotationDetail } from '@/api/sales/myQuotation'
const countId = ref(null)
const { proxy } = getCurrentInstance()
const { products_tax_rate } = proxy.useDict('products_tax_rate')
const { contract_template } = proxy.useDict('contract_template')
const { contract_payment_type } = proxy.useDict('contract_payment_type')
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const dialogVisible = ref(false)

const dialogProps = ref({
  isView: false,
  isInquiry: false, // 询价页面过来的
  isAudit: false,
  title: '',
  refMainId: '',
  row: {},
})
const dialogPreviewRef = ref(false)
const handlePreview = () => {
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
    if (!material.purchaseQuantity) {
      ElMessage.error(`第 ${i + 1} 行物料的采购数量为必填项`)
      return
    }
  }
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      dialogPreviewRef.value?.acceptParams({
        isPreview: true,
        title: '预览',
        row: { ...formData.value },
      })
    } else {
      ElMessage.error('请完整填写表单必填项')
    }
  })
}

const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const contractId = ref(null) // 用于记录采购合同ID，判断是新增还是修改

const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  formData.value.refMainId = params.refMainId

  // 统一使用数组处理，无论是单个还是批量
  if (params.ids && params.ids.length > 0) {
    // 使用 Map 来存储去重后的物料数据
    const uniqueMaterialsMap = new Map()
    for (const id of params.ids) {
      try {
        const res = await showMaterialsPurchase(id)
        // 检查接口返回的数据是否为数组，并且有内容
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // 遍历接口返回的物料数组
          res.data.forEach((item) => {
            // 在添加到 Map 之前进行数据转换
            const processedItem = {
              id: item.id,
              materialsId: item.materialsId,
              name: item.name,
              specifications: item.specifications,
              unitName: item.unitName,
              brand: item.brand,
              price: item.price,
              deliveryDate: item.deliveryDate,
              demandQuantity: item.demandQuantity,
              purchaseQuantity: item.purchaseQuantity,
              taxRateType: String(item.taxRateType),
              taxPrice: item.priceIncludeTax,
              inventoryNum: item.inventoryNum,
              remark: item.remark,
            }
            // 使用 materialsId 作为主键，最新数据会覆盖旧数据
            uniqueMaterialsMap.set(item.materialsId, processedItem)
          })
        }
      } catch (error) {
        console.error(`获取采购物料详情失败，ID: ${id}`, error)
      }
    }
    formData.value.meterials = Array.from(uniqueMaterialsMap.values())
  }
  // 询价来的用询价的供应商信息
  if (params.isInquiry) {
    formData.value.supplierId = params.row.supplierId
    formData.value.supplierName = params.row.supplierName
  } 
  if (params.row.id && !params.isInquiry) {
    contractId.value = params.row.id
    await contactInfo(params.row.id).then(async (res) => {
      const data = res.data
      console.log(data)
      // 对应后端返回的数据结构进行映射
      formData.value = {
        attachments: [], // 附件由attachmentFiles处理
        buyerContactsId: data.buyerContactsId || null,
        buyerId: data.buyerId || null,
        buyerName: data.buyerName || '',
        code: data.code || '',
        contractType: data.contractType || 1,
        deliveryTime: data.deliveryTime || '',
        id: data.id || 0,
        meterials: (data.meterials || []).map((item) => ({
          id: item.id,
          materialsId: item.materialsId,
          name: item.name,
          specifications: item.specifications,
          unitName: item.unitName,
          brand: item.brand,
          price: item.price, // 未税单价
          deliveryDate: item.deliveryDate,
          demandQuantity: item.demandQuantity,// 需求数量
          purchaseQuantity:item.purchaseQuantity,// 采购数量
          taxRateType: String(item.taxRateType),
          taxPrice: item.priceIncludeTax, // 含税单价
          inventoryNum: item.inventoryNum, // 库存数量
          remark: item.remark,
        })),
        name: data.name || '',
        paymentType: data.paymentType ? String(data.paymentType) : null,
        planBeginDate:
          data.planBeginDate || new Date().toISOString().split('T')[0],
        planEndDate: data.planEndDate || new Date().toISOString().split('T')[0],
        priceRemark: data.priceRemark || '',
        refMainId: data.refMainId || 0,
        supplierContactsId: data.supplierContactsId || null,
        supplierId: data.supplierId || null,
        supplierName: data.supplierName || '',
        template: data.template ? String(data.template) : null,
      }

      // 如果有供方ID，获取对应的联系人列表
      if (formData.value.supplierId) {
        getContactUnitsListHandle(formData.value.supplierId)
      }
      // 如果有需方ID，获取对应的联系人列表
      if (formData.value.buyerId) {
        getBuyerContactsListHandle(formData.value.buyerId)
      }
      // 处理附件数据回显
      if (data.attachments && data.attachments.length > 0) {
        // 将后端返回的附件数组转换为逗号分隔的字符串
        const attachmentPaths = data.attachments
          .map((item) => item.filePath)
          .join(',')
        attachmentFiles.value = attachmentPaths
      } else {
        attachmentFiles.value = ''
      }
    })
  }
}

const formData = ref({
  attachments: [], //合同附件文件单个文件最大50MB，最多9个
  buyerContactsId: null, //需方单位联系人ID
  buyerId: null, //需方ID
  buyerName: '', //需方名称
  code: '', //编码
  contractType: 1, //合同类型:1销售合同 2采购合同
  deliveryTime: '', //交货时间,用户填写如：下单后10天
  id: 0,
  meterials: [], //关联物料信息
  name: '', //名称
  paymentType: null, //结算方式,对应数据字典payment_type
  planBeginDate: new Date().toISOString().split('T')[0], //计划开始日期
  planEndDate: new Date().toISOString().split('T')[0], // 计划结束日期
  priceRemark: '', //价格备注,如：含 13%税含运费 累计满 3000 开具发票
  refMainId: 0, // 关联主报价单Id或者采购单ID,为空则没有关联
  supplierContactsId: null, //供方单位联系人ID
  supplierId: null, //供方ID
  supplierName: '', //供方名称
  template: null, //合同模版,对应数据字典contract_template
})

const attachmentFiles = ref('')
// 监听文件上传的变化，将字符串转换为数组格式
watch(attachmentFiles, (newValue) => {
  if (newValue) {
    // 将逗号分隔的字符串转换为数组格式
    const fileArray = newValue.split(',').filter((item) => item.trim() !== '')
    formData.value.attachments = fileArray.map((filePath) => {
      // 提取文件名（去掉路径）
      const fileName = filePath.includes('/')
        ? filePath.split('/').pop()
        : filePath
      return {
        filePath: filePath.trim(),
        name: fileName,
      }
    })
  } else {
    formData.value.attachments = []
  }
})

// 监听结算方式字典数据，加载完成后设置默认值
watch(
  contract_payment_type,
  (newValue) => {
    if (newValue && newValue.length > 0 && !formData.value.paymentType) {
      formData.value.paymentType = newValue[0].value
    }
  },
  { immediate: true }
)
// 监听合同模版字典数据，加载完成后设置默认值
watch(
  contract_template,
  (newValue) => {
    if (newValue && newValue.length > 0 && !formData.value.template) {
      formData.value.template = newValue[0].value
    }
  },
  { immediate: true }
)

const rules = reactive({
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  buyerContactsId: [
    { required: true, message: '请选择需方联系人', trigger: 'change' },
  ],
  buyerId: [{ required: true, message: '请选择需方', trigger: 'change' }],
  deliveryTime: [
    { required: true, message: '请输入交货时间', trigger: 'blur' },
  ],
  paymentType: [
    { required: true, message: '请选择结算方式', trigger: 'change' },
  ],
  planBeginDate: [
    { required: true, message: '请选择计划开始日期', trigger: 'change' },
  ],
  planEndDate: [
    { required: true, message: '请选择计划结束日期', trigger: 'change' },
  ],
  supplierContactsId: [
    { required: true, message: '请选择供方联系人', trigger: 'change' },
  ],
  supplierId: [{ required: true, message: '请选择供方', trigger: 'change' }],
  template: [{ required: true, message: '请选择合同模板', trigger: 'change' }],
})

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
    purchaseQuantity: item.purchaseQuantity,
    taxRateType: item.taxRateType,
    taxPrice: item.taxPrice,
    inventoryNum: item.inventoryNum,
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

// 处理单价变化
const handlePriceChange = (row) => {
  updateTaxPrice(row)
}

// 处理税率变化
const handleTaxRateChange = (row) => {
  updateTaxPrice(row)
}
// 计算含税总价
const totalPrice = computed(() => {
  if (!formData.value.meterials || formData.value.meterials.length === 0) {
    return '0.00'
  }
  const total = formData.value.meterials.reduce((sum, item) => {
    const price = parseFloat(item.price || 0)
    const quantity = parseFloat(item.purchaseQuantity || 0)// 采购数量
    const taxRate = parseFloat(item.taxRateType || 0) / 100
    return sum + price * quantity * (1 + taxRate)
  }, 0)
  return total.toFixed(2)
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
        demandQuantity: item.demandQuantity,// 需求数量
        purchaseQuantity:'',// 采购数量
        taxRateType: defaultTaxRateType, // 设置默认税率
        taxPrice: calculatedTaxPrice, // 设置计算出的含税单价
        inventoryNum: item.inventoryNum,
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
const contactSelectType = ref('supplier') // 'supplier' 或 'buyer'
const defaultContactSelected = ref([])
const chooseContact = () => {
  // 设置当前选择供方
  contactSelectType.value = 'supplier'
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

  if (contactSelectType.value === 'supplier') {
    // 处理供方选择
    formData.value.supplierName = contact.name
    formData.value.supplierId = contact.id
    // 清空供方联系人字段
    formData.value.supplierContactsId = null
    ElMessage.success('选择供方成功')
    getContactUnitsListHandle(formData.value.supplierId)
  } else if (contactSelectType.value === 'buyer') {
    // 处理需方选择
    formData.value.buyerName = contact.name
    formData.value.buyerId = contact.id
    // 清空需方联系人字段
    formData.value.buyerContactsId = null
    ElMessage.success('选择需方成功')
    getBuyerContactsListHandle(formData.value.buyerId)
  }

  showContactSelect.value = false
}

// 获取询价单位联系人信息
const contactUnitsList = ref([])
const buyerContactsList = ref([])
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

// 获取需方联系人信息
const getBuyerContactsListHandle = async (id) => {
  const res = await getContactUnitsList({
    id: id,
  })
  console.log(res)
  res.data.forEach((item) => {
    item.label = item.name + '-' + item.phone
    item.value = item.id
  })
  buyerContactsList.value = res.data
}

// 选择需方公司信息
const chooseBuyer = () => {
  // 设置当前选择需方
  contactSelectType.value = 'buyer'
  defaultContactSelected.value = {
    buyerName: formData.value.buyerName,
    buyerId: formData.value.buyerId,
  }
  showContactSelect.value = true
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
    if (!material.purchaseQuantity) {
      ElMessage.error(`第 ${i + 1} 行物料的采购数量为必填项`)
      return
    }
  }
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      let res
      // 根据contractId判断是新增还是修改
      if (contractId.value) {
        // 修改操作
        res = await updateContact(formData.value)
      } else {
        // 新增操作
        res = await addContact(formData.value)
      }

      if (res.code === 200) {
        ElMessage.success(contractId.value ? '修改成功' : '新增成功')
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
    attachments: [], //合同附件文件单个文件最大50MB，最多9个
    buyerContactsId: null, //需方单位联系人ID
    buyerId: null, //需方ID
    buyerName: '', //需方名称
    code: '', //编码
    contractType: 1, //合同类型:1销售合同 2采购合同
    deliveryTime: '', //交货时间,用户填写如：下单后10天
    id: 0,
    meterials: [], //关联物料信息
    name: '', //名称
    paymentType: null, //结算方式,对应数据字典payment_type
    planBeginDate: new Date().toISOString().split('T')[0], //计划开始日期
    planEndDate: new Date().toISOString().split('T')[0], // 计划结束日期
    priceRemark: '', //价格备注,如：含 13%税含运费 累计满 3000 开具发票
    refMainId: 0, // 关联主报价单Id或者采购单ID,为空则没有关联
    supplierContactsId: null, //供方单位联系人ID
    supplierId: null, //供方ID
    supplierName: '', //供方名称
    template: null, //合同模版,对应数据字典contract_template
  }

  // 重置后设置默认值
  if (contract_payment_type.value && contract_payment_type.value.length > 0) {
    formData.value.paymentType = contract_payment_type.value[0].value
  }
  // 重置后设置默认值
  if (contract_template.value && contract_template.value.length > 0) {
    formData.value.template = contract_template.value[0].value
  }

  // 重置文件上传中间变量
  attachmentFiles.value = ''
  // 重置contractId
  contractId.value = null
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
</style>

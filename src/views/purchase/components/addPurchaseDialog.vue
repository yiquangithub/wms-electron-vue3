<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}`"
    :destroy-on-close="true"
    width="75%"
    draggable
  >
    <div class="main-content">
      <div class="batch-contract-container">
        <div
          v-for="(contractInfo, contractIndex) in contractList"
          :key="contractInfo.baseInfo.id"
          class="contract-group"
        >
          <el-form
            :ref="`ruleFormRef_${contractIndex}`"
            label-width="120px"
            :model="contractInfo.formData"
            :rules="rules"
            class="elegant-form"
            :disabled="dialogProps.isView"
          >
            <!-- 合同基础信息 -->
            <div class="card-section">
              <CustomDivider
                :title="
                  contractList.length > 1
                    ? `合同${contractIndex + 1} - 基础信息`
                    : '基础信息'
                "
              ></CustomDivider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- <el-form-item label="合同编码" prop="code">
                    <el-input v-model="contractInfo.baseInfo.code" disabled />
                  </el-form-item> -->
                  <el-form-item label="采购编码" prop="code">
                    <el-input
                      v-model="contractInfo.formData.code"
                      placeholder="可不填写，自动生成"
                    />
                  </el-form-item>
                  <el-form-item label="采购日期" prop="purchaseDate" required>
                    <el-date-picker
                      v-model="contractInfo.formData.purchaseDate"
                      type="date"
                      placeholder="请选择日期"
                      format="YYYY/MM/DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </el-form-item>
                    <el-form-item
                    label="预计到货日期"
                    prop="deliveryDate"
                    required
                  >
                    <el-date-picker
                      v-model="contractInfo.formData.deliveryDate"
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
                    <el-input
                      v-model="contractInfo.baseInfo.contractName"
                      disabled
                    />
                  </el-form-item>
                  <el-form-item label="采购名称" prop="name" required>
                    <el-input
                      v-model="contractInfo.formData.name"
                      placeholder="填写采购名称"
                    />
                  </el-form-item>
                
                </el-col>
              </el-row>
            </div>
            <!-- 物料清单 -->
            <div class="card-section">
              <div class="table-actions">
                <p>物料清单</p>
                <el-button
                  type="primary"
                  :icon="Plus"
                  plain
                  size="default"
                  @click="chooseMaterialForContract(contractIndex)"
                  v-if="!dialogProps.isView"
                  >选择物料</el-button
                >
              </div>
              <el-table
                :data="contractInfo.formData.meterials"
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
                  width="80"
                  align="center"
                />
                <el-table-column
                  prop="specifications"
                  label="规格型号"
                  width="100"
                  align="center"
                />
                <el-table-column
                  label="未税单价 (元)"
                  width="110"
                  align="center"
                >
                  <template #default="{ row }">
                    <el-input
                      v-model="row.price"
                      size="medium"
                      @change="handlePriceChangeForContract(row, contractIndex)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="税率" width="120" align="center">
                  <template #default="{ row }">
                    <el-select
                      v-model="row.taxRateType"
                      size="medium"
                      @change="
                        handleTaxRateChangeForContract(row, contractIndex)
                      "
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
                />
                <el-table-column label="需求数量" width="100" align="center">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.demandQuantity"
                      :min="1"
                      size="medium"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="采购数量" width="100" align="center">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.purchaseQuantity"
                      :min="1"
                      size="medium"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="货期 (天)" width="100" align="center">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.deliveryDate"
                      :min="1"
                      size="medium"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="需求人" width="120" align="center">
                  <template #default="{ row, $index }">
                    <div
                      class="operator-select-container"
                      @click="showUserDialog(contractIndex, $index)"
                    >
                      <div class="operator-tags-wrapper">
                        <template v-if="row.demandPersonId">
                          <el-icon><User /></el-icon>{{ row.demandPersonName }}
                        </template>
                        <div v-else class="placeholder-text">
                          <el-icon><User /></el-icon>
                          <span>点击选择</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="需求时间" width="140" align="center">
                  <template #default="{ row }">
                    <el-date-picker
                      v-model="row.demandDate"
                      type="date"
                      placeholder="请选择日期"
                      format="YYYY/MM/DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="inventoryNum"
                  label="库存数量"
                  align="center"
                />
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
                      @click="
                        handleDeleteMaterialFromContract(row, contractIndex)
                      "
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <!-- 统计信息 -->
              <div class="total-summary-section">
                <div class="summary-compact">
                  <div class="summary-row">
                    <span class="summary-label">采购数量合计：</span>
                    <span class="summary-value">{{
                      getPurchaseQuantityTotalForContract(contractIndex)
                    }}</span>
                    <span class="summary-label">需求数量合计：</span>
                    <span class="summary-value">{{
                      getDemandQuantityTotalForContract(contractIndex)
                    }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">采购价格合计：</span>
                    <span class="summary-value price"
                      >￥{{
                        getPurchasePriceTotalForContract(contractIndex)
                      }}</span
                    >
                    <span class="summary-label">需求价格合计：</span>
                    <span class="summary-value price"
                      >￥{{
                        getDemandPriceTotalForContract(contractIndex)
                      }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button
        type="success"
        @click="handleSubmit"
        v-if="!dialogProps.isBatch"
        >保存</el-button
      >
      <el-button type="success" @click="handleSubmit" v-else
        >批量保存</el-button
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
  <!-- 选择需求人 -->
  <UserSelector v-model="userDialogVisible" @select-user="handleUserSelected" />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, watch, computed } from 'vue'
import {
  Plus,
  Delete,
  Search,
  Avatar,
  UserFilled,
} from '@element-plus/icons-vue'
import CustomDivider from '@/components/CustomDivider/index.vue'
import UserSelector from '@/components/UserSelectDialog/index.vue'
import MaterialSelectDialog from '../../sales/components/MaterialSelectDialog.vue'
import { contactInfo } from '@/api/sales/contract.js'
import {
  addPurchase,
  updatePurchase,
  addBatchPurchase,
  detailsPurchase,
  getPurchaseMaterialsBom,
} from '@/api/purchase/purchase.js'
const { proxy } = getCurrentInstance()
const { products_tax_rate } = proxy.useDict('products_tax_rate')
const dialogVisible = ref(false)
const userDialogVisible = ref(false)
const dialogProps = ref({
  isView: false,
  isBatch: false,
  isEdit: false,
  title: '',
  ids: [],
  row: {},
})
// 合同基础信息
const baseInfo = ref({
  contractId: '',
  contractName: '',
})
const userIndex = ref(null)
const contractIndexForUser = ref(null)
// 显示弹框方法
const showUserDialog = (contractIndex, materialIndex) => {
  contractIndexForUser.value = contractIndex
  userIndex.value = materialIndex
  userDialogVisible.value = true
}
// 确定选择需求人
const handleUserSelected = (user) => {
  contractList.value[contractIndexForUser.value].formData.meterials[
    userIndex.value
  ].demandPersonId = user.id
  contractList.value[contractIndexForUser.value].formData.meterials[
    userIndex.value
  ].demandPersonName = user.name
  userDialogVisible.value = false
}

// 合同基础信息列表
const contractList = ref([])
const emits = defineEmits(['getTableData'])
const contractId = ref(null) // 用于记录合同ID，判断是新增还是修改
// 物料数据映射
const mapMaterialData = (materialItem, isEditMode = false) => ({
  id: materialItem.id,
  materialsId: materialItem.materialsId,
  name: materialItem.name,
  specifications: materialItem.specifications,
  unitName: materialItem.unitName,
  brand: materialItem.brand,
  price: materialItem.price,
  deliveryDate: materialItem.deliveryDate,
  demandDate: materialItem.demandDate,
  demandQuantity: materialItem.demandQuantity,
  purchaseQuantity: materialItem.purchaseQuantity,
  demandPersonId: materialItem.demandPersonId,
  demandPersonName: materialItem.demandPersonName,
  taxRateType: String(materialItem.taxRateType),
  taxPrice: isEditMode
    ? materialItem.priceIncludeTax
    : materialItem.priceIncludeTax,
  inventoryNum: isEditMode
    ? materialItem.inventoryNum
    : materialItem.inventoryNum,
  remark: materialItem.remark || '',
})

// 创建合同信息对象
const createContractInfo = (data, isEditMode = false) => {
  return {
    baseInfo: {
      contractId: data.contractId,
      contractName: data.contractName,
    },
    formData: {
      code: data.code,
      contractId: data.contractId,
      id: data.id,
      name: data.name,
      purchaseDate: data.purchaseDate,
      deliveryDate: data.deliveryDate,
      meterials: (data.meterials || []).map((item) =>
        mapMaterialData(item, true)
      ),
    },
  }
  // if (isEditMode) {
  //   // 编辑：使用采购单数据
  //   return {
  //     baseInfo: {
  //       contractId: data.contractId,
  //       contractName: data.contractName,
  //     },
  //     formData: {
  //       code: data.code,
  //       contractId: data.contractId,
  //       id: data.id,
  //       name: data.name,
  //       purchaseDate: data.purchaseDate,
  //       deliveryDate: data.deliveryDate,
  //       meterials: (data.meterials || []).map((item) =>
  //         mapMaterialData(item, true)
  //       ),
  //     },
  //   }
  // } else {
  //   // 新增：使用bom新的物料数据
  //   return {
  //     baseInfo: {
  //       contractId: data.contractId,
  //       contractName: data.contractName,
  //     },
  //     formData: {
  //       code: data.code,
  //       contractId: data.contractId,
  //       id: data.id,
  //       name: data.name,
  //       purchaseDate: new Date().toISOString().split('T')[0],
  //       deliveryDate: new Date().toISOString().split('T')[0],
  //       meterials: (data.meterials || []).map((item) =>
  //         mapMaterialData(item, false)
  //       ),
  //     },
  //   }
  // }
}

const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  // 统一使用数组处理，无论是单个还是批量
  if (params.ids && params.ids.length > 0) {
    contractList.value = []
    for (const id of params.ids) {
      try {
        let res
        let contractInfo

        if (params.isEdit) {
          // 编辑模式：调用采购单详情接口
          res = await detailsPurchase(id)
          contractInfo = createContractInfo(res.data, true)
        } else {
          // 新增模式：调用新的采购信息接口
          // res = await contactInfo(id);
          res = await getPurchaseMaterialsBom(id)
          contractInfo = createContractInfo(res.data[0], false)
        }
        contractList.value.push(contractInfo)
      } catch (error) {
        console.error(
          `获取${params.isEdit ? '采购单' : '合同'}${id}信息失败:`,
          error
        )
        ElMessage.error(`获取${params.isEdit ? '采购单' : '合同'}信息失败`)
      }
    }
  }
}
const formData = ref({
  code: '',
  contractId: 0,
  id: 0,
  meterials: [],
  name: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  deliveryDate: new Date().toISOString().split('T')[0],
})

const rules = reactive({})
// 选择产品/物料信息
const currentContractIndex = ref(null)
const chooseMaterialForContract = (contractIndex) => {
  currentContractIndex.value = contractIndex
  const currentContract = contractList.value[contractIndex]
  // 将已选择的物料传递给对话框，使用 materialsId 作为标识
  defaultSelected.value = currentContract.formData.meterials.map((item) => ({
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
    demandPersonId: item.demandPersonId,
    demandPersonName: item.demandPersonName,
    demandDate: item.demandDate,
  }))
  showMaterialSelect.value = true
}
const showMaterialSelect = ref(false)
const defaultSelected = ref([])
// 计算含税价格
const updateTaxPriceForContract = (row, contractIndex) => {
  const price = parseFloat(row.price)
  if (isNaN(price)) {
    row.taxPrice = ''
    return
  }
  const selectedRateItem = products_tax_rate.value.find(
    (rate) => rate.value === String(row.taxRateType)
  )
  const taxRate = selectedRateItem
    ? parseFloat(selectedRateItem.value) / 100
    : 0
  const calculatedTaxPrice = (price * (1 + taxRate)).toFixed(2)
  row.taxPrice = calculatedTaxPrice
}
const handlePriceChangeForContract = (row, contractIndex) =>
  updateTaxPriceForContract(row, contractIndex)
const handleTaxRateChangeForContract = (row, contractIndex) =>
  updateTaxPriceForContract(row, contractIndex)

// 删除物料
const handleDeleteMaterialFromContract = (row, contractIndex) => {
  const currentContract = contractList.value[contractIndex]
  const index = currentContract.formData.meterials.findIndex(
    (item) => item.id === row.id
  )
  if (index > -1) {
    currentContract.formData.meterials.splice(index, 1)
    ElMessage.success('物料删除成功')
  }
}
// 批量的计算方法
const getPurchaseQuantityTotalForContract = (contractIndex) => {
  const currentContract = contractList.value[contractIndex]
  if (
    !currentContract?.formData.meterials ||
    currentContract.formData.meterials.length === 0
  ) {
    return 0
  }
  return currentContract.formData.meterials.reduce((sum, item) => {
    return sum + parseFloat(item.purchaseQuantity || 0)
  }, 0)
}
const getDemandQuantityTotalForContract = (contractIndex) => {
  const currentContract = contractList.value[contractIndex]
  if (
    !currentContract?.formData.meterials ||
    currentContract.formData.meterials.length === 0
  ) {
    return 0
  }
  return currentContract.formData.meterials.reduce((sum, item) => {
    return sum + parseFloat(item.demandQuantity || 0)
  }, 0)
}

const getPurchasePriceTotalForContract = (contractIndex) => {
  const currentContract = contractList.value[contractIndex]
  if (
    !currentContract?.formData.meterials ||
    currentContract.formData.meterials.length === 0
  ) {
    return '0.00'
  }
  const total = currentContract.formData.meterials.reduce((sum, item) => {
    const taxPrice = parseFloat(item.taxPrice || 0)
    const purchaseQuantity = parseFloat(item.purchaseQuantity || 0)
    return sum + taxPrice * purchaseQuantity
  }, 0)
  return total.toFixed(2)
}

const getDemandPriceTotalForContract = (contractIndex) => {
  const currentContract = contractList.value[contractIndex]
  if (
    !currentContract?.formData.meterials ||
    currentContract.formData.meterials.length === 0
  ) {
    return '0.00'
  }
  const total = currentContract.formData.meterials.reduce((sum, item) => {
    const taxPrice = parseFloat(item.taxPrice || 0)
    const demandQuantity = parseFloat(item.demandQuantity || 0)
    return sum + taxPrice * demandQuantity
  }, 0)
  return total.toFixed(2)
}
// 物料选择处理
const onMaterialSelect = (selectedData) => {
  if (!selectedData || selectedData.length === 0) {
    ElMessage.info('未选择任何物料')
    return
  }

  const contractIndex = currentContractIndex.value || 0
  const currentContract = contractList.value[contractIndex]
  const existingMaterialIds = currentContract.formData.meterials.map(
    (item) => item.materialsId
  )

  const newMaterials = []
  selectedData.forEach((item) => {
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
        price: initialPrice,
        deliveryDate: '',
        demandQuantity: '',
        purchaseQuantity: '',
        demandPersonId: '',
        demandPersonName: '',
        demandDate: '',
        taxRateType: defaultTaxRateType,
        taxPrice: calculatedTaxPrice,
        inventoryNum: item.inventoryNum,
      }
      newMaterials.push(newMaterial)
    }
  })

  currentContract.formData.meterials.push(...newMaterials)
  if (newMaterials.length > 0) {
    const contractLabel =
      contractList.value.length > 1 ? `合同${contractIndex + 1}` : ''
    ElMessage.success(
      `成功${contractLabel ? `为${contractLabel}` : ''}添加 ${
        newMaterials.length
      } 条新物料`
    )
  } else {
    ElMessage.info('所选物料已存在，未添加新物料')
  }

  showMaterialSelect.value = false
}

const handleSubmit = async () => {
  // 统一验证所有合同
  for (let i = 0; i < contractList.value.length; i++) {
    const contractInfo = contractList.value[i]
    if (!contractInfo.formData.name) {
      ElMessage.error(`请填写合同${i + 1}的采购名称`)
      return
    }
    if (!contractInfo.formData.purchaseDate) {
      ElMessage.error(`请填写合同${i + 1}的采购日期`)
      return
    }
    if (!contractInfo.formData.deliveryDate) {
      ElMessage.error(`请填写合同${i + 1}的到货日期`)
      return
    }

    if (contractInfo.formData.meterials.length === 0) {
      const contractLabel = contractList.value.length > 1 ? `合同${i + 1}` : ''
      ElMessage.error(`${contractLabel}请添加物料`)
      return
    }

    for (let j = 0; j < contractInfo.formData.meterials.length; j++) {
      const material = contractInfo.formData.meterials[j]
      const contractLabel = contractList.value.length > 1 ? `合同${i + 1} ` : ''
      if (!material.price) {
        ElMessage.error(`${contractLabel}第 ${j + 1} 行物料的未税单价为必填项`)
        return
      }
      if (!material.demandQuantity) {
        ElMessage.error(`${contractLabel}第 ${j + 1} 行物料的需求数量为必填项`)
        return
      }
      if (!material.purchaseQuantity) {
        ElMessage.error(`${contractLabel}第 ${j + 1} 行物料的采购数量为必填项`)
        return
      }
      if (!material.deliveryDate) {
        ElMessage.error(`${contractLabel}第 ${j + 1} 行物料的货期天数为必填项`)
        return
      }
    }
  }

  try {
    let res
    if (dialogProps.value.isBatch) {
      // 批量模式：只新增，传数组参数
      const batchData = contractList.value.map((item) => item.formData)
      res = await addBatchPurchase(batchData)
      if (res.code === 200) {
        ElMessage.success(`成功批量创建${contractList.value.length}个采购单`)
        closeDialog()
        emits('getTableData')
      } else {
        ElMessage.error(`批量保存失败：${res.msg}`)
      }
    } else {
      // 单个模式：可以新增或修改，传对象参数，取第0个即可
      const singleData = contractList.value[0].formData
      if (dialogProps.value.isEdit) {
        // 修改
        res = await updatePurchase(singleData)
        if (res.code === 200) {
          ElMessage.success('修改成功')
          closeDialog()
          emits('getTableData')
        } else {
          ElMessage.error(`修改失败：${res.msg}`)
        }
      } else {
        // 新增
        res = await addPurchase(singleData)
        if (res.code === 200) {
          ElMessage.success('新增成功')
          closeDialog()
          emits('getTableData')
        } else {
          ElMessage.error(`新增失败：${res.msg}`)
        }
      }
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  }
}

const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    code: '',
    contractId: 0,
    id: 0,
    meterials: [],
    name: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
  }

  // 重置合同基础信息
  baseInfo.value = {
    code: '',
    id: '',
    name: '',
  }
  // 重置批量模式数据
  contractList.value = []
  currentContractIndex.value = null
  contractId.value = null
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss">
.operator-select-container {
  width: 100%;
  cursor: pointer;
}

.operator-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 32px;
  line-height: 32px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background-color: var(--el-fill-color-blank);
  transition: all 0.3s;
  align-items: center;
  padding: 0 5px;
  .el-icon {
    margin-right: 5px;
  }

  &:hover {
    border-color: var(--el-color-primary);
  }

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: var(--el-border-color-darker);
  }
}

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

// 批量模式样式
.batch-contract-container {
  .contract-group {
    border: 2px solid #e6f7ff;
    border-radius: 12px;
    margin-bottom: 30px;
    padding: 20px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 12px;
      z-index: -1;
      opacity: 0.1;
    }

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 8px 24px rgba(24, 144, 255, 0.12);
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }

    .card-section {
      border: 1px solid #f0f0f0;
      background: rgba(255, 255, 255, 0.8);

      &:first-child {
        border-color: #e6f7ff;
      }
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
  min-height: 120px;
}
.total-summary-section {
  margin-top: 0;
  border: 1px solid #ebeef5;
  border-top: none;
  background-color: #fafafa;
  padding: 12px 16px;

  .summary-compact {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .summary-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .summary-label {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
        white-space: nowrap;
      }

      .summary-value {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        min-width: 80px;
        text-align: left;

        &.price {
          color: #e6a23c;
          background: #fdf6ec;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid #f5dab1;
        }
      }
    }
  }
}
</style>

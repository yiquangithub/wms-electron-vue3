<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}`"
    :destroy-on-close="true"
    width="50%"
    draggable
  >
    <div class="main-content">
      <el-form
        ref="ruleFormRef"
        label-width="130px"
        :model="formData"
        :rules="rules"
        :disabled="dialogProps.isView"
      >
        <el-form-item label="付款金额" prop="actualAmount">
          <el-input
            v-model="formData.actualAmount"
            placeholder="请输入付款金额"
          >
            <template #append>元</template></el-input
          >
        </el-form-item>
        <el-form-item label="付款日期" prop="actualDate">
          <el-date-picker
            v-model="formData.actualDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item> 
        <el-form-item label="银行回单" prop="bankReceipt">
          <ImageUpload
            v-model="formData.bankReceipt"
            :file-type="['png', 'jpg', 'jpeg']"
            :limit="1"
          ></ImageUpload>
        </el-form-item>
        <el-form-item label="发票" prop="invoice">
          <ImageUpload
            v-model="formData.invoice"
            :file-type="['png', 'jpg', 'jpeg']"
            :limit="1"
          ></ImageUpload>
        </el-form-item>
        <el-form-item label="付款备注" prop="remark	">
          <el-input
            v-model="formData.remark"
            placeholder="请输入备注"
            type="textarea"
            rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="handleSubmit()"
        v-if="!dialogProps.isView"
        >提交</el-button
      >
      <el-button @click="closeDialog">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { uploadPayable, savePayable } from '@/api/finance/payable'
import ImageUpload from '@/components/ImageUpload/index.vue'
const dialogVisible = ref(false)
const dialogProps = ref({
  isView: false,
  title: '',
  row: {},
})
const rules = reactive({
  actualAmount: [
    { required: true, message: '请输入付款金额', trigger: 'blur' },
  ],
  actualDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
})
const formData = ref({
  actualAmount: 0,
  actualDate: '',
  bankReceipt: '',
  id: 0,
  invoice: '', 
  remark: '',
})
const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  if (params.row.id) {
    await uploadPayable(params.row.id).then((res) => {
      formData.value = res.data
    })
  }
}
const handleSubmit = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      let res = await savePayable(formData.value)
      if (res.code === 200) {
        ElMessage.success('修改成功')
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
const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    actualAmount: 0,
    actualDate: '',
    bankReceipt: '',
    id: 0,
    invoice: '', 
    remark: '',
  }
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss">
.image-form-item {
  width: 200px;
  height: 200px;
}
</style>

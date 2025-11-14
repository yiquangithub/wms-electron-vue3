<template>
  <el-dialog
    v-model="dialogVisible"
    @close="closeDialog"
    :title="`${dialogProps.title}`"
    :destroy-on-close="true"
    width="40%"
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
        <el-form-item label="处理日期" prop="processingDate">
          <el-date-picker
            v-model="formData.processingDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="处理方案" prop="processingScheme">
          <el-select
            v-model="formData.processingScheme"
            placeholder="请选择处理方案"
          >
            <el-option
              v-for="dict in solution_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="责任方" prop="responsibleParty">
          <el-input
            v-model="formData.responsibleParty"
            placeholder="请输入责任方"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="详细描述" prop="remark">
          <el-input
            v-model="formData.remark"
            placeholder="请输入详细描述"
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
import { addAfter, updateAfter, getAfterInfo } from '@/api/purchase/after'
const { proxy } = getCurrentInstance()
const { solution_status } = proxy.useDict('solution_status')
const dialogVisible = ref(false)
const dialogProps = ref({
  isView: false,
  title: '',
  row: {},
})
const rules = reactive({
  processingScheme: [
    { required: true, message: '请选择处理方案', trigger: 'blur' },
  ],
})
const formData = ref({
  id: 0,
  inspectionId: 0,
  processingDate: '',
  processingScheme: null,
  remark: '',
  responsibleParty: '',
})
const updateFlag = ref(false)
const emits = defineEmits(['getTableData'])
const ruleFormRef = ref()
const acceptParams = async (params) => {
  dialogProps.value = params
  dialogVisible.value = true
  if (params.row.processStatus === '已处理') {
    updateFlag.value = true
    const res = await getAfterInfo(params.row.id)
    formData.value = res.data
    formData.value.processingScheme = res.data.processingScheme + ''
  } else {
    updateFlag.value = false
    formData.value = params.row
  }
}
const handleSubmit = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      let res
      if (updateFlag.value) {
        // 修改操作
        res = await updateAfter(formData.value)
      } else {
        // 新增操作
        res = await addAfter(formData.value)
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
const closeDialog = () => {
  // 重置表单为默认值
  formData.value = {
    contractId: null,
    id: 0,
    payPhase: null,
    payRemark: '',
    percent: '',
    planAmount: null,
    planDate: '',
  }
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
})
</script>

<style scoped lang="scss"></style>

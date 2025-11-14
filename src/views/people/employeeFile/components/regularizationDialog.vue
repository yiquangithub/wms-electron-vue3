<template>
  <el-dialog
    v-model="dialogVisible"
    title="申请转正"
    :destroy-on-close="true"
    width="50%"
    draggable
    class="regularization-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="regularization-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="转正申请书" prop="application">
            <el-input
              v-model="formData.application"
              type="textarea"
              :rows="6"
              placeholder="请输入转正申请书内容"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'

const dialogVisible = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  application: ''
})

// 表单验证规则
const formRules = {
  application: [
    { required: true, message: '请输入转正申请书内容', trigger: 'blur' }
  ]
}

const acceptParams = async (params) => {
  dialogVisible.value = true
  if (params && params.row) {
  }
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交转正申请数据:', formData)
      closeDialog()
    }
  })
}

const closeDialog = () => {
  // 重置表单
  formRef.value?.resetFields()
  dialogVisible.value = false
}

defineExpose({
  acceptParams,
})
</script>

<style scoped>
.regularization-dialog {
  border-radius: 8px;
}

.regularization-form {
  padding: 20px;
}

.dialog-footer {
  text-align: right;
  padding: 20px 30px;
  border-top: 1px solid #ebeef5;
}

.dialog-footer .el-button {
  margin-left: 10px;
}
</style>
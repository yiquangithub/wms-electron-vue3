<template>
  <el-dialog
    v-model="dialogVisible"
    title="申请离职"
    :destroy-on-close="true"
    width="50%"
    draggable
    class="resignation-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="resignation-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="离职原因" prop="reason">
            <el-select
              v-model="formData.reason"
              placeholder="请选择离职原因"
              style="width: 100%"
            >
              <el-option label="个人发展" value="个人发展" />
              <el-option label="薪资待遇" value="薪资待遇" />
              <el-option label="工作环境" value="工作环境" />
              <el-option label="家庭因素" value="家庭因素" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="离职申请书" prop="application">
            <el-input
              v-model="formData.application"
              type="textarea"
              :rows="6"
              placeholder="请输入离职申请书内容"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <div class="confirmation-text">
            本人确认： 已阅读并理解公司相关离职规定，将配合完成工作交接
            离职后将遵守保密协议，不泄露公司商业秘密
            上述所填写信息真实有效，如有虚假愿承担相应责任
          </div>
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
  reason: '',
  application: '',
})

// 表单验证规则
const formRules = {
  reason: [{ required: true, message: '请选择离职原因', trigger: 'change' }],
  application: [
    { required: true, message: '请输入离职申请书内容', trigger: 'blur' },
  ],
}

const acceptParams = async (params) => {
  dialogVisible.value = true 
  if (params && params.row) {
   
  }
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交离职申请数据:', formData)
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
.resignation-dialog {
  border-radius: 8px;
}

.resignation-form {
  padding: 20px;
}

.confirmation-text {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.confirmation-text p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
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

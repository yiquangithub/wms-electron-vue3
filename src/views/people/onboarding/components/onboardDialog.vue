<template>
  <el-dialog
    v-model="dialogVisible"
    title="办理入职"
    :destroy-on-close="true"
    width="50%"
    draggable
    class="onboard-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="onboard-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工姓名" prop="name" >
            <el-input v-model="formData.name" placeholder="张三" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职部门" prop="department">
            <el-input v-model="formData.department" placeholder="销售部" readonly/>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="入职状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="1">正式员工</el-radio>
              <el-radio :label="2">试用期</el-radio>
              <el-radio :label="3">实习生</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息"
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
  name: '',
  department: '',
  status: 1, // 默认为正式员工
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入员工姓名', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入入职部门', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择入职状态', trigger: 'change' }
  ]
}

const acceptParams = async (params) => {
  dialogVisible.value = true
  if (params && params.row) {
    Object.assign(formData, params.row)
  }
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交表单数据:', formData)
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
.onboard-dialog {
  border-radius: 8px;
}

.onboard-form {
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
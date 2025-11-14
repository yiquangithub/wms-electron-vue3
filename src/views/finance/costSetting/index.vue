<template>
  <div class="costSet-wrapper layout-padding">
    <div class="costSet-padding layout-padding-view layout-padding-auto">
      <div class="costSet-container">
        <el-form
          :model="accountsSetting"
          :rules="rules"
          ref="formRef"
          label-width="150px"
          class="elegant-form"
        >
          <h4 class="form-title">费用设置</h4>
          <el-form-item label="每月日常均摊费用" prop="shareeQually">
            <el-input size="default" placeholder="请输入" v-model="accountsSetting.shareeQually" />
          </el-form-item>
          <el-form-item label="每月税金费用" prop="taxes">
            <el-input size="default" placeholder="请输入" v-model="accountsSetting.taxes" />
          </el-form-item>
          <el-form-item label="每月财务成本" prop="account">
            <el-input size="default" placeholder="请输入" v-model="accountsSetting.account" />
          </el-form-item>
          <el-form-item label="每月管理成本" prop="manager">
            <el-input size="default" placeholder="请输入" v-model="accountsSetting.manager" />
          </el-form-item>
          <el-form-item label="项目售后费用占比" prop="afterSales">
            <el-input size="default" placeholder="请输入" v-model="accountsSetting.afterSales">
              <template #append>%</template>
            </el-input>
          </el-form-item>
        </el-form>
        <div class="footer-actions">
          <el-button type="primary" size="large" @click="handleSave"
            >保存设置</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="costSetting">
import FileUpload from '@/components/FileUpload/index.vue'
import { getSettingQuery, saveSettingQuery } from '@/api/finance/cost.js'
import { ElMessage, ElForm } from 'element-plus'
import { onMounted, ref, reactive } from 'vue'
import { Plus, CircleCloseFilled } from '@element-plus/icons-vue'
const attachmentFiles = ref('')
const formRef = ref()
const accountsSetting = ref({
  account: '',
  afterSales: '',
  manager: '',
  shareeQually: '',
  taxes: '',
})

const rules = reactive({
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
})
const getAccountsSettingHandle = async () => {
  const res = await getSettingQuery()
  if (res.code === 200) {
    Object.assign(accountsSetting.value, res.data)
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (valid) {
      const res = await saveSettingQuery(accountsSetting.value)
      if (res.code === 200) {
        ElMessage.success('保存成功')
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } else {
      ElMessage.warning('请检查并填写所有必填项')
    }
  })
}

onMounted(() => {
  getAccountsSettingHandle()
})
</script>

<style scoped lang="scss">
.costSet-wrapper {
  background-color: #fff;
  height: 100%;
}
.costSet-padding {
  padding: 0;
  overflow: auto;
}
.costSet-container {
  max-width: 800px;
  margin: 0;
  padding: 20px 40px;
  background-color: #fff;
  box-shadow: none;

  .form-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--el-color-primary-light-3);
    text-align: left;
  }
}
.footer-actions {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>

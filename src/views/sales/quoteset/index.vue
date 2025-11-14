<template>
  <div class="quotationSet-wrapper layout-padding">
    <div class="quotationSet-padding layout-padding-view layout-padding-auto">
      <div class="quotationSet-container">
        <el-form
          :model="quotationSetting"
          :rules="rules"
          ref="formRef"
          label-width="120px"
          class="elegant-form"
        >
          <h4 class="form-title">报价单设置</h4>
          <el-form-item label="公司logo" prop="logo" class="image-form-item">
            <ImageUpload
              v-model="quotationSetting.logo"
              :file-type="['png', 'jpg', 'jpeg']"
              :limit="1"
            ></ImageUpload>
            <!-- <CommonUpload
							:componentOption="{
								limit: 1,
								autoUpload: true,
								slot: 'trigger',
								showFileList: false,
								accept: '.png, .jpg, .jpeg',
								fileType: ['png', 'jpg', 'jpeg'],
							}"
							class="avatar-uploader"
							@getUploadData="(data: any) => handleUpload('logo', data)"
						>
							<div class="upload-img-block">
								<div class="image-assembly-layout">
									<img v-if="quotationSetting.logo" :src="imgUrl + quotationSetting.logo" class="avatar" />
									<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
								</div>
								<span v-show="quotationSetting.logo !== ''" class="filter-img-remove-img" @click.stop="handleRemoveImage('logo')">
									<el-icon><CircleCloseFilled /></el-icon>
								</span>
							</div>
						</CommonUpload> -->
          </el-form-item>
          <el-form-item label="公司名称" prop="name">
            <el-input
              size="default"
              v-model="quotationSetting.name"
              placeholder="请输入公司名称"
            />
          </el-form-item>
          <el-form-item label="公司地址" prop="address">
            <el-input
              size="default"
              v-model="quotationSetting.address"
              placeholder="请输入公司地址"
            />
          </el-form-item>
          <el-form-item label="联系方式" prop="contacts">
            <el-input
              size="default"
              v-model="quotationSetting.contacts"
              placeholder="请输入联系方式"
            />
          </el-form-item>
          <el-form-item label="其他联系方式" prop="otherContacts">
            <el-input
              size="default"
              v-model="quotationSetting.otherContacts"
              placeholder="请输入其他联系方式"
            />
          </el-form-item>
          <el-form-item
            label="公司公章图片"
            prop="officialSeal"
            class="image-form-item"
          >
            <ImageUpload
              v-model="quotationSetting.officialSeal"
              :file-type="['png', 'jpg', 'jpeg']"
              :limit="1"
            ></ImageUpload> 
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

<script setup name="quotationSet">
import {
  getQuotationSetting,
  saveQuotationSetting,
} from '@/api/sales/quotationSet'
import { ElMessage, ElForm } from 'element-plus'
import { onMounted, ref, reactive } from 'vue'
import ImageUpload from '../../../components/ImageUpload/index.vue'
import { Plus, CircleCloseFilled } from '@element-plus/icons-vue'

const formRef = ref()
const quotationSetting = ref({
  address: '',
  contacts: '',
  id: 0,
  logo: '',
  name: '',
  officialSeal: '',
  otherContacts: '',
})

const rules = reactive({
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  officialSeal: [
    { required: true, message: '请上传公司公章图片', trigger: 'change' },
  ],
})
const getQuotationSettingHandle = async () => {
  const res = await getQuotationSetting()
  if (res.code === 200) {
    Object.assign(quotationSetting.value, res.data)
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (valid) {
      const res = await saveQuotationSetting(quotationSetting.value)
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
  getQuotationSettingHandle()
})
</script>

<style scoped lang="scss">
.quotationSet-wrapper {
  background-color: #fff;
  height: 100%;
}
.quotationSet-padding {
  padding: 0;
  overflow: auto;
}
.quotationSet-container {
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

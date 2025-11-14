<template>
  <div class="info-container">
    <div class="main-content">
      <el-form
        ref="ruleFormRef"
        label-width="120px"
        :model="formData"
        :rules="rules"
        class="elegant-form"
        :disabled="isView"
      >
        <!-- 基本信息 -->
        <div class="card-section">
          <CustomDivider title="基本信息"></CustomDivider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="姓名" prop="name">
                    <el-input
                      v-model="formData.name"
                      placeholder="请输入姓名"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="性别" prop="gender">
                    <el-select
                      v-model="formData.gender"
                      placeholder="请选择性别"
                    >
                      <el-option label="男" value="男" />
                      <el-option label="女" value="女" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="formData.phone"
                  placeholder="请输入手机号码"
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="证件类型" prop="idType">
                <el-select
                  v-model="formData.idType"
                  placeholder="请选择证件类型"
                >
                  <el-option label="身份证" value="身份证" />
                  <el-option label="护照" value="护照" />
                  <el-option label="港澳通行证" value="港澳通行证" />
                </el-select>
              </el-form-item>
              <el-form-item label="证件号码" prop="idNumber">
                <el-input
                  v-model="formData.idNumber"
                  placeholder="请输入证件号码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="照片" prop="photo">
                <ImageUpload v-model="photoFile" :limit="1"></ImageUpload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 银行账户信息 -->
        <div class="card-section">
          <CustomDivider title="银行账户信息"></CustomDivider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开卡银行全称" prop="bankName">
                <el-input
                  v-model="formData.bankName"
                  placeholder="请输入开卡银行全称"
                />
              </el-form-item>
              <el-form-item label="银行卡号" prop="bankCardNumber">
                <el-input
                  v-model="formData.bankCardNumber"
                  placeholder="请输入银行卡号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户支行信息" prop="bankBranch">
                <el-input
                  v-model="formData.bankBranch"
                  placeholder="请输入开户支行信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 入职信息 -->
        <div class="card-section">
          <CustomDivider title="入职信息"></CustomDivider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="员工类型" prop="employeeType">
                <el-select
                  v-model="formData.employeeType"
                  placeholder="请选择员工类型"
                  clearable
                >
                  <el-option
                    v-for="dict in employee_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="入职部门" prop="department">
                <el-input
                  v-model="formData.department"
                  placeholder="请输入入职部门"
                />
              </el-form-item>
              <el-form-item label="直接上级" prop="manager">
                <el-input
                  v-model="formData.manager"
                  placeholder="请输入直接上级"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="入职日期" prop="onboardingDate">
                <el-date-picker
                  v-model="formData.onboardingDate"
                  type="date"
                  placeholder="请选择入职日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="转正日期" prop="regularizationDate">
                <el-date-picker
                  v-model="formData.regularizationDate"
                  type="date"
                  placeholder="请选择转正日期"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="入职岗位" prop="position">
                <el-input
                  v-model="formData.position"
                  placeholder="请输入入职岗位"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 教育经历 -->
        <div class="card-section">
          <div class="table-actions">
            <p>
              <span>教育经历</span>
            </p>
            <el-button
              :icon="Plus"
              plain
              size="small" 
              type="primary"
              @click="addEducation"
            >
              新增一行
            </el-button>
          </div>
          <el-table :data="formData.educationList" border style="width: 100%">
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
            />
            <el-table-column label="学历" prop="degree">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.degree"
                  placeholder="请输入学历"
                />
                <span v-else>{{ row.degree }}</span>
              </template>
            </el-table-column>
            <el-table-column label="毕业院校" prop="school">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.school"
                  placeholder="请输入毕业院校"
                />
                <span v-else>{{ row.school }}</span>
              </template>
            </el-table-column>
            <el-table-column label="专业" prop="major">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.major"
                  placeholder="请输入专业"
                />
                <span v-else>{{ row.major }}</span>
              </template>
            </el-table-column>
            <el-table-column label="入学时间" width="150">
              <template #default="{ row }">
                <el-date-picker
                  v-if="!isView"
                  v-model="row.startTime"
                  type="date"
                  placeholder="请选择入学时间"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <span v-else>{{ row.startTime }}</span>
              </template>
            </el-table-column>
            <el-table-column label="毕业时间" width="150">
              <template #default="{ row }">
                <el-date-picker
                  v-if="!isView"
                  v-model="row.endTime"
                  type="date"
                  placeholder="请选择毕业时间"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <span v-else>{{ row.endTime }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80"
              align="center"
              v-if="!isView"
            >
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="removeEducation($index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 工作经历 -->
        <div class="card-section">
          <div class="table-actions">
            <p>
              <span>工作经历</span>
            </p>
            <el-button
              type="primary"
              @click="addWorkExperience"
              :icon="Plus"
              plain
              size="small"
            >
              新增一行
            </el-button>
          </div>
          <el-table
            :data="formData.workExperienceList"
            border
            style="width: 100%"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
            />
            <el-table-column label="工作单位" prop="company">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.company"
                  placeholder="请输入工作单位"
                />
                <span v-else>{{ row.company }}</span>
              </template>
            </el-table-column>
            <el-table-column label="职位" prop="position">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.position"
                  placeholder="请输入职位"
                />
                <span v-else>{{ row.position }}</span>
              </template>
            </el-table-column>
            <el-table-column label="入职时间" width="150">
              <template #default="{ row }">
                <el-date-picker
                  v-if="!isView"
                  v-model="row.startTime"
                  type="date"
                  placeholder="请选择入职时间"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <span v-else>{{ row.startTime }}</span>
              </template>
            </el-table-column>
            <el-table-column label="离职时间" width="150">
              <template #default="{ row }">
                <el-date-picker
                  v-if="!isView"
                  v-model="row.endTime"
                  type="date"
                  placeholder="请选择离职时间"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <span v-else>{{ row.endTime }}</span>
              </template>
            </el-table-column>
            <el-table-column label="证明人姓名" prop="referenceName">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.referenceName"
                  placeholder="请输入证明人姓名"
                />
                <span v-else>{{ row.referenceName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="证明人电话" prop="referencePhone">
              <template #default="{ row }">
                <el-input
                  v-if="!isView"
                  v-model="row.referencePhone"
                  placeholder="请输入证明人电话"
                />
                <span v-else>{{ row.referencePhone }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80"
              align="center"
              v-if="!isView"
            >
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  text
                  size="small"
                  @click="removeWorkExperience($index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 证书附件 -->
        <div class="card-section">
          <CustomDivider title="证书附件"></CustomDivider>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="证书信息">
                <FileUpload
                  v-model="certificateFiles"
                  :file-type="['pdf', 'doc', 'docx', 'jpg', 'png']"
                  :limit="9"
                  :fileSize="50"
                ></FileUpload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit" v-if="!isView" size="default">
            保存
          </el-button>
          <el-button @click="resetForm" v-if="!isView" size="default"> 重置 </el-button>
          <el-button @click="goBack" size="default"> 返回 </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup name="addOnboard">
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomDivider from '@/components/CustomDivider/index.vue'
import FileUpload from '@/components/FileUpload/index.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { Plus } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const { employee_type } = proxy.useDict('employee_type')

const isView = ref(false)
const ruleFormRef = ref()

// 获取操作类型（add-新增, edit-编辑, view-查看）
const actionType = route.query.action || 'add'

// 文件上传的中间变量
const certificateFiles = ref('')
const photoFile = ref('')

onMounted(() => {
  // 根据操作类型设置页面状态
  if (actionType === 'view') {
    isView.value = true
  }

  // 如果是编辑或查看，获取数据
  if (actionType === 'edit' || actionType === 'view') {
    const id = route.query.id
    if (id) {
      // 这里应该是调用API获取数据
      // 由于后端接口未提供，暂时使用模拟数据
      getFakeData(id)
    }
  }
})

const formData = ref({
  id: 0,
  // 基本信息
  name: '', // 姓名
  phone: '', // 手机号码
  email: '', // 邮箱
  gender: '', // 性别
  idType: '', // 证件类型
  idNumber: '', // 证件号码
  photo: '', // 照片

  // 银行账户信息
  bankName: '', // 开卡银行全称
  bankCardNumber: '', // 银行卡号
  bankBranch: '', // 开户支行信息

  // 入职信息
  employeeType: '', // 员工类型
  onboardingDate: new Date().toISOString().split('T')[0], // 入职日期，默认为当日
  regularizationDate: '', // 转正日期
  department: '', // 入职部门
  position: '', // 入职岗位
  manager: '', // 直接上级

  // 教育经历列表
  educationList: [],

  // 工作经历列表
  workExperienceList: [],

  // 证书附件
  certificates: [], // 证书附件
})

// 生成假数据
function getFakeData(id) {
  // 模拟根据ID获取数据
  setTimeout(() => {
    formData.value = {
      id: id,
      // 基本信息
      name: `员工${id}`,
      phone: '13800138000',
      email: 'employee@example.com',
      gender: '男',
      idType: '身份证',
      idNumber: '110101199001011234',
      photo: '',

      // 银行账户信息
      bankName: '中国工商银行',
      bankCardNumber: '6222021234567890123',
      bankBranch: '北京朝阳支行',

      // 入职信息
      employeeType: '正式员工',
      onboardingDate: '2023-01-15',
      regularizationDate: '2023-04-15',
      department: '技术部',
      position: '前端工程师',
      manager: '张经理',

      // 教育经历列表
      educationList: [
        {
          degree: '本科',
          school: '北京大学',
          major: '计算机科学与技术',
          startTime: '2010-09-01',
          endTime: '2014-06-30',
        },
      ],

      // 工作经历列表
      workExperienceList: [
        {
          company: 'XX科技有限公司',
          position: '前端工程师',
          startTime: '2014-07-01',
          endTime: '2018-06-30',
          referenceName: '李经理',
          referencePhone: '13800138001',
        },
        {
          company: 'YY互联网公司',
          position: '高级前端工程师',
          startTime: '2018-07-01',
          endTime: '2023-01-14',
          referenceName: '王总监',
          referencePhone: '13800138002',
        },
      ],

      // 证书附件
      certificates: [],
    }
  }, 300)
}

// 教育经历相关操作
const addEducation = () => {
  formData.value.educationList.push({
    degree: '',
    school: '',
    major: '',
    startTime: '',
    endTime: '',
  })
}

const removeEducation = (index) => {
  formData.value.educationList.splice(index, 1)
}

// 工作经历相关操作
const addWorkExperience = () => {
  formData.value.workExperienceList.push({
    company: '',
    position: '',
    startTime: '',
    endTime: '',
    referenceName: '',
    referencePhone: '',
  })
}

const removeWorkExperience = (index) => {
  formData.value.workExperienceList.splice(index, 1)
}

// 处理日期范围变化

const handleSubmit = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      setTimeout(() => {
        ElMessage.success(
          formData.value.id ? '员工信息修改成功' : '员工信息新增成功'
        )
        // 返回列表页
        goBack()
      }, 500)
    } else {
      ElMessage.error('请完整填写表单必填项')
    }
  })
}

const goBack = () => {
  router.push('/people/onboarding')
}

// 重置表单
const resetForm = () => {
  ruleFormRef.value.resetFields()
  // 重置教育经历和工作经历列表
  formData.value.educationList = []
  formData.value.workExperienceList = []
  // 重置文件上传
  certificateFiles.value = ''
  photoFile.value = ''
  formData.value.certificates = []
  formData.value.photo = ''
}

// 添加重置表单到导出
defineExpose({
  resetForm
})
</script>

<style scoped lang="scss">
.info-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
  padding: 20px;
  padding-bottom: 100px; /* 增加底部内边距为固定按钮留出更多空间 */
}

.main-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px; /* 添加底部外边距 */
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
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 999; /* 提高z-index确保始终在最上层 */
  box-shadow: 0 -2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin: 0;

  .el-button {
    margin: 0 10px;
    min-width: 100px;
  }
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed rgb(87, 126, 255);
  margin-bottom: 10px;

  p {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 700;

    span {
      width: 120px;
    }
  }
}
</style>

<template>
  <div class="info-container">
    <el-tabs v-model="activeTab" type="border-card" class="custom-tabs">
      <!-- 员工信息 -->
      <el-tab-pane
        v-if="permissions.employeeInfo"
        label="员工信息"
        name="employeeInfo"
      >
        <div class="section-title">基本信息</div>
        <!-- 基本信息左右布局 -->
        <div class="basic-info-container">
          <!-- 左侧基本信息 -->
          <div class="basic-info-left">
            <div class="info-row">
              <div class="info-label">姓名：</div>
              <div class="info-value">{{ employeeInfo.name }}</div>
              <div class="info-label">性别：</div>
              <div class="info-value">{{ employeeInfo.gender }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">手机号码：</div>
              <div class="info-value">{{ employeeInfo.phone }}</div>
              <div class="info-label">邮箱：</div>
              <div class="info-value">{{ employeeInfo.email }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">证件类型：</div>
              <div class="info-value">{{ employeeInfo.idType }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">证件号码：</div>
              <div class="info-value">{{ employeeInfo.idNumber }}</div>
            </div>
          </div>

          <!-- 右侧用户头像 -->
          <div class="basic-info-right">
            <div class="avatar-container">
              <el-avatar
                :size="120"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <div class="avatar-text">用户头像</div>
            </div>
          </div>
        </div>

        <div class="section-title">银行账户信息</div>
        <div class="info-row">
          <div class="info-label">开卡银行全称：</div>
          <div class="info-value">{{ employeeInfo.bankName }}</div>
          <div class="info-label">银行卡号：</div>
          <div class="info-value">11111111111111111</div>
        </div>
        <div class="info-row">
          <div class="info-label">开户支付信息：</div>
          <div class="info-value">{{ employeeInfo.bankBranch }}</div>
        </div>

        <div class="section-title">入职信息</div>
        <div class="info-row">
          <div class="info-label">员工类型：</div>
          <div class="info-value">{{ employeeInfo.employeeType }}</div>
          <div class="info-label">入职日期：</div>
          <div class="info-value">2023-10-1</div>
        </div>
        <div class="info-row">
          <div class="info-label">入职部门：</div>
          <div class="info-value">{{ employeeInfo.department }}</div>
          <div class="info-label">入职岗位：</div>
          <div class="info-value">{{ employeeInfo.superior }}</div>
        </div>
        <div class="info-row">
          <div class="info-label">直接上级：</div>
          <div class="info-value">{{ employeeInfo.superior }}</div>
          <div class="info-label">入职导师：</div>
          <div class="info-value">{{ employeeInfo.department }}</div>
        </div>

        <div class="section-title">教育经历</div>
        <div class="table-container">
          <el-table :data="employeeInfo.education" border>
            <el-table-column prop="degree" label="学历"></el-table-column>
            <el-table-column prop="school" label="毕业院校"></el-table-column>
            <el-table-column prop="major" label="专业"></el-table-column>
            <el-table-column
              prop="studyType"
              label="学习类型"
            ></el-table-column>
            <el-table-column
              prop="startDate"
              label="入学时间"
            ></el-table-column>
            <el-table-column prop="endDate" label="毕业时间"></el-table-column>
          </el-table>
        </div>

        <div class="section-title">工作经历</div>
        <div class="table-container">
          <el-table
            :data="employeeInfo.workExperience"
            border
            style="width: 100%"
          >
            <el-table-column prop="company" label="工作单位"></el-table-column>
            <el-table-column prop="position" label="职位"></el-table-column>
            <el-table-column
              prop="startDate"
              label="入职时间"
            ></el-table-column>
            <el-table-column prop="endDate" label="离职时间"></el-table-column>
            <el-table-column
              prop="referenceName"
              label="证明人姓名"
            ></el-table-column>
            <el-table-column
              prop="referencePhone"
              label="证明人电话"
            ></el-table-column>
          </el-table>
        </div>

        <div class="section-title">证书附件</div>
        <div class="section-content">
          <el-link underline="always" type="primary">软件开发正.jpg</el-link>
        </div>
      </el-tab-pane>

      <!-- 培训信息 -->
      <el-tab-pane
        v-if="permissions.trainingInfo"
        label="培训信息"
        name="trainingInfo"
      >
        <div class="table-container">
          <el-table :data="trainingInfo" border style="width: 100%">
            <el-table-column prop="name" label="培训项目名称"></el-table-column>
            <el-table-column prop="unit" label="培训单位"></el-table-column>
            <el-table-column prop="score" label="培训成绩"></el-table-column>
            <el-table-column
              prop="period"
              label="培训周期"
              width="220"
            ></el-table-column>
            <el-table-column prop="status" label="完成情况"></el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 合同信息 -->
      <el-tab-pane
        v-if="permissions.contractInfo"
        label="合同信息"
        name="contractInfo"
      >
        <div class="table-container">
          <el-table :data="contractInfo" border style="width: 100%">
            <el-table-column prop="name" label="合同名称"></el-table-column>
            <el-table-column prop="signDate" label="签署时间"></el-table-column>
            <el-table-column
              prop="startDate"
              label="合同开始日期"
            ></el-table-column>
            <el-table-column
              prop="endDate"
              label="合同结束日期"
            ></el-table-column>
            <el-table-column
              prop="nextSignDays"
              label="距离下次签署（天）"
            ></el-table-column>
            <el-table-column label="操作">
              <template #default>
                <el-button type="primary" size="small">查看合同</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 生命周期 -->
      <el-tab-pane
        v-if="permissions.lifecycle"
        label="生命周期"
        name="lifecycle"
      >
        <div class="lifecycle-container">
          <el-steps
            direction="vertical"
            :active="lifecycleSteps.length"
            finish-status="success"
            align-center
          >
            <el-step
              v-for="(step, index) in lifecycleSteps"
              :key="index"
              :title="step.title"
            >
              <template #description>
                <div class="step-time">{{ step.time }}</div>
                <div class="step-details">
                  <div
                    class="info-row"
                    v-for="(item, itemIndex) in step.items"
                    :key="itemIndex"
                  >
                    <div class="info-label">{{ item.label }}：</div>
                    <div class="info-value">{{ item.value }}</div>
                  </div>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface EmployeeInfo {
  name: string
  gender: string
  phone: string
  idType: string
  idNumber: string
  email: string
  bankName: string
  bankBranch: string
  employeeType: string
  department: string
  superior: string
  education: Education[]
  workExperience: WorkExperience[]
}

interface Education {
  degree: string
  school: string
  major: string
  studyType: string
  startDate: string
  endDate: string
}

interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate: string
  referenceName: string
  referencePhone: string
}

interface TrainingInfo {
  name: string
  unit: string
  score: string
  period: string
  status: string
}

interface ContractInfo {
  name: string
  signDate: string
  startDate: string
  endDate: string
  nextSignDays: number
}

interface Lifecycle {
  onboarding: {
    date: string
    department: string
    position: string
    superior: string
    probationEndDate: string
  }
  regularization: {
    date: string
    department: string
    position: string
    superior: string
  }
  departure: {
    date: string
    department: string
    position: string
    superior: string
    type: string
    reason: string
  }
}

interface Permissions {
  employeeInfo: boolean
  trainingInfo: boolean
  contractInfo: boolean
  lifecycle: boolean
}

interface LifecycleStep {
  title: string
  time: string
  items: Array<{
    label: string
    value: string
  }>
}

// 响应式数据
const activeTab = ref('employeeInfo')

// 权限控制
const permissions: Permissions = {
  employeeInfo: true,
  trainingInfo: true,
  contractInfo: true,
  lifecycle: true,
}

// 员工信息数据
const employeeInfo: EmployeeInfo = {
  name: '张三',
  gender: '男',
  phone: '13212341234',
  idType: '身份证',
  idNumber: '430222202003030655',
  email: '125452@qq.com',
  bankName: '招商银行',
  bankBranch: '株洲市天元区招商银行支行',
  employeeType: '正式',
  department: '采购部门',
  superior: '李斯',
  education: [
    {
      degree: '高中',
      school: '株洲二中',
      major: '理科',
      studyType: '全日制',
      startDate: '2022-03-01',
      endDate: '2022-03-01',
    },
    {
      degree: '高中',
      school: '株洲二中',
      major: '理科',
      studyType: '全日制',
      startDate: '2022-03-01',
      endDate: '2022-03-01',
    },
  ],
  workExperience: [
    {
      company: '天天向上',
      position: '软件开发',
      startDate: '2022-03-01',
      endDate: '2022-03-01',
      referenceName: '刘备',
      referencePhone: '13712341234',
    },
    {
      company: '天天向上',
      position: '软件开发',
      startDate: '2022-03-01',
      endDate: '2022-03-01',
      referenceName: '刘备',
      referencePhone: '13712341234',
    },
  ],
}

// 培训信息数据
const trainingInfo: TrainingInfo[] = [
  {
    name: '新员工培训',
    unit: '本司自主培训',
    score: '10分',
    period: '2025-10-01至2025-11-01',
    status: '已完成',
  },
  {
    name: '项目部署培训',
    unit: '本司自主培训',
    score: '10分',
    period: '2025-10-01至2025-11-01',
    status: '已完成',
  },
]

// 合同信息数据
const contractInfo: ContractInfo[] = [
  {
    name: '张三人事合同',
    signDate: '2024-01-01',
    startDate: '2025-02-01',
    endDate: '2026-02-01',
    nextSignDays: 30,
  },
  {
    name: '张三人事合同',
    signDate: '2024-01-01',
    startDate: '2025-02-01',
    endDate: '2026-02-01',
    nextSignDays: 365,
  },
]

// 生命周期数据
const lifecycle: Lifecycle = {
  onboarding: {
    date: '2025-05-01',
    department: '采购部',
    position: '部门经理',
    superior: '张三',
    probationEndDate: '2025-08-01',
  },
  regularization: {
    date: '2025-08-01',
    department: '采购部',
    position: '部门经理',
    superior: '张三',
  },
  departure: {
    date: '2025-10-01',
    department: '采购部',
    position: '部门经理',
    superior: '张三',
    type: '员工申请',
    reason: '个人发展',
  },
}

// 计算生命周期步骤
const lifecycleSteps = computed<LifecycleStep[]>(() => {
  return [
    {
      title: '入职',
      time: lifecycle.onboarding.date,
      items: [
        { label: '入职时间', value: lifecycle.onboarding.date },
        { label: '部门', value: lifecycle.onboarding.department },
        { label: '职位', value: lifecycle.onboarding.position },
        { label: '直接上级', value: lifecycle.onboarding.superior },
        { label: '预转正时间', value: lifecycle.onboarding.probationEndDate },
      ],
    },
    {
      title: '转正',
      time: lifecycle.regularization.date,
      items: [
        { label: '转正时间', value: lifecycle.regularization.date },
        { label: '部门', value: lifecycle.regularization.department },
        { label: '职位', value: lifecycle.regularization.position },
        { label: '直接上级', value: lifecycle.regularization.superior },
      ],
    },
    {
      title: '离职',
      time: lifecycle.departure.date,
      items: [
        { label: '离职时间', value: lifecycle.departure.date },
        { label: '部门', value: lifecycle.departure.department },
        { label: '职位', value: lifecycle.departure.position },
        { label: '直接上级', value: lifecycle.departure.superior },
        { label: '离职类型', value: lifecycle.departure.type },
        { label: '离职原因', value: lifecycle.departure.reason },
      ],
    },
  ]
})
</script>

<style scoped>
.info-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.custom-tabs {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  background-color: #ffffff;
}

.custom-tabs :deep(.el-tabs__nav-wrap)::after {
  height: 1px;
}

.custom-tabs :deep(.el-tabs__item) {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 600;
  background-color: #ecf5ff;
}

.custom-tabs :deep(.el-tabs__content) {
  background-color: #ffffff;
  padding: 0px 20px;
  /* min-height: 500px; */
  min-height: calc(100vh - 180px);
}

/* 新增的基本信息容器样式 */
.basic-info-container {
  display: flex;
  gap: 0px;
  margin-bottom: 20px;
}

.basic-info-left {
  flex: 1;
}

.basic-info-right {
  flex: 1;
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  /* justify-content: flex-start; */
  /* padding-top: 20px; */
}

.avatar-container {
  text-align: center;
}

.avatar-text {
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  color: #303133;
}

.info-row {
  display: flex;
  margin-bottom: 15px;
  padding: 8px 0;
}

.info-label {
  width: 120px;
  font-weight: 500;
  color: #606266;
}

.info-value {
  flex: 1;
  color: #303133;
}

.table-container {
  margin-top: 20px;
  margin-bottom: 30px;
} 

.lifecycle-container {
  padding: 20px 0;
  background-color: #ffffff;
}
.lifecycle-container :deep(.el-step__line) {
  background-color: #409eff;
  width: 2px;
}

.lifecycle-container :deep(.el-step__head.is-success) {
  color: #409eff;
  border-color: #409eff;
}
.lifecycle-container :deep(.el-step__description.is-success) {
  padding-bottom: 10px;
}

.step-details .lifecycle-container :deep(.el-step__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.lifecycle-container :deep(.el-step__title.is-success) {
  color: #303133;
}

.step-time {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
  font-weight: 500;
}

.step-details {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin-top: 10px;
}

.step-details .info-row {
  padding: 4px 0;
  margin-bottom: 0;
}

.step-details .info-label {
  width: 100px;
  font-weight: 400;
  font-size: 13px;
  color: #606266;
}

.step-details .info-value {
  font-size: 13px;
  color: #303133;
}
.section-content{
  padding:30px 10px;
}
</style>

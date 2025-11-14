<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      v-show="showSearch"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="员工姓名">
        <el-input
          v-model="queryParams.employeeName"
          placeholder="请输入员工姓名查询"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="员工类型">
        <el-select
          v-model="queryParams.employeeType"
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
      <el-form-item label="入职日期">
        <el-date-picker
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          :disabled="multiple"
          v-hasPermi="['people:info:add']"
          @click="handleAddEntry()"
          >新增入职</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" width="55" align="center" label="序号" />
      <el-table-column
        label="员工工号"
        prop="employeeId"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="员工姓名"
        prop="employeeName"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="员工类型"
        prop="employeeType"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="入职状态"
        prop="onboardingStatus"
        :show-overflow-tooltip="true"
        width="100"
      />
      <el-table-column
        label="入职部门"
        prop="department"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="教育经历"
        prop="education"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="工作经历"
        prop="workExperience"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column label="审核状态" prop="auditStatus" width="150">
        <template v-slot="scope">
          <el-link
            underline
            type="primary"
            @click="handleCommand('审核详情', scope.row)"
            >{{ scope.row.auditStatus }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="">
        <template #default="scope">
          <div class="table-btns">
            <el-text type="primary" @click="handleCommand('查看', scope.row)"
              >查看</el-text
            >
            <el-text type="primary" @click="handleCommand('编辑', scope.row)"
              >编辑</el-text
            >
            <el-text type="primary" @click="handleCommand('提审', scope.row)"
              >提审</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('取消提审', scope.row)"
              >取消提审</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('重新提审', scope.row)"
              >重新提审</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('办理入职', scope.row)"
              >办理入职</el-text
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
  <auditDialog ref="dialogRef" @get-table-data="getList" />
  <onboardDialog ref="dialogOnboardRef" @get-table-data="getList" /> 
</template>

<script setup name="onboarding">
import auditDialog from './components/auditDialog.vue'
import onboardDialog from './components/onboardDialog.vue' 
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const total = ref(0)
const dateRange = ref([])
const { employee_type } = proxy.useDict('employee_type')

// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    employeeName: undefined,
    employeeType: undefined,
    onboardingStatus: undefined,
    refMainId: undefined,
  },
})

const { queryParams } = toRefs(data)

// 生成假数据
function generateFakeData() {
  const fakeData = []
  const employeeTypes = ['正式员工', '实习生', '兼职', '外包']
  const departments = [
    '技术部',
    '销售部',
    '人事部',
    '财务部',
    '市场部',
    '运营部',
  ]
  const statuses = ['已入职', '待入职', '已离职']
  const auditStatuses = ['未审核', '待审核', '审核通过', '审核拒绝']

  for (let i = 1; i <= 10; i++) {
    fakeData.push({
      id: i,
      employeeId: `E${String(i).padStart(4, '0')}`,
      employeeName: `员工${i}`,
      employeeType:
        employeeTypes[Math.floor(Math.random() * employeeTypes.length)],
      onboardingStatus: statuses[Math.floor(Math.random() * statuses.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      education: `学历${(i % 5) + 1}`,
      workExperience: `${(i % 10) + 1}年`,
      onboardingDate: `202${Math.floor(i / 10)}-${String((i % 12) + 1).padStart(
        2,
        '0'
      )}-${String((i % 28) + 1).padStart(2, '0')}`,
      departureDate:
        i % 5 === 0
          ? `202${Math.floor(i / 8) + 1}-${String((i % 12) + 1).padStart(
              2,
              '0'
            )}-${String((i % 28) + 1).padStart(2, '0')}`
          : '',
      companyAge: i % 5 === 0 ? `${(i % 8) + 1}年` : `${(i % 5) + 1}年`,
      auditStatus:
        auditStatuses[Math.floor(Math.random() * auditStatuses.length)],
    })
  }
  return fakeData
}

// 查询列表
function getList() {
  loading.value = true
  // 使用假数据替代实际API调用
  setTimeout(() => {
    const allData = generateFakeData()

    // 模拟分页
    const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
    const end = start + queryParams.value.pageSize
    tableList.value = allData.slice(start, end)
    total.value = allData.length

    loading.value = false
  }, 500)
}

// 页面初始化时获取数据
getList()

// 打开 dialog(新增、查看、编辑)
const dialogRef = ref()
const dialogOnboardRef = ref() 
function handleCommand(title, row) {
  if (title === '审核详情') {
    dialogRef.value?.acceptParams({
      title,
      row: { ...row }
    })
  } else if (title === '办理入职') {
    dialogOnboardRef.value?.acceptParams({
      title,
      row: { ...row }
    })
  } 
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置查询 */
function resetQuery() {
  proxy.resetForm('queryRef')
  dateRange.value = []
  handleQuery()
}

/** 日期选择处理 */
function handleDateChange(value) {
}
/** 跳转到新增入职页面 */
function handleAddEntry() {
  router.push('/people/onboarding/addOnboard')
}
</script>

<style lang="scss" scoped>
.table-btns :deep(.el-text) {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}
</style>
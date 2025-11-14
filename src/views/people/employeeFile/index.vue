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
    <el-table
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      @expand-change="expandChange"
      ref="tableRef"
      row-key="id"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="expand-container">
            <!-- 教育经历表格 -->
            <div
              v-if="
                props.row.currentExpandedType === 'education' ||
                !props.row.currentExpandedType
              "
            >
              <h4 style="margin-left: 50px; margin-bottom: 10px">教育经历</h4>
              <el-table
                :data="educationList"
                class="nested-table"
                v-if="props.row.id === currentExpandedRowId"
              >
                <el-table-column
                  type="index"
                  label="序号"
                  width="80"
                  align="center"
                />
                <el-table-column label="学历" prop="degree" width="120" />
                <el-table-column label="毕业院校" prop="school" width="150" />
                <el-table-column label="专业" prop="major" width="120" />
                <el-table-column
                  label="学习类型"
                  prop="studyType"
                  width="120"
                />
                <el-table-column
                  label="入学时间"
                  prop="startDate"
                  width="120"
                />
                <el-table-column label="毕业时间" prop="endDate" width="120" />
                <el-table-column label="操作" width="80">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      text
                      size="small"
                      @click="removeEducation(props.row, $index)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 工作经历表格 -->
            <div v-if="props.row.currentExpandedType === 'work'">
              <h4 style="margin-left: 50px; margin-bottom: 10px">工作经历</h4>
              <el-table
                :data="workList"
                class="nested-table"
                v-if="props.row.id === currentExpandedRowId"
              >
                <el-table-column
                  type="index"
                  label="序号"
                  width="80"
                  align="center"
                />
                <el-table-column label="工作单位" prop="company" width="150" />
                <el-table-column label="职位" prop="position" width="120" />
                <el-table-column
                  label="入职时间"
                  prop="startDate"
                  width="120"
                />
                <el-table-column label="离职时间" prop="endDate" width="120" />
                <el-table-column
                  label="证明人姓名"
                  prop="referenceName"
                  width="120"
                />
                <el-table-column
                  label="证明人电话"
                  prop="referencePhone"
                  width="120"
                />
                <el-table-column label="操作" width="80">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      text
                      size="small"
                      @click="removeWork(props.row, $index)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </template>
      </el-table-column>

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
      >
      <template #default="scope">
        <span class="clickable-field" @click="handleAddEntry(scope.row)">
           {{ scope.row.employeeName }}
          </span> 
      </template>
      </el-table-column>
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
      <el-table-column label="教育经历" width="150">
        <template #default="scope">
          <span class="clickable-field" @click="toggleEducation(scope.row)">
            查看教育经历
          </span>
        </template>
      </el-table-column>
      <el-table-column label="工作经历" width="150">
        <template #default="scope">
          <span class="clickable-field" @click="toggleWork(scope.row)">
            查看工作经历
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="司龄"
        prop="companyAge"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column
        label="是否签署合同"
        prop="isContractSigned"
        :show-overflow-tooltip="true"
        width="150"
      />
      <el-table-column label="操作" align="center" fixed="right" width="">
        <template #default="scope">
          <div class="table-btns">
            <el-text type="primary" @click="handleCommand('编辑', scope.row)"
              >编辑</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('申请转正', scope.row)"
              >申请转正</el-text
            >
            <el-text
              type="primary"
              @click="handleCommand('申请离职', scope.row)"
              >申请离职</el-text
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
  <regularizationDialog
    ref="regularizationDialogRef"
    @get-table-data="getList"
  />
  <resignationDialog ref="resignationDialogRef" @get-table-data="getList" />
</template>

<script setup name="employeeFile">
import regularizationDialog from './components/regularizationDialog.vue'
import resignationDialog from './components/resignationDialog.vue'
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
const tableRef = ref()
const currentExpandedRowId = ref(null)
const educationList = ref([])
const workList = ref([])

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
  const degrees = ['本科', '硕士', '博士', '专科']
  const studyTypes = ['全日制', '非全日制', '自考', '成人教育']
  const positions = ['工程师', '经理', '主管', '专员', '总监']

  for (let i = 1; i <= 10; i++) {
    // 生成教育经历列表
    const educationList = []
    for (let j = 1; j <= 2; j++) {
      educationList.push({
        degree: degrees[Math.floor(Math.random() * degrees.length)],
        school: `XX大学${j}`,
        major: `专业${j}`,
        studyType: studyTypes[Math.floor(Math.random() * studyTypes.length)],
        startDate: `201${j}-09-01`,
        endDate: `201${j + 4}-06-30`,
      })
    }

    // 生成工作经历列表
    const workList = []
    for (let k = 1; k <= 2; k++) {
      workList.push({
        company: `XX公司${k}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        startDate: `201${k + 3}-01-01`,
        endDate: `201${k + 5}-12-31`,
        referenceName: `推荐人${k}`,
        referencePhone: `1380013800${k}`,
      })
    }

    fakeData.push({
      id: i,
      employeeId: `E${String(i).padStart(4, '0')}`,
      employeeName: `员工${i}`,
      companyAge: 1,
      isContractSigned: '是',
      employeeType:
        employeeTypes[Math.floor(Math.random() * employeeTypes.length)],
      onboardingStatus: statuses[Math.floor(Math.random() * statuses.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      currentExpandedType: null,
      educationList,
      workList,
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

// 切换教育经历展开状态
function toggleEducation(row) {
  // 如果点击的是已展开的行，则收起
  if (
    currentExpandedRowId.value === row.id &&
    (row.currentExpandedType === 'education' || !row.currentExpandedType)
  ) {
    tableRef.value.toggleRowExpansion(row, false)
    currentExpandedRowId.value = null
    educationList.value = []
    return
  }

  // 关闭当前展开的行
  if (currentExpandedRowId.value && currentExpandedRowId.value !== row.id) {
    const expandedRow = tableList.value.find(
      (item) => item.id === currentExpandedRowId.value
    )
    if (expandedRow) {
      tableRef.value.toggleRowExpansion(expandedRow, false)
    }
  }

  // 设置当前行的展开类型为教育经历
  row.currentExpandedType = 'education'
  currentExpandedRowId.value = row.id
  educationList.value = row.educationList

  // 展开当前行
  tableRef.value.toggleRowExpansion(row, true)
}

// 切换工作经历展开状态
function toggleWork(row) {
  // 如果点击的是已展开的行，则收起
  if (
    currentExpandedRowId.value === row.id &&
    row.currentExpandedType === 'work'
  ) {
    tableRef.value.toggleRowExpansion(row, false)
    currentExpandedRowId.value = null
    workList.value = []
    return
  }

  // 关闭当前展开的行
  if (currentExpandedRowId.value && currentExpandedRowId.value !== row.id) {
    const expandedRow = tableList.value.find(
      (item) => item.id === currentExpandedRowId.value
    )
    if (expandedRow) {
      tableRef.value.toggleRowExpansion(expandedRow, false)
    }
  }

  // 设置当前行的展开类型为工作经历
  row.currentExpandedType = 'work'
  currentExpandedRowId.value = row.id
  workList.value = row.workList

  // 展开当前行
  tableRef.value.toggleRowExpansion(row, true)
}

// 处理展开行变化
const expandChange = (row, expandedRows) => {
  const isExpanded = expandedRows.some(
    (expandedRow) => expandedRow.id === row.id
  )

  // 关闭其他行
  if (isExpanded) {
    // 关闭当前已展开的其他行
    if (currentExpandedRowId.value && currentExpandedRowId.value !== row.id) {
      const expandedRow = tableList.value.find(
        (item) => item.id === currentExpandedRowId.value
      )
      if (expandedRow) {
        tableRef.value.toggleRowExpansion(expandedRow, false)
      }
    }

    // 如果是通过点击箭头展开，默认显示教育经历
    if (!row.currentExpandedType) {
      row.currentExpandedType = 'education'
    }

    // 更新当前展开的行ID
    currentExpandedRowId.value = row.id

    // 根据展开类型设置数据
    if (row.currentExpandedType === 'education' || !row.currentExpandedType) {
      educationList.value = row.educationList
      workList.value = []
    } else if (row.currentExpandedType === 'work') {
      workList.value = row.workList
      educationList.value = []
    }
  } else {
    if (currentExpandedRowId.value === row.id) {
      currentExpandedRowId.value = null
      educationList.value = []
      workList.value = []
    }
  }
}

// 删除教育经历
function removeEducation(row, index) {
  row.educationList.splice(index, 1)
  educationList.value = [...row.educationList]
}

// 删除工作经历
function removeWork(row, index) {
  row.workList.splice(index, 1)
  workList.value = [...row.workList]
}

// 打开 dialog(新增、查看、编辑)
const regularizationDialogRef = ref()
const resignationDialogRef = ref()
function handleCommand(title, row) {
  if (title === '申请转正') {
    regularizationDialogRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  } else if (title === '申请离职') {
    resignationDialogRef.value?.acceptParams({
      title,
      row: { ...row },
    })
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  // 收起所有展开的行
  if (currentExpandedRowId.value) {
    const expandedRow = tableList.value.find(
      (item) => item.id === currentExpandedRowId.value
    )
    if (expandedRow) {
      tableRef.value.toggleRowExpansion(expandedRow, false)
    }
  }
  currentExpandedRowId.value = null
  educationList.value = []
  workList.value = []
  getList()
}

/** 重置查询 */
function resetQuery() {
  proxy.resetForm('queryRef')
  dateRange.value = []
  // 收起所有展开的行
  if (currentExpandedRowId.value) {
    const expandedRow = tableList.value.find(
      (item) => item.id === currentExpandedRowId.value
    )
    if (expandedRow) {
      tableRef.value.toggleRowExpansion(expandedRow, false)
    }
  }
  currentExpandedRowId.value = null
  educationList.value = []
  workList.value = []
  handleQuery()
}

/** 日期选择处理 */
function handleDateChange(value) {
  // 可以在这里处理日期范围筛选逻辑
}
/** 跳转到员工详情页面 */
function handleAddEntry(row) {
  router.push(`/people/employeeFile/employeeInfo?id=${row.id}`)
}
</script>

<style lang="scss" scoped>
.table-btns :deep(.el-text) {
  margin: 5px;
  cursor: pointer;
  font-weight: 500;
}

.nested-table {
  margin-left: 50px;
  width: calc(100% - 50px);
  background-color: #f5f7fa;
}

.expand-container {
  padding-left: 50px;
}

.clickable-field {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
}

.clickable-field:hover {
  color: #66b1ff;
}
</style>

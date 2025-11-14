<template>
  <div class="progress-overview-wrapper layout-padding">
    <div
      class="progress-overview-container layout-padding-view layout-padding-auto"
    >
      <div class="progress-overview-header">
        <div class="title-left">
          <h2>项目进度概览</h2>
          <p>实时监控项目各项任务进度与完成情况</p>
        </div>
        <el-select
          v-model="searchForm.projectId"
          placeholder="请选择项目"
          @change="getDataChange"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>

      <!-- Summary Cards -->
      <div class="summary-container">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="summary-card overall-progress">
              <div class="card-icon">
                <i class="el-icon-data-analysis"></i>
              </div>
              <p>项目总体进度</p>
              <h3>
                <span class="highlight"
                  >{{ summaryCards.projectProgress }}%</span
                >
              </h3>
              <p>
                计划进度:
                <span class="highlight"
                  >{{ summaryCards.scheduleProgress }}%</span
                >
                偏差:
                <span class="highlight-deviation"
                  >{{ summaryCards.behindProgress }}%</span
                >
              </p>
              <p>&nbsp;</p>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="summary-card task-completion">
              <div class="card-icon">
                <i class="el-icon-check"></i>
              </div>
              <p>任务完成情况</p>
              <h3>
                <span class="highlight">{{
                  summaryCards.completedTaskNum
                }}</span
                >/<span>{{ summaryCards.totalTaskNum }}</span>
              </h3>
              <p>
                占总任务的
                <span class="highlight"
                  >{{ summaryCards.taskCompletion }}%</span
                >
              </p>
              <p>&nbsp;</p>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
            <div class="summary-card time-progress">
              <div class="card-icon">
                <i class="el-icon-time"></i>
              </div>
              <p>项目时间进度</p>
              <h3>
                <span class="highlight">{{ summaryCards.pastDays }}</span
                >/<span>{{ summaryCards.totalDays }}</span>
              </h3>
              <div class="progress-bar">
                <div
                  class="progress-bar-fill"
                  :style="{
                    width:
                      (summaryCards.pastDays / summaryCards.totalDays) * 100 +
                      '%',
                  }"
                ></div>
              </div>
              <p>
                开始:
                <span class="highlight-date">{{ summaryCards.startDate }}</span>
                预计结束:
                <span class="highlight-date">{{ summaryCards.endDate }}</span>
              </p>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Charts -->
      <div class="charts-container">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <div class="chart-box">
              <h3>任务状态分布</h3>
              <div ref="pieChart" style="width: 100%; height: 300px"></div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <div class="chart-box">
              <h3>项目进度趋势</h3>
              <div ref="lineChart" style="width: 100%; height: 300px"></div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Search and Table -->
      <div class="table-container">
        <div class="table-search-container">
          <h2>任务明细</h2>
          <el-form ref="searchFormRef" :model="searchForm" class="table-form">
            <el-form-item prop="keyword" class="table-form-btn">
              <el-button type="primary" @click="openAddDialog"
                >新增任务</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <!-- CommonTable -->
        <CommonTable
          ref="commonTableRef"
          v-bind="state.tableData"
          class="table-demo"
          @pageChange="onTablePageChange"
          @sortHeader="onSortHeader"
          @checkboxChange="handleSelectionChange"
        >
        </CommonTable>
      </div>

      <!-- Add/Edit Task Dialog -->
      <el-dialog
        v-model="taskDialogVisible"
        :title="taskDialogTitle"
        width="800px"
        @close="resetTaskFormData"
        class="add-dialog"
      >
        <el-form
          ref="taskFormRef"
          :model="taskFormData"
          :rules="taskFormRules"
          label-width="140px"
        >
          <el-row :gutter="20" class="mb20">
            <el-col :span="12">
              <el-form-item label="任务编码" prop="code">
                <el-input
                  v-model="taskFormData.code"
                  placeholder="不输入，自动生成"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务名称" prop="name" required>
                <el-input
                  v-model="taskFormData.name"
                  placeholder="请输入任务名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb20">
            <el-col :span="12">
              <el-form-item label="计划开始日期" prop="planStartDate" required>
                <el-date-picker
                  v-model="taskFormData.planStartDate"
                  type="date"
                  placeholder="请选择计划开始日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划完成日期" prop="planEndDate" required>
                <el-date-picker
                  v-model="taskFormData.planEndDate"
                  type="date"
                  placeholder="请选择计划完成日期"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="mb20">
            <el-col :span="12">
              <el-form-item label="任务责任人" prop="responsiblePeopleId">
                <el-input
                  v-model="taskFormData.responsiblePeopleName"
                  placeholder="请选择任务责任人"
                  readonly
                  @click="showUserDialog"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联项目" prop="projectId" required>
                <el-select
                  v-model="taskFormData.projectId"
                  placeholder="请选择项目"
                  style="width: 100%"
                  disabled
                >
                  <el-option
                    v-for="item in projectList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="resetTaskFormData" size="default"
              >取消</el-button
            >
            <el-button type="primary" @click="submitTaskForm" size="default">
              {{ taskFormData.id ? "保存修改" : "确认新增" }}
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- User Selector Dialog -->
      <UserSelector
        v-model="userDialogVisible"
        @select-user="handleUserSelected"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import * as echarts from "echarts";
import CommonTable from "@/components/CommonTable/index.vue";
import UserSelector from "@/components/UserSelectDialog/index.vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getTaskSummary } from "@/api/projectManage/projectTask";
import { getAllProject } from "@/api/projectManage/projectList";
import {
  listProjectTask,
  addProjectTask,
  updateProjectTask,
  delProjectTask,
  getProjectTask,
  getTaskStatusDistribution,
  getProjectProgressTrend,
} from "@/api/projectManage/projectTask";

// Summary Cards Data
const summaryCards = ref({});
const getSummaryCards = async (value) => {
  try {
    const res = await getTaskSummary(value);
    summaryCards.value = res.data || {};
  } catch (error) {
    ElMessage.error("获取总结数据失败");
  }
};

const projectList = ref([]);
const getProjectList = async () => {
  try {
    const res = await getAllProject();
    projectList.value = res.data || [];
    if (res.data && res.data.length > 0) {
      searchForm.projectId = res.data[0].id;
      getSummaryCards(res.data[0].id);
      getTableData();
      updateCharts(); // Fetch chart data on project selection
    }
  } catch (error) {
    ElMessage.error("获取项目列表失败");
  }
};

// User Selector Dialog
const userDialogVisible = ref(false);
const showUserDialog = () => {
  userDialogVisible.value = true;
};

// Handle user selection from UserSelector
const handleUserSelected = (user) => {
  taskFormData.value.responsiblePeopleName = user.name;
  taskFormData.value.responsiblePeopleId = user.id;
  userDialogVisible.value = false;
};

const getDataChange = (value) => {
  searchForm.projectId = value;
  getSummaryCards(value);
  getTableData();
  updateCharts(); // Update charts when project changes
};

// Chart References
const pieChart = ref(null);
const lineChart = ref(null);

// Search Form
const searchForm = reactive({
  projectId: "",
  keyword: "",
});
const searchFormRef = ref();

// Table Configuration
const commonTableRef = ref();
const selectedRows = ref([]);
const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "code",
        colWidth: "",
        title: "任务编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "name",
        colWidth: "",
        title: "任务名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "planStartDate",
        colWidth: "",
        title: "计划开始日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "planEndDate",
        colWidth: "",
        title: "计划完成日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualStartDate",
        colWidth: "",
        title: "实际开始日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualEndDate",
        colWidth: "",
        title: "实际完成日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "taskProgress",
        colWidth: "",
        title: "进度",
        type: "text",
        isCheck: true,
      },
      {
        key: "taskStatusStr",
        colWidth: "",
        title: "状态",
        type: "tag",
        isCheck: true,
      },
      {
        key: "responsiblePeopleName",
        colWidth: "",
        title: "负责人",
        type: "text",
        isCheck: true,
      },
    ],
    config: {
      total: 0,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: false,
      isOperate: false,
      operateWidth: "120",
      isImport: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

// Task Dialog and Form
const taskDialogVisible = ref(false);
const taskDialogTitle = ref("新增任务");
const taskFormRef = ref();
const taskFormData = ref({
  id: "",
  code: "",
  name: "",
  planStartDate: "",
  planEndDate: "",
  projectId: "",
  responsiblePeopleId: "",
  responsiblePeopleName: "",
});

const taskFormRules = reactive({
  name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  planStartDate: [
    { required: true, message: "请选择计划开始日期", trigger: "change" },
  ],
  planEndDate: [
    { required: true, message: "请选择计划完成日期", trigger: "change" },
  ],
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  responsiblePeopleId: [
    { required: false, message: "请选择任务责任人", trigger: "change" },
  ],
});

// Table Handlers
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const onSortHeader = (headers) => {
  state.tableData.header = headers;
};

const getTableData = async () => {
  state.tableData.config.loading = true;
  try {
    const res = await listProjectTask({
      projectId: searchForm.projectId,
      keyword: searchForm.keyword,
      pageNum: state.tableData.param.pageNum,
      pageSize: state.tableData.param.pageSize,
    });
    state.tableData.data = res.rows || [];
    state.tableData.config.total = res.total || 0;
    updateCharts();
  } catch (error) {
    ElMessage.error("获取任务列表失败");
  } finally {
    state.tableData.config.loading = false;
  }
};

// Dialog Handlers
const openAddDialog = () => {
  taskFormData.value = {
    id: "",
    code: "",
    name: "",
    planStartDate: "",
    planEndDate: "",
    projectId: searchForm.projectId,
    responsiblePeopleId: "",
    responsiblePeopleName: "",
  };
  taskDialogTitle.value = "新增任务";
  taskDialogVisible.value = true;
};

const handleEdit = async (row) => {
  taskDialogTitle.value = "编辑任务";
  try {
    const res = await getProjectTask(row.id);
    taskFormData.value = {
      id: row.id || "",
      code: row.code || "",
      name: row.name || "",
      planStartDate: row.planStartDate || row.plannedStartDate || "",
      planEndDate: row.planEndDate || row.plannedEndDate || "",
      projectId: searchForm.projectId,
      responsiblePeopleId: row.responsiblePeopleId || "",
      responsiblePeopleName: row.responsiblePeopleName || "",
    };
    taskDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取任务详情失败");
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除此任务吗？删除后无法恢复！", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await delProjectTask(row.id);
    ElMessage.success("删除成功");
    getTableData();
    getSummaryCards(searchForm.projectId);
    updateCharts();
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

const resetTaskFormData = () => {
  taskFormData.value = {
    id: "",
    code: "",
    name: "",
    planStartDate: "",
    planEndDate: "",
    projectId: "",
    responsiblePeopleId: "",
    responsiblePeopleName: "",
  };
  taskFormRef.value?.resetFields();
  taskDialogVisible.value = false;
};

const submitTaskForm = async () => {
  try {
    const valid = await taskFormRef.value.validate();
    if (!valid) return;

    const payload = {
      id: taskFormData.value.id,
      code: taskFormData.value.code,
      name: taskFormData.value.name,
      planStartDate: taskFormData.value.planStartDate,
      planEndDate: taskFormData.value.planEndDate,
      projectId: taskFormData.value.projectId,
      responsiblePeopleId: taskFormData.value.responsiblePeopleId,
    };

    if (taskFormData.value.id) {
      await updateProjectTask(payload);
      ElMessage.success("编辑任务成功");
    } else {
      await addProjectTask(payload);
      ElMessage.success("新增任务成功");
    }
    resetTaskFormData();
    getTableData();
    getSummaryCards(searchForm.projectId);
    updateCharts();
  } catch (error) {
    ElMessage.error(taskFormData.value.id ? "编辑任务失败" : "新增任务失败");
  }
};

// Chart Data Fetching and Initialization
const taskStatusData = ref([]);
const progressTrendData = ref({ xaxisData: [], seriesDataAry: [] });

const fetchChartData = async () => {
  if (!searchForm.projectId) return;

  // Fetch Task Status Distribution
  const res = await getTaskStatusDistribution(searchForm.projectId);
  taskStatusData.value = res.data.map((item) => ({
    name: item.name,
    value: parseInt(item.value) || 0,
  }));

  // Fetch Project Progress Trend
  const res2 = await getProjectProgressTrend(searchForm.projectId);
  progressTrendData.value = res2.data;
};

const updateCharts = () => {
  fetchChartData().then(() => {
    nextTick(() => {
      // Pie Chart (Task Status Distribution)
      if (pieChart.value) {
        const pieChartInstance = echarts.init(pieChart.value);
        pieChartInstance.setOption({
          tooltip: { trigger: "item" },
          series: [
            {
              type: "pie",
              radius: ["40%", "70%"],
              data: taskStatusData.value,
              label: { show: true, formatter: "{b}: {c} ({d}%)" },
            },
          ],
          color: ["#5470c6", "#91cc75", "#fac858", "#ee6666"],
        });
      }

      // Line Chart (Project Progress Trend)
      if (lineChart.value && progressTrendData.value.xaxisData.length > 0) {
        const lineChartInstance = echarts.init(lineChart.value);
        lineChartInstance.setOption({
          tooltip: { trigger: "axis" },
          xAxis: {
            type: "category",
            data: progressTrendData.value.xaxisData,
          },
          yAxis: { type: "value", max: 100 },
          series: {
            type: "line",
            name: "项目进度趋势",
            data: progressTrendData.value.seriesDataObj.map(
              (series) => series.value
            ),
            itemStyle: { color: "#5470c6" },
            areaStyle: { color: "rgba(84, 112, 198, 0.2)" },
          },
        });
      }
    });
  });
};

// Initialize
onMounted(() => {
  getProjectList();
});

watch(
  () => searchForm.keyword,
  () => {
    getTableData();
  }
);
</script>

<style scoped lang="scss">
.progress-overview-wrapper {
  height: calc(100vh - 90px);
  overflow-y: auto;
  background: #f8fafc;

  .progress-overview-container {
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

    .progress-overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .title-left {
        h2 {
          font-weight: 600;
          color: #1f2a44;
          margin: 0 0 8px;
        }

        p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
      }

      .el-select {
        width: 200px;
      }
    }

    .summary-container {
      margin-bottom: 32px;

      .summary-card {
        position: relative;
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        text-align: left;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        background: linear-gradient(135deg, #ffffff, #f8fafc);

        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        &.overall-progress {
          border-left: 4px solid #5470c6;
        }
        &.task-completion {
          border-left: 4px solid #91cc75;
        }
        &.time-progress {
          border-left: 4px solid #fac858;
        }

        .card-icon {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 24px;
          color: #64748b;
          opacity: 0.3;
          transition: opacity 0.3s ease;

          .el-icon {
            font-size: 28px;
          }
        }

        &:hover .card-icon {
          opacity: 0.6;
        }

        p {
          margin: 0 0 8px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.5;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 700;
          color: #1f2a44;
          letter-spacing: 0.5px;

          span {
            font-weight: 400;
          }
        }

        p:last-child {
          color: #94a3b8;
        }

        .highlight {
          color: #2f855a;
          font-weight: 600;
        }

        .highlight-deviation {
          color: #c53030;
          font-weight: 600;
        }

        .highlight-date {
          color: #d97706;
          font-weight: 600;
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin: 12px 0;
        }

        .progress-bar-fill {
          height: 100%;
          background: #fac858;
          transition: width 0.5s ease;
        }
      }
    }

    .charts-container {
      margin-bottom: 32px;

      .chart-box {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        text-align: left;

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2a44;
          margin: 0 0 12px;
        }
      }
    }

    .table-container {
      .table-search-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2a44;
          margin: 0;
        }

        .table-form {
          display: flex;
          align-items: center;
          gap: 12px;

          .el-input {
            width: 240px;
          }

          .el-button {
            height: 36px;
            border-radius: 6px;
            font-weight: 500;
            background: #2563eb;
            border-color: #2563eb;
            color: #ffffff;

            &:hover {
              background: #1e40af;
              border-color: #1e40af;
            }
          }
        }
      }

      :deep(.table-demo) {
        height: calc(100vh - 400px);

        .el-table {
          border: 1px solid #e2e8f0;
          border-radius: 8px;

          th,
          td {
            padding: 12px;
            font-size: 14px;
            color: #1f2a44;
          }

          th {
            background: #f8fafc;
            font-weight: 600;
            color: #1f2a44;
          }

          .el-table__row:hover {
            background: #f1f5f9;
          }
        }
      }
    }
  }
}

.table-form-btn {
  margin-left: 0;
}

.add-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    max-width: 800px;
  }

  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2a44;
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 15px 20px 20px;
    border-top: 1px solid #ebeef5;

    .el-button {
      border-radius: 6px;
      font-weight: 500;

      &:first-child {
        background: #ffffff;
        border-color: #e2e8f0;
        color: #64748b;

        &:hover {
          background: #f1f5f9;
        }
      }

      &:last-child {
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;

        &:hover {
          background: #1e40af;
          border-color: #1e40af;
        }
      }
    }
  }

  .mb20 {
    margin-bottom: 20px;
  }
}
</style>

<template>
  <div class="cost-overview-wrapper layout-padding">
    <div class="cost-overview-padding layout-padding-view layout-padding-auto">
      <div class="cost-overview-container">
        <div class="cost-overview-header">
          <div class="title-left">
            <h2>成本概览</h2>
            <p>跟踪和管理所有项目的成本、统计及分析</p>
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
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card plan-budget">
                <div class="card-icon">
                  <i class="el-icon-wallet"></i>
                </div>
                <p>总人力成本</p>
                <h3>￥{{ summaryCards.totalCost }}</h3>
                <p>项目总人力成本</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card used-cost">
                <div class="card-icon">
                  <i class="el-icon-money"></i>
                </div>
                <p>总工时(天)</p>
                <h3>{{ summaryCards.totalHours }}</h3>
                <p>&nbsp;</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card remaining-budget">
                <div class="card-icon">
                  <i class="el-icon-coin"></i>
                </div>
                <p>平均每日成本</p>
                <h3>￥{{ summaryCards.avgCost }}</h3>
                <p>&nbsp;</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card deviation">
                <div class="card-icon">
                  <i class="el-icon-data-line"></i>
                </div>
                <p>参与人数</p>
                <h3>{{ summaryCards.peopleNum }}人</h3>
                <p>&nbsp;</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- Search and Table -->
        <div class="table-container">
          <div class="table-search-container">
            <h2>项目成本明细</h2>
            <el-form ref="searchFormRef" :model="searchForm" class="table-form">
              <el-form-item prop="keyword" class="table-form-btn">
                <el-button type="primary" @click="handleAddCostItem">
                  新增人员任务
                </el-button>
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
            <!-- <template #operate="{ row }">
              <div class="operateBox no-print">
                <el-button type="primary" link @click="handleEdit(row)"
                  >编辑</el-button
                >
                <el-button type="danger" link @click="handleDelete(row)"
                  >删除</el-button
                >
              </div>
            </template> -->
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
                <el-form-item
                  label="计划开始日期"
                  prop="planStartDate"
                  required
                >
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
                    v-model="taskFormData.responsiblePeopleId"
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

        <UserSelector
          v-model="userDialogVisible"
          @select-user="handleUserSelected"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import CommonTable from "@/components/CommonTable/index.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getHumanCostSummary,
  getHumanCostDetail,
} from "@/api/projectManage/projectCost";
import { getAllProject } from "@/api/projectManage/projectList";
import {
  addProjectTask,
  updateProjectTask,
  delProjectTask,
  getProjectTask,
} from "@/api/projectManage/projectTask";
import UserSelector from "@/components/UserSelectDialog/index.vue";

// Summary Cards Data
const summaryCards = ref({});
const getSummaryCards = async (value) => {
  const res = await getHumanCostSummary(value);
  summaryCards.value = res.data;
};

const projectList = ref([]);
const getProjectList = async () => {
  const res = await getAllProject();
  projectList.value = res.data;
  searchForm.value.projectId = res.data[0]?.id;
  getSummaryCards(searchForm.value.projectId);
  getTableData();
};

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
  searchForm.value.projectId = value;
  getSummaryCards(value);
  getTableData();
};

// Search Form
const searchForm = ref({ keyword: "", projectId: 1 });
const searchFormRef = ref();

// Table Configuration
const commonTableRef = ref();
const selectedRows = ref([]);
const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "peopleName",
        colWidth: "",
        title: "负责人",
        type: "text",
        isCheck: true,
      },
      {
        key: "peoplePost",
        colWidth: "",
        title: "岗位",
        type: "text",
        isCheck: true,
      },
      {
        key: "salary",
        colWidth: "",
        title: "月薪标准",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualStartDate",
        colWidth: "",
        title: "加入项目日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualEndDate",
        colWidth: "",
        title: "完成项目日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualDays",
        colWidth: "",
        title: "累计工时(天)",
        type: "text",
        isCheck: true,
      },
      {
        key: "laborCost",
        colWidth: "",
        title: "人力成本(￥)",
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
      operateWidth: "150",
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
  const res = await getHumanCostDetail(searchForm.value.projectId, {
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
  });
  state.tableData.data = res.rows;
  state.tableData.config.total = res.total;
  state.tableData.config.loading = false;
};

// Task Dialog Handlers
const handleAddCostItem = () => {
  taskFormData.value = {
    id: "",
    code: "",
    name: "",
    planStartDate: "",
    planEndDate: "",
    projectId: searchForm.value.projectId,
    responsiblePeopleId: "",
    responsiblePeopleName: "",
  };
  taskDialogTitle.value = "新增任务";
  taskDialogVisible.value = true;
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
    getSummaryCards(searchForm.value.projectId);
  } catch (error) {
    ElMessage.error(taskFormData.value.id ? "编辑任务失败" : "新增任务失败");
  }
};

onMounted(() => {
  getProjectList();
});

watch(searchForm, () => {
  getTableData();
});
</script>

<style scoped lang="scss">
.cost-overview-wrapper {
  height: calc(100vh - 90px);
  overflow-y: auto;
  background: #f8fafc;

  .cost-overview-container {
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

    .cost-overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .title-left {
        h2 {
          font-size: 24px;
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

        &.plan-budget {
          border-left: 4px solid #5470c6;
        }
        &.used-cost {
          border-left: 4px solid #91cc75;
        }
        &.remaining-budget {
          border-left: 4px solid #fac858;
        }
        &.deviation {
          border-left: 4px solid #ee6666;
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
          font-size: 14px;
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
            font-size: 14px;
            font-weight: 400;
          }
        }

        p:last-child {
          font-size: 13px;
          color: #94a3b8;
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
        border-radius: 8px;
        height: calc(100vh - 460px);
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

.edit-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    max-width: 600px;
  }

  :deep(.el-dialog__header) {
    padding: 16px 24px;
    border-bottom: 1px solid #e2e8f0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2a44;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;

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
    margin-bottom: 16px;
  }
}

.add-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 15px 20px 20px;
    border-top: 1px solid #ebeef5;
  }

  :deep(.el-divider) {
    margin: 25px 0 20px;
  }

  .mb20 {
    margin-bottom: 20px;
  }
}
</style>

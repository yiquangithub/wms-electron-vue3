<template>
  <div class="projects-wrapper layout-padding">
    <div class="projects-padding layout-padding-view layout-padding-auto">
      <div class="projects-container">
        <!-- Search and Action Area -->
        <div class="table-search-container">
          <el-form ref="searchFormRef" :model="searchForm" class="table-form">
            <el-row :gutter="35">
              <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
                <el-form-item prop="keyword">
                  <el-input
                    placeholder="请输入项目名称/编码搜索"
                    v-model.trim="searchForm.keyword"
                    clearable
                    :suffix-icon="Search"
                    @input="getTableData"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
                <el-form-item prop="projectType">
                  <el-select
                    v-model="searchForm.projectType"
                    placeholder="请选择项目类型"
                    clearable
                    style="width: 100%"
                    @change="getTableData"
                  >
                    <el-option
                      v-for="item in projectType"
                      :label="item.dictLabel"
                      :value="item.dictValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="14">
                <el-button type="primary" :icon="Plus" @click="handleAdd">
                  新增
                </el-button>
                <el-button
                  :disabled="selectedRows.length === 0"
                  type="danger"
                  @click="handleDeleteBatch"
                  :icon="Delete"
                >
                  批量删除
                </el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- Table Area -->
        <CommonTable
          ref="commonTableRef"
          v-bind="state.tableData"
          class="table-demo"
          @pageChange="onTablePageChange"
          @sortHeader="onSortHeader"
          @checkboxChange="handleSelectionChange"
          @expand-change="handleExpandChange"
        >
          <!-- Expandable Row Content -->
          <template #expand="{ row }">
            <el-table
              :data="row.taskList"
              stripe
              border
              row-key="id"
              height="260"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 'text-align': 'center' }"
              class="expand-content"
            >
              <el-table-column label="序号" type="index" width="50" />
              <el-table-column prop="code" label="任务编码" width="200" />
              <el-table-column prop="name" label="任务名称" width="200" />
              <el-table-column
                prop="planStartDate"
                label="计划开始日期"
                width="200"
              />
              <el-table-column
                prop="planEndDate"
                label="计划完成日期"
                width="200"
              />
              <el-table-column
                prop="actualEndDate"
                label="实际结束日期"
                width="200"
              />
              <el-table-column prop="taskProgress" label="进度" width="200">
                <template #default="{ row }">
                  {{ row.taskProgress }}%
                </template>
              </el-table-column>
              <el-table-column prop="taskStatusStr" label="状态" width="200" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditTask(row)">
                    编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteTask(row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
          <!-- Operation Column -->
          <template #operate="{ row }">
            <div class="operateBox no-print">
              <el-button type="success" link @click="handleAddTask(row)">
                新增任务
              </el-button>
              <el-button type="info" link @click="handleAddCostItem(row)">
                新增成本项
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <PopoverButton
                :componentOption="{
                  tip: '删除后无法恢复，请谨慎操作！',
                  width: '',
                  svgIcon: 'warning',
                  popoverclass: 'is-danger',
                  svgStyle: '',
                  svgIconLeft: '',
                  svgIconRight: '',
                  label: '删除',
                  type: 'danger',
                  size: '',
                  plain: true,
                }"
                @deleteCameraEvent="handleDelete(row)"
              />
            </div>
          </template>
        </CommonTable>
      </div>
    </div>

    <!-- Add/Edit Project Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1200px"
      @close="resetFormData"
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
      >
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="项目编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入项目编码" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目类型" prop="proType">
              <el-select
                v-model="formData.proType"
                placeholder="请选择项目类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in projectType"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="项目预算" prop="planBudget">
              <el-input
                v-model.number="formData.planBudget"
                placeholder="请输入项目预算"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始日期" prop="planStartDate">
              <el-date-picker
                v-model="formData.planStartDate"
                type="date"
                placeholder="请选择开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划完成日期" prop="planEndDate">
              <el-date-picker
                v-model="formData.planEndDate"
                type="date"
                placeholder="请选择计划完成日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="项目负责人" prop="responsiblePeopleName">
              <el-input
                v-model="formData.responsiblePeopleName"
                placeholder="请选择项目负责人"
                readonly
                @click="showUserDialog('project')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFormData" size="default">取消</el-button>
          <el-button type="primary" @click="submitForm" size="default">
            {{ formData.id ? "保存修改" : "确认新增" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

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
            <el-form-item label="任务名称" prop="name">
              <el-input
                v-model="taskFormData.name"
                placeholder="请输入任务名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="12">
            <el-form-item label="计划开始日期" prop="planStartDate">
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
            <el-form-item label="计划完成日期" prop="planEndDate">
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
            <el-form-item label="任务责任人" prop="responsiblePeopleName">
              <el-input
                v-model="taskFormData.responsiblePeopleName"
                placeholder="请选择任务责任人"
                readonly
                @click="showUserDialog('task')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input
                v-model="taskFormData.remark"
                type="textarea"
                placeholder="请输入备注"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetTaskFormData" size="default">取消</el-button>
          <el-button type="primary" @click="submitTaskForm" size="default">
            {{ taskFormData.id ? "保存修改" : "确认新增" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add Project Cost Dialog -->
    <el-dialog
      v-model="costDialogVisible"
      title="新增成本项"
      width="1200px"
      @close="resetCostFormData"
      class="add-dialog"
    >
      <el-form
        ref="costFormRef"
        :model="costFormData"
        :rules="costFormRules"
        label-width="140px"
      >
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="编码" prop="code">
              <el-input
                v-model="costFormData.code"
                placeholder="不输入，自动生成"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否正常成本" prop="isNormal">
              <el-select
                v-model="costFormData.isNormal"
                placeholder="请选择是否正常成本"
                style="width: 100%"
              >
                <el-option label="正常" :value="1" />
                <el-option label="不正常" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成本类型" prop="costType">
              <el-select
                v-model="costFormData.costType"
                placeholder="请选择成本类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in costType"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="预算金额" prop="budgetAmount">
              <el-input
                v-model.number="costFormData.budgetAmount"
                placeholder="请输入预算金额"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="实际金额" prop="actualAmount">
              <el-input
                v-model.number="costFormData.actualAmount"
                placeholder="请输入实际金额"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划支付日期" prop="planPayDate">
              <el-date-picker
                v-model="costFormData.planPayDate"
                type="date"
                placeholder="请选择计划支付日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="实际支付日期" prop="actualPayDate">
              <el-date-picker
                v-model="costFormData.actualPayDate"
                type="date"
                placeholder="请选择实际支付日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="责任人" prop="responsiblePeopleName">
              <el-input
                v-model="costFormData.responsiblePeopleName"
                placeholder="请选择责任人"
                readonly
                @click="showUserDialog('cost')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="支付状态" prop="payStatus">
              <el-select
                v-model="costFormData.payStatus"
                placeholder="请选择支付状态"
                style="width: 100%"
              >
                <el-option
                  v-for="item in payType"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="12">
            <el-form-item label="银行回单" prop="bankReceipt">
              <ImageUpload
                v-model="costFormData.bankReceipt"
                :limit="1"
                :file-size="5"
                :file-type="['jpg', 'jpeg', 'png', 'gif']"
                :is-show-tip="true"
                :accept="'.jpg,.jpeg,.png,.gif'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票" prop="invoice">
              <ImageUpload
                v-model="costFormData.invoice"
                :limit="1"
                :file-size="5"
                :file-type="['jpg', 'jpeg', 'png', 'gif']"
                :is-show-tip="true"
                :accept="'.jpg,.jpeg,.png,.gif'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="costFormData.remark"
                type="textarea"
                placeholder="请输入备注"
                :rows="4"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetCostFormData" size="default">取消</el-button>
          <el-button type="primary" @click="submitCostForm" size="default">
            确认新增
          </el-button>
        </div>
      </template>
    </el-dialog>

    <UserSelector
      v-model="userDialogVisible"
      @select-user="handleUserSelected"
    />
  </div>
</template>

<script setup name="projects">
import { ref, reactive, onMounted, watch } from "vue";
import CommonTable from "@/components/CommonTable/index.vue";
import PopoverButton from "@/components/PopoverButton/index.vue";
import { Search, Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import UserSelector from "@/components/UserSelectDialog/index.vue";
import ImageUpload from "@/components/ImageUpload/index.vue";
import {
  listProject,
  addProject,
  updateProject,
  getProject,
  delProject,
  getProjectType,
} from "@/api/projectManage/projectList";
import {
  listProjectTask,
  addProjectTask,
  updateProjectTask,
  delProjectTask,
  getProjectTask,
} from "@/api/projectManage/projectTask";
import {
  addProjectCost,
  getCostType,
  getPayType,
} from "@/api/projectManage/projectCost";

const userDialogVisible = ref(false);
const userDialogContext = ref(""); // To track which dialog triggered user selection

// Show user selector dialog
const showUserDialog = (context) => {
  userDialogContext.value = context;
  userDialogVisible.value = true;
};

// Handle user selection from UserSelector
const handleUserSelected = (user) => {
  if (userDialogContext.value === "project") {
    formData.value.responsiblePeopleName = user.name;
    formData.value.responsiblePeopleId = user.id;
  } else if (userDialogContext.value === "task") {
    taskFormData.value.responsiblePeopleName = user.name;
    taskFormData.value.responsiblePeopleId = user.id;
  } else if (userDialogContext.value === "cost") {
    costFormData.value.responsiblePeopleName = user.name;
    costFormData.value.responsiblePeopleId = user.id;
  }
  userDialogVisible.value = false;
};

// Search-related
const searchForm = ref({ keyword: "", projectType: "" });
watch(searchForm, (newVal, oldVal) => {
  getTableData();
});

// Table-related
const selectedRows = ref([]);
const commonTableRef = ref();

const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "code",
        colWidth: "120",
        title: "项目编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "name",
        colWidth: "200",
        title: "项目名称",
        type: "text",
        isCheck: true,
        status: "testName",
      },
      {
        key: "proTypeStr",
        colWidth: "120",
        title: "项目类型",
        type: "text",
        isCheck: true,
      },
      {
        key: "planBudget",
        colWidth: "120",
        title: "项目预算",
        type: "text",
        isCheck: true,
      },
      {
        key: "usedCost",
        colWidth: "120",
        title: "已使用成本",
        type: "text",
        isCheck: true,
      },
      {
        key: "planStartDate",
        colWidth: "150",
        title: "开始日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "planEndDate",
        colWidth: "150",
        title: "计划完成日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "responsiblePeopleName",
        colWidth: "150",
        title: "项目负责人",
        type: "text",
        isCheck: true,
      },
      {
        key: "progress",
        colWidth: "120",
        title: "进度",
        type: "text",
        isCheck: true,
        status: "testProgress",
      },
      {
        key: "proStatus",
        colWidth: "120",
        title: "状态",
        type: "tag",
        isCheck: true,
      },
      {
        key: "taskNum",
        colWidth: "200",
        title: "任务数",
        type: "text",
        isCheck: true,
      },
    ],
    config: {
      total: 0,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      isFixed: true,
      operateWidth: "300",
      isImport: true,
      isExpandable: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

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
  const res = await listProject({
    keyword: searchForm.value.keyword,
    type: searchForm.value.projectType,
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
  });
  state.tableData.data = res.rows;
  state.tableData.config.total = res.total;
  state.tableData.config.loading = false;

  const row = state.tableData.data.filter((item) => {
    if (item.id === expandedRows.value.id) {
      return item;
    }
  });
  handleExpandChange(row[0]);
};

// Dialog-related
const dialogVisible = ref(false);
const dialogTitle = ref("新增项目");
const formRef = ref();

const formData = ref({
  id: "",
  code: "",
  name: "",
  proType: "",
  planBudget: "",
  planStartDate: "",
  planEndDate: "",
  responsiblePeopleName: "",
  responsiblePeopleId: "",
});

const formRules = reactive({
  code: [{ required: true, message: "项目编码不能为空", trigger: "blur" }],
  name: [{ required: true, message: "项目名称不能为空", trigger: "blur" }],
  proType: [{ required: true, message: "请选择项目类型", trigger: "change" }],
  planBudget: [
    { required: true, message: "项目预算不能为空", trigger: "blur" },
  ],
  planStartDate: [
    { required: true, message: "请选择开始日期", trigger: "change" },
  ],
  planEndDate: [
    { required: true, message: "请选择计划完成日期", trigger: "change" },
  ],
  responsiblePeopleName: [
    { required: true, message: "请选择项目负责人", trigger: "change" },
  ],
});

const handleAdd = () => {
  dialogTitle.value = "新增项目";
  formData.value = {
    id: "",
    code: "",
    name: "",
    proType: "",
    planBudget: "",
    planStartDate: "",
    planEndDate: "",
    responsiblePeopleName: "",
    responsiblePeopleId: "",
  };
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  dialogTitle.value = "编辑项目";
  const res = await getProject(row.id);
  formData.value = {
    ...res.data,
    proType: String(res.data.proType),
  };
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  await ElMessageBox.confirm("确定要删除此项目吗？删除后无法恢复！", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
  await delProject(row.id);
  ElMessage.success("删除成功");
  getTableData();
};

const handleDeleteBatch = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的项目");
    return;
  }
  await ElMessageBox.confirm(
    `确定要删除选中的${selectedRows.value.length}个项目吗？删除后无法恢复！`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  );
  const ids = selectedRows.value.map((row) => row.id).join(",");
  await delProject(ids);
  ElMessage.success("批量删除成功");
  commonTableRef.value?.clearCheckboxState();
  selectedRows.value = [];
  getTableData();
};

const submitForm = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;
  if (formData.value.id) {
    await updateProject(formData.value);
    ElMessage.success("编辑成功");
  } else {
    await addProject(formData.value);
    ElMessage.success("新增成功");
  }
  resetFormData();
  getTableData();
};

const resetFormData = () => {
  formData.value = {
    id: "",
    code: "",
    name: "",
    proType: "",
    planBudget: "",
    planStartDate: "",
    planEndDate: "",
    responsiblePeopleName: "",
    responsiblePeopleId: "",
  };
  formRef.value?.resetFields();
  dialogVisible.value = false;
};

const projectType = ref([]);
const getProjectTypeFn = async () => {
  try {
    const res = await getProjectType();
    projectType.value = res.data;
  } catch (error) {
    ElMessage.error("获取项目类型失败");
  }
};

const expandedRows = ref({});
const handleExpandChange = async (row) => {
  expandedRows.value = row;
  const res = await listProjectTask({
    projectId: row.id,
  });
  row.taskList = res.rows;
};

// Task Dialog-related
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
  remark: "",
});

const taskFormRules = reactive({
  name: [{ required: true, message: "任务名称不能为空", trigger: "blur" }],
  planStartDate: [
    { required: true, message: "请选择计划开始日期", trigger: "change" },
  ],
  planEndDate: [
    { required: true, message: "请选择计划完成日期", trigger: "change" },
  ],
  responsiblePeopleName: [
    { required: true, message: "请选择任务责任人", trigger: "change" },
  ],
});

const handleAddTask = (row) => {
  taskDialogTitle.value = "新增任务";
  taskFormData.value = {
    id: "",
    code: "",
    name: "",
    planStartDate: "",
    planEndDate: "",
    projectId: row.id,
    responsiblePeopleId: "",
    responsiblePeopleName: "",
    remark: "",
  };
  taskDialogVisible.value = true;
};

const handleEditTask = async (row) => {
  taskDialogTitle.value = "编辑任务";
  const res = await getProjectTask(row.id);
  taskFormData.value = res.data;
  taskDialogVisible.value = true;
};

const handleDeleteTask = async (row) => {
  await ElMessageBox.confirm("确定要删除此任务吗？删除后无法恢复！", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  });
  await delProjectTask(row.id);
  ElMessage.success("删除成功");
  handleExpandChange(expandedRows.value);
};

const submitTaskForm = async () => {
  const valid = await taskFormRef.value.validate();
  if (!valid) return;
  if (taskFormData.value.id) {
    await updateProjectTask(taskFormData.value);
    ElMessage.success("编辑成功");
  } else {
    await addProjectTask(taskFormData.value);
    ElMessage.success("新增成功");
  }
  resetTaskFormData();
  handleExpandChange(expandedRows.value);
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
    remark: "",
  };
  taskFormRef.value?.resetFields();
  taskDialogVisible.value = false;
};

// Cost Dialog-related
const costDialogVisible = ref(false);
const costFormRef = ref();

// Form data
const costFormData = ref({
  code: "",
  isNormal: 1,
  costType: "",
  budgetAmount: null,
  actualAmount: null,
  planPayDate: "",
  actualPayDate: "",
  responsiblePeopleName: "",
  payStatus: "",
  bankReceipt: "", // String to store the bank receipt image URL
  invoice: "", // String to store the invoice image URL
  remark: "",
});
const costType = ref([]);
const payType = ref([]);
const getCostTypeFn = async () => {
  const res = await getCostType();
  costType.value = res.data;
};
const getPayTypeFn = async () => {
  const res = await getPayType();
  payType.value = res.data;
};

// Form validation rules
const costFormRules = reactive({
  code: [{ required: false, message: "请输入编码", trigger: "blur" }],
  isNormal: [
    { required: true, message: "请选择是否正常成本", trigger: "change" },
  ],
  costType: [{ required: true, message: "请选择成本类型", trigger: "change" }],
  budgetAmount: [
    { required: true, message: "请输入预算金额", trigger: "blur" },
  ],
  actualAmount: [
    { required: true, message: "请输入实际金额", trigger: "blur" },
  ],
  planPayDate: [
    { required: true, message: "请选择计划支付日期", trigger: "change" },
  ],
  actualPayDate: [
    { required: false, message: "请选择实际支付日期", trigger: "change" },
  ],
  responsiblePeopleName: [
    { required: true, message: "请选择责任人", trigger: "change" },
  ],
  payStatus: [{ required: true, message: "请选择支付状态", trigger: "change" }],
  bankReceipt: [
    { required: false, message: "请上传银行回单", trigger: "change" },
  ],
  invoice: [{ required: false, message: "请上传发票", trigger: "change" }],
});

const handleAddCostItem = (row) => {
  costFormData.value = {
    code: "",
    isNormal: 1,
    costType: "",
    budgetAmount: "",
    actualAmount: "",
    planPayDate: "",
    actualPayDate: "",
    responsiblePeopleId: "",
    responsiblePeopleName: "",
    payStatus: "",
    bankReceipt: "",
    invoice: "",
    remark: "",
    projectId: row.id,
  };
  costDialogVisible.value = true;
};

const submitCostForm = async () => {
  const valid = await costFormRef.value.validate();
  if (!valid) return;

  await addProjectCost(costFormData.value);
  ElMessage.success("新增成本项成功");
  resetCostFormData();
  getTableData();
};

const resetCostFormData = () => {
  costFormData.value = {
    code: "",
    isNormal: 1,
    costType: "",
    budgetAmount: "",
    actualAmount: "",
    planPayDate: "",
    actualPayDate: "",
    responsiblePeopleId: "",
    responsiblePeopleName: "",
    payStatus: "",
    bankReceipt: "",
    invoice: "",
    remark: "",
    projectId: "",
  };
  costFormRef.value?.resetFields();
  costDialogVisible.value = false;
};

onMounted(() => {
  getTableData();
  getProjectTypeFn();
  getCostTypeFn();
  getPayTypeFn();
});
</script>

<style scoped lang="scss">
.projects-padding {
  padding: 15px;

  .projects-container {
    .table-search-container {
      overflow: hidden;

      :deep(.el-icon) {
        font-size: 16px;
        margin: 0;
      }
    }

    :deep(.table-demo) {
      height: calc(100vh - 170px);
    }
  }
}
.expand-content {
  padding: 10px;
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

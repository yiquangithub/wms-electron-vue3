<template>
  <div class="tasks-wrapper layout-padding">
    <div class="tasks-padding layout-padding-view layout-padding-auto">
      <div class="tasks-container">
        <!-- Search Area -->
        <div class="table-search-container">
          <el-form ref="searchFormRef" :model="searchForm" class="table-form">
            <el-row :gutter="35">
              <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
                <el-form-item prop="keyword">
                  <el-input
                    placeholder="项目名称/编码或任务名称/任务编码查询"
                    v-model.trim="searchForm.keyword"
                    clearable
                    :suffix-icon="Search"
                    @input="getTableData"
                  />
                </el-form-item>
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
        >
          <template #operate="{ row }">
            <div class="operateBox no-print">
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
            </div>
          </template>
        </CommonTable>
      </div>
    </div>

    <!-- Edit Task Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600"
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
          <el-col :span="24">
            <el-form-item label="实际开始日期" prop="actualStartDate" required>
              <el-date-picker
                v-model="formData.actualStartDate"
                type="date"
                placeholder="请选择实际开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="实际结束日期" prop="actualEndDate" required>
              <el-date-picker
                v-model="formData.actualEndDate"
                type="date"
                placeholder="请选择实际结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="实际天数" prop="actualDays">
              <el-input
                v-model="formData.actualDays"
                placeholder="请输入实际天数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFormData" size="default">取消</el-button>
          <el-button type="primary" @click="submitForm" size="default">
            保存修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="tasks">
import { ref, reactive, onMounted, watch } from "vue";
import CommonTable from "@/components/CommonTable/index.vue";
import { Search, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { listMyTask, editMyTask } from "@/api/projectManage/projectTask";

// Search-related
const searchForm = ref({ keyword: "" });

// Table-related
const selectedRows = ref([]);
const commonTableRef = ref();

const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "projectId",
        colWidth: "120",
        title: "项目编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "projectName",
        colWidth: "200",
        title: "项目名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "code",
        colWidth: "120",
        title: "任务编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "name",
        colWidth: "200",
        title: "任务名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "planStartDate",
        colWidth: "150",
        title: "计划开始日期",
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
        key: "actualStartDate",
        colWidth: "150",
        title: "实际开始日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualEndDate",
        colWidth: "150",
        title: "实际结束日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "taskProgress",
        colWidth: "120",
        title: "进度",
        type: "text",
        isCheck: true,
        status: "testProgress",
      },
      {
        key: "taskStatusStr",
        colWidth: "120",
        title: "状态",
        type: "tag",
        isCheck: true,
      },
    ],
    config: {
      total: 0,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: false,
      isOperate: true,
      isFixed: true,
      operateWidth: "100",
      isImport: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

watch(searchForm, () => {
  getTableData();
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
  const res = await listMyTask({
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    keyWord: searchForm.value.keyword,
  });
  state.tableData.data = res.rows;
  state.tableData.config.total = res.total;
  state.tableData.config.loading = false;
};

// Dialog-related
const dialogVisible = ref(false);
const dialogTitle = ref("编辑任务");
const formRef = ref();

const formData = ref({
  id: "",
  actualStartDate: "",
  actualEndDate: "",
  actualDays: "",
});

const formRules = reactive({
  taskName: [{ required: true, message: "任务名称不能为空", trigger: "blur" }],
  actualStartDate: [
    { required: false, message: "请选择实际开始日期", trigger: "change" },
  ],
  actualEndDate: [
    { required: false, message: "请选择实际结束日期", trigger: "change" },
  ],
  progress: [{ required: true, message: "请输入进度", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

watch(formData, (newVal) => {
  if (newVal.actualStartDate && newVal.actualEndDate) {
    const startDate = new Date(newVal.actualStartDate);
    const endDate = new Date(newVal.actualEndDate);
    const days = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    formData.value.actualDays = days;
  } else {
    formData.value.actualDays = 0;
  }
});

const handleEdit = (row) => {
  dialogTitle.value = "编辑任务";
  formData.value = {
    id: row.id,
    actualStartDate: row.actualStartDate,
    actualEndDate: row.actualEndDate,
    actualDays: row.actualDays,
  };
  dialogVisible.value = true;
};

const resetFormData = () => {
  formData.value = {
    id: "",
    actualStartDate: "",
    actualEndDate: "",
    actualDays: "",
  };
  formRef.value?.resetFields();
  dialogVisible.value = false;
};

const submitForm = async () => {
  await formRef.value.validate();
  await editMyTask(formData.value);
  ElMessage.success("编辑成功");
  resetFormData();
  getTableData();
};

onMounted(() => {
  getTableData();
});
</script>

<style scoped lang="scss">
.tasks-padding {
  padding: 15px;

  .tasks-container {
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

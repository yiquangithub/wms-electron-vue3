<template>
  <div class="cost-overview-wrapper layout-padding">
    <div class="cost-overview-padding layout-padding-view layout-padding-auto">
      <div class="cost-overview-container">
        <div class="cost-overview-header">
          <div class="title-left">
            <h2>成本总览</h2>
            <p>跟踪和管理所有项目的成本预算与实际支出情况</p>
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
                <p>项目预算成本</p>
                <h3>￥{{ summaryCards.planBudget }}</h3>
                <p>项目总预算额度</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card used-cost">
                <div class="card-icon">
                  <i class="el-icon-money"></i>
                </div>
                <p>已使用金额</p>
                <h3>￥{{ summaryCards.usedCost }}</h3>
                <p>占总预算的{{ summaryCards.usedCostPercent }}%</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card remaining-budget">
                <div class="card-icon">
                  <i class="el-icon-coin"></i>
                </div>
                <p>剩余预算</p>
                <h3>￥{{ summaryCards.remainingBudget }}</h3>
                <p>占总预算的{{ summaryCards.remainingBudgetPercent }}%</p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="summary-card deviation">
                <div class="card-icon">
                  <i class="el-icon-data-line"></i>
                </div>
                <p>预算偏差</p>
                <h3>
                  {{ summaryCards.deviation ? summaryCards.deviation : "--" }}
                </h3>
                <p>{{ summaryCards.message ? summaryCards.message : "--" }}</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- Charts -->
        <div class="charts-container">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <div class="chart-box">
                <h3>成本构成分析</h3>
                <div ref="pieChart" style="width: 100%; height: 300px"></div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
              <div class="chart-box">
                <h3>预算实际成本对比</h3>
                <div ref="barChart" style="width: 100%; height: 300px"></div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- Search and Table -->
        <div class="table-container">
          <div class="table-search-container">
            <h2>成本明细</h2>
            <el-form ref="searchFormRef" :model="searchForm" class="table-form">
              <el-form-item prop="keyword">
                <el-input
                  v-model.trim="searchForm.keyword"
                  placeholder="按名称搜索成本项"
                  clearable
                  :suffix-icon="Search"
                />
              </el-form-item>
              <el-form-item prop="keyword" class="table-form-btn">
                <el-button type="primary" @click="handleAddCost"
                  >新增成本项</el-button
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
            <template #operate="{ row }">
              <div class="operateBox no-print">
                <el-button type="primary" link @click="handleEditCost(row)"
                  >编辑</el-button
                >
                <el-button type="danger" link @click="handleDelete(row)"
                  >删除</el-button
                >
              </div>
            </template>
          </CommonTable>
        </div>

        <!-- Add Project Cost Dialog -->
        <el-dialog
          v-model="costDialogVisible"
          title="新增成本项"
          width="1200px"
          @close="resetformData"
          class="add-dialog"
        >
          <el-form
            ref="costFormRef"
            :model="formData"
            :rules="formRules"
            label-width="140px"
          >
            <el-row :gutter="20" class="mb20">
              <el-col :span="8">
                <el-form-item label="编码" prop="code">
                  <el-input
                    v-model="formData.code"
                    placeholder="不输入，自动生成"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="成本项目名称" prop="isNormal">
                  <el-select
                    v-model="formData.isNormal"
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
                    v-model="formData.costType"
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
                    v-model.number="formData.budgetAmount"
                    placeholder="请输入预算金额"
                    type="number"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="实际金额" prop="actualAmount">
                  <el-input
                    v-model.number="formData.actualAmount"
                    placeholder="请输入实际金额"
                    type="number"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="计划支付日期" prop="planPayDate">
                  <el-date-picker
                    v-model="formData.planPayDate"
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
                    v-model="formData.actualPayDate"
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
                    v-model="formData.responsiblePeopleName"
                    placeholder="请选择责任人"
                    readonly
                    @click="showUserDialog"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="支付状态" prop="payStatus">
                  <el-select
                    v-model="formData.payStatus"
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
                    v-model="formData.bankReceipt"
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
                    v-model="formData.invoice"
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
                    v-model="formData.remark"
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
              <el-button @click="resetformData" size="default">取消</el-button>
              <el-button type="primary" @click="submitCostForm" size="default">
                确认{{ formData.id ? "更新" : "新增" }}
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
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import * as echarts from "echarts";
import CommonTable from "@/components/CommonTable/index.vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getCostSummary,
  listProjectCost,
  getCostCompositionAnalysis,
  getCostComparison,
  addProjectCost,
  updateProjectCost,
  getProjectCost,
  getCostType,
  getPayType,
  delProjectCost,
} from "@/api/projectManage/projectCost";
import { getAllProject } from "@/api/projectManage/projectList";
import UserSelector from "@/components/UserSelectDialog/index.vue";
import ImageUpload from "@/components/ImageUpload/index.vue";

// Project List
const projectList = ref([]);

// Summary Cards Data
const summaryCards = ref({});

// Chart References
const pieChart = ref(null);
const barChart = ref(null);

// Chart Data
const costBreakdown = ref([]); // For pie chart
const costComparison = ref({
  seriesDataAry: [],
  xaxisData: [],
}); // For bar chart

// Search Form
const searchForm = ref({
  projectId: "",
  keyword: "",
});
const searchFormRef = ref(null);

// Table Configuration
const commonTableRef = ref(null);
const selectedRows = ref([]);
const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "code",
        colWidth: "100",
        title: "编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "projectName",
        colWidth: "",
        title: "成本项目名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "costTypeStr",
        colWidth: "",
        title: "成本类别",
        type: "text",
        isCheck: true,
      },
      {
        key: "budgetAmount",
        colWidth: "",
        title: "预算金额",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualAmount",
        colWidth: "",
        title: "实际金额",
        type: "text",
        isCheck: true,
      },
      {
        key: "payStatus",
        colWidth: "",
        title: "计划支付日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "actualPayDate",
        colWidth: "",
        title: "实际支付日期",
        type: "text",
        isCheck: true,
      },
      {
        key: "responsiblePeopleName",
        colWidth: "",
        title: "负责人",
        type: "text",
        isCheck: true,
      },
      {
        key: "payStatusStr",
        colWidth: "",
        title: "支付状态",
        type: "text",
        isCheck: true,
      },
      {
        key: "remark",
        colWidth: "",
        title: "备注",
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
      isOperate: true,
      operateWidth: "120",
      isImport: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

// Dialog and Form
const userDialogVisible = ref(false);
const showUserDialog = () => {
  userDialogVisible.value = true;
};
const costDialogVisible = ref(false);
const costFormRef = ref(null);
const formData = ref({
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
const formRules = reactive({
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

// Fetch Summary Cards
const getSummaryCards = async (id) => {
  try {
    const res = await getCostSummary(id);
    summaryCards.value = res.data || {};
  } catch (error) {
    console.error("Failed to fetch summary cards:", error);
    ElMessage.error("获取成本汇总失败");
  }
};

// Fetch Project List
const getProjectList = async () => {
  const res = await getAllProject();
  projectList.value = res.data || [];
  if (projectList.value.length > 0) {
    searchForm.value.projectId = projectList.value[0].id;
    await getDataChange(projectList.value[0].id);
  }
};

// Fetch Chart Data
const fetchChartData = async (projectId) => {
  try {
    // Fetch cost composition analysis for pie chart
    const pieRes = await getCostCompositionAnalysis(projectId);

    if (pieRes.success && pieRes.data) {
      costBreakdown.value = pieRes.data.map((item) => ({
        name: item.name,
        value: parseFloat(item.value) || 0,
      }));
    } else {
      costBreakdown.value = [];
      ElMessage.warning("成本构成分析数据为空");
    }

    // Fetch cost comparison for bar chart
    const barRes = await getCostComparison(projectId);
    if (barRes.success && barRes.data) {
      costComparison.value = {
        seriesDataAry: barRes.data.seriesDataAry.map((series) => ({
          name: series.name,
          data: series.values.map((val) => parseFloat(val) || 0),
        })),
        xaxisData: barRes.data.xaxisData || [],
      };
    } else {
      costComparison.value = { seriesDataAry: [], xaxisData: [] };
      ElMessage.warning("预算实际成本对比数据为空");
    }
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    ElMessage.error("获取图表数据失败");
    costBreakdown.value = [];
    costComparison.value = { seriesDataAry: [], xaxisData: [] };
  }
};

// Fetch Table Data
const getTableData = async () => {
  const currentProjectId = searchForm.value.projectId;
  state.tableData.config.loading = true;
  const params = {
    projectId: currentProjectId,
    keyWord: searchForm.value.keyword,
    ...state.tableData.param,
  };
  const res = await listProjectCost(params);
  state.tableData.data = res.rows;
  state.tableData.config.total = res.total;
  state.tableData.config.loading = false;
};

// Handle Project Change
const getDataChange = async (value) => {
  if (!value) return;
  await Promise.all([
    getSummaryCards(value),
    getTableData(),
    fetchChartData(value),
  ]);
  await nextTick(); // Ensure DOM is updated
  updateCharts();
};

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
  getTableData();
};

const handleDelete = async (row) => {
  ElMessageBox.confirm("确定删除吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await delProjectCost(row.id);
    ElMessage.success("删除成功");
    getTableData();
  });
};

const resetformData = () => {
  formData.value = {
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
  };
  costFormRef.value?.resetFields();
  costDialogVisible.value = false;
};

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

const submitCostForm = async () => {
  const valid = await costFormRef.value.validate();
  if (!valid) return;
  if (formData.value.id) {
    await updateProjectCost(formData.value);
    ElMessage.success("更新成本项成功");
  } else {
    await addProjectCost(formData.value);
    ElMessage.success("新增成本项成功");
  }
  resetformData();
  getTableData();
};

const handleAddCost = () => {
  costDialogVisible.value = true;
};
const handleEditCost = async (row) => {
  const res = await getProjectCost(row.id);
  formData.value = {
    ...res.data,
    costType: res.data.costType.toString(),
    payStatus: res.data.payStatus.toString(),
  };
  costDialogVisible.value = true;
};

const handleUserSelected = (user) => {
  formData.value.responsiblePeopleName = user.name;
  formData.value.responsiblePeopleId = user.id;
  userDialogVisible.value = false;
};

// Chart Initialization
const updateCharts = () => {
  if (!pieChart.value || !barChart.value) return;

  // Dispose existing instances if they exist
  let pieInstance = echarts.getInstanceByDom(pieChart.value);
  if (pieInstance) pieInstance.dispose();
  let barInstance = echarts.getInstanceByDom(barChart.value);
  if (barInstance) barInstance.dispose();

  // Pie Chart (Cost Composition Analysis)
  const pieChartInstance = echarts.init(pieChart.value);
  pieChartInstance.setOption({
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: costBreakdown.value,
        label: { show: true, formatter: "{b}: {c} ({d}%)" },
      },
    ],
    legend: {
      data: costBreakdown.value.map((item) => item.name),
      type: "scroll",
      orient: "vertical",
      right: 10,
      top: 20,
      bottom: 20,
    },
    color: ["#5470c6", "#91cc75", "#fac858", "#ee6666"],
  });

  // Bar Chart (Cost Comparison)
  const barChartInstance = echarts.init(barChart.value);
  barChartInstance.setOption({
    tooltip: { trigger: "axis" },
    legend: {
      data: costComparison.value.seriesDataAry.map((series) => series.name),
    },
    xAxis: {
      type: "category",
      data: costComparison.value.xaxisData,
    },
    yAxis: { type: "value" },
    series: costComparison.value.seriesDataAry.map((series) => ({
      type: "bar",
      name: series.name,
      data: series.data,
      itemStyle: {
        color: series.name === "实际金额" ? "#5470c6" : "#91cc75",
      },
    })),
  });
};

onMounted(() => {
  getProjectList();
  getCostTypeFn();
  getPayTypeFn();
});

watch(
  () => searchForm.value.keyword,
  () => {
    getTableData();
  }
);

watch(
  () => searchForm.value.projectId,
  (newId) => {
    if (newId) {
      state.tableData.param.pageNum = 1;
      getDataChange(newId);
    }
  }
);
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
        border-radius: 8px;
        overflow: hidden;
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
</style>

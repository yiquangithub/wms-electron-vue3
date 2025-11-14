<template>
  <div class="disqualification">
    <div class="disqualification-container">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :model="searchForm" class="search-form">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="检验类型">
                <el-select
                  v-model="searchForm.inspectionType"
                  placeholder="请选择检验类型"
                  clearable
                  class="w-full"
                  style="width: 100%"
                >
                  <el-option label="来料检验" :value="1" />
                  <el-option label="过程检验" :value="2" />
                  <el-option label="出货检验" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="产品名称">
                <el-input
                  v-model="searchForm.productName"
                  placeholder="请输入产品名称"
                  clearable
                  class="w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="检验日期">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4" class="flex justify-end">
              <el-button type="primary" :icon="Search" @click="handleSearch"
                >查询</el-button
              >
              <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="content-box">
        <!-- 统计卡片 -->
        <div class="statistics-cards">
          <el-row :gutter="24">
            <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
              <div class="stat-card">
                <div class="stat-title">{{ stat.categoryName }}</div>
                <div class="stat-content">
                  <span class="number">{{ stat.total }}</span>
                  <span class="unit">件</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 图表区域 -->
        <div class="charts-area">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="chart-card">
                <div class="chart-title">不合格趋势图</div>
                <div class="chart-container" ref="trendChartRef"></div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-card">
                <div class="chart-title">不合格原因分布</div>
                <div class="chart-container" ref="reasonChartRef"></div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 表格区域 -->
        <div class="table-card">
          <div class="table-header">
            <span class="table-title">不合格详情列表</span>
          </div>
          <el-table
            :data="tableData"
            style="width: 100%"
            height="300"
            v-loading="loading"
            :cell-style="{ textAlign: 'center' }"
            :header-cell-style="{
              backgroundColor: '#f5f7fa',
              color: '#606266',
              textAlign: 'center',
            }"
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="code" label="检验单号" min-width="120" />
            <el-table-column prop="name" label="检验单名称" min-width="120" />
            <el-table-column
              prop="productName"
              label="产品名称"
              min-width="120"
            />
            <el-table-column prop="examineType" label="检验类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getInspectionTypeTag(row.examineType)">
                  {{ getInspectionTypeText(row.examineType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="checkNum" label="检验数量" width="100" />
            <el-table-column
              prop="unqualifiedNum"
              label="不合格数量"
              width="100"
            />
            <el-table-column prop="rate" label="不合格率" width="100">
              <template #default="{ row }"> {{ row.rate }}% </template>
            </el-table-column>
            <el-table-column prop="checkTime" label="检验时间" width="160" />
            <el-table-column
              prop="checkUserName"
              label="检验人员"
              width="100"
            />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewDetail(row)"
                  >详情</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        <!-- 详情弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          :title="'不合格详情'"
          width="820px"
          destroy-on-close
          @closed="handleDialogClosed"
          class="disqualification-dialog"
        >
          <el-descriptions :column="3" border>
            <el-descriptions-item label="检验单编码">{{
              detailData.code
            }}</el-descriptions-item>
            <el-descriptions-item label="检验单名称">{{
              detailData.name
            }}</el-descriptions-item>
            <el-descriptions-item
              :label="
                detailData.examineType === 1 ? '产品物料编码' : '产品编码'
              "
              >{{ detailData.productCode }}</el-descriptions-item
            >

            <el-descriptions-item label="产品名称">{{
              detailData.productName
            }}</el-descriptions-item>
            <el-descriptions-item label="规格型号">{{
              detailData.specification
            }}</el-descriptions-item>

            <el-descriptions-item label="检验类型">
              <el-tag :type="getInspectionTypeTag(detailData.examineType)">
                {{ detailData.examineTypeStr }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <div class="mt20">
            <div class="sub-title mb10">不合格项详情</div>
            <el-table
              :data="detailData.items"
              border
              style="width: 100%"
              class="table-demo"
              height="260"
            >
              <el-table-column type="index" label="序号" width="60" fixed />
              <el-table-column
                label="检验项名称"
                prop="itemName"
                min-width="150"
                fixed
              />
              <el-table-column
                label="检验要求"
                prop="requirement"
                min-width="150"
              />
              <el-table-column
                label="检验工具"
                prop="itemTool"
                min-width="120"
              />
              <el-table-column
                label="检验结果"
                prop="checkResult"
                width="100"
              />
              <el-table-column
                label="检验状态"
                prop="checkStateStr"
                width="100"
              >
                <template #default="{ row }">
                  <el-tag :type="getDefectLevelTag(row.checkState)">
                    {{ row.checkStateStr }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="致命缺陷数量"
                prop="criticalDefectNum"
                width="120"
              />
              <el-table-column
                label="严重缺陷数量"
                prop="seriousDefectNum"
                width="120"
              />
              <el-table-column
                label="轻微缺陷数量"
                prop="minorDefectNum"
                width="120"
              />
            </el-table>
            <!-- <div class="table-pagination">
              <el-pagination
                v-model:current-page="pagination.currentPage"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total"
                @size-change="handleSizeChange1"
                @current-change="handleCurrentChange1"
              />
            </div> -->
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import {
  getUnqualifiedCount,
  getUnqualifiedTrend,
  getUnqualifiedItems,
  getUnqualifiedList,
} from "@/api/quality/disqualification";
import { getTestTaskDetail } from "@/api/quality/testTask";

// 搜索表单
const searchForm = reactive({
  inspectionType: "",
  productName: "",
  dateRange: [],
});

// 统计数据
const statistics = ref([]);
const getStatisticsData = async () => {
  const parameter = {
    beginCheckTime: searchForm.dateRange[0],
    endCheckTime: searchForm.dateRange[1],
    examineType: searchForm.inspectionType,
    productName: searchForm.productName,
  };
  const res = await getUnqualifiedCount(parameter);
  statistics.value = res.data;
};

// 表格数据
const loading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const getTableDataList = async () => {
  const parameter = {
    first: 0,
    pageNum: pagination.currentPage,
    pageSize: pagination.pageSize,
    query: {
      beginCheckTime: searchForm.dateRange[0],
      endCheckTime: searchForm.dateRange[1],
      examineType: searchForm.inspectionType,
      productName: searchForm.productName,
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  loading.value = true;
  const res = await getUnqualifiedList(parameter);
  tableData.value = res.data.rows;
  pagination.total = res.data.records;
  loading.value = false;
};

// 详情弹窗
const dialogVisible = ref(false);
const detailData = ref({
  code: "",
  name: "",
  productName: "",
  productCode: "",
  specification: "",
  examineType: 0,
  examineTypeStr: "",
  items: [],
});

// 图表实例
let trendChart = null;
let reasonChart = null;
const trendChartRef = ref();
const reasonChartRef = ref();

// 初始化图表
const initCharts = () => {
  // 初始化趋势图
  trendChart = echarts.init(trendChartRef.value);
  trendChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["来料检验", "过程检验", "出货检验"],
    },
    xAxis: {
      type: "category",
      data: [],
    },
    yAxis: {
      type: "value",
      name: "不合格数量",
    },
    series: [
      {
        name: "来料检验",
        type: "line",
        data: [],
      },
      {
        name: "过程检验",
        type: "line",
        data: [],
      },
      {
        name: "出货检验",
        type: "line",
        data: [],
      },
    ],
  });

  // 初始化原因分布图
  reasonChart = echarts.init(reasonChartRef.value);
  reasonChart.setOption({
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "不合格原因",
        type: "pie",
        radius: "50%",
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  });
};

// 获取数据方法
const fetchData = async () => {
  loading.value = true;
  try {
    const parameter = {
      beginCheckTime: searchForm.dateRange[0],
      endCheckTime: searchForm.dateRange[1],
      examineType: searchForm.inspectionType,
      productName: searchForm.productName,
    };
    const res1 = await getUnqualifiedTrend(parameter);
    const res2 = await getUnqualifiedItems(parameter);

    // 更新图表数据
    updateCharts(res1.data, res2.data);
  } catch (error) {
    console.error("获取数据失败", error);
    ElMessage.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 更新图表数据
const updateCharts = (trendData, reasonsData) => {
  if (trendChart && reasonChart) {
    // 更新趋势图数据
    trendChart.setOption({
      xAxis: {
        data: trendData.xaxisData || [],
      },
      series: trendData.seriesDataAry.map((item) => ({
        name: item.name,
        type: "line",
        data: item.values,
      })),
    });

    // 更新原因分布图数据
    reasonChart.setOption({
      series: [
        {
          data: reasonsData.seriesDataObj || [],
        },
      ],
    });
  }
};

// 工具方法
const getInspectionTypeTag = (type) => {
  const tagMap = {
    1: "success",
    2: "warning",
    3: "danger",
  };
  return tagMap[type] || "info";
};

const getInspectionTypeText = (type) => {
  const textMap = {
    1: "来料检验",
    2: "过程检验",
    3: "出货检验",
  };
  return textMap[type] || "未知";
};
const getDefectLevelTag = (level) => {
  const tagMap = {
    1: "success",
    2: "warning",
    3: "danger",
  };
  return tagMap[level] || "info";
};

// 事件处理方法
const handleSearch = () => {
  pagination.currentPage = 1;
  getStatisticsData();
  getTableDataList();
  fetchData();
};

const resetSearch = () => {
  searchForm.inspectionType = "";
  searchForm.productName = "";
  searchForm.dateRange = [];
  handleSearch();
};

const handleSizeChange = (val) => {
  pagination.pageSize = val;
  fetchData();
};

const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  fetchData();
};

const inspectionCurrentRow = ref();
const handleViewDetail = async (row) => {
  inspectionCurrentRow.value = row;
  const inspectionRes = await getTestTaskDetail({ id: row.id });
  detailData.value = inspectionRes.data;
  dialogVisible.value = true;
};

const handleSizeChange1 = (val) => {
  pagination.pageSize = val;
  handleViewDetail(inspectionCurrentRow.value);
};

const handleCurrentChange1 = (val) => {
  pagination.currentPage = val;
  handleViewDetail(inspectionCurrentRow.value);
};
const handleDialogClosed = () => {
  detailData.value = {
    code: "",
    name: "",
    productName: "",
    productCode: "",
    specification: "",
    examineType: 0,
    examineTypeStr: "",
    items: [],
  };
};

// 监听窗口大小变化，重绘图表
window.addEventListener("resize", () => {
  trendChart?.resize();
  reasonChart?.resize();
});

onMounted(() => {
  getStatisticsData();
  getTableDataList();
  initCharts();
  fetchData();
});
</script>

<style lang="scss" scoped>
.disqualification {
  background-color: #f5f7fa;
  padding: 20px;

  .search-area {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }

    .w-full {
      width: 100%;
    }

    .flex {
      display: flex;
    }

    .justify-end {
      justify-content: flex-end;
    }
  }

  .content-box {
    height: calc(100vh - 237px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .statistics-cards {
    margin-bottom: 24px;

    .stat-card {
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .stat-title {
        color: #606266;
        font-size: 14px;
        margin-bottom: 16px;
      }

      .stat-content {
        text-align: center;

        .number {
          font-size: 28px;
          font-weight: 600;
          color: #409eff;
          line-height: 1;
        }

        .unit {
          margin-left: 4px;
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .charts-area {
    margin-bottom: 24px;

    .chart-card {
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

      .chart-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 16px;
      }

      .chart-container {
        height: 350px;
      }
    }
  }

  .table-card {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    .table-header {
      margin-bottom: 16px;

      .table-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .el-table {
      --el-table-border-color: #ebeef5;
      --el-table-header-bg-color: #f5f7fa;

      th.el-table__cell {
        font-weight: 500;
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .disqualification-dialog {
    .table-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>

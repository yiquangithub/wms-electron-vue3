<template>
  <div class="dashboard-container">
    <div
      class="progress-overview-container layout-padding-view layout-padding-auto"
    >
      <div class="progress-overview-header">
        <div class="title-center">
          <h1>生产项目管理看板</h1>
        </div>
        <div class="header-controls">
          <el-select
            v-model="filter"
            placeholder="请选择项目类型"
            style="width: 200px; margin-right: 10px"
            @change="selectChangeFn"
            :teleported="false"
            :append-to="false"
          >
            <el-option
              v-for="item in projectType"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
          <div class="full-screen">
            <svg-icon
              v-if="!isFullscreen"
              icon-class="full"
              title="全屏"
              @click="enterFullscreen"
            />
            <svg-icon
              v-if="isFullscreen"
              icon-class="nofull"
              title="退出全屏"
              @click="exitFullscreen"
            />
          </div>
        </div>
      </div>

      <!-- Summary Cards (unchanged) -->
      <div class="summary-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="summary-card total-projects">
              <div class="card-icon" style="font-size: 30px">
                <svg-icon icon-class="total" />
              </div>
              <p>总项目数</p>
              <h3>
                <span class="highlight">{{ summaryTotalData.total }}</span>
              </h3>
              <p>&nbsp;</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-card completed-projects">
              <div class="card-icon" style="font-size: 24px">
                <svg-icon icon-class="completed" />
              </div>
              <p>已完成</p>
              <h3>
                <span class="highlight">{{ summaryTotalData.completed }}</span>
              </h3>
              <p>&nbsp;</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-card in-progress">
              <div class="card-icon" style="font-size: 24px">
                <svg-icon icon-class="inProgress" />
              </div>
              <p>进行中</p>
              <h3>
                <span class="highlight">
                  {{ summaryTotalData.inProgress }}
                </span>
              </h3>
              <p>&nbsp;</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-card delayed-projects">
              <div class="card-icon" style="font-size: 28px">
                <svg-icon icon-class="delayed" />
              </div>
              <p>已延期</p>
              <h3>
                <span class="highlight">{{ summaryTotalData.delayed }}</span>
              </h3>
              <p>&nbsp;</p>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Table Section -->
      <div class="table-section" style="margin-top: 20px">
        <div class="controls">
          <el-input
            v-model="searchQuery"
            placeholder="请输入项目名称或项目编码搜索"
            style="width: 260px; margin-left: 10px"
          />
          <div class="tag-show">
            <el-button type="primary" @click="handleSelectProjectType(0)"
              >全部项目</el-button
            >
            <el-button type="info" @click="handleSelectProjectType(1)"
              >未开始</el-button
            >
            <el-button type="success" @click="handleSelectProjectType(2)"
              >进行中</el-button
            >
            <el-button @click="handleSelectProjectType(3)">已完成</el-button>
            <el-button type="danger" @click="handleSelectProjectType(4)"
              >已延期</el-button
            >
          </div>
        </div>
        <el-table
          :data="tableData"
          border
          style="width: 100%; margin-top: 10px"
          class="table-container"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
          :class="isFullscreen ? 'fullscreen-table' : 'table-container'"
        >
          <el-table-column type="index" label="序号" width="50" fixed />
          <el-table-column prop="name" label="项目名称" fixed />
          <el-table-column prop="responsiblePeopleName" label="负责人" />
          <el-table-column prop="endDays" label="距离结束天数">
            <template #default="scope">
              <span :class="getTextClass(scope.row.endDays)">
                {{ scope.row.endDays }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="proStatusStr" label="状态">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.proStatusStr === '未开始'
                    ? 'info'
                    : scope.row.proStatusStr === '进行中'
                    ? 'success'
                    : scope.row.proStatusStr === '已完成'
                    ? 'primary'
                    : 'danger'
                "
              >
                {{ scope.row.proStatusStr }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="总体进度">
            <template #default="scope">
              {{ scope.row.progress.toFixed(2) + "%" }}
            </template>
          </el-table-column>
          <el-table-column
            v-for="item in tableDynamicColumnName"
            :key="item"
            :label="item"
          >
            <template #default="scope">
              <water-level
                :percentage="
                  Number(
                    scope.row.tasks.find((task) => task.name === item)
                      ?.taskProgress || 0
                  )
                "
                :color="
                  getCellColor(
                    scope.row.tasks.find((task) => task.name === item)?.complete
                  )
                "
              />
              <el-popover
                title="详情"
                placement="top-start"
                width="300"
                :teleported="isFullscreen ? false : true"
              >
                <template #default>
                  <div class="content-container">
                    <div class="content-item">
                      <span class="content-title">计划开始时间：</span>
                      <span>{{
                        scope.row.tasks.find((task) => task.name === item)
                          ?.planStartDate
                      }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-title">计划结束时间：</span>
                      <span>{{
                        scope.row.tasks.find((task) => task.name === item)
                          ?.planEndDate
                      }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-title">计划天数：</span>
                      <span
                        >{{
                          scope.row.tasks.find((task) => task.name === item)
                            ?.planDays
                        }}天</span
                      >
                    </div>
                    <div class="content-item">
                      <span class="content-title">实际开始时间：</span>
                      <span>{{
                        scope.row.tasks.find((task) => task.name === item)
                          ?.actualStartDate
                      }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-title">实际结束时间：</span>
                      <span>{{
                        scope.row.tasks.find((task) => task.name === item)
                          ?.actualEndDate
                      }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-title">实际天数：</span>
                      <span
                        >{{
                          scope.row.tasks.find((task) => task.name === item)
                            ?.actualDays
                        }}天</span
                      >
                    </div>
                    <div class="content-item">
                      <span class="content-title">责任人：</span>
                      <span>{{
                        scope.row.tasks.find((task) => task.name === item)
                          ?.responsiblePeopleName
                      }}</span>
                    </div>
                  </div>
                </template>
                <template #reference>
                  <el-button type="primary" link>{{
                    scope.row.tasks.find((task) => task.name === item)
                      ?.planDateStr || "未计划"
                  }}</el-button>
                </template>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import WaterLevel from "@/components/WaterLevel/index.vue";
import {
  getSummary,
  getTaskListColumnName,
  getProjectList,
} from "@/api/projectBoard/index.js";
import { getProjectType } from "@/api/projectManage/projectList";

onMounted(() => {
  getProjectTypeFn();
  getSummaryFn();
});

// 项目类型下拉数据
const filter = ref(null);
const projectType = ref([]);
const getProjectTypeFn = async () => {
  const res = await getProjectType();
  projectType.value = res.data;
  filter.value = res.data[0].dictValue;
  getTaskListColumnNameFn();
};
const selectChangeFn = () => {
  getTaskListColumnNameFn();
};

// 全屏
const isFullscreen = ref(false);

const updateFullscreenPoppers = () => {
  // 更新所有弹出层的挂载位置
  nextTick(() => {
    const dashboardContainer = document.querySelector(".dashboard-container");
    if (dashboardContainer && isFullscreen.value) {
      // 为全屏状态添加特殊类名
      dashboardContainer.classList.add("fullscreen-mode");
    } else if (dashboardContainer) {
      dashboardContainer.classList.remove("fullscreen-mode");
    }
  });
};

const enterFullscreen = () => {
  const element = document.querySelector(".dashboard-container");
  if (element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    isFullscreen.value = true;
    updateFullscreenPoppers();
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  isFullscreen.value = false;
  updateFullscreenPoppers();
};

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
  updateFullscreenPoppers();
};

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
document.addEventListener("msfullscreenchange", handleFullscreenChange);

// 获取项目进度统计信息
const summaryTotalData = ref({});
const getSummaryFn = async () => {
  const res = await getSummary();
  summaryTotalData.value = res.data;
};

// 获取项目列表
const tableDynamicColumnName = ref([]);
const getTaskListColumnNameFn = async () => {
  const res = await getTaskListColumnName(filter.value);
  tableDynamicColumnName.value = res.data;
  getTableDataFn();
};

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const handleSizeChange = (val) => {
  pageSize.value = val;
  getTableDataFn();
};
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getTableDataFn();
};
const searchQuery = ref("");
const proStatus = ref(0);
const tableData = ref([]);
const getTableDataFn = async () => {
  const res = await getProjectList({
    type: filter.value,
    keyWord: searchQuery.value,
    proStatus: proStatus.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  });

  tableData.value = res.rows;
  total.value = res.total;
};
const handleSelectProjectType = (value) => {
  proStatus.value = value;
};
watch(searchQuery, () => {
  getTableDataFn();
});
watch(proStatus, () => {
  getTableDataFn();
});

const getCellColor = (complete) => {
  if (complete === 2) return "#67C23A"; // 提前完成 (green)
  if (complete === 1) return "#409EFF"; // 正常完成 (blue)
  if (complete === -1) return "#F56C6C"; // 延期完成 or 未完成 (red)
  if (complete === 0) return "#67C23A"; // 进行中 (green)
  return "#67C23A"; // Default to red for undefined/null cases
};

const getTextClass = (complete) => {
  if (complete > 15 || complete == 0) {
    return "green-text";
  } else if (complete <= 15) {
    return "red-text";
  }
};
</script>

<style scoped lang="scss">
.dashboard-container {
  height: calc(100vh - 90px);
  overflow-y: auto;
  background: #f8fafc;

  .table-container {
    height: calc(100vh - 450px);
  }
  .fullscreen-table {
    height: 66vh;
  }
}

.progress-overview-container {
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.progress-overview-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.title-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  h2 {
    font-weight: 600;
    color: #1f2a44;
    margin: 0;
    font-size: 24px;
  }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.full-screen {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.summary-container {
  margin-bottom: 32px;

  .el-row {
    display: flex;
    flex-wrap: nowrap;
  }

  .summary-card {
    position: relative;
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    text-align: left;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    min-width: 0;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    &.total-projects {
      border-left: 4px solid #5470c6;
    }
    &.completed-projects {
      border-left: 4px solid #91cc75;
    }
    &.in-progress {
      border-left: 4px solid #fac858;
    }
    &.delayed-projects {
      border-left: 4px solid #ee6666;
    }

    .card-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 20px;
      color: #64748b;
      opacity: 0.3;
      transition: opacity 0.3s ease;

      .el-icon {
        font-size: 24px;
      }
    }

    &:hover .card-icon {
      opacity: 0.6;
    }

    p {
      margin: 0 0 6px;
      color: #64748b;
      font-weight: 500;
      line-height: 1.5;
      font-size: 14px;
    }

    h3 {
      margin: 0 0 6px;
      font-size: 20px;
      font-weight: 700;
      color: #1f2a44;
      letter-spacing: 0.5px;

      span {
        font-weight: 400;
      }
    }

    .highlight {
      color: #2f855a;
      font-weight: 600;
    }
  }
}

.table-section {
  margin-top: 20px;

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .el-button {
      border-radius: 6px;
      font-weight: 500;

      &.el-button--primary {
        background: #2563eb;
        border-color: #2563eb;

        &:hover {
          background: #1e40af;
          border-color: #1e40af;
        }
      }

      &.el-button--success {
        background: #91cc75;
        border-color: #91cc75;

        &:hover {
          background: #689f38;
          border-color: #689f38;
        }
      }

      &.el-button--danger {
        background: #ee6666;
        border-color: #ee6666;

        &:hover {
          background: #d32f2f;
          border-color: #d32f2f;
        }
      }
    }

    .el-input {
      width: 200px;
      margin-left: 10px;
    }
  }

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

.red-text {
  color: #ee6666;
  font-weight: 900;
}

.green-text {
  color: #2f855a;
  font-weight: 900;
}

.content-container {
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.content-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.content-item:last-child {
  margin-bottom: 0;
}

.content-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2a44;
}

:deep(.el-table__cell) {
  z-index: inherit;
}
</style>

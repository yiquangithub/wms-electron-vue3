<template>
  <div class="dashboard-page">
    <!-- 欢迎区域 -->
    <section class="welcome-card">
      <div class="user-info-section">
        <img
          class="user-avatar"
          :src="userStore.avatar"
          alt="User Avatar"
          @error="handleAvatarError"
        />
        <div class="user-details">
          <h1 class="welcome-title">{{ greeting }}，{{ userStore.name }}！</h1>
          <p class="welcome-tip">{{ welcomeTip }}</p>
          <p class="welcome-time">{{ currentDate }}</p>
        </div>
      </div>
    </section>

    <section class="data-summary-grid">
      <div class="summary-card">
        <div class="card-content">
          <p class="card-title">总项目数</p>
          <p class="card-number">{{ summary?.projectNum }}</p>
          <div class="card-trend trend-up">
            <el-icon><CaretTop /></el-icon>
            <span>{{ summary?.projectMoM }}% 较上月</span>
          </div>
        </div>
        <div class="card-icon-wrapper" style="background-color: #409eff">
          <el-icon><Suitcase /></el-icon>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-content">
          <p class="card-title">进行中项目</p>
          <p class="card-number">{{ summary?.inProgressNum }}</p>
          <div class="card-trend trend-down">
            <el-icon><CaretBottom /></el-icon>
            <span>{{ summary?.inProgressMoM }}% 较上月</span>
          </div>
        </div>
        <div class="card-icon-wrapper" style="background-color: #e6a23c">
          <el-icon><Loading /></el-icon>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-content">
          <p class="card-title">本月采购额</p>
          <p class="card-number">¥{{ summary?.currentPurchaseAmount }}</p>
          <div class="card-trend trend-up">
            <el-icon><CaretTop /></el-icon>
            <span>{{ summary?.purchaseAmountMoM }}% 较上月</span>
          </div>
        </div>
        <div class="card-icon-wrapper" style="background-color: #67c23a">
          <el-icon><ShoppingCart /></el-icon>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-content">
          <p class="card-title">库存总量</p>
          <p class="card-number">{{ summary?.inventoryNum }}</p>
          <div class="card-trend trend-down">
            <el-icon><CaretBottom /></el-icon>
            <span>{{ summary?.inventoryNumMoM }}% 较上月</span>
          </div>
        </div>
        <div class="card-icon-wrapper" style="background-color: #909399">
          <el-icon><Box /></el-icon>
        </div>
      </div>
    </section>
    <div class="dashboard-content">
      <div class="chart-card">
        <h3 class="card-section-title">项目进度趋势</h3>
        <div ref="progressChart" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <h3 class="card-section-title">项目状态分布</h3>
        <div class="chart-content-flex">
          <div ref="statusChart" class="chart-container"></div>
          <div class="status-details">
            <div
              class="status-item"
              v-for="item in projectsStatus"
              :key="item.name"
            >
              <span
                class="status-dot"
                :style="{ backgroundColor: getColorByName(item.name) }"
              ></span>
              <span>{{ item.name }}</span>
              <span class="status-count">{{ item.value }} 个项目</span>
              <span class="status-percent">{{
                getPercentage(item.value)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="dashboard-content chart-full-width">
      <div class="chart-card">
        <h3 class="card-section-title">财务收支趋势</h3>
        <div ref="financeChart" class="chart-container max-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import {
  Suitcase,
  Loading,
  ShoppingCart,
  Box,
  CaretTop,
  CaretBottom,
  Search,
  Bell,
  Setting,
} from "@element-plus/icons-vue";
import {
  getSummary,
  getProgress,
  getProjectsStatus,
  getFinancialStatus,
} from "@/api/index";
import useUserStore from "@/store/modules/user";
const userStore = useUserStore();
console.log(userStore);
// 响应式数据
const welcomeTip = ref("分身有术，高效执行！");
const currentDate = ref("");
const greeting = ref("");
const financeChart = ref(null);
const progressChart = ref(null);
const statusChart = ref(null);

const setGreetingAndDate = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    greeting.value = "上午好";
  } else if (hour < 18) {
    greeting.value = "下午好";
  } else {
    greeting.value = "晚上好";
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  currentDate.value = new Date().toLocaleDateString("zh-CN", options);
};

onMounted(async () => {
  setGreetingAndDate();

  await getSummaryHandler(); //项目数统计信息
  await getProjectsStatusHandler(); // 项目状态分布
  await getFinancialStatusHandler(); // 财务收支趋势
  await getProgressHandler(); // 项目进度趋势

  window.addEventListener("resize", () => {
    echarts.getInstanceByDom(financeChart.value)?.resize();
    echarts.getInstanceByDom(progressChart.value)?.resize();
    echarts.getInstanceByDom(statusChart.value)?.resize();
  });
});

// 项目数统计信息
const summary = ref();
const getSummaryHandler = () => {
  getSummary().then((response) => {
    summary.value = response.data;
  });
};
// 项目状态分布
const projectsStatus = ref();
const colorMap = {
  进行中: "#409eff",
  计划中: "#67c23a",
  已完成: "#e6a23c",
  已延期: "#f56c6c",
  暂停中: "#909399",
  未开始: "#909399",
  已逾期: "#f56c6c",
};
const getColorByName = (name) => {
  return colorMap[name] || "#909399"; // 默认灰色
};
const getPercentage = (value) => {
  if (!projectsStatus.value || projectsStatus.value.length === 0) return "0%";
  const total = projectsStatus.value.reduce(
    (sum, item) => sum + parseInt(item.value || "0", 10),
    0
  );
  if (total === 0) return "0%";
  const percentage = (parseInt(value || "0", 10) / total) * 100;
  return `${percentage.toFixed(0)}%`;
};
const getProjectsStatusHandler = () => {
  getProjectsStatus().then((response) => {
    projectsStatus.value = response.data.map((item) => ({
      name: item.name,
      value: parseInt(item.value, 10) || 0,
    }));
    initStateChart();
  });
};
// 项目状态图表配置
const initStateChart = () => {
  const chart = echarts.init(statusChart.value);
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    series: [
      {
        name: "项目状态",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "center",
          formatter: (params) => {
            // 计算总数
            const total = projectsStatus.value.reduce(
              (sum, item) => sum + item.value,
              0
            );
            return `{title|总计项目}\n\n{value|${total}}`;
          },
          rich: {
            title: {
              fontSize: 14,
              fontWeight: "normal",
              color: "#909399",
            },
            value: {
              fontSize: 28,
              fontWeight: "bold",
              color: "#303133",
              padding: [5, 0],
            },
          },
        },
        labelLine: {
          show: false,
        },
        data: projectsStatus.value,
      },
    ],
  };
  chart.setOption(option);
};

// 项目进度趋势
const progressData = ref();
const getProgressHandler = () => {
  getProgress().then((res) => {
    progressData.value = res.data;
    initProgressChart();
  });
};
// 项目进度图表配置
const initProgressChart = () => {
  if (!progressData.value) {
    return;
  }
  const chart = echarts.init(progressChart.value);
  const series = progressData.value.seriesDataAry.map((item, index) => {
    const numericValues = item.values.map((value) => parseFloat(value));
    const colors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"];
    const color = colors[index % colors.length];
    return {
      name: item.name,
      type: "line",
      data: numericValues,
      smooth: true,
      itemStyle: { color: color },
      areaStyle: {
        opacity: 0.1,
        color: color,
      },
    };
  });
  const legendData = progressData.value.seriesDataAry.map((item) => item.name);
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#eee",
      textStyle: {
        color: "#333",
      },
    },
    legend: {
      data: legendData,
      right: 10,
      left: 10,
      top: 0,
      type: "scroll", // 启用滚动
      pageButtonItemGap: 5,
      pageButtonPosition: "end",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: progressData.value.xaxisData,
      axisLabel: {
        color: "#999",
      },
      axisLine: {
        lineStyle: {
          color: "#eee",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#999",
        formatter: "{value} %",
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#eee",
        },
      },
    },
    series: series,
  };
  chart.setOption(option);
};

// 财务收支趋势
const financial = ref();
const getFinancialStatusHandler = () => {
  getFinancialStatus().then((res) => {
    financial.value = res.data;
    initFinanceChart();
  });
};
// 财务收支图表配置
const initFinanceChart = () => {
  if (!financeChart.value || !financial.value) {
    return;
  }
  const chart = echarts.init(financeChart.value);
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#eee",
      textStyle: {
        color: "#333",
      },
      formatter: (params) => {
        let tooltipContent = `${params[0].axisValue}<br/>`;
        params.forEach((param) => {
          tooltipContent += `${param.marker}${param.seriesName}: ${param.value} K<br/>`;
        });
        return tooltipContent;
      },
    },
    legend: {
      data: financial.value.seriesDataAry.map((item) => item.name),
      right: 10,
      top: 0,
      type: "scroll", // 启用滚动
      pageButtonItemGap: 5,
      pageButtonPosition: "end",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: financial.value.xaxisData,
      axisLabel: {
        color: "#999",
      },
      axisLine: {
        lineStyle: {
          color: "#eee",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#999",
        formatter: "{value}",
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#eee",
        },
      },
    },
    series: financial.value.seriesDataAry.map((item) => ({
      name: item.name,
      type: "bar",
      barWidth: "20%",
      data: item.values.map((value) => parseFloat(value)),
      itemStyle: {
        color:
          item.name === "收入"
            ? "#67c23a"
            : item.name === "支出"
            ? "#f56c6c"
            : "#909399",
        borderRadius: [10, 10, 0, 0],
      },
    })),
  };
  chart.setOption(option);
};
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.welcome-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  margin-bottom: 20px;
}
.user-info-section {
  display: flex;
  align-items: center;
  gap: 50px;
}
.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  background: #fff;
  margin-left: 20px;
}
.user-details {
  display: flex;
  flex-direction: column;
}
.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin: 4px 0 0;
}
.welcome-tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0 0;
}
.welcome-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0 0;
}
.data-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.summary-card {
  display: flex;
  align-items: center;
  padding: 20px 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}
.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.card-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 55px;
  height: 55px;
  border-radius: 8px;
  margin-right: 12px;
  color: white;
  font-size: 20px;
  .el-icon {
    font-size: 24px;
  }
}
.card-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.card-title {
  font-size: 14px;
  color: #161718;
  margin: 0 0 4px 0;
}
.card-number {
  font-size: 30px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 4px 0;
}
.card-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-top: 2px;
}
.trend-up {
  color: #67c23a;
}
.trend-down {
  color: #f56c6c;
}
.dashboard-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.chart-full-width {
  grid-template-columns: 1fr;
}
.chart-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-container {
  width: 100%;
  height: 280px;
}
.max-chart {
  height: 380px;
}
.chart-actions {
  display: flex;
  gap: 8px;
}
.chart-content-flex {
  display: flex;
  align-items: center;
}
.chart-content-flex .chart-container {
  flex: 1;
}
.status-details {
  flex: 1;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}
.status-count {
  margin-left: auto;
  margin-right: 10px;
  color: #141414;
}
.status-percent {
  color: #787373;
}
</style>

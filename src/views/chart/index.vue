<template>
  <div class="dashboard-container">
    <!-- 头部 -->
    <div class="header">
      <div class="title">
        <span class="icon">📊</span>
        智能垂直回转柜监控系统
      </div>
      <div class="header-actions">
        <el-button class="home-btn" @click="goToHome">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-button>
        <div class="time">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card stat-card-1">
          <div class="stat-header">
            <span class="stat-title">在库数</span>
            <el-icon class="stat-icon"><Box /></el-icon>
          </div>
          <div class="stat-value">13</div>
          <div class="stat-status success">
            <span class="status-dot"></span>
            设备运行正常
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card stat-card-2">
          <div class="stat-header">
            <span class="stat-title">出库存数</span>
            <el-icon class="stat-icon"><TrendCharts /></el-icon>
          </div>
          <div class="stat-value">528</div>
          <el-progress :percentage="68" :show-text="false" color="#00d9ff" />
          <div class="stat-subtitle">已操作总数</div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat-card stat-card-3">
          <div class="stat-header">
            <span class="stat-title">今日盘点次数</span>
            <el-icon class="stat-icon"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-value">126</div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat-card stat-card-4">
          <div class="stat-header">
            <span class="stat-title">系统告警总数</span>
            <el-icon class="stat-icon"><Warning /></el-icon>
          </div>
          <div class="stat-value error">2</div>
          <div class="stat-status error">
            <span class="status-dot"></span>
            请及时处理告警
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主要内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：回转柜实时状态 + 当前层详情 -->
      <el-col :span="8">
        <div class="panel full-height-panel">
          <!-- 回转柜实时状态 -->
          <div class="cabinet-section">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Monitor /></el-icon>
                回转柜实时状态
              </span>
              <el-button size="small" @click="refreshCabinet">刷新</el-button>
            </div>

            <div class="cabinet-list">
              <div
                v-for="item in cabinetStatus"
                :key="item.id"
                :class="[
                  'cabinet-item',
                  { active: selectedCabinet === item.id },
                ]"
                @click="selectCabinet(item)"
              >
                <div class="cabinet-info">
                  <span class="cabinet-id">{{ item.id }}</span>
                  <el-tag v-if="item.type" size="small" type="info">{{
                    item.type
                  }}</el-tag>
                </div>
                <div class="cabinet-status">
                  <span class="count">{{ item.count }}</span>
                  <span
                    :class="[
                      'status-indicator',
                      item.status === '告警' ? 'warning' : 'normal',
                    ]"
                  ></span>
                </div>
              </div>
            </div>
            <div class="cabinet-controls">
              <el-button circle icon="ArrowUp" @click="scrollUp"></el-button>
              <el-button
                circle
                icon="ArrowDown"
                @click="scrollDown"
              ></el-button>
            </div>
          </div>

          <!-- 当前层详情 -->
          <div class="detail-section">
            <div class="panel-header">
              <span class="panel-title">当前层详情</span>
            </div>

            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">物品名称</span>
                <span class="detail-value">{{ currentDetail.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">规格编号</span>
                <span class="detail-value">{{ currentDetail.code }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">存放日期</span>
                <span class="detail-value">{{ currentDetail.date }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">负责人</span>
                <span class="detail-value">{{ currentDetail.owner }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">数量</span>
                <span class="detail-value">{{ currentDetail.quantity }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">状态</span>
                <span
                  :class="[
                    'detail-value',
                    'status-badge',
                    currentDetail.statusType,
                  ]"
                >
                  {{ currentDetail.statusText }}
                </span>
              </div>
            </div>

            <el-button type="primary" class="detail-btn" @click="viewDetail">
              查看完整详情
            </el-button>
          </div>
        </div>
      </el-col>

      <!-- 中间：库存统计分析 -->
      <el-col :span="8">
        <div class="panel full-height-panel">
          <div class="panel-header">
            <span class="panel-title">
              <el-icon><PieChart /></el-icon>
              库存统计分析
            </span>
          </div>

          <div class="chart-container">
            <div ref="pieChartRef" class="chart" style="height: 280px"></div>
          </div>

          <div class="panel-header" style="margin-top: 15px">
            <span class="panel-title">各区使用效率</span>
          </div>
          <div class="chart-container">
            <div ref="barChartRef" class="chart" style="height: 200px"></div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：告警信息和趋势 -->
      <el-col :span="8">
        <div class="panel full-height-panel">
          <!-- 告警信息 -->
          <div class="alert-section">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Bell /></el-icon>
                告警信息
              </span>
              <el-button text @click="viewAllAlerts">查看全部</el-button>
            </div>

            <div class="alert-list">
              <el-alert
                v-for="alert in alerts"
                :key="alert.id"
                :title="alert.title"
                :type="alert.priority === 'high' ? 'error' : 'warning'"
                :description="alert.desc"
                show-icon
                :closable="false"
              >
                <template #default>
                  <div class="alert-time">{{ alert.time }}</div>
                </template>
              </el-alert>
            </div>

            <el-button
              type="primary"
              plain
              class="handle-btn"
              @click="handleAlerts"
            >
              处理所有告警
            </el-button>
          </div>

          <!-- 操作趋势分析 -->
          <div class="trend-section">
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><TrendCharts /></el-icon>
                操作趋势分析
              </span>
              <div class="legend">
                <span class="legend-item">
                  <span class="legend-dot" style="background: #00d9ff"></span>
                  存入
                </span>
                <span class="legend-item">
                  <span class="legend-dot" style="background: #00ff88"></span>
                  取出
                </span>
              </div>
            </div>
            <div class="chart-container">
              <div ref="lineChartRef" class="chart" style="height: 220px"></div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import {
  Box,
  TrendCharts,
  DataAnalysis,
  Warning,
  Monitor,
  PieChart,
  Bell,
  HomeFilled,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();

// 当前时间
const currentTime = ref("");
let timer = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 跳转首页
const goToHome = () => {
  router.push("/index");
};

// 回转柜状态数据（包含详细信息）
const selectedCabinet = ref(13);
const cabinetStatus = ref([
  {
    id: 15,
    type: "A-01 号运维柜",
    status: "正常",
    count: 31,
    detail: {
      name: "网络交换机套件",
      code: "C-2023-060",
      date: "2023-06-20",
      owner: "李工程师",
      quantity: "31 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 14,
    type: "",
    status: "正常",
    count: 22,
    detail: {
      name: "光纤测试仪",
      code: "C-2023-059",
      date: "2023-06-18",
      owner: "王技师",
      quantity: "22 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 13,
    type: "",
    status: "正常",
    count: 35,
    detail: {
      name: "高精度电路套件",
      code: "C-2023-058",
      date: "2023-06-15",
      owner: "张工程师",
      quantity: "36 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 12,
    type: "",
    status: "正常",
    count: 28,
    detail: {
      name: "电源模块组",
      code: "C-2023-057",
      date: "2023-06-12",
      owner: "陈主管",
      quantity: "28 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 11,
    type: "",
    status: "正常",
    count: 40,
    detail: {
      name: "传感器套装",
      code: "C-2023-056",
      date: "2023-06-10",
      owner: "刘工程师",
      quantity: "40 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 10,
    type: "",
    status: "正常",
    count: 0,
    detail: {
      name: "空置",
      code: "--",
      date: "--",
      owner: "--",
      quantity: "0 件",
      statusText: "空置",
      statusType: "info",
    },
  },
  {
    id: 9,
    type: "",
    status: "正常",
    count: 25,
    detail: {
      name: "工具箱组合",
      code: "C-2023-055",
      date: "2023-06-08",
      owner: "赵技师",
      quantity: "25 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 8,
    type: "",
    status: "正常",
    count: 45,
    detail: {
      name: "测量仪器集",
      code: "C-2023-054",
      date: "2023-06-05",
      owner: "孙工程师",
      quantity: "45 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 7,
    type: "",
    status: "正常",
    count: 23,
    detail: {
      name: "接插件组",
      code: "C-2023-053",
      date: "2023-06-03",
      owner: "周技师",
      quantity: "23 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 6,
    type: "",
    status: "告警",
    count: 14,
    detail: {
      name: "电阻电容包",
      code: "C-2023-052",
      date: "2023-05-28",
      owner: "吴工程师",
      quantity: "14 件",
      statusText: "需维护",
      statusType: "warning",
    },
  },
  {
    id: 5,
    type: "",
    status: "告警",
    count: 36,
    detail: {
      name: "芯片存储盒",
      code: "C-2023-051",
      date: "2023-04-15",
      owner: "郑主管",
      quantity: "36 件",
      statusText: "超期存放",
      statusType: "danger",
    },
  },
  {
    id: 4,
    type: "",
    status: "正常",
    count: 0,
    detail: {
      name: "空置",
      code: "--",
      date: "--",
      owner: "--",
      quantity: "0 件",
      statusText: "空置",
      statusType: "info",
    },
  },
  {
    id: 3,
    type: "",
    status: "正常",
    count: 15,
    detail: {
      name: "线缆组合包",
      code: "C-2023-050",
      date: "2023-06-01",
      owner: "钱技师",
      quantity: "15 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 2,
    type: "",
    status: "正常",
    count: 17,
    detail: {
      name: "螺丝配件盒",
      code: "C-2023-049",
      date: "2023-05-30",
      owner: "孙技师",
      quantity: "17 件",
      statusText: "正常",
      statusType: "success",
    },
  },
  {
    id: 1,
    type: "",
    status: "正常",
    count: 52,
    detail: {
      name: "维修工具集",
      code: "C-2023-048",
      date: "2023-05-25",
      owner: "李主管",
      quantity: "52 件",
      statusText: "正常",
      statusType: "success",
    },
  },
]);

// 当前选中的层详情
const currentDetail = ref({
  name: "高精度电路套件",
  code: "C-2023-058",
  date: "2023-06-15",
  owner: "张工程师",
  quantity: "36 件",
  statusText: "正常",
  statusType: "success",
});

// 告警数据
const alerts = ref([
  {
    id: 1,
    title: "第12层传感器异常",
    desc: "检测到感应不准确",
    time: "10分钟前",
    priority: "high",
  },
  {
    id: 2,
    title: "第5层物品超时",
    desc: "已存放超过30天",
    time: "2小时前",
    priority: "medium",
  },
]);

// ECharts 实例
const pieChartRef = ref(null);
const barChartRef = ref(null);
const lineChartRef = ref(null);
let pieChart = null;
let barChart = null;
let lineChart = null;

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return;

  pieChart = echarts.init(pieChartRef.value);
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#00d9ff",
      textStyle: { color: "#fff" },
    },
    legend: {
      orient: "vertical",
      right: "10%",
      top: "center",
      textStyle: { color: "#94a3b8" },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: "物品类别",
        type: "pie",
        radius: ["45%", "70%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 35, name: "电子元件", itemStyle: { color: "#00d9ff" } },
          { value: 25, name: "精密工具", itemStyle: { color: "#0095ff" } },
          { value: 20, name: "测试设备", itemStyle: { color: "#00ffaa" } },
          { value: 12, name: "工程资料", itemStyle: { color: "#ffd700" } },
          { value: 8, name: "其他物料", itemStyle: { color: "#ff6b9d" } },
        ],
      },
    ],
  };
  pieChart.setOption(option);
};

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return;

  barChart = echarts.init(barChartRef.value);
  const option = {
    backgroundColor: "transparent",
    grid: {
      left: "5%",
      right: "5%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["1日", "6日", "11日", "16日", "21日", "26日", "30日"],
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: [
      {
        data: [68, 65, 45, 52, 72, 58, 48],
        type: "bar",
        barWidth: "40%",
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#00d9ff" },
            { offset: 1, color: "#0095ff" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };
  barChart.setOption(option);
};

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return;

  lineChart = echarts.init(lineChartRef.value);
  const option = {
    backgroundColor: "transparent",
    grid: {
      left: "8%",
      right: "5%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#00d9ff",
      textStyle: { color: "#fff" },
    },
    xAxis: {
      type: "category",
      data: ["1日", "6日", "11日", "16日", "21日", "26日", "30日"],
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: { color: "#94a3b8", fontSize: 11 },
    },
    series: [
      {
        name: "存入",
        type: "line",
        smooth: true,
        data: [32, 38, 42, 48, 55, 62, 58],
        lineStyle: { color: "#00d9ff", width: 3 },
        itemStyle: { color: "#00d9ff" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0, 217, 255, 0.3)" },
            { offset: 1, color: "rgba(0, 217, 255, 0)" },
          ]),
        },
      },
      {
        name: "取出",
        type: "line",
        smooth: true,
        data: [28, 35, 38, 45, 50, 58, 52],
        lineStyle: { color: "#00ff88", width: 3 },
        itemStyle: { color: "#00ff88" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0, 255, 136, 0.3)" },
            { offset: 1, color: "rgba(0, 255, 136, 0)" },
          ]),
        },
      },
    ],
  };
  lineChart.setOption(option);
};

// 方法
const selectCabinet = (item) => {
  selectedCabinet.value = item.id;
  currentDetail.value = { ...item.detail };
};

const refreshCabinet = () => {
  ElMessage.success("刷新回转柜状态");
};

const scrollUp = () => {
  console.log("向上滚动");
};

const scrollDown = () => {
  console.log("向下滚动");
};

const viewDetail = () => {
  console.log("查看详情");
};

const viewAllAlerts = () => {
  console.log("查看所有告警");
};

const handleAlerts = () => {
  ElMessage.success("正在处理所有告警");
};

// 生命周期
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  nextTick(() => {
    initPieChart();
    initBarChart();
    initLineChart();

    // 响应式处理
    window.addEventListener("resize", () => {
      pieChart?.resize();
      barChart?.resize();
      lineChart?.resize();
    });
  });
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  pieChart?.dispose();
  barChart?.dispose();
  lineChart?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  padding: 20px;
  color: #fff;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d9ff, #0095ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 32px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  color: #00d9ff;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 14px;
  cursor: pointer;
}

.home-btn:hover {
  background: rgba(0, 217, 255, 0.2);
  border-color: #00d9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

.home-btn .el-icon {
  font-size: 16px;
}

.time {
  color: #00d9ff;
  font-size: 28px;
  font-family: "Consolas", monospace;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(
    135deg,
    rgba(6, 78, 131, 0.4),
    rgba(15, 23, 42, 0.6)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 217, 255, 0.2);
}

.stat-card-4 {
  background: linear-gradient(
    135deg,
    rgba(131, 6, 6, 0.4),
    rgba(15, 23, 42, 0.6)
  );
  border-color: rgba(255, 107, 107, 0.3);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.stat-title {
  color: #94a3b8;
  font-size: 14px;
}

.stat-icon {
  font-size: 24px;
  color: #00d9ff;
}

.stat-card-4 .stat-icon {
  color: #ff6b6b;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin: 8px 0;
  line-height: 1;
}

.stat-value.error {
  color: #ff6b6b;
}

.stat-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-top: auto;
}

.stat-status.success {
  color: #00ff88;
}

.stat-status.error {
  color: #ff6b6b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.stat-subtitle {
  color: #64748b;
  font-size: 12px;
  margin-top: 4px;
}

/* 主要内容区 */
.main-content {
  margin-top: 20px;
}

.panel {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.8),
    rgba(30, 58, 95, 0.6)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.full-height-panel {
  height: calc(100vh - 280px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.panel-title {
  color: #00d9ff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 回转柜部分 */
.cabinet-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.cabinet-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}

.cabinet-list::-webkit-scrollbar {
  width: 5px;
}

.cabinet-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.cabinet-list::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.3);
  border-radius: 3px;
}

.cabinet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.cabinet-item:hover {
  background: rgba(51, 65, 85, 0.7);
}

.cabinet-item.active {
  background: rgba(0, 217, 255, 0.2);
  border-color: rgba(0, 217, 255, 0.5);
}

.cabinet-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cabinet-id {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  min-width: 25px;
}

.cabinet-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  color: #94a3b8;
  font-size: 13px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.normal {
  background: #00ff88;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.status-indicator.warning {
  background: #ffd700;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.cabinet-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 详情部分 */
.detail-section {
  flex: 0 0 auto;
}

.detail-content {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #94a3b8;
  font-size: 13px;
}

.detail-value {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.success {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge.warning {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.status-badge.danger {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.status-badge.info {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.detail-btn {
  width: 100%;
  background: linear-gradient(90deg, #00d9ff, #0095ff);
  border: none;
  color: #fff;
}

/* 告警部分 */
.alert-section {
  flex: 0 0 auto;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.alert-list::-webkit-scrollbar {
  width: 5px;
}

.alert-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.alert-list::-webkit-scrollbar-thumb {
  background: rgba(0, 217, 255, 0.3);
  border-radius: 3px;
}

.alert-time {
  font-size: 11px;
  color: #64748b;
  margin-top: 5px;
}

.handle-btn {
  width: 100%;
}

/* 趋势部分 */
.trend-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 图例 */
.legend {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-button) {
  border-color: rgba(0, 217, 255, 0.3);
}

:deep(.el-button:hover) {
  border-color: #00d9ff;
  color: #00d9ff;
}

:deep(.el-button--primary) {
  background: linear-gradient(90deg, #00d9ff, #0095ff);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(90deg, #00e5ff, #00a5ff);
}

:deep(.el-tag) {
  background-color: rgba(0, 149, 255, 0.2);
  border-color: rgba(0, 149, 255, 0.3);
  color: #0095ff;
  font-size: 11px;
}

:deep(.el-alert) {
  background-color: rgba(15, 23, 42, 0.5) !important;
  border-color: rgba(148, 163, 184, 0.2) !important;
  margin-bottom: 0;
}

:deep(.el-alert__title) {
  font-size: 13px;
}

:deep(.el-alert__description) {
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(71, 85, 105, 0.5) !important;
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #00d9ff, #0095ff) !important;
}
</style>

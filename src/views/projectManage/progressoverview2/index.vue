<!-- 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果 -->

<template>
  <div class="min-h-screen bg-[#1a1c2d] text-gray-200">
    <!-- 顶部导航 -->
    <header
      class="h-16 px-6 flex items-center justify-between border-b border-gray-700"
    >
      <div class="flex items-center space-x-4">
        <i class="fas fa-desktop text-2xl text-blue-400"></i>
        <h1 class="text-xl font-bold">网络设备监控中心</h1>
      </div>

      <div class="flex items-center space-x-8">
        <div class="flex space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">168</div>
            <div class="text-xs text-gray-400">在线设备</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-400">12</div>
            <div class="text-xs text-gray-400">告警数量</div>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <span>{{ currentTime }}</span>
          <div class="relative">
            <button class="flex items-center cursor-pointer">
              <i class="fas fa-user mr-1"></i>
              管理员
            </button>
          </div>
          <i class="fas fa-cog cursor-pointer"></i>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="p-6 grid grid-cols-5 gap-6 h-[calc(100vh-4rem-6rem)]">
      <!-- 左侧拓扑图 -->
      <div class="col-span-3 bg-gray-800 rounded-lg p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">网络拓扑图</h2>
          <div class="flex space-x-2">
            <button
              class="bg-blue-500 px-3 py-1 text-sm !rounded-button whitespace-nowrap flex items-center"
            >
              <i class="fas fa-search-plus mr-1"></i>
              放大
            </button>
            <button
              class="bg-blue-500 px-3 py-1 text-sm !rounded-button whitespace-nowrap flex items-center"
            >
              <i class="fas fa-search-minus mr-1"></i>
              缩小
            </button>
          </div>
        </div>
        <div class="h-full" ref="topologyRef"></div>
      </div>

      <!-- 右侧状态面板 -->
      <div class="col-span-2 space-y-6">
        <!-- 设备统计图表 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <h2 class="text-lg font-bold mb-4">设备状态统计</h2>
          <div class="grid grid-cols-2 gap-4">
            <div ref="deviceTypeRef" class="h-64"></div>
            <div ref="deviceStatusRef" class="h-64"></div>
          </div>
        </div>

        <!-- 告警列表 -->
        <div class="bg-gray-800 rounded-lg p-4 flex-1">
          <h2 class="text-lg font-bold mb-4">实时告警</h2>
          <table class="w-full">
            <thead>
              <tr class="text-left">
                <th class="pb-2 w-20">等级</th>
                <th class="pb-2 w-32">设备</th>
                <th class="pb-2">告警内容</th>
                <th class="pb-2 w-44">时间</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="alarm in alarmList"
                :key="alarm.time"
                class="border-t border-gray-700"
              >
                <td class="py-2">
                  <span
                    :class="{
                      'px-2 py-1 rounded text-xs': true,
                      'bg-red-500': alarm.level === '严重',
                      'bg-yellow-500': alarm.level === '警告',
                      'bg-blue-500': alarm.level === '提示',
                    }"
                    >{{ alarm.level }}</span
                  >
                </td>
                <td class="py-2">{{ alarm.device }}</td>
                <td class="py-2">{{ alarm.content }}</td>
                <td class="py-2">{{ alarm.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- 底部状态区 -->
    <footer class="h-24 px-6 grid grid-cols-3 gap-6 border-t border-gray-700">
      <div class="flex items-center space-x-8">
        <div class="text-center">
          <div class="text-xl font-bold text-green-400">98.6%</div>
          <div class="text-xs text-gray-400">系统运行率</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-blue-400">1.2ms</div>
          <div class="text-xs text-gray-400">平均响应时间</div>
        </div>
      </div>

      <div ref="networkFlowRef" class="h-full"></div>

      <div class="flex items-center justify-end">
        <table class="w-72">
          <tbody>
            <tr
              v-for="item in performanceList"
              :key="item.name"
              class="border-b border-gray-700"
            >
              <td class="py-2 w-32">{{ item.name }}</td>
              <td class="py-2">
                <div class="w-full bg-gray-700 rounded h-2">
                  <div
                    class="h-full rounded"
                    :style="{
                      width: item.load + '%',
                      backgroundColor: item.load > 80 ? '#F56C6C' : '#67C23A',
                    }"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </footer>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  data() {
    return {
      currentTime: "",
      timer: null,
      alarmList: [
        {
          level: "严重",
          device: "核心交换机01",
          content: "CPU使用率超过90%",
          time: "2024-01-20 14:30:21",
        },
        {
          level: "警告",
          device: "路由器02",
          content: "内存使用率超过80%",
          time: "2024-01-20 14:28:15",
        },
        {
          level: "提示",
          device: "接入交换机03",
          content: "端口流量异常",
          time: "2024-01-20 14:25:33",
        },
      ],
      performanceList: [
        { name: "核心交换机01", load: 85 },
        { name: "路由器02", load: 72 },
        { name: "接入交换机03", load: 65 },
      ],
      topologyChart: null,
      deviceTypeChart: null,
      deviceStatusChart: null,
      networkFlowChart: null,
    };
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleString("zh-CN");
    },
    initCharts() {
      // 初始化拓扑图
      this.topologyChart = echarts.init(this.$refs.topologyRef);
      this.topologyChart.setOption({
        animation: false,
        tooltip: {},
        series: [
          {
            type: "graph",
            layout: "force",
            data: [
              { name: "核心交换机", symbolSize: 50, value: "online" },
              { name: "路由器A", symbolSize: 30, value: "online" },
              { name: "路由器B", symbolSize: 30, value: "warning" },
            ],
            links: [
              { source: "核心交换机", target: "路由器A" },
              { source: "核心交换机", target: "路由器B" },
            ],
            itemStyle: {
              color: "#4CAF50",
            },
            lineStyle: {
              color: "#1890ff",
            },
          },
        ],
      });

      // 初始化设备类型分布
      this.deviceTypeChart = echarts.init(this.$refs.deviceTypeRef);
      this.deviceTypeChart.setOption({
        animation: false,
        tooltip: {
          trigger: "item",
        },
        series: [
          {
            type: "pie",
            radius: "70%",
            data: [
              { value: 45, name: "交换机" },
              { value: 30, name: "路由器" },
              { value: 25, name: "防火墙" },
            ],
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

      // 初始化设备状态
      this.deviceStatusChart = echarts.init(this.$refs.deviceStatusRef);
      this.deviceStatusChart.setOption({
        animation: false,
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [98, 97, 99, 96, 98, 95, 97],
            type: "line",
            smooth: true,
          },
        ],
      });

      // 初始化网络流量
      this.networkFlowChart = echarts.init(this.$refs.networkFlowRef);
      this.networkFlowChart.setOption({
        animation: false,
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [
            "00:00",
            "03:00",
            "06:00",
            "09:00",
            "12:00",
            "15:00",
            "18:00",
            "21:00",
          ],
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: false,
          },
        },
        series: [
          {
            data: [820, 932, 901, 934, 1290, 1330, 1320, 1000],
            type: "line",
            areaStyle: {},
            smooth: true,
          },
        ],
      });
    },
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.topologyChart) {
      this.topologyChart.dispose();
    }
    if (this.deviceTypeChart) {
      this.deviceTypeChart.dispose();
    }
    if (this.deviceStatusChart) {
      this.deviceStatusChart.dispose();
    }
    if (this.networkFlowChart) {
      this.networkFlowChart.dispose();
    }
  },
};
</script>

<style scoped>
.border-t {
  border-top-width: 1px;
}
.border-b {
  border-bottom-width: 1px;
}
.border-gray-700 {
  border-color: rgb(55, 65, 81);
}
</style>

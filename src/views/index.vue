<template>
  <div class="wms-home-page">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="header-left">
        <el-icon class="logo-icon" :size="32"><Goods /></el-icon>
        <span class="system-title">智能垂直回转柜系统</span>
      </div>
      <div class="header-right">
        <div class="time-display">
          <el-icon><Clock /></el-icon>
          <span>{{ currentTime }}</span>
        </div>
        <el-dropdown @command="handleUserCommand">
          <div class="user-info">
            <img :src="userStore.avatar" class="user-avatar" />
            <span>管理员</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="logout" divided
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-left">
            <h1 class="welcome-title">欢迎使用智能垂直回转柜系统</h1>
            <p class="welcome-desc">
              请选择以下功能模块进行操作，点击模块图标打开对应功能
            </p>
          </div>
        </div>
      </div>

      <!-- Menu Grid -->
      <div class="menu-grid">
        <div
          v-for="item in menuItems"
          :key="item.id"
          class="menu-card"
          @click="handleMenuClick(item)"
        >
          <div class="menu-icon">
            <component :is="item.icon" />
          </div>
          <div class="menu-info">
            <h3 class="menu-title">{{ item.title }}</h3>
            <p class="menu-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Status Bar -->
    <footer class="status-bar">
      <div class="status-left">
        <div class="status-info">
          <span class="status-label">货柜编号:</span>
          <span class="status-value primary">A01</span>
        </div>
        <div class="status-info">
          <span class="status-label">运行:</span>
          <span class="status-value success">0时11分</span>
        </div>
        <div class="status-info">
          <span class="status-label">PLC通信:</span>
          <span class="status-value success">
            <span class="status-indicator"></span>
            正常
          </span>
        </div>
      </div>
      <div class="status-right">
        <div class="status-info">
          <span class="status-label">库存量:</span>
          <span class="status-value">12547</span>
        </div>
        <div class="status-info">
          <span class="status-label">今日入库量:</span>
          <span class="status-value info">100</span>
        </div>
        <div class="status-info">
          <span class="status-label">今日出库量:</span>
          <span class="status-value warning">125</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, markRaw } from "vue";
import {
  Goods,
  Clock,
  Bell,
  User,
  Calendar,
  Setting,
  Lock,
  Box,
  TrendCharts,
  Upload,
  Download,
  DataAnalysis,
  Warning,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import useUserStore from "@/store/modules/user";
import usePermissionStore from "@/store/modules/permission";

const permissionStore = usePermissionStore();
const router = useRouter();
const userStore = useUserStore();

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

// 菜单项配置 - 使用 markRaw 包装组件
const menuItems = ref([
  {
    id: 0,
    icon: markRaw(TrendCharts),
    title: "大屏展示",
    desc: "实时监控货柜状态与库存信息",
    path: "/chart",
    name: "chart",
  },
  {
    id: 1,
    icon: markRaw(Setting),
    title: "系统设置",
    desc: "用户账号管理与操作权限控制",
    path: "/system/user",
    name: "System",
  },
  {
    id: 2,
    icon: markRaw(Box),
    title: "物料管理",
    desc: "物料信息维护与分类编码管理",
    path: "/base/calculateunit",
    name: "Base",
  },
  {
    id: 3,
    icon: markRaw(Lock),
    title: "参数管理",
    desc: "系统参数配置与维护",
    path: "/parameterManage/baseSetting",
    name: "ParameterManage",
  },
  {
    id: 4,
    icon: markRaw(TrendCharts),
    title: "货柜管理",
    desc: "存储货位划分与状态实时监控",
    path: "/containerManage/containerManageList",
    name: "ContainerManage",
  },
  {
    id: 5,
    icon: markRaw(Upload),
    title: "入库管理",
    desc: "采购到货登记与库位分配操作",
    path: "/warehouse/inboundStorage",
    name: "Warehouse",
  },
  {
    id: 6,
    icon: markRaw(Download),
    title: "出库管理",
    desc: "查询物料所在库位并出库操作",
    path: "/outWarehouse/outStorage",
    name: "OutWarehouse",
  },
  {
    id: 7,
    icon: markRaw(DataAnalysis),
    title: "盘点管理",
    desc: "定期库存清点与差异调整处理",
    path: "/inventory/inventoryOrder",
    name: "Inventory",
  },
  {
    id: 8,
    icon: markRaw(Warning),
    title: "警告信息",
    desc: "库存预警与常态实时提醒",
    path: "/warningInfo",
    name: "WarningInfo",
  },
]);

// 事件处理
const handleNotification = () => {
  ElMessage.info("暂无新通知");
};

const handleUserCommand = (command) => {
  if (command === "logout") {
    handleLogout();
  } else if (command === "profile") {
    ElMessage.info("个人中心");
  }
};

const handleMenuClick = async (item) => {
  permissionStore.setCurrentModuleRoutes(item.name);
  router.push(item.path);
};

const handleLogout = () => {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = "/login";
      });
    })
    .catch(() => {});
};

// 生命周期
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.wms-home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  color: #fff;
  font-family: "Microsoft YaHei", sans-serif;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(30, 58, 95, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 217, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 100;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-icon {
      color: #00d9ff;
    }

    .system-title {
      font-size: 20px;
      font-weight: bold;
      background: linear-gradient(90deg, #00d9ff, #0095ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .time-display {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #00d9ff;
      font-size: 20px;
      font-family: "Consolas", monospace;
    }

    .user-info {
      margin-top: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .user-avatar {
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        margin-right: 8px;
      }

      span {
        font-size: 18px;
      }
    }
  }
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 217, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 217, 255, 0.5);
    }
  }
}

/* Welcome Section */
.welcome-section {
  background: linear-gradient(
    135deg,
    rgba(0, 149, 255, 0.3),
    rgba(0, 217, 255, 0.2)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .welcome-left {
    flex: 1;

    .welcome-title {
      font-size: 32px;
      font-weight: bold;
      margin: 0 0 16px 0;
      background: linear-gradient(90deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .welcome-desc {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 20px 0;
      line-height: 1.6;
    }

    .system-status {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);

      .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00ff88;
        animation: pulse 2s infinite;
      }
    }
  }

  .welcome-right {
    text-align: right;

    .stat-number {
      font-size: 56px;
      font-weight: bold;
      color: #00d9ff;
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

/* Menu Grid */
.menu-grid {
  height: calc(100vh - 370px);
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 10px;
}
.menu-grid::-webkit-scrollbar {
  display: none;
}

.menu-card {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.6),
    rgba(30, 58, 95, 0.4)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 217, 255, 0.5);
    box-shadow: 0 12px 32px rgba(0, 217, 255, 0.2);
    background: linear-gradient(
      135deg,
      rgba(0, 149, 255, 0.2),
      rgba(0, 217, 255, 0.1)
    );

    .menu-icon {
      background: linear-gradient(135deg, #00d9ff, #0095ff);
      transform: scale(1.1);
    }
  }

  .menu-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #0095ff, #00d9ff);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    transition: all 0.3s ease;
    box-shadow: 0 8px 16px rgba(0, 149, 255, 0.3);
  }

  .menu-info {
    .menu-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #e2e8f0;
    }

    .menu-desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
    }
  }
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(71, 85, 105, 0.5);
  font-size: 18px;

  .status-left,
  .status-right {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-label {
      color: #94a3b8;
    }

    .status-value {
      font-weight: 600;
      color: #e2e8f0;

      &.primary {
        color: #00d9ff;
      }

      &.success {
        color: #00ff88;
      }

      &.info {
        color: #0095ff;
      }

      &.warning {
        color: #ffa500;
      }
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00ff88;
      animation: pulse 2s infinite;
      margin-right: 4px;
    }
  }
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-button) {
  border-color: rgba(0, 217, 255, 0.3);
  color: #e2e8f0;

  &:hover {
    border-color: #00d9ff;
    color: #00d9ff;
    background: rgba(0, 217, 255, 0.1);
  }
}

:deep(.el-dropdown) {
  color: #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-section {
    .welcome-content {
      flex-direction: column;
      gap: 20px;
    }

    .welcome-right {
      text-align: left;
    }
  }

  .status-bar {
    flex-direction: column;
    gap: 16px;

    .status-left,
    .status-right {
      width: 100%;
      justify-content: space-between;
    }
  }
}

:deep(.el-dropdown-menu__item--divided) {
  margin: 0;
}
</style>

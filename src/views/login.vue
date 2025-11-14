<template>
  <div class="login">
    <!-- 左侧区域 -->
    <div class="left-panel">
      <div class="header-section">
        <div class="header-content">
          <div class="header-title">
            <div class="header-icon">
              <Goods style="width: 60px; height: 60px" />
            </div>
            <h1 class="main-title">{{ systemTitle }}</h1>
          </div>
          <h2 class="subtitle">智能仓储，高效管理</h2>
          <p class="description">
            优化仓库作业流程，精准管控库存，提升运营效率与数据准确性
          </p>
        </div>
      </div>

      <div class="features">
        <div class="feature-card">
          <div class="feature">
            <Goods class="feature-icon" />
            <div>
              <h3 class="feature-title">库存管理</h3>
              <p class="feature-desc">实时监控库存状态，智能预警</p>
            </div>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature">
            <Switch class="feature-icon" />
            <div>
              <h3 class="feature-title">高效出入库</h3>
              <p class="feature-desc">优化流程，提升作业效率</p>
            </div>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature">
            <Search class="feature-icon" />
            <div>
              <h3 class="feature-title">精准追溯</h3>
              <p class="feature-desc">全流程记录，可追溯管理</p>
            </div>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature">
            <Histogram class="feature-icon" />
            <div>
              <h3 class="feature-title">数据分析</h3>
              <p class="feature-desc">智能报表，辅助决策</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="right-panel">
      <div class="form-wrapper">
        <h2 class="login-title">账户登录</h2>

        <el-form
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <label for="username" class="form-label">用户名</label>
            <el-input
              id="username"
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入用户名"
              class="input-field"
            />
          </el-form-item>

          <el-form-item prop="password">
            <label for="password" class="form-label">密码</label>
            <el-input
              id="password"
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
              class="input-field"
            />
          </el-form-item>

          <el-form-item prop="code" v-if="captchaEnabled">
            <label for="captcha" class="form-label">验证码</label>
            <div class="captcha-container">
              <el-input
                id="captcha"
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="请输入验证码"
                class="input-field"
                style="width: 63%"
                @keyup.enter="handleLogin"
              />
              <div class="captcha-image">
                <img :src="codeUrl" class="captcha-img" alt="验证码" />
              </div>
              <button type="button" class="refresh-captcha" @click="getCode">
                <Refresh />
              </button>
            </div>
          </el-form-item>

          <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">
            记住密码
          </el-checkbox>

          <el-form-item style="width: 100%">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              style="width: 100%"
              @click.prevent="handleLogin"
              class="login-button"
            >
              <span v-if="!loading">登录系统</span>
              <span v-else>登录中...</span>
            </el-button>
            <div style="float: right" v-if="register" class="register-link">
              <router-link class="link-type" :to="'/register'">
                立即注册
              </router-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import { getSystemBaseInfoData } from "@/api/system/baseinfo";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from "@/store/modules/user";
import { updateFavicon } from "@/utils/systemConfig";
import { onMounted, ref, watch, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Goods,
  Switch,
  Search,
  Histogram,
  Refresh,
} from "@element-plus/icons-vue";

const baseUrl = ref(import.meta.env.VITE_APP_BASE_API);

// 页面加载时
onMounted(() => {
  getSystemInfo();
  getCookie();
  getCode();
});

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: "",
});
const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
};
const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);
watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), {
          expires: 30,
        });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          const query = route.query;
          const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
            if (cur !== "redirect") {
              acc[cur] = query[cur];
            }
            return acc;
          }, {});
          router.push({
            path: redirect.value || "/index",
            query: otherQueryParams,
          });
        })
        .catch(() => {
          loading.value = false;
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}
// 系统标题
const systemTitle = ref("WMS仓储管理系统");
const systemInfo = ref();
const logoUrl = ref();
function getSystemInfo() {
  getSystemBaseInfoData().then((res) => {
    systemInfo.value = res.data[res.data.length - 1];
    logoUrl.value = baseUrl.value + systemInfo.value.logo; // 菜单栏图标和浏览器图标要加上地址
    // 更新页面标题
    if (systemInfo.value.name) {
      systemTitle.value = systemInfo.value.name;
    }
    // 更新浏览器小图标
    if (logoUrl.value) {
      updateFavicon(logoUrl.value);
    }
    const systemConfig = {
      name: systemInfo.value.name,
      simpleName: systemInfo.value.simpleName,
      logo: logoUrl.value,
      version: systemInfo.value.version,
    };
    localStorage.setItem("systemConfig", JSON.stringify(systemConfig));
  });
}
</script>

<style lang="scss" scoped>
.login {
  font-family: "Inter", sans-serif;
  background-color: #f5f7fa;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  justify-content: center;
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #0a2463 0%, #0091c2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .header-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .header-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .header-title {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .header-icon {
          margin-right: 12px;
        }
        .main-title {
          font-size: 45px;
          font-weight: bold;
          margin: 0;
        }
      }

      .subtitle {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.9);
      }
      .description {
        opacity: 0.8;
        margin: 0;
        line-height: 1.6;
        font-size: 16px;
      }
    }
  }

  .features {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    margin: 16px;

    .feature-card {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 24px;
      border-radius: 12px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      height: 300px;
    }

    .feature-card:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
      font-size: 24px;
      margin-top: 4px;
      flex-shrink: 0;
      color: #fff;
    }

    .feature-title {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 16px;
    }

    .feature-desc {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
      line-height: 1.4;
    }
  }
}

.right-panel {
  flex: 1;
  min-width: 0;
  background-color: white;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-wrapper {
  max-width: 384px;
  margin: 0 auto;
  width: 100%;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 32px;
  text-align: center;
  color: #1f2937;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input-field {
  :deep(.el-input__wrapper) {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px 16px;
    transition: all 0.3s ease;
    height: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  :deep(.el-input__inner) {
    border: none;
    outline: none;
    padding: 0;
    height: auto;
    font-size: 16px;
  }

  &:focus-within {
    :deep(.el-input__wrapper) {
      border-color: #0091c2;
      box-shadow: 0 0 0 3px rgba(0, 145, 194, 0.1);
    }
  }
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-image {
  background-color: #f3f4f6;
  height: 44px;
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.captcha-img {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.refresh-captcha {
  background-color: #f3f4f6;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  :deep(svg) {
    width: 1em;
    height: 1em;
    color: #4b5563;
  }
}

.refresh-captcha:hover {
  background-color: #e5e7eb;
  transform: rotate(180deg);
}

.remember-checkbox {
  margin: 0 0 24px 0 !important;
  :deep(.el-checkbox__label) {
    font-size: 14px;
    color: #6b7280;
  }
}

.login-button {
  background: linear-gradient(135deg, #0091c2 0%, #007ba7 100%) !important;
  color: white !important;
  padding: 14px 16px !important;
  border: none !important;
  border-radius: 8px !important;
  width: 100% !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(0, 145, 194, 0.2) !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 145, 194, 0.3) !important;
  }

  &:active {
    transform: translateY(0);
  }
}

.register-link {
  margin-top: 16px;
  text-align: right;
}

.link-type {
  color: #0091c2;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: #007ba7;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #6b7280;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  background-color: #f5f7fa;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
}

@media (max-width: 768px) {
  .login {
    padding: 0;
  }

  .login-container {
    flex-direction: column;
    border-radius: 0;
    min-height: 100vh;
    max-width: none;
    box-shadow: none;
  }

  .left-panel,
  .right-panel {
    padding: 32px;
  }

  .left-panel {
    order: 2;
    text-align: center;
  }

  .right-panel {
    order: 1;
  }

  .form-wrapper {
    max-width: none;
    padding: 0 16px;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 20px;
  }

  .header-icon {
    font-size: 28px;
  }

  .main-title {
    font-size: 24px;
  }

  .el-login-footer {
    position: relative;
    background-color: white;
  }
}
</style>

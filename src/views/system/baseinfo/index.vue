<template>
  <div class="basicInfo-wrapper layout-padding">
    <div class="basicInfo-padding layout-padding-view layout-padding-auto">
      <div class="base-info-container">
        <div class="system-setting-head">
          <div class="head-block">
            <span class="head-text">系统设置</span>
          </div>
          <div class="head-body">
            <div class="system-name-container">
              <div class="text-block">
                <span class="system-text">系统名称</span>
              </div>
              <div class="system-input-content">
                <div class="system-name-input">
                  <el-input
                    v-model="systemInfo.name"
                    size="default"
                    style="width: 400px"
                    placeholder="请输入系统名称"
                  />
                  <el-button type="primary" @click="saveName">保存</el-button>
                </div>
                <span class="system-name-tip"
                  >登录页面内及浏览器标签页将使用该名称</span
                >
              </div>
            </div>
            <div class="system-name-container">
              <div class="text-block">
                <span class="system-text">侧边栏名称</span>
              </div>
              <div class="system-input-content">
                <div class="system-name-input">
                  <el-input
                    v-model="systemInfo.simpleName"
                    size="default"
                    style="width: 400px"
                    placeholder="请输入侧边栏名称"
                    maxlength="11"
                  />
                  <el-button type="primary" @click="saveName">保存</el-button>
                </div>
                <span class="system-name-tip"
                  >侧边栏将使用该名称，为了显示效果，请控制在11位字符以内。</span
                >
              </div>
            </div>
            <div class="system-name-container">
              <div class="text-block">
                <span class="system-text">上传标识</span>
              </div>
              <div class="system-input-content">
                <ImageUpload
                  v-model="systemInfo.logo"
                  :file-type="['svg']"
                  :accept="'.svg'"
                  :limit="1"
                  @success="handleUploadSuccess"
                ></ImageUpload>
              </div>
            </div>
            <div class="platform-icon-container">
              <div class="text-block pic-block">
                <span class="system-text">标识位置</span>
              </div>
              <div class="platform-content">
                <div
                  class="pic-item"
                  v-for="(item, index) in platformIcon"
                  :key="index"
                >
                  <div class="pic-title">{{ item.title }}</div>
                  <div class="pic-des">{{ item.desc }}</div>
                  <img :src="item.url" alt="" class="pic-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="system-version-container">
        <div class="head-block">
          <span class="head-text">系统版本</span>
        </div>
        <div class="system-version-content">
          <div class="system-version-item">
            <span class="system-version-module">版本：</span>
            <span class="system-version-version">{{ systemInfo.version }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import ImageUpload from '@/components/ImageUpload/index.vue'
import {
  getSystemBaseInfoData,
  saveSystemBaseInfoData,
} from '@/api/system/baseinfo'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
onMounted(() => {
  getSystemInfo()
})
const platformIcon = ref([
  {
    url: '/assets/basicInfo/login-img.png',
    title: '登录页标识',
    desc: '标识次要展示位，建议采用彩色图形且背景透明，仅支持 .svg',
  },
  {
    url: '/assets/basicInfo/navbar-img.png',
    title: '菜单栏标识',
    desc: '标识次要展示位，建议采用彩色图形且背景透明，仅支持 .svg',
  },
  {
    url: '/assets/basicInfo/tags-img.png',
    title: '浏览器标签标识',
    desc: '浏览器标签的前置标识展示位，仅支持 .svg',
  },
])

const systemInfo = ref({
  id: 0,
  logo: '',
  name: '',
  simpleName: '',
  version: '',
})

const getSystemInfo = async () => {
  const res = await getSystemBaseInfoData()
  systemInfo.value = res.data[res.data.length - 1]
}

const saveSystemInfo = async () => {
  await saveSystemBaseInfoData(systemInfo.value)
    .then(() => {
      ElMessage({
        message: '保存成功，正在跳转到登录页...',
        type: 'success',
      })
      setTimeout(() => {
        // 清除系统配置缓存
        localStorage.removeItem('systemConfig')
        userStore.logOut().then(() => {
          location.href = '/'
        })
      }, 1000)
    })
    .catch((err) => {
      ElMessage({
        message: err.message || '保存失败',
        type: 'error',
      })
    })
}

const saveName = () => {
  saveSystemInfo()
}
// 处理上传成功事件
const handleUploadSuccess = (fileList) => {
  saveSystemInfo()
}
</script>

<style scoped lang="scss">
.basicInfo-padding {
  padding: 15px;
  overflow: auto;

  .base-info-container {
    display: flex;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;

    .system-setting-head {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .head-block {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .head-text {
          font-size: 16px;
          font-weight: 700;
          line-height: 14px;
          color: #0e1b2e;
          margin-right: 8px;
        }
      }

      .head-body {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .text-block {
          display: flex;
          align-items: center;
          width: 150px;
          margin-bottom: 16px;

          .system-text {
            font-size: 14px;
            line-height: 14px;
            color: #585d66;
            margin-right: 8px;
          }
        }

        .system-name-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-bottom: 20px;

          .system-input-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .system-name-input {
              :deep(.el-input) {
                margin-right: 24px;
              }
            }

            .system-name-tip {
              color: #a0a1a3;
              font-size: 12px;
              margin-top: 8px;
            }
          }
        }

        .platform-icon-container {
          display: flex;
          align-items: center;
          // margin-bottom: 20px;
          .platform-content {
            display: flex;

            .pic-item {
              width: 250px;
              // height: 300px;
              background-color: #f7f8fa;
              border-radius: 8px;
              margin-right: 32px;
              box-sizing: border-box;
              padding: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;

              .pic-title {
                font-weight: 700;
                font-size: 16px;
                color: #353536;
                line-height: 28px;
              }

              .pic-des {
                font-weight: 400;
                font-size: 12px;
                color: #6a6b6c;
                line-height: 18px;
                margin-top: 4px;
              }

              .pic-img {
                width: 192px;
                height: 108px;
                margin: 24px 0 26px 0;
              }
            }
          }
        }
      }
    }
  }

  .system-version-container {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;

    .head-block {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .head-text {
        font-size: 16px;
        font-weight: 700;
        line-height: 14px;
        color: #0e1b2e;
        margin-right: 8px;
      }
    }
    .system-version-content {
      display: flex;
      flex-flow: column;
      .system-version-item {
        line-height: 36px;
        display: flex;

        .system-version-module {
          width: 72px;
          display: inline-block;
          flex-shrink: 0;
          font-size: 14px;
          color: rgba(14, 27, 46, 0.5);
        }

        .system-version-version {
          font-size: 14px;
          color: #0e1b2e;
        }
      }
    }
  }
}
</style>

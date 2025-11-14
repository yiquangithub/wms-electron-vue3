<template>
  <div class="upload-excel" title="导入">
    <!-- excel导入 -->
    <span class="upload-icon">
      <svg-icon icon-class="upload" @click="openDialogFn" />
    </span>
    <el-dialog v-model="dialogVisible" width="600" draggable>
      <el-upload
        class="upload-demo"
        ref="uploadRef"
        action=""
        :auto-upload="false"
        drag
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        accept=".xlsx, .xls"
        :http-request="uploadFile"
        :limit="1"
        :on-exceed="selectFileTip"
      >
        <el-icon class="el-icon--upload">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处或点击上传</div>
      </el-upload>
      <div class="import-info">
        <div class="cover-container">
          <el-checkbox v-model="checkedStatus" size="large"
            >是否更新已存在的数据</el-checkbox
          >
        </div>
        <el-button type="success" size="small">
          <el-link
            :underline="false"
            target="_blank"
            @click="downloadTemplateFn"
            >下载导入模版</el-link
          >
        </el-button>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="beforeUploadFn"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入数据状态 -->
    <el-drawer
      v-model="fileInfoDrawer"
      title="导入明细"
      size="300px"
      :before-close="handleClose"
    >
      <div class="file-info" v-html="fileData.data"></div>
    </el-drawer>
  </div>
</template>

<script setup name="uploadExcel">
import { ref, inject } from "vue";
import { ElMessage } from "element-plus";
import { downloadTemplate } from "@/api/fileExprot/uploadExcel";
import { postUploadExcel } from "@/api/fileExprot/uploadFile";
import mittBus from "@/utils/mitt";

// 注入配置
const uploadConfig = inject("uploadConfig", {
  url: "",
  data: {},
});

const templateConfig = inject("templateConfig", {
  url: "",
  fileName: "",
});

const uploadRef = ref();
const dialogVisible = ref(false);
const openDialogFn = () => {
  dialogVisible.value = true;
};

const checkedStatus = ref(false);

const fileData = ref();

// 处理上传成功的回调
const handleSuccess = () => {
  // ElMessage.success('文件导入成功');
  uploadRef.value.clearFiles();
  mittBus.emit("onExcelDataUpdataList");
  fileInfoDrawer.value = true;
  checkedStatus.value = false;
};

// 处理上传失败的回调
const handleError = () => {
  ElMessage.error("文件导入失败，请重新尝试！");
};

// 处理上传前的钩子，可用于校验文件类型和大小
const beforeUpload = (file) => {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  const isValidSize = file.size / 1024 / 1024 < 10;

  if (!isExcel) {
    ElMessage.error("只支持上传 .xlsx, .xls 后缀的文件!");
  }

  if (!isValidSize) {
    ElMessage.error("请控制上传文件的大小，最大为10MB!");
  }

  return isExcel && isValidSize;
};

const uploadFile = async (data) => {
  let formData = new FormData();
  formData.append("file", data.file);
  try {
    const res = await postUploadExcel(uploadConfig.url, formData, {
      cover: checkedStatus.value,
      ...uploadConfig.data,
    });
    fileData.value = res.data;
    if (res.data.code == 500) {
      ElMessage.error(res.data.message);
    } else {
      ElMessage.success(res.data.message);
    }
  } catch (error) {
    console.log(
      "%c [ error ]-119",
      "font-size:13px; background:#64a44e; color:#a8e892;",
      error
    );
  }
  // 延时器
  setTimeout(() => {
    fileInfoDrawer.value = false;
  }, 10000);
};

const selectFileTip = () => {
  ElMessage.error("单次导入文件数量不能超过1个");
};

const beforeUploadFn = () => {
  uploadRef.value.submit();
  dialogVisible.value = false;
};

const fileInfoDrawer = ref(false);
const handleClose = () => {
  fileInfoDrawer.value = false;
  fileData.value = {};
};

// 下载导入模版
const downloadTemplateFn = async () => {
  try {
    const response = await downloadTemplate(templateConfig.url, {});
    // 创建Blob对象
    const blob = new Blob([response], {
      type: "application/x-www-form-urlencoded",
    });
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateConfig.fileName || "downloaded_file"; // 确保文件名有效
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    ElMessage.success("下载成功");
  } catch (error) {
    console.error("下载失败:", error);
    ElMessage.error("下载失败");
  }
};
</script>

<style scoped lang="scss">
.upload-excel {
  display: flex;
  justify-content: center;
  align-items: center;
  .upload-demo {
    display: flex;
    flex-direction: column;

    :deep(.el-upload--text) {
      display: flex;
      justify-content: center;
    }
  }

  .import-info {
    width: 560px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
  }

  :deep(.el-dialog__body) {
    height: 300px !important;

    .el-upload-dragger {
      width: 490px;
    }
  }

  :deep(.el-drawer__title) {
    font-size: 15px;
    color: #05a380;
  }
  .upload-icon svg {
    margin-right: 8px;
    font-size: 20px;
  }
  .file-info {
    padding: 10px 20px;
    line-height: 1.5;

    :deep(br) {
      margin: 5px 0;
    }
  }
}
</style>

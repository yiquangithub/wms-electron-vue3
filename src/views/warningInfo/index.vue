<template>
  <div class="warningInfo-container layout-padding">
    <div class="warningInfo-padding layout-padding-view layout-padding-auto">
      <!-- 顶部统计卡片 - 警告统计 -->
      <div class="stats-wrapper">
        <div class="stat-card">
          <div class="label">本月警告数</div>
          <div class="num">8</div>
        </div>
        <div class="stat-card success">
          <div class="label">当日警告数</div>
          <div class="num">5</div>
        </div>
        <div class="stat-card warning">
          <div class="label">待处理警告</div>
          <div class="num">3</div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-container">
        <el-form ref="searchFormRef" :model="searchForm" class="table-form">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-form-item style="width: 100%">
                <el-select
                  v-model="searchForm.status"
                  placeholder="全部状态"
                  clearable
                >
                  <el-option label="全部状态" value="" />
                  <el-option label="未处理" value="pending" />
                  <el-option label="已处理" value="processed" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item style="width: 100%">
                <el-select
                  v-model="searchForm.type"
                  placeholder="全部类型"
                  clearable
                >
                  <el-option label="全部类型" value="" />
                  <el-option label="库存警告" value="stock" />
                  <el-option label="库位警告" value="location" />
                  <el-option label="设备警告" value="device" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-date-picker
                  v-model="searchForm.startDate"
                  type="date"
                  placeholder="开始日期"
                  value-format="YYYY-MM-DD"
                />
                <span style="margin: 0 10px">至</span>
                <el-date-picker
                  v-model="searchForm.endDate"
                  type="date"
                  placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-input
                  v-model.trim="searchForm.keyword"
                  placeholder="警告编码/内容"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 表格 -->
      <CommonTable
        ref="tableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onPageChange"
        @selection-change="handleSelectionChange"
      >
        <!-- 状态列自定义 -->
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
        <!-- 操作列 -->
        <template #operate="{ row }">
          <div class="operateBox">
            <el-button link type="primary" @click="handleView(row)"
              >详情</el-button
            >
            <el-button
              link
              type="primary"
              @click="handleProcess(row)"
              :disabled="row.status !== 'pending'"
            >
              处理
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.status !== 'pending'"
            >
              删除
            </el-button>
          </div>
        </template>
      </CommonTable>
    </div>
  </div>

  <!-- 详情对话框 -->
  <el-dialog
    v-model="detailDialog.visible"
    :title="detailDialog.title"
    width="600px"
    destroy-on-close
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="警告编码">{{
        detailDialog.data?.code
      }}</el-descriptions-item>
      <el-descriptions-item label="警告类型">{{
        getWarningTypeText(detailDialog.data?.type)
      }}</el-descriptions-item>
      <el-descriptions-item label="发生时间">{{
        detailDialog.data?.occurTime
      }}</el-descriptions-item>
      <el-descriptions-item label="处理时间">{{
        detailDialog.data?.processTime || "-"
      }}</el-descriptions-item>
      <el-descriptions-item label="状态" :span="2">
        <el-tag :type="getStatusType(detailDialog.data?.status)" size="small">
          {{ getStatusText(detailDialog.data?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="警告内容" :span="2">
        {{ detailDialog.data?.content }}
      </el-descriptions-item>
      <el-descriptions-item label="相关设备/库位" :span="2">
        {{ detailDialog.data?.relatedInfo }}
      </el-descriptions-item>
      <el-descriptions-item label="处理说明" :span="2">
        {{ detailDialog.data?.processNote || "暂无" }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 处理警告对话框 -->
  <el-dialog
    v-model="processDialog.visible"
    title="处理警告"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="processFormRef"
      :model="processDialog.form"
      :rules="processDialog.rules"
      label-width="100px"
    >
      <el-form-item label="警告编码">
        <span>{{ processDialog.form.code }}</span>
      </el-form-item>
      <el-form-item label="警告类型">
        <span>{{ getWarningTypeText(processDialog.form.type) }}</span>
      </el-form-item>
      <el-form-item label="警告内容">
        <span>{{ processDialog.form.content }}</span>
      </el-form-item>
      <el-form-item label="处理说明" prop="processNote">
        <el-input
          v-model="processDialog.form.processNote"
          type="textarea"
          :rows="4"
          placeholder="请输入处理说明"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="processDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmProcess">确认处理</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";
import { Search } from "@element-plus/icons-vue";

const searchForm = reactive({
  status: "",
  type: "",
  startDate: "",
  endDate: "",
  keyword: "",
});

// 警告类型映射
const getWarningTypeText = (type) => {
  const map = {
    stock: "库存警告",
    location: "库位警告",
    device: "设备警告",
  };
  return map[type] || type;
};

// 状态映射
const getStatusText = (status) => {
  const map = {
    pending: "未处理",
    processed: "已处理",
  };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = {
    pending: "warning",
    processed: "success",
  };
  return map[status] || "info";
};

// 详情对话框
const detailDialog = reactive({
  visible: false,
  title: "警告详情",
  data: null,
});

// 处理警告对话框
const processDialog = reactive({
  visible: false,
  form: {
    id: "",
    code: "",
    type: "",
    content: "",
    processNote: "",
  },
  rules: {
    processNote: [
      { required: true, message: "请输入处理说明", trigger: "blur" },
      { min: 5, message: "处理说明至少5个字符", trigger: "blur" },
    ],
  },
});

const processFormRef = ref();

// 表格核心数据
const state = reactive({
  tableData: {
    data: [
      {
        id: 1,
        code: "ALERT-2025-001",
        type: "stock",
        content: "产品A库存低于安全库存水平，当前库存：50，安全库存：100",
        occurTime: "2025-05-15 10:30:25",
        processTime: "",
        status: "pending",
        relatedInfo: "仓库A-货架B1",
        processNote: "",
      },
      {
        id: 2,
        code: "ALERT-2025-002",
        type: "location",
        content: "库位C3温湿度异常，温度：35°C，湿度：85%",
        occurTime: "2025-05-15 14:20:10",
        processTime: "2025-05-15 15:10:30",
        status: "processed",
        relatedInfo: "库位C3",
        processNote: "已调整空调设置，温湿度恢复正常",
      },
      {
        id: 3,
        code: "ALERT-2025-003",
        type: "device",
        content: "扫码枪设备001连接异常，请检查设备状态",
        occurTime: "2025-05-14 09:15:45",
        processTime: "2025-05-14 09:30:20",
        status: "processed",
        relatedInfo: "扫码枪001",
        processNote: "重启设备后恢复正常",
      },
      {
        id: 4,
        code: "ALERT-2025-004",
        type: "stock",
        content: "产品B库存超过最大容量，当前库存：500，最大容量：400",
        occurTime: "2025-05-14 16:45:30",
        processTime: "",
        status: "pending",
        relatedInfo: "仓库B-货架A2",
        processNote: "",
      },
      {
        id: 5,
        code: "ALERT-2025-005",
        type: "device",
        content: "监控摄像头003画面丢失",
        occurTime: "2025-05-13 22:10:15",
        processTime: "2025-05-14 08:30:00",
        status: "processed",
        relatedInfo: "摄像头003",
        processNote: "检查线路连接，重新配置网络",
      },
    ],
    header: [
      { key: "code", title: "警告编码", width: 160, isCheck: true },
      {
        key: "type",
        title: "警告类型",
        width: 120,
        isCheck: true,
      },
      { key: "content", title: "警告内容", isCheck: true },
      { key: "occurTime", title: "发生时间", width: 160, isCheck: true },
      { key: "processTime", title: "处理时间", width: 160, isCheck: true },
      {
        key: "status",
        title: "状态",
        width: 100,
        isCheck: true,
        slot: true,
      },
    ],
    config: {
      total: 5,
      loading: false,
      isBorder: true,
      isStripe: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      operateWidth: "200",
      isImport: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

// 查看详情
const handleView = (row) => {
  detailDialog.data = { ...row };
  detailDialog.visible = true;
};

// 处理警告
const handleProcess = (row) => {
  processDialog.form = {
    id: row.id,
    code: row.code,
    type: row.type,
    content: row.content,
    processNote: "",
  };
  processDialog.visible = true;
};

// 确认处理
const confirmProcess = async () => {
  if (!processFormRef.value) return;

  try {
    await processFormRef.value.validate();

    // 在实际项目中，这里应该调用API
    const index = state.tableData.data.findIndex(
      (item) => item.id === processDialog.form.id
    );
    if (index !== -1) {
      state.tableData.data[index] = {
        ...state.tableData.data[index],
        status: "processed",
        processTime: new Date()
          .toISOString()
          .replace("T", " ")
          .substring(0, 19),
        processNote: processDialog.form.processNote,
      };
    }

    ElMessage.success("处理成功");
    processDialog.visible = false;
  } catch (error) {
    // 验证失败
    console.error("表单验证失败:", error);
  }
};

// 删除警告
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除警告 "${row.code}" 吗？`, "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 在实际项目中，这里应该调用API
      const index = state.tableData.data.findIndex(
        (item) => item.id === row.id
      );
      if (index !== -1) {
        state.tableData.data.splice(index, 1);
        state.tableData.config.total = state.tableData.data.length;
      }
      ElMessage.success("删除成功");
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 批量选择
const handleSelectionChange = (selection) => {
  console.log("当前选中:", selection);
};

// 分页变化
const onPageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

// 搜索
const handleSearch = () => {
  state.tableData.param.pageNum = 1;
  getTableData();
};

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    status: "",
    type: "",
    startDate: "",
    endDate: "",
    keyword: "",
  });
  handleSearch();
};

// 获取表格数据
const getTableData = () => {
  state.tableData.config.loading = true;

  // 模拟API调用延迟
  setTimeout(() => {
    // 这里可以根据searchForm进行筛选
    let filteredData = [...state.tableData.data];

    if (searchForm.status) {
      filteredData = filteredData.filter(
        (item) => item.status === searchForm.status
      );
    }

    if (searchForm.type) {
      filteredData = filteredData.filter(
        (item) => item.type === searchForm.type
      );
    }

    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.code.toLowerCase().includes(keyword) ||
          item.content.toLowerCase().includes(keyword)
      );
    }

    // 这里应该返回分页数据，简化处理直接使用全部数据
    state.tableData.config.total = filteredData.length;
    state.tableData.config.loading = false;
  }, 300);
};

onMounted(() => {
  getTableData();
});
</script>

<style scoped lang="scss">
.warningInfo-container {
  height: 100%;
}

.warningInfo-padding {
  padding: 18px;
  height: 100%;
}

.stats-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  .stat-card {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 16px 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    .label {
      font-size: 14px;
      color: #606266;
    }
    .num {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
    &.success .num {
      color: #67c23a;
    }
    &.warning .num {
      color: #e6a23c;
    }
    &.danger .num {
      color: #f56c6c;
    }
  }
}

.search-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-demo {
  height: calc(100vh - 288px);
}

.operateBox {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

:deep(.el-descriptions__cell) {
  padding: 12px 10px;
}

:deep(.el-textarea__inner) {
  min-height: 80px;
}
</style>

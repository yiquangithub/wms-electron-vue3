<template>
  <div class="anomaly-container layout-padding">
    <div class="anomaly-padding layout-padding-view layout-padding-auto">
      <!-- 搜索栏 -->
      <div class="search-container">
        <el-form ref="searchFormRef" :model="searchForm" class="table-form">
          <el-row :gutter="35">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="keyword" label="物品名称">
                <el-input
                  placeholder="请输入物品名称"
                  v-model.trim="searchForm.keyword"
                  clearable
                />
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
        @pageChange="onTablePageChange"
        @sortHeader="onSortHeader"
      >
        <template #operate="{ row }">
          <div class="operateBox">
            <el-button text type="danger" @click="handleFn(row)"
              >处理</el-button
            >
          </div>
        </template>
      </CommonTable>

      <!-- 优化后的移库操作弹窗 -->
      <el-dialog
        v-model="transferDialog.visible"
        title="移库操作"
        width="800px"
        destroy-on-close
        append-to-body
        class="transfer-dialog"
      >
        <div class="dialog-content">
          <!-- 处理建议提示条 -->
          <div class="tip-box">
            <el-icon><InfoFilled /></el-icon>
            <span>
              处理建议：需从该格子移出约
              <span class="highlight"
                >{{ transferDialog.current.removeWeight }}kg</span
              >
              的物品至其他空格子
            </span>
          </div>

          <el-form label-width="100px" class="transfer-form">
            <el-row :gutter="30">
              <!-- 左侧：源格子信息 -->
              <el-col :span="12">
                <div class="section-card">
                  <div class="section-title">
                    <el-icon><Location /></el-icon>
                    <span>源格子信息</span>
                  </div>

                  <div class="info-group">
                    <div class="info-item">
                      <span class="info-label">位置：</span>
                      <span class="info-value">{{
                        transferDialog.current.position || "-"
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">物品：</span>
                      <span class="info-value">{{
                        transferDialog.current.itemName || "-"
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">当前重量：</span>
                      <span class="info-value">{{
                        transferDialog.current.weight || "-"
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">最大承重：</span>
                      <span class="info-value">{{
                        transferDialog.current.maxWeight || "-"
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">需移除重量：</span>
                      <span class="info-value danger"
                        >{{
                          transferDialog.current.removeWeight || "0"
                        }}kg</span
                      >
                    </div>
                  </div>

                  <!-- 料盒明细 -->
                  <div class="box-list-section">
                    <div class="section-subtitle">料盒明细</div>
                    <div class="box-list">
                      <div
                        v-for="(box, i) in transferDialog.current.boxes || []"
                        :key="i"
                        class="box-item"
                      >
                        <span class="box-name"
                          >料盒{{ i + 1 }}：{{ box.name }}</span
                        >
                        <span class="box-code">物料编码：{{ box.code }}</span>
                      </div>
                      <div
                        v-if="
                          !transferDialog.current.boxes ||
                          transferDialog.current.boxes.length === 0
                        "
                        class="no-data"
                      >
                        暂无料盒信息
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>

              <!-- 右侧：目标格子选择 -->
              <el-col :span="12">
                <div class="section-card">
                  <div class="section-title">
                    <el-icon><Aim /></el-icon>
                    <span>目标格子选择</span>
                  </div>

                  <div class="form-group">
                    <el-form-item label="选择层" class="form-item-custom">
                      <el-select
                        v-model="transferDialog.form.floor"
                        placeholder="请选择层"
                        clearable
                        class="full-width"
                      >
                        <el-option
                          v-for="n in 20"
                          :key="n"
                          :label="`${n}层`"
                          :value="n"
                        />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="选择格" class="form-item-custom">
                      <el-select
                        v-model="transferDialog.form.grid"
                        placeholder="请选择格"
                        clearable
                        class="full-width"
                      >
                        <el-option
                          v-for="n in 30"
                          :key="n"
                          :label="`${n}格`"
                          :value="n"
                        />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="选择料盒" class="form-item-custom">
                      <el-select
                        v-model="transferDialog.form.box"
                        placeholder="请选择料盒"
                        clearable
                        class="full-width"
                      >
                        <el-option label="1料盒" :value="1" />
                        <el-option label="2料盒" :value="2" />
                        <el-option label="3料盒" :value="3" />
                      </el-select>
                    </el-form-item>

                    <el-form-item label="移入数量" class="form-item-custom">
                      <el-input-number
                        v-model="transferDialog.form.quantity"
                        :min="0.01"
                        :max="transferDialog.current.removeWeightNum || 0"
                        :step="0.1"
                        :precision="2"
                        placeholder="请输入移入数量"
                        class="full-width"
                        controls-position="right"
                      />
                      <div class="quantity-tip">
                        可移入最大数量：{{
                          transferDialog.current.removeWeightNum || 0
                        }}kg
                      </div>
                    </el-form-item>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="transferDialog.visible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="transferDialog.loading"
              @click="confirmTransfer"
            >
              确认移库
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { InfoFilled, Location, Aim } from "@element-plus/icons-vue";
import CommonTable from "@/components/CommonTable/index.vue";

// ==================== 数据结构 ====================
const state = reactive({
  tableData: {
    data: [
      {
        position: "1层-08格",
        itemName: "纯锡材料",
        weight: "8.2kg",
        maxWeight: "6.0kg",
        detectTime: "2025-05-01 08:00:10",
        status: "过载",
        boxes: [
          { name: "纯锡材料", code: "B-2023-0815" },
          { name: "纯锡材料", code: "B-2023-0815" },
          { name: "纯锡材料", code: "B-2023-0815" },
        ],
      },
      // 可以添加更多测试数据
      {
        position: "2层-15格",
        itemName: "铜材料",
        weight: "10.5kg",
        maxWeight: "8.0kg",
        detectTime: "2025-05-01 09:30:25",
        status: "过载",
        boxes: [
          { name: "铜材料", code: "C-2023-0912" },
          { name: "铜材料", code: "C-2023-0913" },
        ],
      },
    ],
    header: [
      { key: "position", title: "位置", type: "text", isCheck: true },
      { key: "itemName", title: "物品名称", type: "text", isCheck: true },
      { key: "weight", title: "重量", type: "text", isCheck: true },
      { key: "maxWeight", title: "最大承重", type: "text", isCheck: true },
      { key: "detectTime", title: "检测时间", type: "text", isCheck: true },
      {
        key: "status",
        title: "状态",
        type: "text",
        isCheck: true,
        status: "anomalyStatus",
      },
    ],
    config: {
      total: 10,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      operateWidth: "120",
    },
    param: { pageNum: 1, pageSize: 10 },
    printName: "异常物品管理",
  },
});

// ==================== 搜索 ====================
const searchForm = reactive({ keyword: "" });

// ==================== 移库弹窗 ====================
const transferDialog = reactive({
  visible: false,
  loading: false,
  current: {
    position: "",
    itemName: "",
    weight: "",
    maxWeight: "",
    removeWeight: "0",
    removeWeightNum: 0,
    boxes: [],
  },
  form: { floor: null, grid: null, box: null, quantity: null },
});

// 提取数字的工具函数
const parseWeight = (str) => parseFloat(String(str).replace("kg", "")) || 0;

const handleFn = (row) => {
  console.log("处理行数据:", row); // 调试用

  const currentVal = parseWeight(row.weight);
  const maxVal = parseWeight(row.maxWeight);
  const removeVal = Math.max(0, currentVal - maxVal);

  // 确保所有数据都正确传递
  transferDialog.current = {
    position: row.position || "-",
    itemName: row.itemName || (row.boxes && row.boxes[0]?.name) || "未知物品",
    weight: row.weight || "0kg",
    maxWeight: row.maxWeight || "0kg",
    boxes: row.boxes || [],
    removeWeight: removeVal.toFixed(2) + "kg",
    removeWeightNum: removeVal,
  };

  // 重置表单
  transferDialog.form = { floor: null, grid: null, box: null, quantity: null };
  transferDialog.visible = true;
};

const confirmTransfer = () => {
  const { floor, grid, box, quantity } = transferDialog.form;

  // 验证表单
  if (!floor || !grid || !box || !quantity) {
    ElMessage.warning("请完整填写目标格子和移入数量");
    return;
  }

  if (quantity > transferDialog.current.removeWeightNum) {
    ElMessage.warning("移入数量不能大于需移除重量");
    return;
  }

  ElMessageBox.confirm(
    `确认将 ${quantity}kg 物品从 ${transferDialog.current.position} 移入到 ${floor}层-${grid}格-${box}料盒？`,
    "确认移库",
    { type: "warning" }
  )
    .then(async () => {
      transferDialog.loading = true;
      // TODO: 调用真实移库接口
      await new Promise((r) => setTimeout(r, 800));
      ElMessage.success("移库成功！");
      transferDialog.visible = false;
      transferDialog.loading = false;
      getTableData(); // 刷新列表
    })
    .catch(() => {});
};

// ==================== 表格原有逻辑 ====================
const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const onSortHeader = (data) => {
  state.tableData.header = data;
};

const getTableData = async () => {
  state.tableData.config.loading = true;
  // await yourApi()
  await new Promise((r) => setTimeout(r, 300));
  state.tableData.config.loading = false;
};

watch(
  () => searchForm.keyword,
  () => {
    state.tableData.param.pageNum = 1;
    getTableData();
  },
  { flush: "post" }
);

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.anomaly-padding {
  padding: 18px;
}
.table-demo {
  height: calc(100vh - 181px);
}

// 弹窗样式优化
.transfer-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-content {
  padding: 0 20px;
}

// 提示框样式
.tip-box {
  margin: 0 0 20px 0;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #e1f3ff;
  border-radius: 6px;
  color: #409eff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  .highlight {
    font-weight: 600;
    color: #f56c6c;
  }
}

// 分区卡片
.section-card {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;

  .el-icon {
    color: #409eff;
  }
}

.section-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin: 16px 0 12px 0;
}

// 信息组样式
.info-group {
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .info-label {
    color: #909399;
    min-width: 80px;
    text-align: right;
  }

  .info-value {
    color: #303133;
    font-weight: 500;

    &.danger {
      color: #f56c6c;
      font-weight: 600;
    }
  }
}

// 料盒列表样式
.box-list {
  max-height: 120px;
  overflow-y: auto;

  .box-item {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    margin-bottom: 6px;
    background: white;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    font-size: 13px;

    .box-name {
      color: #303133;
      margin-bottom: 2px;
    }

    .box-code {
      color: #909399;
      font-size: 12px;
    }
  }

  .no-data {
    text-align: center;
    color: #c0c4cc;
    font-size: 13px;
    padding: 20px;
  }
}

// 表单样式优化
.transfer-form {
  margin-top: 10px;
}

.form-group {
  .form-item-custom {
    margin-bottom: 20px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
    }
  }
}

.full-width {
  width: 100%;
}

.quantity-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  text-align: right;
  padding: 10px 20px 20px;
}

// 响应式调整
@media (max-width: 768px) {
  .section-card {
    padding: 16px;
  }

  .info-group .info-item {
    flex-direction: column;
    align-items: flex-start;

    .info-label {
      text-align: left;
      min-width: auto;
      margin-bottom: 4px;
    }
  }
}
</style>

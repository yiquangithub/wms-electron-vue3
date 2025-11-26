<template>
  <div class="containerManage-container layout-padding">
    <div
      class="containerManage-padding layout-padding-view layout-padding-auto"
    >
      <!-- 顶部总览卡片 -->
      <div class="title">
        <svg-icon icon-class="overview" />
        <h3>运行状态概览</h3>
      </div>
      <div class="summary-cards">
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="label">总格子数</div>
            <div class="value primary">{{ totalSlots }}</div>
            <div class="sub">共4层，每层20个格子</div>
          </div>
        </el-card>
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="label">已占用格子数</div>
            <div class="value success">{{ occupiedSlots }}</div>
            <div class="sub">占用率 {{ occupancyRate.toFixed(0) }}%</div>
          </div>
        </el-card>
        <el-card class="summary-card" shadow="hover">
          <div class="card-content">
            <div class="label">空格子</div>
            <div class="value info">{{ emptySlots }}</div>
            <div class="sub">可继续存放物料</div>
          </div>
        </el-card>
        <el-card class="summary-card warning-card" shadow="hover">
          <div class="card-content">
            <div class="label">偏载格子</div>
            <div class="value warning">{{ unbalanceCount }}</div>
            <div class="sub">需要重新调整</div>
          </div>
        </el-card>
        <el-card class="summary-card danger-card" shadow="hover">
          <div class="card-content">
            <div class="label">过载格子</div>
            <div class="value danger">{{ overloadCount }}</div>
            <div class="sub">需要立即处理</div>
          </div>
        </el-card>
      </div>

      <!-- 货柜主体：四宫格布局 -->
      <div class="title">
        <svg-icon icon-class="grid-condition" />
        <h3>格子库存与负载情况</h3>
      </div>
      <div class="cabinet-body">
        <div class="cabinet-grid">
          <template v-for="(floor, floorIndex) in floors" :key="floorIndex">
            <div class="floor">
              <div class="floor-header">
                <span class="floor-title">{{ floor.name }}</span>
                <div class="floor-stats">
                  <el-tag type="danger" size="small" effect="dark"
                    >过载: {{ floor.overload }}</el-tag
                  >
                  <el-tag type="warning" size="small" effect="dark"
                    >偏载: {{ floor.unbalance }}</el-tag
                  >
                </div>
              </div>
              <div class="slots-row">
                <!-- 只有过载格子才用 Popover 包裹 -->
                <template
                  v-for="(slot, slotIndex) in floor.slots"
                  :key="slot.id + slotIndex"
                >
                  <el-popover
                    v-if="slot.weight > 7.0"
                    placement="left-start"
                    :width="400"
                    trigger="click"
                    popper-class="slot-detail-popover"
                    :show-arrow="false"
                  >
                    <!-- 触发器：格子本身 -->
                    <template #reference>
                      <div class="slot-item" :class="getSlotClass(slot)">
                        <div class="slot-id">{{ slot.id }}</div>
                        <div
                          class="slot-status"
                          v-if="slot.status === 'occupied'"
                        >
                          <span>集成电路</span>
                          <span class="weight">{{ slot.weight }}kg</span>
                        </div>
                        <div class="slot-empty" v-else>空</div>
                      </div>
                    </template>

                    <!-- Popover 内容 -->
                    <template #default>
                      <div class="popover-content">
                        <div class="popover-header">
                          <div class="position">
                            {{ floor.name }} - {{ slot.id }}格
                          </div>
                          <div class="state" :class="getStateClass(slot)">
                            状态：{{ getStateText(slot) }}
                          </div>
                        </div>

                        <div class="info-row">
                          <span>重量：</span>
                          <span class="weight-big"
                            >{{ slot.weight.toFixed(1) }}kg</span
                          >
                        </div>
                        <div class="info-row">
                          <span>最大承重：</span>
                          <span>6kg</span>
                        </div>

                        <div class="box-title">
                          料盒总数：{{ mockBoxes(slot).length }}
                        </div>
                        <div class="box-list">
                          <div
                            v-for="box in mockBoxes(slot)"
                            :key="box.code"
                            class="box-item"
                          >
                            <span class="code">{{ box.code }}</span>
                            <span class="name">{{ box.name }}</span>
                            <span class="qty">数量：{{ box.qty }}</span>
                          </div>
                        </div>

                        <div class="load-bar">
                          <div class="bar">
                            <div
                              class="fill"
                              :class="{ overload: slot.weight > 6 }"
                              :style="{ width: (slot.weight / 8) * 100 + '%' }"
                            ></div>
                          </div>
                          <div class="labels">
                            <span>0kg</span>
                            <span>6kg(最大)</span>
                            <span class="current"
                              >{{ slot.weight.toFixed(1) }}kg(当前)</span
                            >
                          </div>
                        </div>

                        <div class="action">
                          <el-button
                            type="danger"
                            plain
                            size="small"
                            @click.stop="handleFix(slot, floor.name)"
                          >
                            处理异常
                          </el-button>
                        </div>
                      </div>
                    </template>
                  </el-popover>

                  <!-- 非过载格子直接显示 -->
                  <div v-else class="slot-item" :class="getSlotClass(slot)">
                    <div class="slot-id">{{ slot.id }}</div>
                    <div class="slot-status" v-if="slot.status === 'occupied'">
                      <span>集成电路</span>
                      <span class="weight">{{ slot.weight }}kg</span>
                    </div>
                    <div class="slot-empty" v-else>空</div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 移库操作弹窗 -->
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
                      transferDialog.current.maxWeight || "6.0kg"
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">需移除重量：</span>
                    <span class="info-value danger"
                      >{{ transferDialog.current.removeWeight || "0" }}kg</span
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
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { InfoFilled, Location, Aim } from "@element-plus/icons-vue";

interface Slot {
  id: string;
  weight: number;
  status: "empty" | "occupied";
}

interface Floor {
  name: string;
  slots: Slot[];
  overload: number;
  unbalance: number;
}

// 移库弹窗数据
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
    boxes: [] as any[],
  },
  form: {
    floor: null as number | null,
    grid: null as number | null,
    box: null as number | null,
    quantity: null as number | null,
  },
});

const floors = ref<Floor[]>([
  { name: "第一层", slots: generateFloor1(), overload: 2, unbalance: 2 },
  { name: "第二层", slots: generateFloor2(), overload: 2, unbalance: 2 },
  { name: "第三层", slots: generateFloor3(), overload: 3, unbalance: 1 },
  { name: "第四层", slots: generateFloor4(), overload: 1, unbalance: 3 },
]);

function generateFloor1(): Slot[] {
  return [
    { id: "01", weight: 0, status: "empty" },
    { id: "02", weight: 5.7, status: "occupied" },
    { id: "03", weight: 5.7, status: "occupied" },
    { id: "04", weight: 5.7, status: "occupied" },
    { id: "05", weight: 6.8, status: "occupied" },
    { id: "06", weight: 5.7, status: "occupied" },
    { id: "07", weight: 5.7, status: "occupied" },
    { id: "08", weight: 7.5, status: "occupied" },
    { id: "09", weight: 0, status: "empty" },
    { id: "10", weight: 5.7, status: "occupied" },
    { id: "11", weight: 5.7, status: "occupied" },
    { id: "12", weight: 5.7, status: "occupied" },
    { id: "13", weight: 5.7, status: "occupied" },
    { id: "14", weight: 5.7, status: "occupied" },
    { id: "15", weight: 5.7, status: "occupied" },
    { id: "16", weight: 5.7, status: "occupied" },
    { id: "17", weight: 5.7, status: "occupied" },
    { id: "18", weight: 5.7, status: "occupied" },
    { id: "19", weight: 5.7, status: "occupied" },
    { id: "20", weight: 5.7, status: "occupied" },
  ];
}

function generateFloor2(): Slot[] {
  return [
    { id: "01", weight: 0, status: "empty" },
    { id: "02", weight: 5.7, status: "occupied" },
    { id: "03", weight: 5.7, status: "occupied" },
    { id: "04", weight: 5.7, status: "occupied" },
    { id: "05", weight: 5.7, status: "occupied" },
    { id: "06", weight: 7.8, status: "occupied" },
    { id: "07", weight: 5.7, status: "occupied" },
    { id: "08", weight: 5.7, status: "occupied" },
    { id: "09", weight: 0, status: "empty" },
    { id: "10", weight: 5.7, status: "occupied" },
    { id: "11", weight: 5.7, status: "occupied" },
    { id: "12", weight: 5.7, status: "occupied" },
    { id: "13", weight: 5.7, status: "occupied" },
    { id: "14", weight: 6.5, status: "occupied" },
    { id: "15", weight: 5.7, status: "occupied" },
    { id: "16", weight: 5.7, status: "occupied" },
    { id: "17", weight: 5.7, status: "occupied" },
    { id: "18", weight: 5.7, status: "occupied" },
    { id: "19", weight: 5.7, status: "occupied" },
    { id: "20", weight: 5.7, status: "occupied" },
  ];
}

function generateFloor3(): Slot[] {
  return Array(20)
    .fill(null)
    .map((_, i) => ({
      id: String(i + 1).padStart(2, "0"),
      weight: i % 5 === 0 ? 0 : i % 7 === 0 ? 7.6 : i % 6 === 0 ? 6.8 : 5.7,
      status: i % 5 === 0 ? "empty" : "occupied",
    }));
}

function generateFloor4(): Slot[] {
  return Array(20)
    .fill(null)
    .map((_, i) => ({
      id: String(i + 1).padStart(2, "0"),
      weight: i % 5 === 0 ? 0 : i % 7 === 0 ? 7.9 : i % 6 === 0 ? 6.9 : 5.7,
      status: i % 5 === 0 ? "empty" : "occupied",
    }));
}

// 计算属性
const totalSlots = computed(() =>
  floors.value.reduce((s, f) => s + f.slots.length, 0)
);
const occupiedSlots = computed(
  () =>
    floors.value.flatMap((f) => f.slots).filter((s) => s.status === "occupied")
      .length
);

const emptySlots = computed(() => totalSlots.value - occupiedSlots.value);
const occupancyRate = computed(
  () => (occupiedSlots.value / totalSlots.value) * 100
);

const overloadCount = computed(
  () =>
    floors.value.flatMap((f) => f.slots).filter((s) => s.weight > 7.0).length
);
const unbalanceCount = computed(
  () =>
    floors.value
      .flatMap((f) => f.slots)
      .filter((s) => s.weight > 5.7 && s.weight <= 7.0).length
);

const getSlotClass = (slot: Slot) => {
  if (slot.status === "empty") return "empty";
  if (slot.weight > 7.0) return "overload";
  if (slot.weight > 5.7) return "unbalance";
  return "normal";
};

const getStateText = (slot: Slot) => {
  if (slot.weight > 7) return "过载";
  if (slot.weight > 5.7) return "偏载";
  return "正常负载";
};

const getStateClass = (slot: Slot) => {
  if (slot.weight > 7) return "danger";
  if (slot.weight > 5.7) return "warning";
  return "success";
};

// 模拟料盒数据
const mockBoxes = (slot: Slot) => {
  if (slot.status === "empty") return [];
  const base = [
    { code: "L1-B1-C1", name: "绝缘材料", qty: 100 },
    { code: "L1-G1-S1", name: "绝缘材料", qty: 100 },
    { code: "L1-G1-S1", name: "绝缘材料", qty: 100 },
  ];
  return slot.weight > 6.5 ? base : base.slice(0, 2);
};

// 提取数字的工具函数
const parseWeight = (str: string | number) =>
  parseFloat(String(str).replace("kg", "")) || 0;

// 处理异常按钮点击事件
const handleFix = (slot: Slot, floorName: string) => {
  const currentVal = parseWeight(slot.weight);
  const maxVal = 6.0; // 最大承重固定为6kg
  const removeVal = Math.max(0, currentVal - maxVal);

  // 设置弹窗数据
  transferDialog.current = {
    position: `${floorName} - ${slot.id}格`,
    itemName: "集成电路", // 根据实际情况调整
    weight: `${slot.weight}kg`,
    maxWeight: "6.0kg",
    boxes: mockBoxes(slot).map((box, index) => ({
      name: box.name,
      code: box.code,
    })),
    removeWeight: removeVal.toFixed(2) + "kg",
    removeWeightNum: removeVal,
  };

  // 重置表单
  transferDialog.form = { floor: null, grid: null, box: null, quantity: null };
  transferDialog.visible = true;
};

// 确认移库
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
      // 这里可以添加刷新数据的逻辑
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
.containerManage-padding {
  padding: 18px;
}

.summary-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: 200px;
  border-radius: 12px;
  border: none;
}

.card-content {
  text-align: center;
}

.label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.value {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
}

.primary {
  color: #409eff;
}
.success {
  color: #67c23a;
}
.info {
  color: #909399;
}
.warning {
  color: #e6a23c;
}
.danger {
  color: #f56c6c;
}

.sub {
  font-size: 12px;
  color: #bbb;
}

.warning-card {
  border-left: 5px solid #e6a23c;
}
.danger-card {
  border-left: 5px solid #f56c6c;
}

.cabinet-body {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.cabinet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.floor {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.floor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.floor-stats .el-tag:first-child {
  margin-right: 12px;
}

.floor-title {
  font-size: 17px;
  font-weight: bold;
  color: #303133;
}

.slots-row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 10px;
}

.slot-item {
  width: 100%;
  height: 75px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.slot-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.slot-id {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}
.weight {
  font-weight: bold;
  font-size: 14px;
}

.empty {
  background: linear-gradient(135deg, #f0f2f5, #e4e7ed);
  color: #999;
  border: 2px dashed #dcdfe6;
}
.normal {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
}
.unbalance {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  animation: pulse 2s infinite;
}
.overload {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  animation: shake 0.5s infinite;
}

/* Popover 样式 */
:deep(.slot-detail-popover) {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  border: none !important;
  overflow: hidden;
}

.popover-content {
  padding: 20px;
  font-size: 14px;
}

.popover-header {
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  .position {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
  .state {
    margin-top: 6px;
    font-size: 16px;
    font-weight: bold;
    &.success {
      color: #67c23a;
    }
    &.warning {
      color: #e6a23c;
    }
    &.danger {
      color: #f56c6c;
    }
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  .weight-big {
    font-size: 28px;
    font-weight: bold;
    color: #f56c6c;
  }
}

.box-title {
  margin: 18px 0 10px;
  font-weight: bold;
  color: #303133;
}

.box-list {
  background: #f8f9fb;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
}

.box-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  &:not(:last-child) {
    border-bottom: 1px dashed #ddd;
  }
  .code {
    color: #409eff;
    font-family: monospace;
  }
  .qty {
    color: #f56c6c;
  }
}

.load-bar {
  margin: 20px 0;
  .bar {
    height: 12px;
    background: #ebeef5;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
    .fill {
      height: 100%;
      background: #67c23a;
      transition: width 0.4s;
      &.overload {
        background: linear-gradient(90deg, #f56c6c, #f78989);
      }
    }
  }
  .labels {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #999;
    .current {
      color: #f56c6c;
      font-weight: bold;
    }
  }
}

.action {
  text-align: center;
  margin-top: 10px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.title {
  display: flex;
  align-items: center;

  .svg-icon {
    margin-right: 8px;
    font-size: 30px;
    color: #409eff;
  }
}

/* 移库弹窗样式 */
.transfer-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-content {
  padding: 0 20px;
}

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
</style>

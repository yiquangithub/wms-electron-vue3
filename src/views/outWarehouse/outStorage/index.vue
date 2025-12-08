<template>
  <div class="outbound-container layout-padding">
    <div class="outbound-padding layout-padding-view layout-padding-auto">
      <!-- 顶部统计卡片 - 出库统计 -->
      <div class="stats-wrapper">
        <div class="stat-card">
          <div class="label">今日出库单数</div>
          <div class="num">12</div>
        </div>
        <div class="stat-card">
          <div class="label">本周出库总量</div>
          <div class="num">856 <span class="unit">件</span></div>
        </div>
        <div class="stat-card warning">
          <div class="label">待处理出库单</div>
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
                  <el-option label="已完成" value="completed" />
                  <el-option label="部分出库" value="partial" />
                  <el-option label="已审核" value="audited" />
                  <el-option label="待审核" value="pending" />
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
                  <el-option label="销售出库" value="sales" />
                  <el-option label="调拨出库" value="transfer" />
                  <el-option label="退货出库" value="return" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-date-picker
                  v-model="searchForm.startDate"
                  type="date"
                  placeholder="年/月/日"
                  value-format="YYYY-MM-DD"
                />
                <span style="margin: 0 10px">至</span>
                <el-date-picker
                  v-model="searchForm.endDate"
                  type="date"
                  placeholder="年/月/日"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-input
                  v-model.trim="searchForm.keyword"
                  placeholder="出库单号/客户"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-button type="primary" @click="handleCommand('add')"
                  >新增出库单</el-button
                >
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
        @clickChangeCode="clickChangeCode"
      >
        <!-- 状态列自定义 -->
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="dark" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>

        <!-- 操作列 -->
        <template #operate="{ row }">
          <div class="operateBox">
            <el-button link type="primary" @click="handleCommand('view', row)"
              >详情</el-button
            >
            <el-button
              v-if="row.status === 'partial'"
              link
              type="primary"
              class="warning-btn"
              @click="handleContinue(row)"
              >继续出库</el-button
            >
            <el-button
              v-if="row.status === 'audited'"
              link
              type="primary"
              @click="handleStart(row)"
              >开始出库</el-button
            >
            <el-button
              v-if="row.status === 'pending'"
              link
              type="primary"
              @click="handleCommand('edit', row)"
              >编辑</el-button
            >
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              @click="handleCommand('del', row)"
              >删除</el-button
            >
          </div>
        </template>
      </CommonTable>
    </div>

    <!-- 新增出库弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      @close="closeDialog"
      :title="dialogProps.title"
      :destroy-on-close="true"
      width="65%"
      draggable
      class="add-dialog"
    >
      <el-form
        ref="ruleFormRef"
        label-width="120px"
        label-suffix=" :"
        :rules="rules"
        :disabled="dialogProps.isView || dialogProps.isAudit"
        :model="formData"
        :hide-required-asterisk="dialogProps.isView"
        label-position="top"
      >
        <el-row class="form-box">
          <el-col :span="24">
            <CustomDivider title="出库基础信息"></CustomDivider>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="出库单编号" prop="">
              <el-input
                placeholder="可不填写，自动生成"
                v-model="formData.code"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="出库单类型" required prop="">
              <el-select
                placeholder="请选择出库类别"
                v-model="formData.outboundType"
              >
                <el-option
                  v-for="item in storeType"
                  :key="item.category"
                  :label="item.categoryName"
                  :value="item.category"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="关联订单号" required prop="">
              <el-input
                placeholder="请输入关联订单号"
                v-model="formData.orderCode"
                readonly
                @click="toggleOrder"
              >
                <template #suffix>
                  <el-icon class="toggle"><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="预计出库日期" prop="" required>
              <el-date-picker
                v-model="formData.outboundDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择预计出库日期"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户名称" prop="">
              <el-input
                v-model="formData.customerName"
                placeholder="请选择客户"
                readonly
                @click="chooseContact"
              >
                <template #suffix>
                  <el-icon class="el-input__icon" style="cursor: pointer">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="出库仓库" required prop="">
              <el-select
                placeholder="请选择出库仓库"
                v-model="formData.warehouseId"
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.warehouseId"
                  :label="item.warehouseName"
                  :value="item.warehouseId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="24">
            <el-form-item label="备注" prop="">
              <el-input
                placeholder="请输入内容"
                :rows="2"
                type="textarea"
                maxlength="300"
                show-word-limit
                v-model="formData.remark"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="form-box detail-info">
        <el-col :span="20">
          <CustomDivider title="出库物料信息"></CustomDivider>
        </el-col>
        <el-button
          type="primary"
          :icon="Plus"
          plain
          size="default"
          @click="chooseMaterial"
          v-if="!dialogProps.isAudit && !dialogProps.isView"
          >选择物料</el-button
        >
      </div>
      <div class="detail-table">
        <el-table
          :data="formData.products"
          border
          class="table-demo"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
          :disabled="dialogProps.isView"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column
            prop="productName"
            label="物料名称"
            min-width="150"
          />
          <el-table-column
            prop="productCode"
            label="物料编号"
            min-width="120"
          />
          <el-table-column
            prop="specification"
            label="规格型号"
            min-width="150"
          />
          <el-table-column prop="unit" label="单位" min-width="60" />
          <el-table-column label="批次" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.batch"
                placeholder="请输入批次"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="单价" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.price"
                placeholder="请输入单价"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="出库数量" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.quantity"
                placeholder="请输入出库数量"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100"
            fixed="right"
            v-if="!dialogProps.isView"
          >
            <template #default="{ row }">
              <div class="operateBox">
                <el-button
                  type="danger"
                  text
                  size="default"
                  @click="handleDetailCommand('del', row)"
                  :icon="Delete"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button
          v-show="!dialogProps.isView && !dialogProps.isAudit"
          type="primary"
          @click="handleSubmit"
          >确定</el-button
        >
        <el-button @click="closeDialog">取消</el-button>
      </template>
    </el-dialog>

    <!-- 订单选择弹窗 -->
    <el-dialog
      v-model="orderSelectVisible"
      title="选择订单"
      width="1000px"
      append-to-body
      class="select-dialog"
    >
      <div class="search-bar">
        <el-input
          v-model="orderSearchKeyword"
          placeholder="输入客户名称搜索"
          clearable
          @input="handleOrderSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-table
        :data="orderList"
        height="400"
        border
        stripe
        highlight-current-row
        @row-click="handleOrderSelect"
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ 'text-align': 'center' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="订单号" width="180" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="productName" label="物料" />
        <el-table-column
          prop="workOrderNum"
          label="数量"
          width="100"
          align="center"
        />
        <el-table-column
          prop="deliveryDate"
          label="交付日期"
          width="150"
          align="center"
        />
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="orderPage"
          v-model:page-size="orderPageSize"
          :page-sizes="[5, 10, 20]"
          :total="orderTotal"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleOrderSizeChange"
          @current-change="handleOrderPageChange"
        />
      </div>
    </el-dialog>

    <WarehouseProductSelectDialog
      v-model="showMaterialSelect"
      @confirm="onMaterialSelect"
      title="选择仓库物料"
      selectionMode="multiple"
      :defaultSelected="defaultSelected"
    />

    <ContactSelectDialog
      v-model="showContactSelect"
      @confirm="onContactSelect"
      title="选择客户"
      selectionMode="single"
      :defaultSelected="defaultContactSelected"
    />

    <!-- 出库执行弹窗（开始出库 / 继续出库） -->
    <el-dialog
      v-model="outboundExecuteVisible"
      :title="outboundExecuteTitle"
      width="90%"
      top="5vh"
      destroy-on-close
      class="outbound-execute-dialog"
    >
      <div class="execute-content">
        <!-- 物料拣货区域 -->
        <div class="material-pick-section">
          <div class="section-header">
            <svg-icon icon-class="grid-condition" />
            <h3>物料拣货</h3>
          </div>
          <div class="outbound-info">
            <div class="info-item">
              <span class="label">出库单编号:</span>
              <span class="value"> 20230824001 </span>
            </div>
            <div class="info-item">
              <span class="label">客户:</span>
              <span class="value"> 客户A </span>
            </div>
            <div class="info-item">
              <span class="label">出库类型:</span>
              <span class="value"> 销售出库 </span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <span class="value"> 部分出库 </span>
            </div>
            <div class="info-item">
              <el-button
                type="primary"
                :loading="executeLoading"
                @click="confirmOutbound"
                :disabled="!isPickValid"
              >
                确认出库
              </el-button>
            </div>
          </div>

          <!-- 待拣货物料统计 -->
          <div class="pick-summary">
            <span class="summary-label">待拣货的物料</span>
            <span class="summary-info">
              共{{ pickMaterialTypes }}种物料，总数量{{ pickTotalQuantity }}件
            </span>
          </div>

          <!-- 待拣货物料表格 -->
          <div class="pick-table-container">
            <el-table
              :data="pickMaterials"
              border
              height="200"
              class="material-pick-table"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{
                'text-align': 'center',
                'background-color': '#f5f7fa',
                'font-weight': 'bold',
              }"
            >
              <el-table-column
                prop="materialCode"
                label="物料编码"
                width="140"
                align="center"
              />
              <el-table-column
                prop="materialName"
                label="物料名称"
                min-width="150"
                align="center"
              />
              <el-table-column
                prop="specification"
                label="规格型号"
                min-width="150"
                align="center"
              />
              <el-table-column
                prop="unit"
                label="单位"
                width="80"
                align="center"
              />
              <el-table-column
                prop="planQuantity"
                label="计划数量"
                width="100"
                align="center"
              />
              <el-table-column
                prop="pickedQuantity"
                label="已拣数量"
                width="100"
                align="center"
              />
              <el-table-column label="本次拣货" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.currentPick"
                    :min="0"
                    :max="row.planQuantity - row.pickedQuantity"
                    :precision="0"
                    size="small"
                    controls-position="right"
                    @change="updatePickStats"
                  />
                </template>
              </el-table-column>
              <el-table-column label="推荐货位" width="120" align="center">
                <template #default="{ row }">
                  <el-select
                    v-model="row.recommendedLocation"
                    placeholder="选择货位"
                    size="small"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="loc in warehouseLocations"
                      :key="loc.value"
                      :label="loc.label"
                      :value="loc.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag
                    :type="getPickStatusType(row.status)"
                    size="small"
                    effect="plain"
                  >
                    {{ getPickStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 出库状态显示区域 -->
        <div v-if="outboundStatus.length > 0" class="outbound-status-section">
          <div class="section-header">
            <svg-icon icon-class="status" />
            <h3>出库状态</h3>
          </div>
          <div class="status-list">
            <div
              v-for="(status, index) in outboundStatus"
              :key="index"
              class="status-item"
            >
              <div class="status-content">
                <span class="time">{{ status.time }}</span>
                <span class="material">{{ status.materialName }}</span>
                <span class="quantity">{{ status.quantity }}件</span>
                <el-tag
                  :type="status.success ? 'success' : 'danger'"
                  size="small"
                >
                  {{ status.success ? "出库成功" : "出库失败" }}
                </el-tag>
              </div>
              <div v-if="status.message" class="status-message">
                {{ status.message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";
import CustomDivider from "@/components/CustomDivider/index.vue";
import { Plus, Delete, Search } from "@element-plus/icons-vue";
import ContactSelectDialog from "@/components/ContactSelectDialog/index.vue";
import WarehouseProductSelectDialog from "@/components/WarehouseProductSelectDialog/index.vue";
import router from "@/router";

const searchForm = reactive({
  status: "",
  type: "",
  startDate: "",
  endDate: "",
  keyword: "",
});

// 状态映射
const getStatusText = (status) => {
  const map = {
    completed: "已完成",
    partial: "部分出库",
    audited: "已审核",
    pending: "待审核",
  };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = {
    completed: "success",
    partial: "warning",
    audited: "primary",
    pending: "info",
  };
  return map[status] || "info";
};

// 表格核心数据
const state = reactive({
  tableData: {
    data: [
      {
        id: "OUT-2025-001",
        type: "销售出库",
        customer: "深圳科技有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        outQty: 100,
        status: "completed",
      },
      {
        id: "OUT-2025-002",
        type: "销售出库",
        customer: "北京电子有限公司",
        planDate: "2025-05-16",
        totalQty: 200,
        outQty: 150,
        status: "partial",
      },
      {
        id: "OUT-2025-003",
        type: "调拨出库",
        customer: "内部调拨",
        planDate: "2025-05-17",
        totalQty: 50,
        outQty: 0,
        status: "audited",
      },
      {
        id: "OUT-2025-004",
        type: "销售出库",
        customer: "上海机械厂",
        planDate: "2025-05-18",
        totalQty: 80,
        outQty: 0,
        status: "pending",
      },
    ],
    header: [
      { key: "id", title: "出库单号", width: 160, isCheck: true },
      { key: "type", title: "出库类型", isCheck: true },
      { key: "customer", title: "客户", minWidth: 220, isCheck: true },
      { key: "planDate", title: "预计出库日期", width: 140, isCheck: true },
      {
        key: "totalQty",
        title: "总数量",
        width: 100,
        align: "center",
        isCheck: true,
      },
      {
        key: "outQty",
        title: "已出库数量",
        width: 120,
        align: "center",
        isCheck: true,
        status: "linkButton",
      },
    ],
    config: {
      total: 68,
      loading: false,
      isBorder: true,
      isStripe: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      operateWidth: "200",
      isImport: true,
      isStatusConfig: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

// 方法
const handleSearch = () => {
  state.tableData.param.pageNum = 1;
  getTableData();
};

const clickChangeCode = (row) => {
  console.log(
    "%c [ row ]-579",
    "font-size:13px; background:pink; color:#bf2c9f;",
    row
  );
  router.push({
    path: "/warehouse/recordOutbound",
  });
};

const onPageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const getTableData = () => {
  state.tableData.config.loading = true;
  setTimeout(() => {
    state.tableData.config.loading = false;
  }, 300);
};

// ========== 新增出库弹框相关代码 ==========
const dialogVisible = ref(false);
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: "",
  row: {},
});

const rules = reactive({});
const ruleFormRef = ref();
const formData = ref({
  code: "",
  id: 0,
  outboundType: null,
  orderId: 0,
  outboundDate: "",
  warehouseId: 0,
  orderCode: "",
  products: [],
  remark: "",
  customerContacts: "",
  customerId: 0,
  customerCode: "",
  customerName: "",
  customerPhone: "",
});

const warehouseList = ref([]);

const handleCommand = async (command, row) => {
  if (command === "add") {
    dialogProps.value = {
      isView: false,
      isAudit: false,
      title: "新增出库单",
    };
    formData.value = {
      code: "",
      id: 0,
      outboundType: null,
      orderId: 0,
      orderCode: "",
      products: [],
      remark: "",
      customerContacts: "",
      customerId: 0,
      customerCode: "",
      customerName: "",
      customerPhone: "",
    };
    dialogVisible.value = true;
  } else if (command === "edit") {
    dialogProps.value = {
      isView: false,
      isAudit: false,
      title: "编辑出库单",
    };
    formData.value = {
      code: row.id,
      id: 1,
      outboundType: "sales",
      orderId: 1,
      orderCode: "ORDER-001",
      products: [
        {
          batch: "BATCH001",
          price: 100,
          productId: 1,
          quantity: 50,
          warehouseId: 1,
          productName: "电子元件A",
          productCode: "EC001",
          warehouseName: "主仓库",
        },
      ],
      remark: "测试出库单",
      customerContacts: "李经理",
      customerId: 1,
      customerCode: "CUS001",
      customerName: row.customer,
      customerPhone: "13800138000",
    };
    dialogVisible.value = true;
  } else if (command === "view") {
    dialogProps.value = {
      isView: true,
      isAudit: false,
      title: "查看出库单",
    };
    formData.value = {
      code: row.id,
      id: 1,
      outboundType: "sales",
      orderId: 1,
      orderCode: "ORDER-001",
      products: [
        {
          batch: "BATCH001",
          price: 100,
          productId: 1,
          quantity: 50,
          warehouseId: 1,
          productName: "电子元件A",
          productCode: "EC001",
          warehouseName: "主仓库",
        },
      ],
      remark: "测试出库单",
      customerContacts: "李经理",
      customerId: 1,
      customerCode: "CUS001",
      customerName: row.customer,
      customerPhone: "13800138000",
    };
    dialogVisible.value = true;
  } else if (command === "del") {
    deleteData(row);
  }
};

const handleDetailCommand = (command, row) => {
  if (command === "del") {
    const index = formData.value.products.findIndex(
      (item) => item.productId === row.productId
    );
    if (index !== -1) {
      formData.value.products.splice(index, 1);
    }
  }
};

const deleteData = async (params) => {
  ElMessageBox.confirm("您确定删除该数据吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      ElMessage({
        type: "success",
        message: "删除成功",
      });
      getTableData();
    })
    .catch(() => {});
};

const handleSubmit = async () => {
  if (ruleFormRef.value) {
    ruleFormRef.value.validate(async (valid) => {
      if (valid) {
        ElMessage({
          message: "操作成功",
          type: "success",
        });
        ruleFormRef.value?.resetFields();
        dialogVisible.value = false;
        getTableData();
      }
    });
  }
};

const closeDialog = () => {
  ruleFormRef.value?.resetFields();
  dialogVisible.value = false;
};

// 选择物料相关
const showMaterialSelect = ref(false);
const defaultSelected = ref([]);

const chooseMaterial = () => {
  defaultSelected.value = formData.value.products.map((item) => ({
    id: item.productId,
    code: item.productCode,
    name: item.productName,
    specification: item.specification || "",
    unitName: item.unit || "",
    brand: "",
    importantParts: 0,
    externalCode: "",
    internalCode: "",
  }));

  showMaterialSelect.value = true;
};

const onMaterialSelect = (data) => {
  data.forEach(async (item) => {
    const exists = formData.value.products.some((product) => {
      return product.productId === item.productId;
    });
    if (!exists) {
      formData.value.products.push({
        batch: "",
        price: item.productPrice || 0,
        productId: item.productId,
        specification: item.productSpecifications || "",
        unit: item.unitName || "",
        quantity: 0,
        warehouseId: item.warehouseId,
        productName: item.productName,
        productCode: item.productCode,
        warehouseName: item.warehouseName,
      });
    }
  });

  showMaterialSelect.value = false;
};

// 客户相关
const showContactSelect = ref(false);
const defaultContactSelected = ref([]);

const chooseContact = () => {
  defaultContactSelected.value = formData.value.customerId
    ? [
        {
          id: formData.value.customerId,
          name: formData.value.customerName,
        },
      ]
    : [];
  showContactSelect.value = true;
};

const onContactSelect = (selectedData) => {
  let contact;
  if (Array.isArray(selectedData)) {
    if (selectedData.length === 0) {
      ElMessage.info("未选择任何客户");
      return;
    }
    contact = selectedData[0];
  } else {
    if (!selectedData) {
      ElMessage.info("未选择任何客户");
      return;
    }
    contact = selectedData;
  }
  formData.value.customerId = contact.id;
  formData.value.customerName = contact.name;
  ElMessage.success("选择客户成功");
  showContactSelect.value = false;
};

// 获取出库单类型
const storeType = ref([
  { category: "sales", categoryName: "销售出库" },
  { category: "transfer", categoryName: "调拨出库" },
  { category: "return", categoryName: "退货出库" },
  { category: "other", categoryName: "其他出库" },
]);

// 订单选择相关
const orderSelectVisible = ref(false);
const orderSearchKeyword = ref("");
const orderList = ref([]);
const orderPage = ref(1);
const orderPageSize = ref(10);
const orderTotal = ref(0);

const toggleOrder = () => {
  orderSelectVisible.value = true;
  getOrderListData();
};

const handleOrderSearch = () => {
  orderPage.value = 1;
  orderPageSize.value = 10;
  getOrderListData();
};

const getOrderListData = async () => {
  orderList.value = [
    {
      id: 1,
      code: "ORDER-001",
      customerName: "客户A",
      productName: "电子元件A",
      workOrderNum: 100,
      deliveryDate: "2025-05-20",
    },
    {
      id: 2,
      code: "ORDER-002",
      customerName: "客户B",
      productName: "电子元件B",
      workOrderNum: 200,
      deliveryDate: "2025-05-25",
    },
    {
      id: 3,
      code: "ORDER-003",
      customerName: "客户C",
      productName: "电子元件C",
      workOrderNum: 150,
      deliveryDate: "2025-05-30",
    },
  ];
  orderTotal.value = 3;
};

const handleOrderSelect = (row) => {
  formData.value.orderId = row.id;
  formData.value.orderCode = row.code;
  orderSelectVisible.value = false;
};

const handleOrderSizeChange = (val) => {
  orderPageSize.value = val;
  getOrderListData();
};

const handleOrderPageChange = (val) => {
  orderPage.value = val;
  getOrderListData();
};

// 出库执行相关
const outboundExecuteVisible = ref(false);
const outboundExecuteTitle = ref("");
const executeLoading = ref(false);

// 仓库货位选项
const warehouseLocations = ref([
  { label: "A区-01-01", value: "A-01-01" },
  { label: "A区-01-02", value: "A-01-02" },
  { label: "B区-02-01", value: "B-02-01" },
  { label: "B区-02-02", value: "B-02-02" },
  { label: "C区-03-01", value: "C-03-01" },
]);

// 出库状态记录
const outboundStatus = ref([]);

// 物料拣货相关
const pickMaterials = ref([]);
const pickMaterialTypes = ref(0);
const pickTotalQuantity = ref(0);

// 拣货状态文本映射
const getPickStatusText = (status) => {
  const map = {
    pending: "待拣货",
    picking: "拣货中",
    picked: "已拣货",
    outbound: "已出库",
    error: "出库失败",
  };
  return map[status] || status;
};

const getPickStatusType = (status) => {
  const map = {
    pending: "info",
    picking: "warning",
    picked: "primary",
    outbound: "success",
    error: "danger",
  };
  return map[status] || "info";
};

// 初始化拣货物料数据
const initPickMaterials = () => {
  pickMaterials.value = [
    {
      materialCode: "W-2025-001",
      materialName: "电阻器",
      specification: "10KΩ 0.25W",
      unit: "个",
      planQuantity: 100,
      pickedQuantity: 50,
      currentPick: 10,
      recommendedLocation: "A-01-01",
      status: "pending",
      batchCode: "BT-01",
    },
    {
      materialCode: "W-2025-002",
      materialName: "轴承",
      specification: "25×52×15",
      unit: "套",
      planQuantity: 50,
      pickedQuantity: 20,
      currentPick: 5,
      recommendedLocation: "B-02-01",
      status: "pending",
      batchCode: "BT-02",
    },
    {
      materialCode: "W-2025-003",
      materialName: "纸箱",
      specification: "30×20×15cm",
      unit: "个",
      planQuantity: 80,
      pickedQuantity: 30,
      currentPick: 10,
      recommendedLocation: "C-03-01",
      status: "pending",
      batchCode: "BT-03",
    },
  ];
  outboundStatus.value = []; // 清空出库状态
  updatePickStats();
};

// 更新拣货统计
const updatePickStats = () => {
  pickMaterialTypes.value = pickMaterials.value.length;
  pickTotalQuantity.value = pickMaterials.value.reduce((total, item) => {
    return total + (item.currentPick || 0);
  }, 0);
};

// 验证拣货数据
const isPickValid = computed(() => {
  if (pickMaterials.value.length === 0) return false;

  // 检查是否所有物料都填写了拣货数量
  const allFilled = pickMaterials.value.every(
    (item) =>
      item.currentPick > 0 &&
      item.currentPick <= item.planQuantity - item.pickedQuantity
  );

  // 检查是否选择了推荐货位
  const allLocationsSelected = pickMaterials.value.every(
    (item) => item.recommendedLocation
  );

  return allFilled && allLocationsSelected;
});

// 开始出库和继续出库方法
const handleStart = (row) => {
  outboundExecuteTitle.value = "开始出库 - " + row.id;
  initPickMaterials();
  outboundExecuteVisible.value = true;
};

const handleContinue = (row) => {
  outboundExecuteTitle.value = "继续出库 - " + row.id;
  initPickMaterials();
  outboundExecuteVisible.value = true;
};

// 确认出库
const confirmOutbound = async () => {
  const totalPicked = pickMaterials.value.reduce(
    (sum, item) => sum + (item.currentPick || 0),
    0
  );

  if (totalPicked === 0) return ElMessage.warning("请填写拣货数量");

  // 检查推荐货位
  const missingLocation = pickMaterials.value.find(
    (item) => !item.recommendedLocation
  );
  if (missingLocation) {
    return ElMessage.warning(`请为${missingLocation.materialName}选择推荐货位`);
  }

  executeLoading.value = true;

  try {
    // 模拟逐个出库物料
    for (const material of pickMaterials.value) {
      if (material.currentPick > 0) {
        // 更新物料状态为出库中
        material.status = "outbound";

        // 模拟出库处理
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 记录出库状态
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        outboundStatus.value.unshift({
          time: timeStr,
          materialName: material.materialName,
          quantity: material.currentPick,
          success: true,
          message: `从${material.recommendedLocation}货位出库成功`,
        });

        // 更新已拣数量
        material.pickedQuantity += material.currentPick;
        material.currentPick = 0; // 清空本次拣货数量

        // 询问是否继续出库下一个物料
        if (material !== pickMaterials.value[pickMaterials.value.length - 1]) {
          const continueOutbound = await ElMessageBox.confirm(
            `物料 ${material.materialName} 出库成功，是否继续出库下一个物料？`,
            "继续出库",
            {
              confirmButtonText: "继续",
              cancelButtonText: "取消",
              type: "success",
            }
          )
            .then(() => true)
            .catch(() => false);

          if (!continueOutbound) {
            break;
          }
        }
      }
    }

    // 检查是否所有物料都已出库
    const allOutbound = pickMaterials.value.every(
      (item) => item.pickedQuantity >= item.planQuantity
    );

    if (allOutbound) {
      ElMessage.success("所有物料已出库完成！");
      // 可以在这里添加关闭弹窗的逻辑
      // outboundExecuteVisible.value = false;
    } else {
      ElMessage.success("出库操作完成！");
    }

    // 更新统计
    updatePickStats();
  } catch (error) {
    ElMessage.error("出库过程中出现错误");
  } finally {
    executeLoading.value = false;
  }
};

// 监听拣货数量变化
watch(
  pickMaterials,
  () => {
    updatePickStats();
  },
  { deep: true }
);

// 搜索监听
watch(
  () => searchForm.keyword,
  () => {
    handleSearch();
  }
);

onMounted(() => {
  getTableData();
  getOrderListData();
});
</script>

<style scoped lang="scss">
.outbound-padding {
  padding: 18px;
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
    }
    .num {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      .unit {
        font-size: 16px;
        margin-left: 4px;
      }
    }
    &.warning .num {
      color: #e6a23c;
    }
  }
}

.table-demo {
  height: calc(100vh - 287px);
}

.operateBox .warning-btn {
  color: #e6a23c !important;
}

.detail-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  p {
    font-size: 16px;
    font-weight: bold;
  }
}

.form-box {
  padding: 10px 0;
}

:deep(.detail-table) {
  .table-demo {
    height: calc(100vh - 600px);
  }
}

.select-dialog {
  .search-bar {
    margin-bottom: 15px;
  }

  .pagination-container {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
}

.toggle {
  cursor: pointer;
  font-size: 16px;
  color: #409eff;

  &:hover {
    color: #79bbff;
  }
}

.outbound-execute-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.execute-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.material-pick-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .outbound-info {
    display: flex;
    justify-content: space-around;
    gap: 12px;
    height: 100px;
    align-items: center;
    box-shadow: 0 4px 8px 0 rgba(216, 205, 205, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 8px;
    margin-bottom: 10px;

    .info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      .label {
        font-size: 18px;
        color: #606266;
        font-weight: 700;
      }
      .value {
        font-size: 16px;
        color: #303133;
      }
    }
  }

  .pick-summary {
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;

    .summary-label {
      color: #606266;
      margin-right: 12px;
    }

    .summary-info {
      color: #409eff;
      font-weight: 500;
    }
  }

  .pick-table-container {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;

    :deep(.material-pick-table) {
      .el-table__header-wrapper {
        background: #f5f7fa;
      }

      .el-table__body {
        .el-input-number {
          width: 100px;
        }

        .el-input {
          .el-input__wrapper {
            padding: 1px 7px;
          }
        }

        .el-select {
          width: 100%;
        }
      }
    }
  }
}

.outbound-status-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .status-list {
    max-height: 200px;
    overflow-y: auto;

    .status-item {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .status-content {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 4px;

        .time {
          color: #909399;
          font-size: 12px;
          min-width: 60px;
        }

        .material {
          flex: 1;
          color: #303133;
        }

        .quantity {
          color: #409eff;
          font-weight: 500;
        }
      }
      .status-message {
        color: #606266;
        font-size: 12px;
        margin-left: 76px;
        margin-top: 4px;
      }
    }
  }
}
</style>

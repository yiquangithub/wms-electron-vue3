<template>
  <div class="inbound-container layout-padding">
    <div class="inbound-padding layout-padding-view layout-padding-auto">
      <!-- 顶部统计卡片 - 和异常页面完全一致 -->
      <div class="stats-wrapper">
        <div class="stat-card">
          <div class="label">今日入库单数</div>
          <div class="num">18</div>
        </div>
        <div class="stat-card">
          <div class="label">本周入库总量</div>
          <div class="num">1286 <span class="unit">件</span></div>
        </div>
        <div class="stat-card warning">
          <div class="label">待处理入库单</div>
          <div class="num">5</div>
        </div>
      </div>

      <!-- 搜索栏 - 严格按照截图布局 -->
      <div class="search-container">
        <el-form
          ref="searchFormRef"
          :model="searchForm"
          class="table-form"
          inline
        >
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
                  <el-option label="部分入库" value="partial" />
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
                  <el-option label="采购入库" value="purchase" />
                  <el-option label="退货入库" value="return" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-date-picker
                  v-model="searchForm.startDate"
                  type="date"
                  placeholder="年/月/日"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-date-picker
                  v-model="searchForm.endDate"
                  type="date"
                  placeholder="年/月/日"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-input
                  v-model.trim="searchForm.keyword"
                  placeholder="入库单号/供应商"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-button type="primary" @click="handleCommand('add')"
                  >新增入库单</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 表格 - 完全兼容你们项目的 CommonTable -->
      <CommonTable
        ref="tableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onPageChange"
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
              >继续入库</el-button
            >
            <el-button
              v-if="row.status === 'audited'"
              link
              type="primary"
              @click="handleStart(row)"
              >开始入库</el-button
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

    <!-- 新增入库弹窗 -->
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
            <CustomDivider title="入库基础信息"></CustomDivider>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="入库单编号" prop="">
              <el-input
                placeholder="可不填写，自动生成"
                v-model="formData.code"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="入库单类型" required prop="">
              <el-select
                placeholder="请选择入库类别"
                v-model="formData.inventoryType"
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
            <el-form-item
              label="供应商编号"
              prop=""
              required
              @click="toggleGong"
            >
              <el-input
                placeholder="供应商编号"
                v-model="formData.supplierCode"
              >
                <template #append>
                  <el-icon class="toggle"><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供应商名称" prop="">
              <el-input
                placeholder="请输入供应商名称"
                v-model="formData.supplierName"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供应商联系人" required prop="">
              <el-input
                placeholder="请输入供应商联系人"
                v-model="formData.supplierContacts"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="供应商联系方式" required prop="">
              <el-input
                placeholder="请输入供应商联系方式"
                v-model="formData.supplierPhone"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="18">
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
          <CustomDivider title="入库物料信息"></CustomDivider>
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
          <el-table-column label="入库数量" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.quantity"
                placeholder="请输入入库数量"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="仓库" min-width="120" prop="warehouseName" />
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
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";
import CustomDivider from "@/components/CustomDivider/index.vue";
import {
  Plus,
  View,
  Delete,
  EditPen,
  Search,
  Connection,
} from "@element-plus/icons-vue";
import SupplierCustomerSelectDialog from "@/components/SupplierCustomerSelectDialog/index.vue";
import WarehouseProductSelectDialog from "@/components/WarehouseProductSelectDialog/index.vue";

const searchForm = reactive({
  status: "",
  type: "",
  startDate: "",
  endDate: "",
  keyword: "",
});

// 状态映射（颜色完全对齐截图）
const getStatusText = (status) => {
  const map = {
    completed: "已完成",
    partial: "部分入库",
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

// 表格核心数据（必须和你们 CommonTable 要求的结构完全一致）
const state = reactive({
  tableData: {
    data: [
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 100,
        status: "completed",
      },
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 80,
        status: "partial",
      },
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 0,
        status: "audited",
      },
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 0,
        status: "pending",
      },
    ],
    header: [
      { key: "id", title: "入库单号", width: 160, isCheck: true },
      { key: "type", title: "入库类型", isCheck: true },
      { key: "supplier", title: "供应商", minWidth: 220, isCheck: true },
      { key: "planDate", title: "预计入库日期", width: 140, isCheck: true },
      {
        key: "totalQty",
        title: "总数量",
        width: 100,
        align: "center",
        isCheck: true,
      },
      {
        key: "inQty",
        title: "已入库数量",
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

const handleContinue = (row) => {
  ElMessage.success(`继续入库：${row.id}`);
};

const handleStart = (row) => {
  ElMessage.success(`开始入库：${row.id}`);
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

// ========== 新增入库弹框相关代码 ==========
// 弹窗相关
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
  inventoryType: null,
  orderId: 0,
  orderCode: "",
  products: [],
  remark: "",
  supplierContacts: "",
  supplierId: 0,
  supplierCode: "",
  supplierName: "",
  supplierPhone: "",
});

const handleCommand = async (command, row) => {
  if (command === "add") {
    dialogProps.value = {
      isView: false,
      isAudit: false,
      title: "新增入库单",
    };
    formData.value = {
      code: "",
      id: 0,
      inventoryType: null,
      orderId: 0,
      orderCode: "",
      products: [],
      remark: "",
      supplierContacts: "",
      supplierId: 0,
      supplierCode: "",
      supplierName: "",
      supplierPhone: "",
    };
    dialogVisible.value = true;
  } else if (command === "edit") {
    dialogProps.value = {
      isView: false,
      isAudit: false,
      title: "编辑入库单",
    };
    // 模拟获取详情数据
    formData.value = {
      code: row.id,
      id: 1,
      inventoryType: "purchase",
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
      remark: "测试入库单",
      supplierContacts: "张经理",
      supplierId: 1,
      supplierCode: "SUP001",
      supplierName: row.supplier,
      supplierPhone: "13800138000",
    };
    dialogVisible.value = true;
  } else if (command === "view") {
    dialogProps.value = {
      isView: true,
      isAudit: false,
      title: "查看入库单",
    };
    // 模拟获取详情数据
    formData.value = {
      code: row.id,
      id: 1,
      inventoryType: "purchase",
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
      remark: "测试入库单",
      supplierContacts: "张经理",
      supplierId: 1,
      supplierCode: "SUP001",
      supplierName: row.supplier,
      supplierPhone: "13800138000",
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
        // 模拟保存入库单
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
  // 将已选择的物料转换为MaterialSelectDialog需要的格式
  defaultSelected.value = formData.value.products.map((item) => ({
    id: item.productId,
    code: item.productCode,
    name: item.productName,
    specifications: "",
    unitName: "",
    brand: "",
    importantParts: 0,
    externalCode: "",
    internalCode: "",
  }));

  showMaterialSelect.value = true;
};

const onMaterialSelect = (data) => {
  // 遍历选择的物料
  data.forEach(async (item) => {
    // 检查是否已存在相同productId的物料
    const exists = formData.value.products.some((product) => {
      return product.productId === item.productId;
    });
    // 如果不存在，则添加新物料
    if (!exists) {
      formData.value.products.push({
        batch: "", // 批次，默认为空
        price: item.productPrice || 0, // 价格，如果没有则默认为0
        productId: item.productId, // 物料ID
        quantity: 0, // 数量默认为0
        warehouseId: item.warehouseId, // 仓库ID默认为0
        // 添加额外的显示字段，方便表格展示
        productName: item.productName,
        productCode: item.productCode,
        warehouseName: item.warehouseName,
      });
    }
  });

  showMaterialSelect.value = false;
};

// 供应商相关
const showSupplierCustomer = ref(false);
const toggleGong = () => {
  if (dialogProps.value.isView) {
    return;
  }
  showSupplierCustomer.value = true;
};

const onSupplierCustomerSelect = (data) => {
  formData.value.supplierId = data.id;
  formData.value.supplierCode = data.code;
  formData.value.supplierContacts = data.firstName;
  formData.value.supplierPhone = data.firstPhone;
  formData.value.supplierName = data.name;
};

// 获取入库单类型
const storeType = ref([
  { category: "purchase", categoryName: "采购入库" },
  { category: "return", categoryName: "退货入库" },
  { category: "transfer", categoryName: "调拨入库" },
  { category: "other", categoryName: "其他入库" },
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
  // 模拟获取订单列表数据
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
.inbound-padding {
  padding: 18px;
}

// 顶部统计卡片 - 完全复刻你们系统风格
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

.search-container {
  margin-bottom: 16px;
}

.table-operate-btn {
  margin-bottom: 12px;
  text-align: right;
}

.table-demo {
  height: calc(100vh - 300px);
}

.operateBox .warning-btn {
  color: #e6a23c !important;
}

// 新增入库弹窗样式
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
</style>

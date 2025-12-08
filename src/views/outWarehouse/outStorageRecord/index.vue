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
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item label="操作时间">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item label="入库单号">
                <el-input
                  placeholder="请输入入库单号"
                  v-model.trim="searchForm.inboundNo"
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
      </CommonTable>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";

// ==================== 数据结构 ====================
const state = reactive({
  tableData: {
    data: [
      {
        inboundNo: "IN-2025-001",
        materialCode: "W-2025-001",
        materialName: "电阻器",
        specification: "10KΩ 0.25W",
        unit: "个",
        quantity: 100,
        operationType: "货物接收",
        location: "-",
      },
      {
        inboundNo: "IN-2025-001",
        materialCode: "W-2025-001",
        materialName: "轴承",
        specification: "25×52×15",
        unit: "套",
        quantity: 100,
        operationType: "货位分配",
        location: "L1-A2-L2",
      },
      {
        inboundNo: "IN-2025-001",
        materialCode: "W-2025-001",
        materialName: "纸箱",
        specification: "30×20×15cm",
        unit: "个",
        quantity: 100,
        operationType: "货物接收",
        location: "-",
      },
      {
        inboundNo: "IN-2025-001",
        materialCode: "W-2025-001",
        materialName: "纸箱",
        specification: "30×20×15cm",
        unit: "个",
        quantity: 100,
        operationType: "货位分配",
        location: "L1-A2-L2",
      },
    ],
    header: [
      { key: "inboundNo", title: "入库单号", type: "text", isCheck: true },
      { key: "materialCode", title: "物料编码", type: "text", isCheck: true },
      { key: "materialName", title: "物料名称", type: "text", isCheck: true },
      { key: "specification", title: "规格型号", type: "text", isCheck: true },
      { key: "unit", title: "单位", type: "text", isCheck: true },
      { key: "quantity", title: "数量", type: "text", isCheck: true },
      { key: "operationType", title: "操作类型", type: "text", isCheck: true },
      { key: "location", title: "货位", type: "text", isCheck: true },
    ],
    config: {
      total: 4,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: false,
      isOperate: false,
      operateWidth: "80",
      isImport: true,
    },
    param: { pageNum: 1, pageSize: 10 },
    printName: "入库单查询",
  },
});

// ==================== 搜索 ====================
const searchForm = reactive({
  keyword: "",
  dateRange: [],
  inboundNo: "",
});

// 搜索处理
const handleSearch = () => {
  state.tableData.param.pageNum = 1;
  getTableData();
};

// 重置处理
const handleReset = () => {
  searchForm.keyword = "";
  searchForm.dateRange = [];
  searchForm.inboundNo = "";
  state.tableData.param.pageNum = 1;
  getTableData();
};

// 查看详情
const handleView = (row) => {
  console.log("查看行数据:", row);
  ElMessage.info(`查看入库单: ${row.inboundNo}`);
  // 这里可以打开详情弹窗或跳转到详情页面
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

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.anomaly-padding {
  padding: 18px;
}
.table-demo {
  height: calc(100vh - 181px);
}
</style>

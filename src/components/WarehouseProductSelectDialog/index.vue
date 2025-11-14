<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    class="warehouse-product-select-dialog add-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <div class="warehouse-product-select-container">
      <!-- 左侧分类树 -->
      <div class="category-tree" v-if="showCategoryTree">
        <div class="tree-top-block">
          <span class="tree-top-title">{{ categoryTitle }}</span>
        </div>
        <div class="filter-input">
          <el-input
            placeholder="请输入仓库分类名称"
            v-model.trim="warehouseTreeFilter"
            clearable
            size="default"
            :suffix-icon="Search"
          />
        </div>
        <el-tree
          ref="warehouseTreeRef"
          :data="warehouseTreeData"
          :props="categoryProps"
          :highlight-current="true"
          :expand-on-click-node="false"
          :default-expand-all="true"
          node-key="id"
          @node-click="handleCategorySelect"
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <span class="node-content">
                <el-icon
                  style="
                    margin-right: 10px;
                    font-size: 18px;
                    color: darkgoldenrod;
                  "
                >
                  <Folder />
                </el-icon>
                {{ data.name }}
              </span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧物料列表 -->
      <div class="product-list" :class="{ 'full-width': !showCategoryTree }">
        <div class="search-bar">
          <el-input
            v-model="productSearchKeyword"
            :placeholder="searchPlaceholder"
            :suffix-icon="Search"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <el-table
          ref="productTableRef"
          :data="productTableData"
          style="width: 100%"
          @selection-change="handleProductSelectionChange"
          class="product-table"
          v-loading="loading"
          :height="tableHeight"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="checkSelectable"
          />
          <el-table-column
            prop="productCode"
            label="物料编码"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="productName"
            label="物料名称"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="productPrice"
            label="物料单价"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="productSpecifications"
            label="规格型号"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="warehouseName"
            label="仓库名称"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="quantity"
            label="库存数量"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="inQuantity"
            label="入库数量"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="outQuantity"
            label="出库数量"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="lockQuantity"
            label="锁定库存"
            width=""
            show-overflow-tooltip
          />
          <el-table-column
            prop="createTime"
            label="入库时间"
            width=""
            show-overflow-tooltip
          />
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <div class="selected-products">
      <span>已选择 {{ selectedRows.length }} 个物料</span>
      <span v-if="maxSelection > 0">(最多可选 {{ maxSelection }} 项)</span>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  getWarehouseTree,
  getWarehouseProducts,
} from "@/api/warehouseManage/warehouse";

const props = defineProps({
  title: {
    type: String,
    default: "选择仓库物料",
  },
  width: {
    type: String,
    default: "80%",
  },
  selectionMode: {
    type: String,
    default: "single",
    validator: (value) => ["single", "multiple"].includes(value),
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  maxSelection: {
    type: Number,
    default: 0, // 0 表示不限制
  },
  showCategoryTree: {
    type: Boolean,
    default: true,
  },
  categoryTitle: {
    type: String,
    default: "仓库分类",
  },
  searchPlaceholder: {
    type: String,
    default: "请输入物料名称搜索",
  },
  tableHeight: {
    type: String,
    default: "450px",
  },
  defaultSelected: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

// 计算属性处理v-model
const dialogVisible = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

// 数据相关
const warehouseTreeFilter = ref("");
const productSearchKeyword = ref("");
const warehouseTreeData = ref([]);
const productTableData = ref([]);
const selectedRows = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const warehouseTreeRef = ref();
const productTableRef = ref();
const currentCategoryId = ref(0);
const warehouseCurrentNode = ref(null);

// 分类树配置
const categoryProps = {
  label: "name",
  children: "children",
};

// 检查是否可选
const checkSelectable = () => {
  return true;
};

// 获取分类树数据
const getWarehouseTreeData = async () => {
  try {
    const params = {
      id: 0,
      name: warehouseTreeFilter.value,
    };
    const res = await getWarehouseTree(params);
    if (res.code === 200) {
      warehouseTreeData.value = res.data;
      // 只有在没有选中节点时才自动选中第一个节点
      if (
        warehouseTreeData.value &&
        warehouseTreeData.value.length > 0 &&
        !currentCategoryId.value
      ) {
        const firstNode = warehouseTreeData.value[0];
        warehouseCurrentNode.value = firstNode;
        currentCategoryId.value = firstNode.id;
        // 设置树形控件选中状态
        warehouseTreeRef.value?.setCurrentKey(firstNode.id);
        // 获取表格数据
        loadTableData();
      }
    } else {
      ElMessage.error(res.message || "获取仓库分类失败");
    }
  } catch (error) {
    console.error("获取仓库分类失败:", error);
    ElMessage.error("获取仓库分类失败");
  }
};

// 加载表格数据
const loadTableData = async () => {
  if (!currentCategoryId.value) {
    ElMessage.warning("请先选择仓库分类");
    return;
  }

  try {
    loading.value = true;
    const params = {
      first: 0,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      query: {
        name: productSearchKeyword.value,
        id: currentCategoryId.value,
      },
      queryid: 0,
      sort: "",
      sortField: "",
    };
    const res = await getWarehouseProducts(params);
    productTableData.value = res.data.rows;
    total.value = res.data.records;
  } catch (error) {
    console.error("获取物料列表失败:", error);
    ElMessage.error("获取物料列表失败");
  } finally {
    loading.value = false;
  }
};

// 分类选择
const handleCategorySelect = (data) => {
  currentCategoryId.value = data.id;
  warehouseCurrentNode.value = data;
  currentPage.value = 1;
  loadTableData();
};

// 表格选择改变
const handleProductSelectionChange = (rows) => {
  if (props.selectionMode === "single") {
    // 单选模式下，只保留最后选中的一项
    if (rows.length > 1) {
      const lastSelected = rows[rows.length - 1];
      productTableRef.value.clearSelection();
      productTableRef.value.toggleRowSelection(lastSelected, true);
      selectedRows.value = [lastSelected];
    } else {
      selectedRows.value = rows;
    }
  } else {
    // 多选模式下，检查是否超过最大选择数量
    if (props.maxSelection > 0 && rows.length > props.maxSelection) {
      ElMessage.warning(`最多只能选择 ${props.maxSelection} 项`);
      // 移除最后选中的项
      const lastSelected = rows[rows.length - 1];
      productTableRef.value.toggleRowSelection(lastSelected, false);
      selectedRows.value = rows.slice(0, props.maxSelection);
    } else {
      selectedRows.value = rows;
    }
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadTableData();
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadTableData();
};

// 关闭弹框
const handleClose = () => {
  dialogVisible.value = false;
  productSearchKeyword.value = "";
  warehouseTreeFilter.value = "";
  selectedRows.value = [];
  currentPage.value = 1;
  if (productTableRef.value) {
    productTableRef.value.clearSelection();
  }
};

// 确认选择
const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择物料");
    return;
  }

  if (props.selectionMode === "single" && selectedRows.value.length > 1) {
    ElMessage.warning("单选模式下只能选择一项");
    return;
  }

  if (
    props.maxSelection > 0 &&
    selectedRows.value.length > props.maxSelection
  ) {
    ElMessage.warning(`最多只能选择 ${props.maxSelection} 项`);
    return;
  }

  // 根据模式返回不同格式的数据
  const result =
    props.selectionMode === "single"
      ? selectedRows.value[0]
      : selectedRows.value;
  emit("confirm", result);
  handleClose();
};

// 监听弹框显示
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      loadTableData();
      // 如果有默认选中项，设置选中状态
      if (props.defaultSelected && props.defaultSelected.length > 0) {
        nextTick(() => {
          // 在表格数据加载完成后设置选中状态
          productTableData.value.forEach((row) => {
            const found = props.defaultSelected.find(
              (item) => item.id === row.productId
            );
            if (found) {
              productTableRef.value?.toggleRowSelection(row, true);
              selectedRows.value.push(row);
            }
          });
        });
      }
    }
  }
);

// 监听表格数据变化，重新设置选中状态
watch(
  () => productTableData.value,
  () => {
    if (props.defaultSelected && props.defaultSelected.length > 0) {
      nextTick(() => {
        productTableData.value.forEach((row) => {
          const found = props.defaultSelected.find(
            (item) => item.id === row.productId
          );
          if (found) {
            productTableRef.value?.toggleRowSelection(row, true);
            if (!selectedRows.value.find((item) => item.id === row.productId)) {
              selectedRows.value.push(row);
            }
          }
        });
      });
    }
  }
);

// 监听搜索关键词变化
watch(productSearchKeyword, () => {
  loadTableData();
});

// 监听分类过滤变化
watch(warehouseTreeFilter, () => {
  getWarehouseTreeData();
});

// 初始化
onMounted(() => {
  getWarehouseTreeData();
});
</script>

<style scoped lang="scss">
.warehouse-product-select-container {
  display: flex;
  gap: 20px;
  height: 600px;

  .category-tree {
    width: 250px;
    border-right: 1px solid var(--el-border-color-light);
    padding-right: 20px;

    .tree-top-block {
      margin-bottom: 16px;

      .tree-top-title {
        font-size: 16px;
        font-weight: bold;
      }
    }

    .filter-input {
      margin-bottom: 16px;
    }
  }

  .product-list {
    flex: 1;
    display: flex;
    flex-direction: column;

    &.full-width {
      width: 100%;
    }

    .search-bar {
      margin-bottom: 16px;
    }

    .product-table {
      flex: 1;
    }
  }
}

.selected-products {
  margin-top: 16px;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-secondary);
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="800px"
    destroy-on-close
    @close="handleClose"
    class="add-dialog"
  >
    <div class="table-search-container">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="table-form"
      >
        <el-row :gutter="35">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入供应商名称"
                clearable
                :suffix-icon="Search"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <el-table
      ref="tableRef"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      height="450"
      v-loading="loading"
      border
      :cell-style="{ textAlign: 'center' }"
      :header-cell-style="{ 'text-align': 'center' }"
    >
      <el-table-column
        v-if="multiple"
        type="selection"
        width="55"
        :selectable="checkSelectable"
      />
      <el-table-column
        v-else
        type="selection"
        width="55"
        :selectable="checkSelectable"
        :reserve-selection="false"
      />
      <el-table-column
        prop="code"
        label="供应商编号"
        width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="name"
        label="供应商名称"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column prop="secondName" label="联系人" show-overflow-tooltip />
      <el-table-column
        prop="secondPhone"
        label="联系电话"
        show-overflow-tooltip
      />
      <el-table-column prop="address" label="地址" show-overflow-tooltip />
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="js">
import { ref, watch, nextTick, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { getSupplierList } from "@/api/baseData/supplier";

onMounted(() => {
  getSupplierData();
});


const props = defineProps({
  title: {
    type: String,
    default: "选择供应商",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  defaultSelected: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: [Number, String, null],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const searchForm = ref({
  keyword: "",
});
const tableData = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const selectedRows = ref([]);
const tableRef = ref();

const dialogVisible = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    // 名称默认为modelValue
    emit("update:modelValue", value);
  },
});

// 监听modelValue属性变化
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      // 打开弹框时加载数据
      await getSupplierData();

      // 如果有selectedId,找到对应行并选中
      if (props.selectedId) {
        const selectedRow = tableData.value.find(
          (item) => item.id === props.selectedId
        );
        if (selectedRow) {
          nextTick(() => {
            tableRef.value?.toggleRowSelection(selectedRow, true);
          });
        }
      }
    }
  }
);

// 加载数据
const getSupplierData = async () => {
  loading.value = true;
  const params = {
    first: 0,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    query: {
      address: "",
      batchNum: "",
      code: 0,
      creditCode: "",
      email: "",
      enabled: 0,
      englishName: "",
      firstEmail: "",
      firstName: "",
      firstPhone: "",
      grade: null,
      id: 0,
      introduction: "",
      logo: "",
      name: searchForm.value.keyword,
      phone: "",
      remark: "",
      secondEmail: "",
      secondName: "",
      secondPhone: "",
      shortName: "",
      website: "",
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  const res = await getSupplierList(params);
  tableData.value = res.data.rows;
  total.value = res.data.records;
  loading.value = false;
};

watch(searchForm.value, () => {
  getSupplierData();
});

// 选择改变
const handleSelectionChange = (rows) => {
  if (!props.multiple && rows.length > 1) {
    // 单选模式下，只保留最后选中的一项
    const lastSelected = rows[rows.length - 1];
    tableRef.value.clearSelection();
    tableRef.value.toggleRowSelection(lastSelected, true);
    selectedRows.value = [lastSelected];
  } else {
    selectedRows.value = rows;
  }
};

// 检查是否可选
const checkSelectable = () => {
  return true;
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getSupplierData();
};

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getSupplierData();
};

// 关闭弹框
const handleClose = () => {
  emit("update:modelValue", false);
  searchForm.value.keyword = "";
  selectedRows.value = [];
  currentPage.value = 1;
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
};

// 确认选择
const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择供应商");
    return;
  }
  emit("confirm", props.multiple ? selectedRows.value : selectedRows.value[0]);
  handleClose();
};
</script>

<style scoped lang="scss">
.table-search-container {
  .table-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-table) {
  .el-table__header th {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
}
</style>

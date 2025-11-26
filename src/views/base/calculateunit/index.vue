<template>
  <div class="unit-container layout-padding">
    <div class="unit-padding layout-padding-view layout-padding-auto">
      <div class="search-container">
        <el-form ref="searchFormRef" :model="searchForm" class="table-form">
          <el-row :gutter="35">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="keyword" label="单位名称">
                <el-input
                  placeholder="请输入单位名称"
                  v-model.trim="searchForm.keyword"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              :xl="5"
              class="operate-box"
            >
              <el-form-item>
                <el-button type="primary" :icon="Plus" @click="addFn"
                  >新增</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <CommonTable
        ref="tableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onTablePageChange"
        @sortHeader="onSortHeader"
      >
        <template #operate="{ row }">
          <div class="operateBox">
            <el-button text type="primary" @click="putFn(row)">编辑</el-button>
            <el-button text type="danger" @click="deleteFn(row)"
              >删除</el-button
            >
          </div>
        </template>
      </CommonTable>
    </div>

    <!-- 新增/编辑弹框 -->
    <el-dialog
      v-model="showDialog"
      :title="dynamicTitle"
      @close="closeDialog"
      width="600"
      class="add-dialog"
    >
      <el-form
        :model="unitForm"
        :rules="rules"
        ref="unitRefForm"
        label-width="auto"
      >
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="编码" prop="code">
              <el-input v-model="unitForm.code" placeholder="请输入编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位名称" prop="name">
              <el-input v-model="unitForm.name" placeholder="请输入单位名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="是否主单位" prop="isMain">
              <el-switch
                v-model="unitForm.isMain"
                :inactive-value="0"
                :active-value="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态" prop="enabled">
              <el-switch
                v-model="unitForm.enabled"
                :inactive-value="0"
                :active-value="1"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="unitForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitFn">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  getUnitList,
  addOrEditUnit,
  deleteUnit,
  getUnitDetail,
} from "@/api/baseData/unit";
import CommonTable from "@/components/CommonTable/index.vue";

const tableRef = ref();
const state = reactive({
  tableData: {
    data: [],
    header: [
      { key: "code", colWidth: "", title: "编码", type: "text", isCheck: true },
      { key: "name", colWidth: "", title: "单位", type: "text", isCheck: true },
      {
        key: "enabled",
        colWidth: "",
        title: "状态",
        type: "text",
        isCheck: true,
        status: "start",
      },
      {
        key: "isMain",
        colWidth: "",
        title: "是否主单位",
        type: "text",
        isCheck: true,
        status: "are",
      },
      {
        key: "remark",
        colWidth: "",
        title: "备注",
        type: "text",
        isCheck: true,
      },
    ],
    config: {
      total: 0,
      loading: true,
      isBorder: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
    },
    param: {
      pageNum: 1,
      pageSize: 10,
    },
    printName: "单位",
  },
});
const showDialog = ref(false);
const unitForm = ref({
  code: "",
  enabled: 0,
  id: 0,
  isMain: 0,
  name: "",
  remark: "",
});
const rules = ref({
  name: [
    { required: true, message: "单位不能为空", trigger: ["blur", "change"] },
  ],
});
const unitRefForm = ref();
const searchForm = reactive({
  keyword: "",
});
const searchFormRef = ref();

const getTableData = async () => {
  const params = {
    first: 0,
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    query: {
      code: "",
      enabled: 0,
      id: 0,
      isMain: 0,
      name: searchForm.keyword,
      remark: "",
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  state.tableData.config.loading = true;
  const res = await getUnitList(params);
  state.tableData.data = res.data.rows;
  state.tableData.config.total = res.data.records;
  state.tableData.config.loading = false;
};

const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const onSortHeader = (data) => {
  state.tableData.header = data;
};

const addFn = () => {
  showDialog.value = true;
};

const putFn = async (data) => {
  const res = await getUnitDetail({ id: data.id });
  showDialog.value = true;
  unitForm.value = res.data;
};

const deleteFn = (data) => {
  ElMessageBox.confirm("您确定删除此单位吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteUnit({ id: data.id });
      ElMessage({
        type: "success",
        message: "删除成功",
      });
      getTableData();
    })
    .catch(() => {
      ElMessage({
        type: "success",
        message: "已取消删除",
      });
    });
};

const closeDialog = () => {
  if (!unitRefForm.value) return;
  unitForm.value = {
    code: "",
    enabled: 0,
    id: 0,
    isMain: 0,
    name: "",
    remark: "",
  };
  unitRefForm.value.resetFields();
  showDialog.value = false;
};

const submitFn = () => {
  if (!unitRefForm.value) return;
  unitRefForm.value.validate(async (valid) => {
    if (!valid) return;
    if (unitForm.value.id) {
      await addOrEditUnit(unitForm.value);
      ElMessage.success("编辑单位成功");
    } else {
      await addOrEditUnit(unitForm.value);
      ElMessage.success("新增单位成功");
    }
    getTableData();
    closeDialog();
  });
};

const dynamicTitle = computed(() => {
  return unitForm.value.id ? "编辑单位" : "新增单位";
});

watch(searchForm, () => {
  getTableData();
});

onMounted(() => {
  getTableData();
});
</script>

<style scoped lang="scss">
.unit-padding {
  padding: 15px;

  .table-demo {
    height: calc(100vh - 185px);
  }
}
</style>

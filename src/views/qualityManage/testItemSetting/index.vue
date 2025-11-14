<template>
  <div class="order-container layout-padding">
    <div class="order-padding layout-padding-view layout-padding-auto">
      <div class="operate-wrapper">
        <el-form
          ref="ruleFormRef"
          :model="searchForm"
          class="table-form"
          label-width="auto"
        >
          <el-row :gutter="35">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="keyword" label="检验项编码：">
                <el-input
                  placeholder="请输入检验项编码"
                  v-model.trim="searchForm.code"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="keyword" label="检验项名称：">
                <el-input
                  placeholder="请输入检验项名称"
                  v-model.trim="searchForm.name"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="keyword" label="检验项类型：">
                <el-select
                  v-model="searchForm.type"
                  placeholder="请选择检验项类型"
                  size="large"
                  style="width: 240px"
                  clearable
                >
                  <el-option
                    v-for="item in testItemOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              :xl="5"
              style="display: flex; align-items: center"
            >
              <el-button type="primary" @click="handleAdd" :icon="Plus"
                >新增</el-button
              >
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="table-wrapper">
        <CommonTable
          ref="commonTableRef"
          v-bind="state.tableData"
          class="table-demo"
          @pageChange="onTablePageChange"
          @sortHeader="onSortHeader"
        >
          <template #operate="{ row }">
            <div class="operateBox no-print">
              <el-button text type="primary" @click="handleEdit(row)"
                >编辑</el-button
              >
              <el-button text type="danger" @click="handleDelete(row)"
                >删除</el-button
              >
            </div>
          </template>
        </CommonTable>
      </div>
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="700px"
      @close="dialogVisible = false"
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="auto"
      >
        <el-row :gutter="35">
          <el-col :span="12" class="mb20">
            <el-form-item label="检验项编码" prop="code">
              <el-input
                v-model="form.code"
                placeholder="请输入检验项编码"
                disabled
              /> </el-form-item
          ></el-col>
          <el-col :span="12" class="mb20"
            ><el-form-item label="检验项名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入检验项名称"
              ></el-input> </el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="12" class="mb20"
            ><el-form-item label="检验项类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择检验项类型">
                <el-option
                  v-for="item in testItemOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="12" class="mb20">
            <el-form-item label="检验工具">
              <el-input
                v-model="form.tool"
                placeholder="请输入检验工具"
              ></el-input> </el-form-item
          ></el-col>
        </el-row>
        <el-row :gutter="35">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                type="textarea"
                v-model="form.remark"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";
import {
  autoGetCode,
  getTestItemList,
  addOrEditTestItem,
  deleteTestItem,
  getTestItemDetail,
} from "@/api/quality/testItem";
import { getDefectBaseData } from "@/api/quality/defeckManage";

// 一 searchForm
const searchForm = reactive({
  code: "",
  name: "",
  type: "",
});

// 二 table
const commonTableRef = ref();
const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "code",
        colWidth: "",
        title: "检验项编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "name",
        colWidth: "",
        title: "检验项名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "typeStr",
        colWidth: "",
        title: "检验项类型",
        type: "text",
        isCheck: true,
      },
      {
        key: "tool",
        colWidth: "",
        title: "检验工具",
        type: "text",
        isCheck: true,
      },
    ],
    config: {
      total: 2,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      operateWidth: "150",
    },
    param: {
      pageNum: 1,
      pageSize: 10,
    },
  },
});

// 获取表格数据
const getTableData = async () => {
  state.tableData.config.loading = true;
  try {
    const params = {
      first: 0,
      pageNum: state.tableData.param.pageNum,
      pageSize: state.tableData.param.pageSize,
      query: {
        code: searchForm.code,
        id: 0,
        name: searchForm.name,
        remark: "",
        tool: "",
        type: searchForm.type,
        typeStr: "",
      },
      queryid: 0,
      sort: "",
      sortField: "",
    };
    const res = await getTestItemList(params);
    state.tableData.data = res.data.rows || [];
    state.tableData.config.total = res.data.records || 0;
  } catch (error) {
    console.error("获取检验项列表失败", error);
  } finally {
    state.tableData.config.loading = false;
  }
};

// 分页改变时回调
const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

// 拖动显示列排序回调
const onSortHeader = (data) => {
  state.tableData.header = data;
};

// 四 dialog
const dialogVisible = ref(false);
const dialogTitle = ref("新增常见缺陷");
const formRef = ref();
const form = ref({
  code: "",
  id: 0,
  name: "",
  remark: "",
  tool: "",
  type: "",
  typeStr: "",
});
// 检验项类型选项
const testItemOptions = ref([]);

// 删除检验项
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该检验项吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteTestItem({ id: row.id });
    ElMessage.success("删除成功");
    getTableData();
  } catch (error) {
    console.error("删除失败", error);
  }
};

// 打开新增弹窗
const handleAdd = async () => {
  dialogTitle.value = "新增检验项";
  dialogVisible.value = true;
  form.value = {
    code: "",
    id: 0,
    name: "",
    remark: "",
    tool: "",
    type: "",
    typeStr: "",
  };

  // 自动获取编码
  try {
    const res = await autoGetCode({});
    form.value.code = res.data || "";
  } catch (error) {
    console.error("获取编码失败", error);
  }
};

// 打开编辑弹窗
const handleEdit = async (row) => {
  dialogTitle.value = "编辑检验项";
  dialogVisible.value = true;
  const res = await getTestItemDetail({ id: row.id });
  form.value = res.data;
};

// 表单验证规则
const formRules = ref({
  code: [{ required: true, message: "请输入检验项编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入检验项名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择检验项类型", trigger: "blur" }],
});

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addOrEditTestItem(form.value);
        ElMessage.success("保存成功");
        dialogVisible.value = false;
        getTableData();
      } catch (error) {
        console.error("保存失败", error);
      }
    }
  });
};

// 获取基础数据
const getBaseData = async () => {
  const res = await getDefectBaseData({ code: 2 });
  testItemOptions.value = res.data || [];
};

watch(searchForm, () => {
  getTableData();
});

onMounted(() => {
  getBaseData();
  getTableData();
});
</script>

<style scoped lang="scss">
.order-container {
  .order-padding {
    padding: 15px;

    .operate-wrapper {
      :deep(.el-button span) {
        margin-left: 0;
      }
    }

    .table-demo {
      height: calc(100vh - 180px);
    }
  }
}
</style>

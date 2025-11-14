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
              <el-form-item prop="name" label="缺陷描述：">
                <el-input
                  placeholder="请输入缺陷描述"
                  v-model.trim="searchForm.name"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="type" label="检验项类型：">
                <el-select
                  v-model="searchForm.type"
                  placeholder="请选择检验项类型"
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
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
              <el-form-item prop="level" label="缺陷等级：">
                <el-select
                  v-model="searchForm.level"
                  placeholder="请选择缺陷等级"
                  style="width: 240px"
                  clearable
                >
                  <el-option
                    v-for="item in defectRankOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
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
              <PopoverButton
                :componentOption="{
                  tip: '删除后无法恢复，请谨慎操作！',
                  width: '',
                  svgIcon: 'ele-WarningFilled',
                  popoverclass: 'is-danger',
                  svgStyle: '',
                  svgIconLeft: '',
                  svgIconRight: '',
                  label: '删除',
                  type: 'danger',
                  size: '',
                  plain: true,
                }"
                @deleteCameraEvent="handleDelete(row)"
              />
            </div>
          </template>
        </CommonTable>
      </div>
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="dialogVisible = false"
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="auto"
      >
        <el-form-item label="缺陷描述" prop="content">
          <el-input v-model="form.content" placeholder="请输入缺陷描述" />
        </el-form-item>
        <el-form-item label="检验项类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择检验项类型">
            <el-option
              v-for="item in testItemOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="缺陷等级" prop="defectLevel">
          <el-select v-model="form.defectLevel" placeholder="请选择缺陷等级">
            <el-option
              v-for="item in defectRankOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import CommonTable from "@/components/CommonTable/index.vue";
import PopoverButton from "@/components/PopoverButton/index.vue";
import { ElMessage } from "element-plus";
import {
  getDefectBaseData,
  getDefectList,
  addOrEditDefect,
  deleteDefect,
  getDefectDetail,
} from "@/api/quality/defeckManage";

// 一 searchForm
const searchForm = reactive({
  name: "",
  type: "",
  level: "",
});

// 监听表单变化，自动查询
watch(
  searchForm,
  () => {
    getTableData();
  },
  { deep: true }
);

// 二 table
const commonTableRef = ref();
const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "content",
        colWidth: "",
        title: "缺陷描述",
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
        key: "defectLevelStr",
        colWidth: "",
        title: "缺陷等级",
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
const getTableData = async () => {
  state.tableData.config.loading = true;
  const params = {
    first: 0,
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    query: {
      content: searchForm.name,
      defectLevel: searchForm.level,
      defectLevelStr: "",
      id: 0,
      type: searchForm.type,
      typeStr: "",
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  const res = await getDefectList(params);
  state.tableData.data = res.data.rows;
  state.tableData.config.total = res.data.records;
  state.tableData.config.loading = false;
};

// 三 operate

// 四 dialog
const dialogVisible = ref(false);
const dialogTitle = ref("新增常见缺陷");
const formRef = ref();
const form = ref({
  content: "",
  defectLevel: "",
  defectLevelStr: "",
  id: 0,
  type: "",
  typeStr: "",
});

// 打开新增弹窗
const handleAdd = () => {
  dialogTitle.value = "新增常见缺陷";
  dialogVisible.value = true;
  form.value = {
    content: "",
    defectLevel: "",
    defectLevelStr: "",
    id: 0,
    type: "",
    typeStr: "",
  };
};

// 打开编辑弹窗
const handleEdit = async (row) => {
  dialogTitle.value = "编辑常见缺陷";
  try {
    const res = await getDefectDetail({ id: row.id });
    form.value = res.data;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取详情失败");
  }
};

// 删除
const handleDelete = async (row) => {
  try {
    await deleteDefect({ id: row.id });
    ElMessage.success("删除成功");
    getTableData();
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

// 表单验证规则
const formRules = ref({
  content: [{ required: true, message: "请输入缺陷描述", trigger: "change" }],
  type: [{ required: true, message: "请选择检验项类型", trigger: "change" }],
  defectLevel: [
    { required: true, message: "请选择缺陷等级", trigger: "change" },
  ],
});

// 表单提交
const handleSubmit = async () => {
  // 表单验证
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await addOrEditDefect(form.value);
        ElMessage.success(
          dialogTitle.value === "新增常见缺陷" ? "新增成功" : "编辑成功"
        );
        dialogVisible.value = false;
        getTableData();
      } catch (error) {
        ElMessage.error("操作失败");
      }
    }
  });
};

// 获取基础数据
const defectRankOptions = ref([]);
const testItemOptions = ref([]);
const getBaseData = async () => {
  const res = await getDefectBaseData({ code: 1 });
  const res2 = await getDefectBaseData({ code: 2 });
  defectRankOptions.value = res.data;
  testItemOptions.value = res2.data;
};

onMounted(() => {
  getTableData();
  getBaseData();
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

  :deep(.add-dialog) {
    max-height: 96%;
    display: flex;
    flex-flow: column;
    box-shadow: 0 0 20px -2px rgba(7, 14, 23, 0.2);
    border-radius: 8px;

    .el-dialog__header {
      display: block;
      padding: 10px;
      box-shadow: none;

      .el-dialog__title {
        font-size: 18px;
        line-height: 18px;
        color: #0e1b2e;
      }
    }

    .el-dialog__body {
      // padding-top: 0px;
      // padding-bottom: 0px;
      height: 100%;
    }

    .el-dialog__footer {
      text-align: center;
    }
  }
}
</style>

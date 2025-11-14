<template>
  <div class="task-to-inspected layout-padding">
    <div
      class="task-to-inspected-padding layout-padding-view layout-padding-auto"
    >
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :model="searchForm">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-form-item label="单据编码">
                <el-input
                  v-model="searchForm.orderNo"
                  placeholder="请输入单据编码"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="产品名称">
                <el-input
                  v-model="searchForm.materialName"
                  placeholder="请输入产品名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="检验类型">
                <el-select
                  v-model="searchForm.inspectionType"
                  placeholder="请选择检验类型"
                  clearable
                >
                  <el-option
                    v-for="item in inspectionTypeList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <CommonTable
        ref="commonTableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onTablePageChange"
        @sortHeader="onSortHeader"
      >
        <template #operate="{ row }">
          <template v-if="row.examineType === 1">
            <el-button type="primary" link @click="handleInspection(row)"
              >来料检验</el-button
            >
          </template>
          <template v-else-if="row.examineType === 2">
            <el-button type="success" link @click="handleInspection(row)"
              >过程检验</el-button
            >
          </template>
          <template v-else-if="row.examineType === 3">
            <el-button type="warning" link @click="handleInspection(row)"
              >出货检验</el-button
            >
          </template>
        </template>
      </CommonTable>
    </div>

    <!-- 检验详情弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="1200px"
      destroy-on-close
      @close="closeDialog"
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="auto"
      >
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="单据编号">
              <el-input v-model="formData.code" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品编码">
              <el-input v-model="formData.productCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产品名称">
              <el-input v-model="formData.productName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="规格型号">
              <el-input v-model="formData.specification" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检验类型">
              <el-input v-model="formData.examineTypeStr" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检验数量">
              <el-input v-model="formData.checkNum" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="合格数量" prop="qualifiedNum">
              <el-input v-model="formData.qualifiedNum" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="不合格数量" prop="unqualifiedNum">
              <el-input v-model="formData.unqualifiedNum" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 检验项表格 -->
        <el-table
          :data="formData.items"
          border
          style="width: 100%; margin-top: 20px"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          />
          <el-table-column prop="itemName" label="检验项目" min-width="150" />
          <el-table-column
            prop="requirement"
            label="检验标准"
            min-width="150"
          />
          <el-table-column prop="itemMethod" label="检验方法" min-width="150" />
          <el-table-column prop="itemTool" label="检验工具" min-width="150" />
          <el-table-column
            prop="criticalDefectNum"
            label="致命缺陷数量"
            min-width="150"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.criticalDefectNum"
                placeholder="致命缺陷数量"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="seriousDefectNum"
            label="严重缺陷数量"
            min-width="150"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.seriousDefectNum"
                placeholder="严重缺陷数量"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="minorDefectNum"
            label="轻微缺陷数量"
            min-width="150"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.minorDefectNum"
                placeholder="轻微缺陷数量"
              />
            </template>
          </el-table-column>
          <el-table-column prop="checkResult" label="检验描述" min-width="150">
            <template #default="{ row }">
              <el-input v-model="row.checkResult" placeholder="检验描述" />
            </template>
          </el-table-column>
          <el-table-column prop="checkState" label="检验结果" width="200">
            <template #default="{ row }">
              <el-select v-model="row.checkState">
                <el-option label="合格" :value="1" />
                <el-option label="不合格" :value="2" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSubmitInspection"
          :loading="submitting"
          >提交检验</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="js">
import { ref, reactive, onMounted, watch } from "vue";
import CommonTable from "@/components/CommonTable/index.vue";
import { ElMessage } from "element-plus";
import {
  getTestTaskList,
  getInspectionType,
  getTestTaskDetail,
  addOrEditTestTask,
} from "@/api/quality/testTask";

// 搜索表单
const searchForm = reactive({
  orderNo: "",
  materialName: "",
  inspectionType: "",
});

// 表格数据
const state = reactive({
  tableData: {
    data: [], // 实际数据会通过API获取
    header: [
      { key: "code", title: "单据编号", type: "text", isCheck: true },
      { key: "productCode", title: "产品编码", type: "text", isCheck: true },
      { key: "productName", title: "产品名称", type: "text", isCheck: true },
      { key: "specification", title: "规格型号", type: "text", isCheck: true },
      { key: "checkNum", title: "数量", type: "text", isCheck: true },
      { key: "examineTypeStr", title: "检验类型", type: "text", isCheck: true },
      { key: "checkStateStr", title: "状态", type: "text", isCheck: true },
    ],
    config: {
      total: 0,
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

const inspectionTypeList = ref([]);
const getInspectionTypeData = async () => {
  const res = await getInspectionType();
  inspectionTypeList.value = res.data;
};

// 弹窗相关
const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref();

const dialogTitle = ref("检验详情");

// 表单数据
const formData = ref({
  id: 8,
  code: "",
  name: "",
  productId: 0,
  productCode: "",
  productName: "",
  specification: null,
  receivedNum: null,
  checkNum: 0,
  examineType: 0,
  examineTypeStr: "",
  items: [],
  qualifiedNum: 0,
  unqualifiedNum: 0,
});
const formRules = ref({
  unqualifiedNum: [
    { required: true, message: "请输入不合格数量", trigger: "blur" },
  ],
  qualifiedNum: [
    { required: true, message: "请输入合格数量", trigger: "blur" },
  ],
});

// 表格操作方法
const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const onSortHeader = (data) => {
  state.tableData.header = data;
};

// 获取表格数据
const getTableData = async () => {
  state.tableData.config.loading = true;
  const params = {
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    first: 0,
    query: {
      code: searchForm.orderNo,
      examineType: searchForm.inspectionType,
      productsName: searchForm.materialName,
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  const res = await getTestTaskList(params);
  state.tableData.data = res.data.rows;
  state.tableData.config.total = res.data.records;
  state.tableData.config.loading = false;
};

watch(
  () => searchForm,
  () => {
    getTableData();
  },
  {
    deep: true,
  }
);

// 检验操作
const handleInspection = async (row) => {
  dialogTitle.value = `检验详情：${
    row.examineType === 1 ? "来料" : row.examineType === 2 ? "过程" : "出货"
  }检验单`;
  const res = await getTestTaskDetail({ id: row.id });
  formData.value = res.data;
  dialogVisible.value = true;
};

// 提交检验
const handleSubmitInspection = async () => {
  if (!formRef.value) return;

  // 验证是否所有检验项都已填写
  const incomplete = formData.value.items.some(
    (item) => !item.checkResult || !item.checkState
  );
  if (incomplete) {
    ElMessage.warning("请完成所有检验项的填写");
    return;
  }
  const res = await addOrEditTestTask({
    id: formData.value.id,
    inspectRemark: "",
    items: formData.value.items,
    qualifiedNum: formData.value.qualifiedNum,
    unqualifiedNum: formData.value.unqualifiedNum,
  });
  ElMessage.success("提交检验成功");
  dialogVisible.value = false;
  getTableData();
};

// 查看详情
const handleView = (row) => {
  dialogTitle.value = `检验详情：${
    row.examineType === 1 ? "来料" : row.examineType === 2 ? "过程" : "出货"
  }检验单`;
  handleInspection(row);
};

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  getInspectionTypeData();
  getTableData();
});
</script>

<style lang="scss" scoped>
.task-to-inspected-padding {
  padding: 20px;
}
</style>

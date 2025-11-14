<template>
  <div class="test-template layout-padding">
    <div class="test-template-padding layout-padding-view layout-padding-auto">
      <div class="search-area">
        <el-form
          ref="ruleFormRef"
          :model="searchForm"
          class="table-form"
          label-width="auto"
        >
          <el-row :gutter="20" justify="space-between">
            <el-col :span="4">
              <el-form-item>
                <el-input
                  v-model="searchForm.templateNo"
                  placeholder="请输入模板编号"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-input
                  v-model="searchForm.templateName"
                  placeholder="请输入模板名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检验种类：">
                <el-checkbox-group v-model="searchForm.checkTypes" clearable>
                  <el-checkbox
                    v-for="item in testTypeList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.name"
                  />
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="handleAdd">
                <el-icon> <Plus /> </el-icon>新增
              </el-button>
              <el-button type="danger" @click="batchHandleDelete">
                <el-icon> <Delete /> </el-icon>批量删除
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <CommonTable
        ref="commonTableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onTablePageChange"
        @sortHeader="onSortHeader"
        @checkboxChange="getSelectionData"
      >
        <template #operate="{ row }">
          <el-button type="primary" link @click="handleEdit(row)"
            >编辑</el-button
          >
          <el-button type="danger" link @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </CommonTable>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="1200px"
      class="add-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="auto"
        class="dialog-form"
      >
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="模板编号" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入模板编号"
                :disabled="!!formData.code"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="检验种类" prop="types">
          <el-checkbox-group v-model="formData.types">
            <el-checkbox
              v-for="item in testTypeList"
              :key="item.id"
              :value="item.id"
              :label="item.name"
            />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="formData.enabled"
            :inactive-value="0"
            :active-value="1"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>

        <!-- 检验项和物料产品区域 -->
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="检验项" name="testItems">
            <div class="table-operations" v-if="!isViewMode">
              <el-button type="primary" size="small" @click="handleAddTestItem">
                <el-icon> <Plus /> </el-icon>新增
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="batchHandleDeleteTestItem"
              >
                <el-icon> <Delete /> </el-icon>批量删除
              </el-button>
            </div>

            <el-table
              ref="testItemsTableRef"
              :data="testItemsList"
              border
              height="230"
              style="width: 100%"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 'text-align': 'center' }"
              @selection-change="handleTestItemSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column label="检验项名称" prop="itemName" />
              <el-table-column label="检验项类型" prop="itemTypeStr" />
              <el-table-column label="检验工具" prop="itemTool" />
              <el-table-column label="检验方法" prop="itemMethod" />
              <el-table-column label="标准值" prop="standardValue" />
              <el-table-column label="单位" prop="unitName" />
              <el-table-column label="误差上限" prop="upperLimit" />
              <el-table-column label="误差下限" prop="lowerLimit" />
              <el-table-column label="操作" width="150" v-if="!isViewMode">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    @click="handleEditTestItem(row)"
                    >编辑</el-button
                  >
                  <el-button
                    type="danger"
                    link
                    @click="handleDeleteTestItem(row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination
                v-model:current-page="itemListConfig.currentPage"
                v-model:page-size="itemListConfig.pageSize"
                :page-sizes="[10, 20, 30, 40]"
                :total="itemListConfig.total"
                @size-change="handleTestItemListSizeChange"
                @current-change="handleTestItemListCurrentChange"
                layout="total, sizes, prev, pager, next, jumper"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="物料产品" name="products">
            <div class="table-operations" v-if="!isViewMode">
              <el-button type="primary" size="small" @click="handleAddProduct">
                <el-icon> <Plus /> </el-icon>新增
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="batchHandleDeleteProduct"
              >
                <el-icon> <Delete /> </el-icon>批量删除
              </el-button>
            </div>

            <el-table
              ref="productsTableRef"
              :data="productsList"
              border
              height="230"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 'text-align': 'center' }"
              style="width: 100%"
              @selection-change="handleProductSelectionChange"
            >
              <el-table-column type="selection" width="55" fixed="left" />
              <el-table-column
                prop="productCode"
                label="产品物料编码"
                min-width="120"
                fixed="left"
              />
              <el-table-column
                prop="productName"
                label="产品物料名称"
                min-width="120"
                fixed="left"
              />
              <el-table-column
                prop="specification"
                label="规格型号"
                min-width="100"
              />
              <el-table-column
                prop="maxUnqualifiedNum"
                label="最大不合格数"
                min-width="120"
              />
              <el-table-column
                prop="seriousDefectNum"
                label="最大严重缺陷"
                min-width="120"
              />
              <el-table-column
                prop="minorDefectNum"
                label="最大轻微缺陷"
                min-width="120"
              />
              <el-table-column
                prop="criticalDefectNum"
                label="最大致命缺陷"
                min-width="120"
              />
              <el-table-column
                prop="generalDefectNum"
                label="最大一般缺陷"
                min-width="120"
              />
              <el-table-column prop="remark" label="备注" min-width="120" />
              <el-table-column
                label="操作"
                width="150"
                fixed="right"
                v-if="!isViewMode"
              >
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditProduct(row)"
                    >编辑</el-button
                  >
                  <el-button
                    type="danger"
                    link
                    @click="handleDeleteProduct(row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="table-pagination">
              <el-pagination
                v-model:current-page="productListConfig.currentPage"
                v-model:page-size="productListConfig.pageSize"
                :page-sizes="[10, 20, 30, 40]"
                :total="productListConfig.total"
                @size-change="handleProductListSizeChange"
                @current-change="handleProductListCurrentChange"
                layout="total, sizes, prev, pager, next, jumper"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          v-if="!isViewMode"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>

    <!-- 检验项新增/编辑弹窗 -->
    <el-dialog
      :title="testItemDialogTitle"
      v-model="testItemDialogVisible"
      width="800px"
      append-to-body
      destroy-on-close
      class="add-dialog"
    >
      <el-form
        ref="testItemFormRef"
        :model="testItemForm"
        :rules="testItemRules"
        label-width="auto"
      >
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="检验项" prop="itemId">
              <el-select
                v-model="testItemForm.itemId"
                placeholder="请选择检验项"
                filterable
                @change="selectTestItemChange"
              >
                <el-option
                  v-for="item in testItemList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验项类型" prop="itemType">
              <el-select
                v-model="testItemForm.itemType"
                placeholder="请选择检验项类型"
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
        </el-row>
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="检验工具" prop="itemTool">
              <el-input
                v-model="testItemForm.itemTool"
                placeholder="选择检验项自动获取"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验方法" prop="itemMethod">
              <el-input
                v-model="testItemForm.itemMethod"
                placeholder="请输入检验方法"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="检验要求" prop="requirement">
          <el-input
            v-model="testItemForm.requirement"
            type="textarea"
            :rows="2"
            placeholder="请输入检验要求"
          />
        </el-form-item>

        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="标准值" prop="standardValue">
              <el-input
                v-model="testItemForm.standardValue"
                placeholder="请输入标准值"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unitId">
              <el-select
                v-model="testItemForm.unitId"
                placeholder="请选择单位"
                class="w-full"
              >
                <el-option
                  v-for="item in unitDownList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="误差上限" prop="upperLimit">
              <el-input-number
                v-model="testItemForm.upperLimit"
                :min="0"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="误差下限" prop="lowerLimit">
              <el-input-number
                v-model="testItemForm.lowerLimit"
                :min="0"
                class="w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="testItemForm.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="testItemDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleTestItemSubmit"
          >确 定</el-button
        >
      </template>
    </el-dialog>

    <!-- 物料产品新增/编辑弹窗 -->
    <el-dialog
      :title="productDialogTitle"
      v-model="productDialogVisible"
      width="800px"
      append-to-body
      destroy-on-close
      class="add-dialog"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="auto"
      >
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="产品物料编码" prop="productId" required>
              <el-select
                v-model="productForm.productId"
                placeholder="请选择产品物料编码"
                filterable
                @change="selectProductItemChange"
              >
                <el-option
                  v-for="item in productDownList"
                  :key="item.id"
                  :label="item.code"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品物料名称" prop="productName">
              <el-input
                v-model="productForm.productName"
                placeholder="请输入产品物料名称"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb22">
          <el-col :span="24">
            <el-form-item label="规格型号" prop="specification">
              <el-input
                v-model="productForm.specification"
                type="textarea"
                :rows="2"
                placeholder="请输入规格型号"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="最大不合格数" prop="maxUnqualifiedNum">
              <el-input-number
                v-model="productForm.maxUnqualifiedNum"
                :min="0"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大严重缺陷" prop="seriousDefectNum">
              <el-input-number
                v-model="productForm.seriousDefectNum"
                :min="0"
                :max="100"
                class="w-full"
              >
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="最大致命缺陷" prop="criticalDefectNum">
              <el-input-number
                v-model="productForm.criticalDefectNum"
                :min="0"
                :max="100"
                class="w-full"
              >
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大轻微缺陷" prop="minorDefectNum">
              <el-input-number
                v-model="productForm.minorDefectNum"
                :min="0"
                :max="100"
                class="w-full"
              >
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb22">
          <el-col :span="12">
            <el-form-item label="最大一般缺陷" prop="generalDefectNum">
              <el-input-number
                v-model="productForm.generalDefectNum"
                :min="0"
                :max="100"
                class="w-full"
              >
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="productForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProductSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import CommonTable from "@/components/CommonTable/index.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTestTemplateList,
  autoTestTemplateCode,
  getTestTemplateTestItem,
  addOrEditTestTemplateTestItem,
  getTestTemplateMaterialProduct,
  getTestTemplateTestItemDetail,
  batchDeleteTestTemplateTestItem,
  addOrEditTestTemplate,
  batchDeleteTestTemplate,
  getTestTemplateDetail,
  getTestTemplateMaterialProductDetail,
  addOrEditTestTemplateMaterialProduct,
  batchDeleteTestTemplateMaterialProduct,
} from "@/api/quality/testTemplate";
import { getDefectBaseData } from "@/api/quality/defeckManage";
import { getTestItemList } from "@/api/quality/testItem";
import { getUnitDownlodList } from "@/api/baseData/unit";
import { getProductDownList } from "@/api/leanScheduling/productManage";

const commonTableRef = ref();
const selectedRows = ref([]);
// 表格选择事件
const getSelectionData = (selection) => {
  selectedRows.value = selection;
};

const searchForm = reactive({
  templateNo: "",
  templateName: "",
  checkTypes: [],
});

const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "code",
        colWidth: "300",
        title: "模板编号",
        type: "text",
        isCheck: true,
      },
      {
        key: "name",
        colWidth: "",
        title: "模板名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "typesStr",
        colWidth: "",
        title: "检验种类",
        type: "text",
        isCheck: true,
      },
      {
        key: "enabled",
        colWidth: "200",
        title: "是否启用",
        type: "switch",
        isCheck: true,
        status: "start",
      },
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
const getTemplateTableData = async () => {
  state.tableData.config.loading = true;
  try {
    const params = {
      first: 0,
      pageNum: state.tableData.param.pageNum,
      pageSize: state.tableData.param.pageSize,
      query: {
        code: searchForm.templateNo,
        enabled: 0,
        name: searchForm.templateName,
        typesList: searchForm.checkTypes,
      },
      queryid: 0,
      sort: "",
      sortField: "",
    };
    const res = await getTestTemplateList(params);
    state.tableData.data = res.data.rows;
    state.tableData.config.total = res.data.records;
  } finally {
    state.tableData.config.loading = false;
  }
};

watch(searchForm, () => {
  getTemplateTableData();
});

// 基础数据
const testTypeList = ref([]);
const testItemOptions = ref([]);
const getBaseData = async () => {
  const res = await getDefectBaseData({
    code: 3,
  });
  testTypeList.value = res.data;
  const res2 = await getDefectBaseData({ code: 2 });
  testItemOptions.value = res2.data || [];
};

// 弹窗相关
const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref();

// 新增一个状态来判断是否是查看模式
const isViewMode = ref(false);

// 更新弹窗标题的计算属性
const dialogTitle = computed(() => {
  if (isViewMode.value) {
    return "查看检验模板";
  }
  return formData.value.id ? "编辑检验模板" : "新增检验模板";
});

const formData = ref({
  code: "",
  enabled: 1,
  id: 0,
  itemIds: [],
  name: "",
  productIds: [],
  remark: "",
  types: [],
});
watch(
  () => formData.value,
  () => {
    if (formData.value.id != 0) {
      getTestItemsList();
      getProductList();
    }
  }
);
const testItemsList = ref([]);
const itemListConfig = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const getTestItemsList = async () => {
  const res = await getTestTemplateTestItem({
    first: 0,
    pageNum: itemListConfig.value.currentPage,
    pageSize: itemListConfig.value.pageSize,
    query: {
      id: formData.value.id,
    },
    queryid: 0,
    sort: "",
    sortField: "",
  });
  testItemsList.value = res.data.rows;
  itemListConfig.value.total = res.data.records;
};
const handleTestItemListSizeChange = (size) => {
  itemListConfig.value.pageSize = size;
  getTestItemsList();
};
const handleTestItemListCurrentChange = (page) => {
  itemListConfig.value.currentPage = page;
  getTestItemsList();
};

const productsList = ref([]);
const productListConfig = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const getProductList = async () => {
  const res = await getTestTemplateMaterialProduct({
    first: 0,
    pageNum: productListConfig.value.currentPage,
    pageSize: productListConfig.value.pageSize,
    query: {
      id: formData.value.id,
    },
    queryid: 0,
    sort: "",
    sortField: "",
  });
  productsList.value = res.data.rows;
  productListConfig.value.total = res.data.records;
};
const handleProductListSizeChange = (size) => {
  productListConfig.value.pageSize = size;
  getProductList();
};
const handleProductListCurrentChange = (page) => {
  productListConfig.value.currentPage = page;
  getProductList();
};
const formRules = {
  code: [{ required: true, message: "请输入模板编号", trigger: "blur" }],
  name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
  types: [
    { required: true, message: "请选择检验种类", trigger: "change" },
    {
      type: "array",
      min: 1,
      message: "请至少选择一个检验种类",
      trigger: "change",
    },
  ],
};

// 分页改变时回调
const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTemplateTableData();
};
// 拖动显示列排序回调
const onSortHeader = (data) => {
  state.tableData.header = data;
};

// 查看详情
const handleView = () => {
  dialogVisible.value = true;
  isViewMode.value = false; // 设置为编辑模式
};

// 新增
const handleAdd = async () => {
  resetForm();
  const res = await autoTestTemplateCode({});
  formData.value.code = res.data;
  dialogVisible.value = true;
  getTestItemOptions();
  getProductDownData();
  testItemsList.value = [];
  productsList.value = [];
};

// 编辑
const handleEdit = async (row) => {
  const res = await getTestTemplateDetail({ id: row.id });
  formData.value = res.data;
  formData.value.types = res.data.typesList;
  dialogVisible.value = true;
  formData.value.itemIds = [];
  formData.value.productIds = [];
  getTestItemOptions();
  getProductDownData();
};

// 重置表单
const resetForm = () => {
  formData.value = {
    code: "",
    enabled: 1,
    id: 0,
    itemIds: [],
    name: "",
    productIds: [],
    remark: "",
    types: [],
  };
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交表单
const handleSubmit = async () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (!formData.value.id) {
        if (formData.value.itemIds.length == 0) {
          return ElMessage.warning("请添加检验项");
        } else if (formData.value.productIds.length == 0) {
          return ElMessage.warning("请添加物料产品");
        }
      }
      submitting.value = true;
      const isEdit = !!formData.value.id;
      formData.value.itemIds = testItemsList.value.map((item) => item.id);
      formData.value.productIds = productsList.value.map((item) => item.id);

      await addOrEditTestTemplate(formData.value);
      ElMessage.success(`${isEdit ? "编辑" : "新增"}成功`);
      dialogVisible.value = false;
      submitting.value = false;
      getTemplateTableData();
      testItemsList.value = [];
      productsList.value = [];
    }
  });
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除该模版吗？", "提示", {
    type: "warning",
  }).then(async () => {
    await batchDeleteTestTemplate([{ id: row.id }]);
    ElMessage.success("删除成功");
    getTemplateTableData();
  });
};

// 批量删除
const batchHandleDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning("请选择要删除的文件");
    return;
  }
  ElMessageBox.confirm("确定要删除选中文件吗？", "提示", {
    type: "warning",
  }).then(async () => {
    const deleteId = [];
    selectedRows.value.forEach((item) => {
      deleteId.push({ id: item.id });
    });
    await batchDeleteTestTemplate(deleteId);
    ElMessage.success("删除成功");
    commonTableRef.value.clearCheckboxState();
    getTemplateTableData();
  });
};

// 检验项相关
const activeTab = ref("testItems");
const testItemsTableRef = ref();
const selectedTestItems = ref([]);
const testItemDialogVisible = ref(false);
const testItemFormRef = ref();

const testItemList = ref([]);
const getTestItemOptions = async () => {
  const res = await getTestItemList({
    first: 0,
    pageNum: 1,
    pageSize: 10,
    query: {
      code: "",
      id: 0,
      name: "",
      remark: "",
      tool: "",
      type: "",
      typeStr: "",
    },
    queryid: 0,
    sort: "",
    sortField: "",
  });
  testItemList.value = res.data.rows;
};

// 获取单位下拉列表
const unitDownList = ref([]);
const getUnitDownList = async () => {
  const res = await getUnitDownlodList({
    code: "",
    enabled: 1,
    id: 0,
    isMain: 0,
    name: "",
    remark: "",
  });
  unitDownList.value = res.data;
};
const testItemForm = ref({
  description: "",
  id: 0,
  itemId: "",
  itemMethod: "",
  itemType: "",
  itemTool: "",
  lowerLimit: 0,
  remark: "",
  requirement: "",
  standardValue: "",
  templateId: 0,
  unitId: "",
  upperLimit: 0,
});

const testItemRules = {
  itemId: [{ required: true, message: "请选择检验项", trigger: "blur" }],
  standardValue: [{ required: true, message: "", trigger: "change" }],
};

const testItemDialogTitle = computed(() => {
  return testItemForm.value.id ? "编辑检验项" : "新增检验项";
});

const selectTestItemChange = (id) => {
  const item = testItemList.value.find((item) => item.id == id);
  testItemForm.value.itemTool = item.tool;
  testItemForm.value.itemType = item.type;
};

// 检验项相关方法
const handleAddTestItem = () => {
  testItemForm.value = {
    description: "",
    id: 0,
    itemId: "",
    itemMethod: "",
    itemType: "",
    itemTool: "",
    lowerLimit: 0,
    remark: "",
    requirement: "",
    standardValue: "",
    templateId: 0,
    unitId: "",
    upperLimit: 0,
  };
  testItemDialogVisible.value = true;
};

const handleEditTestItem = async (row) => {
  const res = await getTestTemplateTestItemDetail({ id: row.id });
  testItemForm.value = res.data;
  testItemDialogVisible.value = true;
};

const handleTestItemSubmit = async () => {
  testItemFormRef.value.validate(async (valid) => {
    if (valid) {
      testItemForm.value.templateId = formData.value.id;
      if (testItemForm.value.id) {
        const res = await addOrEditTestTemplateTestItem(testItemForm.value);
        ElMessage.success("编辑成功");
        testItemsList.value = testItemsList.value.map((item) =>
          item.id === res.data.id ? res.data : item
        );
        if (formData.value.id) {
          getTestItemsList();
        }
      } else {
        const res = await addOrEditTestTemplateTestItem(testItemForm.value);
        formData.value.itemIds.push(res.data.id);
        ElMessage.success("新增成功");
        testItemsList.value.push(res.data);
      }
      testItemDialogVisible.value = false;
    }
    submitting.value = false;
  });
};

const handleDeleteTestItem = (row) => {
  ElMessageBox.confirm("确定要当前检验项吗？", "提示", {
    type: "warning",
  }).then(async () => {
    await batchDeleteTestTemplateTestItem([
      {
        id: row.id,
      },
    ]);
    // 删除成功后，更新列表
    testItemsList.value = testItemsList.value.filter(
      (item) => item.id !== row.id
    );
    // 更新数组id
    formData.value.itemIds = formData.value.itemIds.filter(
      (item) => item !== row.id
    );
    ElMessage.success("删除成功");
  });
};

const batchHandleDeleteTestItem = () => {
  if (!selectedTestItems.value.length)
    return ElMessage.warning("请选择要删除的检验项");
  ElMessageBox.confirm("确定要删除选中的检验项吗？", "提示", {
    type: "warning",
  }).then(async () => {
    await batchDeleteTestTemplateTestItem(
      selectedTestItems.value.map((item) => ({ id: item.id }))
    );
    const unselectedItems = testItemsList.value.filter(
      (testItem) =>
        !selectedTestItems.value.some(
          (selectedItem) => selectedItem.id === testItem.id
        )
    );
    testItemsList.value = unselectedItems;
    itemListConfig.value.total = unselectedItems.length;
    formData.value.itemIds = formData.value.itemIds.filter(
      (item) => !unselectedItems.some((item1) => item == item1.id)
    );
    ElMessage.success("删除成功");
  });
};

const handleTestItemSelectionChange = (selection) => {
  selectedTestItems.value = selection;
};

// 物料产品相关
const productsTableRef = ref();
const productDownList = ref([]);
const getProductDownData = async () => {
  const res = await getProductDownList();
  productDownList.value = res.data;
};
// 物料产品相关方法
const handleAddProduct = () => {
  productForm.value = {
    criticalDefectNum: 0,
    generalDefectNum: 0,
    id: 0,
    maxUnqualifiedNum: 0,
    minDetections: 0,
    minorDefectNum: 0,
    productId: "",
    remark: "",
    seriousDefectNum: 0,
    specification: "",
    templateId: 0,
    unitId: 0,
  };
  productDialogVisible.value = true;
};

const handleEditProduct = async (row) => {
  const res = await getTestTemplateMaterialProductDetail({ id: row.id });
  productForm.value = res.data;
  productDialogVisible.value = true;
};

const handleDeleteProduct = (row) => {
  ElMessageBox.confirm("确定要删除该物料产品吗？", "提示", {
    type: "warning",
  }).then(async () => {
    await batchDeleteTestTemplateMaterialProduct([{ id: row.id }]);
    ElMessage.success("删除成功");
    productsList.value = productsList.value.filter(
      (item) => item.id !== row.id
    );
    formData.value.productIds = formData.value.productIds.filter(
      (item) => item !== row.id
    );
  });
};

// 批量删除
const batchHandleDeleteProduct = () => {
  if (!selectedProducts.value.length) {
    ElMessage.warning("请选择要删除的物料产品");
    return;
  }
  ElMessageBox.confirm("确定要删除选中的物料产品吗？", "提示", {
    type: "warning",
  }).then(async () => {
    const ids = selectedProducts.value.map((item) => ({ id: item.id }));
    await batchDeleteTestTemplateMaterialProduct(ids);
    ElMessage.success("删除成功");
    productsList.value = productsList.value.filter(
      (item) => !ids.find((id) => id.id === item.id)
    );
    formData.value.productIds = formData.value.productIds.filter(
      (item) => !ids.some((id) => id.id == item)
    );
  });
};
const selectedProducts = ref([]);
const handleProductSelectionChange = (selection) => {
  selectedProducts.value = selection;
};

const productDialogVisible = ref(false);
const productFormRef = ref();
const productForm = ref({
  criticalDefectNum: 0,
  generalDefectNum: 0,
  id: 0,
  maxUnqualifiedNum: 0,
  minDetections: 0,
  minorDefectNum: 0,
  productId: "",
  remark: "",
  seriousDefectNum: 0,
  specification: "",
  templateId: 0,
  unitId: 0,
});

const productRules = {
  productCode: [
    { required: true, message: "请输入产品物料编码", trigger: "blur" },
  ],
  productName: [
    { required: true, message: "请输入产品物料名称", trigger: "blur" },
  ],
  maxDefectCount: [
    { required: true, message: "请输入最大不合格数", trigger: "blur" },
  ],
};

const productDialogTitle = computed(() => {
  return productForm.value.id ? "编辑物料产品" : "新增物料产品";
});

const selectProductItemChange = (id) => {
  const item = productDownList.value.find((item) => item.id == id);
  productForm.value.productName = item.name;
  productForm.value.specification = item.specifications;
};

// 更新物料产品相关方法
const handleProductSubmit = async () => {
  if (!productFormRef.value) return;
  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      productForm.value.templateId = formData.value.id;
      if (productForm.value.id) {
        const res = await addOrEditTestTemplateMaterialProduct(
          productForm.value
        );
        productsList.value = productsList.value.map((item) =>
          item.id === res.data.id ? res.data : item
        );
        ElMessage.success("编辑成功");
        getProductList();
      } else {
        const res = await addOrEditTestTemplateMaterialProduct(
          productForm.value
        );
        formData.value.productIds.push(res.data.id);
        ElMessage.success("新增成功");
        productsList.value.push(res.data);
      }
      submitting.value = false;
      productDialogVisible.value = false;
    }
  });
};

// 关闭弹框时重置查看模式
const closeDialog = () => {
  dialogVisible.value = false;
  isViewMode.value = false; // 重置查看模式
};

onMounted(() => {
  getTemplateTableData();
  getBaseData();
  getUnitDownList();
});
</script>

<style lang="scss" scoped>
.test-template-padding {
  padding: 20px;

  .search-area {
    background: #fff;
    border-radius: 4px;

    .check-types {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .table-demo {
    height: calc(100vh - 180px);
  }
}

.add-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    height: calc(90vh - 120px);
    overflow-y: auto;
  }
}

.table-operations {
  margin-bottom: 10px;
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

<template>
  <div class="materialManage-wrapper layout-padding">
    <div class="materialManage-padding layout-padding-view layout-padding-auto">
      <div class="materialManage-container">
        <!-- 左侧树形结构 -->
        <div class="materialManage-left">
          <div class="tree-container">
            <div class="tree-top-block">
              <span class="tree-top-title">产品/物料组别</span>
              <div class="tree-top-actions">
                <el-button
                  type="primary"
                  :icon="Plus"
                  size="small"
                  circle
                  @click="handleAddRootCategory"
                ></el-button>
              </div>
            </div>
            <div class="filter-input">
              <el-input
                placeholder="请输入产品/物料分类名称"
                v-model.trim="treeFilterForm.keyword"
                clearable
                :suffix-icon="Search"
                @input="treeFilterInputData"
                @keyup.enter="treeFilterInputData"
                style="width: 240px"
              />
            </div>
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              :highlight-current="true"
              :expand-on-click-node="false"
              :default-expand-all="true"
              node-key="id"
              @node-click="handleNodeClick"
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
                  <span class="node-actions">
                    <el-button
                      type="primary"
                      :icon="Plus"
                      link
                      @click.stop="handleAddCategory(data)"
                    ></el-button>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      link
                      @click.stop="handleDeleteCategory(data)"
                    ></el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>

        <!-- 右侧表格 -->
        <div class="table-wrapper88">
          <div class="stats-cards">
            <div class="stats-card">
              <div class="card-bar bar-blue"></div>
              <div class="card-content">
                <div class="card-label">物料种类</div>
                <div class="card-value">1286</div>
              </div>
            </div>
            <div class="stats-card">
              <div class="card-bar bar-green"></div>
              <div class="card-content">
                <div class="card-label">总库存量</div>
                <div class="card-value">1286</div>
              </div>
            </div>
            <div class="stats-card">
              <div class="card-bar bar-orange"></div>
              <div class="card-content">
                <div class="card-label">库存预警数</div>
                <div class="card-value">1286</div>
              </div>
            </div>
            <div class="stats-card">
              <div class="card-bar bar-red"></div>
              <div class="card-content">
                <div class="card-label">缺货物料数</div>
                <div class="card-value">12</div>
              </div>
            </div>
          </div>
          <div class="table-search-container">
            <el-form ref="searchFormRef" :model="searchForm" class="table-form">
              <el-row :gutter="35" justify="space-between">
                <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
                  <el-form-item prop="keyword">
                    <el-input
                      placeholder="请输入编号或名称搜索"
                      v-model.trim="searchForm.keyword"
                      clearable
                      :suffix-icon="Search"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
                  <el-form-item prop="type">
                    <el-select
                      v-model="searchForm.type"
                      placeholder="请选择类型搜索"
                    >
                      <el-option
                        v-for="item in typeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
                  <el-button type="primary" :icon="Plus" @click="handleAdd"
                    >新增</el-button
                  >
                  <el-button
                    :disabled="!selectedRows.length"
                    type="danger"
                    @click="handleDeleteBatch"
                    :icon="Delete"
                    >批量删除</el-button
                  >
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
            @checkboxChange="handleSelectionChange"
            @clickChangeCode="handleClickChangeCode"
            @expand-change="handleExpandChange"
            :row-class-name="isShowIcon"
          >
            <template #expand="{ row }">
              <div class="expand-container" v-if="row.type == 1">
                <div class="header-container">
                  <h3>BOM清单</h3>
                  <el-button
                    type="primary"
                    :icon="Plus"
                    @click="chooseMaterial(row)"
                    >新增物料</el-button
                  >
                </div>
                <el-table
                  :data="row.materialList"
                  stripe
                  border
                  row-key="id"
                  height="260"
                  :cell-style="{ textAlign: 'center' }"
                  :header-cell-style="{ 'text-align': 'center' }"
                  class="expand-table"
                >
                  <el-table-column label="序号" type="index" width="80" />
                  <el-table-column prop="name" label="物料名称" width="180" />
                  <el-table-column prop="typeName" label="类型" width="" />
                  <el-table-column
                    prop="specifications"
                    label="规格"
                    width=""
                  />
                  <el-table-column prop="unitName" label="计量单位" width="" />
                  <el-table-column
                    prop="importantParts"
                    label="是否关重件"
                    width=""
                  >
                    <template #default="{ row }">
                      <el-tag type="success" v-if="row.importantParts == 1"
                        >是</el-tag
                      >
                      <el-tag type="danger" v-else>否</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="quantity" label="所需数量" width="">
                    <template #default="{ row }">
                      <el-input
                        v-model.number="row.quantity"
                        @blur="handleQuantityBlur(row)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                      <el-button
                        type="danger"
                        link
                        @click="handleDeleteTask(row)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="pagination-container1">
                  <el-pagination
                    :current-page="row.materialPage || 1"
                    :page-size="row.materialPageSize || 10"
                    :total="row.materialTotal || 0"
                    :page-sizes="[10, 20, 50]"
                    :pager-count="5"
                    layout="total, sizes, prev, pager, next, jumper"
                    background
                    @size-change="(val) => handleMaterialSizeChange(val, row)"
                    @current-change="
                      (val) => handleMaterialPageChange(val, row)
                    "
                  />
                </div>
              </div>
            </template>
            <template #operate="{ row }">
              <div class="operateBox no-print">
                <el-button type="primary" link @click="handleEdit(row)"
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
    </div>

    <!-- 新增/编辑物料弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1000"
      @close="resetFormData"
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="auto"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="20" class="mb20">
            <el-col :span="8">
              <el-form-item label="产品/物料编号" prop="code">
                <el-input
                  v-model="formData.code"
                  placeholder="请输入产品/物料编号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="产品/物料名称" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入产品/物料名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="产品/物料类型" prop="type">
                <el-select
                  v-model="formData.type"
                  placeholder="请选择产品/物料类型"
                  style="width: 100%"
                >
                  <el-option label="产品" :value="1"></el-option>
                  <el-option label="物料" :value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 规格信息 -->
        <div class="form-section">
          <div class="section-title">规格信息</div>
          <el-row :gutter="20" class="mb20">
            <el-col :span="8">
              <el-form-item label="规格型号" prop="specifications">
                <el-input
                  v-model="formData.specifications"
                  placeholder="请输入规格型号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="品牌" prop="brand">
                <el-input v-model="formData.brand" placeholder="请输入品牌" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计量单位" prop="unitId">
                <el-select
                  v-model="formData.unitId"
                  placeholder="请选择计量单位"
                  style="width: 100%"
                  filterable
                >
                  <el-option
                    v-for="item in unitList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 库存信息 -->
        <div class="form-section">
          <div class="section-title">库存信息</div>
          <el-row :gutter="20" class="mb20">
            <el-col :span="8">
              <el-form-item label="安全库存" prop="safeInventory">
                <el-input-number
                  v-model="formData.safeInventory"
                  :min="0"
                  placeholder="请输入安全库存"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="价格" prop="price">
                <el-input-number
                  v-model="formData.price"
                  :precision="2"
                  :step="0.1"
                  :controls="false"
                  placeholder="请输入价格"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="供应商" prop="supplierId">
                <el-input
                  v-model="formData.supplierName"
                  placeholder="请选择供应商"
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
          </el-row>
        </div>

        <!-- 其他信息 -->
        <div class="form-section">
          <div class="section-title">其他信息</div>
          <el-row :gutter="20" class="mb20">
            <el-col :span="8">
              <el-form-item label="外部编码" prop="externalCode">
                <el-input
                  v-model="formData.externalCode"
                  placeholder="请输入外部编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="内部编码" prop="internalCode">
                <el-input
                  v-model="formData.internalCode"
                  placeholder="请输入内部编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="重要部件" prop="importantParts">
                <el-select
                  v-model="formData.importantParts"
                  placeholder="请选择是否重要部件"
                  style="width: 100%"
                >
                  <el-option label="否" :value="0"></el-option>
                  <el-option label="是" :value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="描述" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入描述信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetFormData">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增分类弹框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="新增物料分类"
      width="500px"
      @close="resetCategoryData"
      class="add-dialog"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryFormData"
        :rules="categoryFormRules"
        label-width="auto"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="categoryFormData.name"
            placeholder="请输入分类名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetCategoryData">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 库存信息弹框 -->
    <el-dialog
      v-model="storeInfoDialogVisible"
      width="600"
      :before-close="handleCloseStoreInfoDialog"
    >
      <el-table
        :data="storeInfoData"
        style="width: 100%"
        ref="tableRef"
        row-key="id"
        height="300px"
        border
        stripe
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ 'text-align': 'center' }"
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="warehouseName" label="仓库名称" width="" />
        <el-table-column prop="quantity" label="库存数" width="" />
      </el-table>
    </el-dialog>

    <MaterialSelectDialog
      v-model="showMaterialSelect"
      @confirm="onMaterialSelect"
      title="选择产品/物料"
      selectionMode="multiple"
      :defaultSelected="defaultSelected"
    />
    12
    <ContactSelectDialog
      v-model="showContactSelect"
      @confirm="onContactSelect"
      title="选择供应商/公司"
      selectionMode="single"
      :defaultSelected="defaultContactSelected"
    />
  </div>
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
  provide,
  nextTick,
} from "vue";
import CommonTable from "@/components/CommonTable/index.vue";
import PopoverButton from "@/components/PopoverButton/index.vue";
import MaterialSelectDialog from "@/components/MaterialSelectDialog/index.vue";
import ContactSelectDialog from "@/components/ContactSelectDialog/index.vue";
import { Search, Plus, Delete, Folder } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getMaterialTreeList,
  getMaterialList,
  saveOrUpdateMaterial,
  deleteMaterial,
  addEditMaterialTypeNode,
  deleteMaterialTypeNode,
  getBomList,
  addBomList,
  deleteBomList,
  updateBomList,
  getIdBomList,
} from "@/api/baseData/material";
import { getUnitDownlodList } from "@/api/baseData/unit";
import { getAllSuppliers } from "@/api/baseData/supplier";
import { getMaterialAndStore } from "@/api/warehouseManage/storeManage";
import mittBus from "@/utils/mitt";

// 树形结构相关
const treeFilterForm = ref({
  keyword: "",
});

const treeData = ref([]);

const defaultProps = {
  children: "children",
  label: "name",
};

const treeRef = ref();
const currentNode = ref(null);
const currentCategoryId = ref(null);

// 搜索过滤
const treeFilterInputData = () => {
  getTreeData();
};

// 节点点击事件
const handleNodeClick = (data) => {
  currentNode.value = data;
  currentCategoryId.value = data.id;
  getTableData();
};

// 获取树形数据
const getTreeData = async () => {
  try {
    const params = {
      id: 0,
      name: treeFilterForm.value.keyword,
    };
    const res = await getMaterialTreeList(params);
    if (res.code === 200) {
      treeData.value = res.data;
      // 如果有数据，自动选中第一个节点
      if (treeData.value && treeData.value.length > 0) {
        const firstNode = treeData.value[0];
        currentNode.value = firstNode;
        currentCategoryId.value = firstNode.id;
        // 设置树形控件选中状态
        nextTick(() => {
          treeRef.value?.setCurrentKey(firstNode.id);
        });
        // 获取表格数据
        getTableData();
      }
    } else {
      ElMessage.error(res.message || "获取物料分类失败");
    }
  } catch (error) {
    console.error("获取物料分类失败:", error);
    ElMessage.error("获取物料分类失败");
  }
};

// 表格相关
const searchForm = ref({
  keyword: "",
  type: null,
});
const typeOptions = ref([
  {
    label: "产品",
    value: 1,
  },
  {
    label: "物料",
    value: 2,
  },
]);

const selectedRows = ref([]);

const tableData = ref([]);

const unitList = ref([]);
const getUnits = async () => {
  try {
    const res = await getUnitDownlodList({});
    if (res.code === 200) {
      unitList.value = res.data || [];
    } else {
      ElMessage.error(res.message || "获取计量单位列表失败");
    }
  } catch (error) {
    console.error("获取计量单位列表失败:", error);
    ElMessage.error("获取计量单位列表失败");
  }
};

const state = reactive({
  tableData: {
    data: tableData,
    header: [
      {
        key: "code",
        colWidth: "120",
        title: "产品/物料编号",
        type: "text",
        isCheck: true,
        status: "code",
      },
      {
        key: "name",
        colWidth: "120",
        title: "产品/物料名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "type",
        colWidth: "100",
        title: "类型",
        type: "text",
        isCheck: true,
        status: "materialType",
      },
      {
        key: "brand",
        colWidth: "100",
        title: "品牌",
        type: "text",
        isCheck: true,
      },
      {
        key: "price",
        colWidth: "100",
        title: "价格/元",
        type: "text",
        isCheck: true,
      },
      {
        key: "specifications",
        colWidth: "120",
        title: "产品/物料规格",
        type: "text",
        isCheck: true,
      },
      {
        key: "externalCode",
        colWidth: "120",
        title: "内部编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "internalCode",
        colWidth: "120",
        title: "外部编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "importantParts",
        colWidth: "100",
        title: "是否关重件",
        type: "text",
        isCheck: true,
        status: "importantParts",
      },
      {
        key: "safeInventory",
        colWidth: "100",
        title: "安全库存",
        type: "text",
        isCheck: true,
      },
      {
        key: "inventoryNum",
        colWidth: "100",
        title: "库存数",
        type: "text",
        isCheck: true,
        status: "linkButton",
      },
      {
        key: "supplierName",
        colWidth: "120",
        title: "供应商",
        type: "text",
        isCheck: true,
      },
      {
        key: "unitName",
        colWidth: "100",
        title: "计量单位",
        type: "text",
        isCheck: true,
      },
      {
        key: "description",
        colWidth: "150",
        title: "产品/物料描述",
        type: "text",
        isCheck: true,
      },
    ],
    config: {
      total: 0,
      loading: false,
      isBorder: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      isFixed: true,
      operateWidth: "150",
      isExpandable: true,
    },
    param: {
      pageNum: 1,
      pageSize: 10,
    },
  },
});

// 弹框相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增物料");
const formRef = ref();

const formData = ref({
  categoryId: 0,
  code: "",
  name: "",
  description: "",
  specifications: "",
  safeInventory: 0,
  supplierId: null,
  supplierName: "",
  price: 0,
  type: 0,
  unitId: null,
  brand: "",
  externalCode: "",
  internalCode: "",
  importantParts: 0,
  importantPartsStr: "",
});

const formRules = reactive({
  code: [{ required: true, message: "请输入产品/物料编号", trigger: "blur" }],
  name: [{ required: true, message: "请输入产品/物料名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }],
  unitId: [{ required: true, message: "请选择计量单位", trigger: "change" }],
  safeInventory: [
    { required: true, message: "请输入安全库存", trigger: "blur" },
  ],
  supplierId: [{ required: true, message: "请选择供应商", trigger: "change" }],
  importantParts: [
    { required: true, message: "请选择是否重要部件", trigger: "change" },
  ],
});

// 分类弹框相关
const categoryDialogVisible = ref(false);
const categoryFormRef = ref();
const categoryFormData = ref({
  id: 0,
  name: "",
  parentId: 0,
});

const categoryFormRules = reactive({
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
});

// 供应商选择相关
const showContactSelect = ref(false);
const defaultContactSelected = ref([]);

const chooseContact = () => {
  defaultContactSelected.value = formData.value.supplierId
    ? [
        {
          id: formData.value.supplierId,
          name: formData.value.supplierName,
        },
      ]
    : [];
  showContactSelect.value = true;
};

const onContactSelect = (selectedData) => {
  let contact;
  if (Array.isArray(selectedData)) {
    if (selectedData.length === 0) {
      ElMessage.info("未选择任何供应商");
      return;
    }
    contact = selectedData[0];
  } else {
    if (!selectedData) {
      ElMessage.info("未选择任何供应商");
      return;
    }
    contact = selectedData;
  }
  formData.value.supplierId = contact.id;
  formData.value.supplierName = contact.name;
  ElMessage.success("选择供应商成功");
  showContactSelect.value = false;
};

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const onSortHeader = (headers) => {
  state.tableData.header = headers;
};

const handleAdd = () => {
  if (!currentCategoryId.value) {
    ElMessage.warning("请先选择一个物料分类");
    return;
  }
  dialogTitle.value = "新增物料";
  formData.value = {
    categoryId: currentCategoryId.value,
    code: "",
    name: "",
    description: "",
    specifications: "",
    safeInventory: 1,
    price: 0,
    supplierId: null,
    supplierName: "",
    type: 1,
    unitId: null,
    brand: "",
    externalCode: "",
    internalCode: "",
    importantParts: 0,
    importantPartsStr: "",
  };
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = "编辑物料";
  formData.value = {
    ...row,
    id: row.id,
    supplierName: row.supplierName || "",
  };
  dialogVisible.value = true;
};

const resetFormData = () => {
  formData.value = {
    categoryId: currentCategoryId.value,
    code: "",
    name: "",
    description: "",
    specifications: "",
    safeInventory: 1,
    supplierId: null,
    supplierName: "",
    price: 0,
    type: 1,
    unitId: null,
    brand: "",
    externalCode: "",
    internalCode: "",
    importantParts: 0,
    importantPartsStr: "",
  };
  formRef.value?.resetFields();
  dialogVisible.value = false;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该产品/物料吗？", "提示", {
      type: "warning",
    });
    const res = await deleteMaterial({ id: row.id });
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getTableData();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除产品/物料失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

const commonTableRef = ref();
const handleDeleteBatch = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的产品/物料");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要批量删除选中的产品/物料吗？", "提示", {
      type: "warning",
    });

    const deletePromises = selectedRows.value.map((row) =>
      deleteMaterial({ id: row.id })
    );
    const results = await Promise.all(deletePromises);

    if (results.every((res) => res.code === 200)) {
      ElMessage.success("批量删除成功");
      commonTableRef.value?.clearCheckboxState();
      getTableData();
    } else {
      ElMessage.error("部分删除失败，请刷新后重试");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("批量删除产品/物料失败:", error);
      ElMessage.error("批量删除失败");
    }
  }
};

// 物料分类操作
const handleAddRootCategory = () => {
  categoryFormData.value = {
    id: 0,
    name: "",
    parentId: 0,
  };
  categoryDialogVisible.value = true;
};

const handleAddCategory = (data) => {
  categoryFormData.value = {
    id: 0,
    name: "",
    parentId: data.id,
  };
  categoryDialogVisible.value = true;
};

const handleDeleteCategory = async (data) => {
  if (!data) {
    ElMessage.warning("请先选择一个产品/物料分类");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除"${data.name}"分类吗？删除后该分类下的所有产品/物料将一并删除！`,
      "提示",
      {
        type: "warning",
      }
    );

    const res = await deleteMaterialTypeNode({ id: data.id });
    if (res.code === 200) {
      ElMessage.success("删除分类成功");
      currentNode.value = null;
      currentCategoryId.value = 0;
      getTreeData();
      getTableData();
    } else {
      ElMessage.error(res.message || "删除分类失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除分类失败:", error);
      ElMessage.error("删除分类失败");
    }
  }
};

const resetCategoryData = () => {
  categoryFormData.value = {
    id: 0,
    name: "",
    parentId: 0,
  };
  categoryFormRef.value?.resetFields();
  categoryDialogVisible.value = false;
};

const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return;

  try {
    await categoryFormRef.value.validate();
    const res = await addEditMaterialTypeNode(categoryFormData.value);
    if (res.code === 200) {
      ElMessage.success("新增分类成功");
      resetCategoryData();
      getTreeData();
    } else {
      ElMessage.error(res.message || "新增分类失败");
    }
  } catch (error) {
    console.error("新增分类失败:", error);
    ElMessage.error("新增分类失败");
  }
};

const submitForm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    const res = await saveOrUpdateMaterial(formData.value);
    if (res.code === 200) {
      ElMessage.success(formData.value.id ? "编辑成功" : "新增成功");
      resetFormData();
      getTableData();
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("保存物料失败:", error);
    ElMessage.error("保存物料失败");
  }
};

// 获取表格数据的方法
const getTableData = async () => {
  if (!currentCategoryId.value) {
    state.tableData.data = [];
    state.tableData.config.total = 0;
    return;
  }

  state.tableData.config.loading = true;
  const params = {
    first: 0,
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    query: {
      categoryId: currentCategoryId.value,
      code: "",
      name: searchForm.value.keyword,
      supplierId: 0,
      type: searchForm.value.type,
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  try {
    const res = await getMaterialList(params);
    if (res.code === 200) {
      state.tableData.data = res.data.rows || [];
      state.tableData.config.total = res.data.records || 0;
    } else {
      ElMessage.error(res.message || "获取物料列表失败");
      state.tableData.data = [];
      state.tableData.config.total = 0;
    }
  } catch (error) {
    console.error("获取物料列表失败:", error);
    ElMessage.error("获取物料列表失败");
    state.tableData.data = [];
    state.tableData.config.total = 0;
  } finally {
    state.tableData.config.loading = false;
  }
};

// 监听搜索关键字变化
watch(
  () => [searchForm.value.keyword, searchForm.value.type],
  () => {
    state.tableData.param.pageNum = 1;
    getTableData();
  }
);

// 库存信息
const storeInfoData = ref([]);
const storeInfoDialogVisible = ref(false);
const handleClickChangeCode = async (row) => {
  storeInfoDialogVisible.value = true;
  try {
    const res = await getMaterialAndStore([{ id: row.id }]);
    if (res.code === 200) {
      storeInfoData.value = res.data || [];
    } else {
      ElMessage.error(res.message || "获取库存信息失败");
      storeInfoData.value = [];
    }
  } catch (error) {
    console.error("获取库存信息失败:", error);
    ElMessage.error("获取库存信息失败");
    storeInfoData.value = [];
  }
};
const handleCloseStoreInfoDialog = () => {
  storeInfoDialogVisible.value = false;
};

// 二级表格
const expandedRows = ref([]);
const handleExpandChange = async (row) => {
  expandedRows.value = [row]; // Only one row can be expanded at a time
  const res = await getBomList(row.id, {
    pageNum: row.materialPage || 1,
    pageSize: row.materialPageSize || 10,
  });
  row.materialList = res.rows;
  row.materialTotal = res.total;
};

const handleMaterialSizeChange = async (val, row) => {
  row.materialPageSize = val;
  row.materialPage = 1;
  await handleMaterialPageChange(row.materialPage, row);
};

const handleMaterialPageChange = async (val, row) => {
  row.materialPage = val;
  handleExpandChange(row);
};

// 删除物料
const handleDeleteTask = async (row) => {
  await ElMessageBox.confirm("确定要删除该物料吗？", "提示", {
    type: "warning",
  });
  await deleteBomList(row.id);
  ElMessage.success("删除物料成功");
  // Find the parent row that contains this BOM item
  const parentRow = expandedRows.value.find((r) =>
    r.materialList.includes(row)
  );
  if (parentRow) {
    // Refresh the BOM list for the parent row
    await handleExpandChange(parentRow);
  }
};

// Handle quantity input blur event to update BOM list
const handleQuantityBlur = async (row) => {
  // Validate quantity to ensure it's a valid number
  if (row.quantity == null || isNaN(row.quantity) || row.quantity < 0) {
    ElMessage.error("请输入有效的数量");
    return;
  }

  // Prepare parameters for updateBomList API
  const params = {
    id: row.id,
    quantity: row.quantity,
  };

  await updateBomList(params);
  ElMessage.success("数量更新成功");
  // Optionally refresh the BOM list for the parent row
  const parentRow = expandedRows.value.find((r) =>
    r.materialList.includes(row)
  );

  if (parentRow) {
    await handleExpandChange(parentRow);
  }
};

// 选择产品相关
const showMaterialSelect = ref(false);
const defaultSelected = ref([]);
const currentRow = ref(null);

const chooseMaterial = async (row) => {
  currentRow.value = row;
  defaultSelected.value = row.materialList.map((item) => ({
    id: item.materialsId,
    code: item.code,
    name: item.name,
    specifications: item.specifications,
    unitName: item.unitName,
    importantParts: item.importantParts == 1 ? 1 : 0,
  }));

  showMaterialSelect.value = true;
};

const onMaterialSelect = async (data) => {
  // Prepare parameters for addBomList API
  const params = {
    id: currentRow.value.id,
    materialIds: data.map((item) => item.id),
  };

  // Call addBomList API
  await addBomList(params);

  ElMessage.success("关联物料成功");
  // Refresh BOM list for the current row
  await handleExpandChange(currentRow.value);

  showMaterialSelect.value = false;
  // Clear current row
  currentRow.value = null;
  defaultSelected.value = [];
};

const isShowIcon = (row) => {
  if (row.row.type == 1) {
    return "";
  } else {
    return "hiderow";
  }
};

// 提供Excel导入配置
const uploadConfig = reactive({
  url: "/material/importData",
  data: {
    categoryId: currentCategoryId.value,
  },
});

watch(currentCategoryId, (newVal) => {
  if (newVal) {
    uploadConfig.data.categoryId = newVal;
  }
});

const templateConfig = {
  url: "/material/importTemplate",
  fileName: "物料导入模版.xlsx",
};

provide("uploadConfig", uploadConfig);
provide("templateConfig", templateConfig);

onMounted(() => {
  getTreeData();
  getUnits();
});

onUnmounted(() => {
  mittBus.off("onExcelDataUpdataList");
});

mittBus.on("onExcelDataUpdataList", () => {
  getTableData();
});
</script>

<style scoped lang="scss">
.materialManage-padding {
  padding: 15px;

  .materialManage-container {
    display: flex;

    .materialManage-left {
      flex: 0.4;
      margin-right: 10px;
      overflow: hidden;

      .tree-top-block {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(14, 27, 46, 0.1);
        padding: 12px 16px;
        margin-bottom: 8px;

        .tree-top-title {
          font-size: 16px;
          line-height: 1;
          font-weight: 600;
          color: rgba(14, 27, 46, 0.85);
        }
      }

      .tree-container {
        height: calc(100vh - 200px);
        background: #fff;
        border-radius: 4px;
        padding: 10px;

        .filter-input {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          margin-bottom: 8px;

          :deep(.el-icon) {
            margin: 0;
          }
        }

        :deep(.el-tree) {
          height: calc(100% - 50px);
          overflow: auto;

          .el-tree-node__content {
            height: 32px;

            .custom-tree-node {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 14px;
              padding-right: 8px;

              .node-content {
                display: flex;
                align-items: center;

                .tree-item-svg-svg {
                  margin-right: 5px;
                  font-size: 20px;
                }
              }

              .node-actions {
                display: none;
                margin-left: 10px;

                .el-button {
                  margin-left: 4px;
                }
              }

              &:hover {
                .node-actions {
                  display: inline-flex;
                }
              }
            }
          }
        }
      }
    }

    .table-wrapper88 {
      flex: 2;
      overflow: auto;

      .common-tablebox-title {
        font-size: 16px;
        color: #0e1b2e;
        display: flex;
        padding-bottom: 16px;
        line-height: 20px;

        span {
          display: flex;
          align-items: center;
        }
      }

      .blue-title ::before {
        content: " ";
        display: inline-block;
        width: 4px;
        height: 100%;
        background-color: #1872f0;
        border-radius: 1px;
        margin-right: 8px;
      }

      .table-search-container {
        overflow: hidden;

        :deep(.el-icon) {
          font-size: 16px;
          margin: 0;
        }
      }

      :deep(.table-demo) {
        height: calc(100vh - 315px);
      }
    }
  }
}

.form-section {
  margin-bottom: 20px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2f3d;
    margin-bottom: 15px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.expand-container {
  width: 72%;
  padding: 10px;
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-weight: bold;
    }
  }

  :deep(.expand-table) {
    height: calc(100vh - 225px);
  }
  .pagination-container1 {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }
}
:deep(.hiderow .el-table__expand-column .el-icon) {
  visibility: hidden;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin: 16px 0;
  flex-wrap: wrap; // 小屏幕自动换行

  .stats-card {
    flex: 1;
    min-width: 220px;
    height: 90px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    overflow: hidden;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-4px);
    }

    .card-bar {
      width: 6px;
      height: 100%;
    }

    .bar-blue {
      background: linear-gradient(to bottom, #409eff, #79bbff);
    }
    .bar-green {
      background: linear-gradient(to bottom, #67c23a, #95d475);
    }
    .bar-orange {
      background: linear-gradient(to bottom, #e6a23c, #f0c27b);
    }
    .bar-red {
      background: linear-gradient(to bottom, #f56c6c, #f89898);
    }

    .card-content {
      padding: 0 20px;
      flex: 1;

      .card-label {
        font-size: 14px;
        color: #999;
        margin-bottom: 8px;
      }

      .card-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1;
      }
    }
  }
}

/* 响应式：超小屏幕时纵向排列 */
@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;

    .stats-card {
      min-width: unset;
    }
  }
}
</style>

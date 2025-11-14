<template>
  <div class="suppliers-wrapper layout-padding">
    <div class="suppliers-padding layout-padding-view layout-padding-auto">
      <div class="suppliers-container">
        <!-- 左侧树形分类区域 -->
        <div class="suppliers-left">
          <div class="tree-container">
            <div class="tree-top-block">
              <span class="tree-top-title">来往单位分类</span>
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
                placeholder="请输入来往单位分类名称"
                v-model.trim="treeFilterForm.keyword"
                clearable
                :suffix-icon="Search"
                @input="treeFilterInputData"
                @keyup.enter="treeFilterInputData"
                style="width: 240px"
              />
            </div>
            <el-tree
              ref="categoryTreeRef"
              :data="categoryTreeData"
              :props="treeProps"
              :default-expand-all="true"
              :expand-on-click-node="false"
              :highlight-current="true"
              node-key="id"
              @node-click="handleCategoryClick"
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
                      type="success"
                      :icon="Edit"
                      link
                      @click.stop="handleEditCategory(data)"
                      v-if="data.isSystem !== 1"
                    ></el-button>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      link
                      @click.stop="handleDeleteCategory(data)"
                      v-if="data.isSystem !== 1"
                    ></el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>

        <!-- 右侧表格区域 -->
        <div class="table-wrapper88">
          <div class="table-search-container">
            <el-form ref="searchFormRef" :model="searchForm" class="table-form">
              <el-row :gutter="35">
                <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
                  <el-form-item prop="keyword">
                    <el-input
                      placeholder="请输入来往单位名称搜索"
                      v-model.trim="searchForm.keyword"
                      clearable
                      :suffix-icon="Search"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="18" :lg="19" :xl="19">
                  <el-button type="primary" :icon="Plus" @click="handleAdd">
                    新增
                  </el-button>
                  <el-button
                    :disabled="selectedRows.length === 0"
                    type="danger"
                    @click="handleDeleteBatch"
                    :icon="Delete"
                  >
                    批量删除
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
            @checkboxChange="handleSelectionChange"
          >
            <template #enabled="{ row }">
              <el-tag :type="row.enabled === 1 ? 'success' : 'danger'">
                {{ row.enabled === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
            <template #operate="{ row }">
              <div class="operateBox no-print">
                <el-button
                  :type="row.enabled === 1 ? 'warning' : 'success'"
                  link
                  @click="handleToggleStatus(row)"
                >
                  {{ row.enabled === 1 ? "禁用" : "启用" }}
                </el-button>
                <el-button type="primary" link @click="handleEdit(row)">
                  编辑
                </el-button>
                <PopoverButton
                  :componentOption="{
                    tip: '删除后无法恢复，请谨慎操作！',
                    width: '',
                    svgIcon: 'warning',
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

    <!-- 新增/编辑往来单位弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1200px"
      @close="resetFormData"
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
      >
        <!-- 第一行：基础信息 -->
        <el-divider content-position="center">基础信息</el-divider>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="往来单位编码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入往来单位编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="往来单位名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入往来单位名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="往来单位英文名称" prop="englishName">
              <el-input
                v-model="formData.englishName"
                placeholder="请输入往来单位英文名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：分类和英文名称 -->
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="所属分类" prop="categoryId">
              <el-tree-select
                v-model="formData.categoryId"
                placeholder="请选择所属分类"
                :data="categoryTreeData"
                :props="{
                  label: 'name',
                  children: 'children',
                }"
                node-key="id"
                clearable
                style="width: 100%"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否启用" prop="enabled">
              <el-radio-group v-model="formData.enabled">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否分享" prop="isShare">
              <el-radio-group v-model="formData.isShare">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="2">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：地址和联系方式 -->
        <el-divider content-position="center">联系信息</el-divider>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="往来单位地址" prop="address">
              <el-input
                v-model="formData.address"
                placeholder="请输入往来单位地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="往来单位电话" prop="phone">
              <el-input
                v-model="formData.phone"
                placeholder="请输入往来单位电话"
              />
            </el-form-item> </el-col
          >·
          <el-col :span="7">
            <el-form-item label="往来单位邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入往来单位邮箱"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：官网和认证信息 -->
        <el-row :gutter="20" class="mb20">
          <el-col :span="12">
            <el-form-item label="往来单位官网" prop="website">
              <el-input
                v-model="formData.website"
                placeholder="请输入往来单位官网"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码" prop="creditCode">
              <el-input
                v-model="formData.creditCode"
                placeholder="请输入统一社会信用代码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 新增：银行信息 -->
        <el-divider content-position="center">银行信息</el-divider>
        <el-row :gutter="20" class="mb20">
          <el-col :span="12">
            <el-form-item label="开户银行" prop="accountBank">
              <el-input
                v-model="formData.accountBank"
                placeholder="请输入开户银行"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户账户" prop="accountNum">
              <el-input
                v-model="formData.accountNum"
                placeholder="请输入开户账户"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：等级和批次号 -->
        <el-divider content-position="center">附加信息</el-divider>
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="往来单位等级" prop="grade">
              <el-select
                v-model="formData.grade"
                placeholder="请选择往来单位等级"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in gradeOptions"
                  :key="item.category"
                  :label="item.categoryName"
                  :value="item.category"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="批次号" prop="batchNum">
              <el-input
                v-model="formData.batchNum"
                placeholder="请输入批次号"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 往来单位简介 -->
        <el-row :gutter="20" class="mb20">
          <el-col :span="24">
            <el-form-item label="往来单位简介" prop="introduction">
              <el-input
                type="textarea"
                v-model="formData.introduction"
                placeholder="请输入往来单位简介"
                :rows="3"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 备注 -->
        <el-row :gutter="20" class="mb20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                type="textarea"
                v-model="formData.remark"
                placeholder="请输入备注"
                :rows="2"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 联系人表格 -->
        <el-divider content-position="center">联系人信息</el-divider>
        <el-row :gutter="20" class="mb20">
          <el-col :span="24">
            <div class="contact-header">
              <el-button
                type="primary"
                :icon="Plus"
                size="small"
                @click="handleAddContact"
              >
                添加联系人
              </el-button>
            </div>

            <el-table
              :data="formData.contacts"
              style="width: 100%; margin-top: 10px"
              border
              empty-text="暂无联系人信息"
              height="200"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{ 'text-align': 'center' }"
            >
              <el-table-column
                type="index"
                label="序号"
                width="60"
                align="center"
              />
              <el-table-column
                prop="name"
                label="联系人姓名"
                min-width="120"
                show-overflow-tooltip
              />
              <el-table-column
                prop="phone"
                label="联系电话"
                min-width="130"
                show-overflow-tooltip
              />
              <el-table-column
                prop="email"
                label="邮箱地址"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="remark"
                label="备注"
                min-width="150"
                show-overflow-tooltip
              />
              <el-table-column
                label="操作"
                width="150"
                align="center"
                fixed="right"
              >
                <template #default="{ row, $index }">
                  <el-button
                    type="primary"
                    link
                    :icon="Edit"
                    size="small"
                    @click="handleEditContact($index)"
                    title="编辑"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    size="small"
                    @click="handleDeleteContact($index)"
                    title="删除"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFormData" size="default">取消</el-button>
          <el-button type="primary" @click="submitForm" size="default">
            {{ formData.id ? "保存修改" : "确认新增" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑分类弹框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogTitle"
      width="500px"
      @close="resetCategoryFormData"
      class="add-dialog"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryFormData"
        :rules="categoryFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="categoryFormData.name"
            placeholder="请输入分类名称"
          />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="categoryFormData.parentId"
            :data="categoryTreeData"
            :props="treeProps"
            clearable
            placeholder="请选择上级分类"
            check-strictly
            node-key="id"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetCategoryFormData">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑联系人弹框 -->
    <el-dialog
      v-model="contactDialogVisible"
      :title="contactDialogTitle"
      width="500px"
      @close="resetContactFormData"
    >
      <el-form
        ref="contactFormRef"
        :model="contactFormData"
        :rules="contactFormRules"
        label-width="100px"
      >
        <el-form-item label="联系人名称" prop="name">
          <el-input
            v-model="contactFormData.name"
            placeholder="请输入联系人名称"
          />
        </el-form-item>
        <el-form-item label="联系人电话" prop="phone">
          <el-input
            v-model="contactFormData.phone"
            placeholder="请输入联系人电话"
          />
        </el-form-item>
        <el-form-item label="联系人邮箱" prop="email">
          <el-input
            v-model="contactFormData.email"
            placeholder="请输入联系人邮箱"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="contactFormData.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetContactFormData">取消</el-button>
          <el-button type="primary" @click="submitContactForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="suppliers">
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue";
import CommonTable from "@/components/CommonTable/index.vue";
import PopoverButton from "@/components/PopoverButton/index.vue";
import { Search, Plus, Delete, Edit, Folder } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSupplierList,
  getSupplierDetail,
  saveSupplier,
  deleteSupplier,
  toggleSupplierStatus,
  getSupplierAutoCode,
  getSupplierGrades,
  getCategoryTree,
  saveCategory,
  deleteCategory,
} from "@/api/baseData/supplier";

// 树形结构相关
const categoryTreeRef = ref();
const categoryTreeData = ref([]);
const selectedCategoryId = ref(null);
const currentNode = ref(null);

const treeProps = {
  children: "children",
  label: "name",
  value: "id",
};

// 树形过滤相关
const treeFilterForm = ref({
  keyword: "",
});

// 搜索过滤
const treeFilterInputData = () => {
  getCategoryTreeData();
};

// 分类弹框相关
const categoryDialogVisible = ref(false);
const categoryDialogTitle = ref("新增分类");
const categoryFormRef = ref();
const categoryFormData = ref({
  id: 0,
  name: "",
  parentId: null,
});

const categoryFormRules = reactive({
  name: [{ required: true, message: "分类名称不能为空", trigger: "blur" }],
});

// 联系人弹框相关
const contactDialogVisible = ref(false);
const contactDialogTitle = ref("新增联系人");
const contactFormRef = ref();
const contactFormData = ref({
  id: null,
  name: "",
  phone: "",
  email: "",
  remark: "",
  supplierId: null,
});
const contactFormRules = reactive({
  name: [
    { required: true, message: "联系人名称不能为空", trigger: "blur" },
    {
      pattern: /^[A-Za-z\u4e00-\u9fa5]{2,50}$/,
      message: "联系人名称为2-50位中文或英文",
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: "联系人电话不能为空", trigger: "blur" },
    {
      pattern: /^(?:1[3-9]\d{9}|\d{3,4}-\d{7,8})$/,
      message: "请输入有效的手机号码或固定电话（如13812345678或010-12345678）",
      trigger: "blur",
    },
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入有效的邮箱地址",
      trigger: "blur",
    },
  ],
  remark: [
    {
      max: 200,
      message: "备注长度不能超过200字符",
      trigger: "blur",
    },
  ],
});
const editingContactIndex = ref(null);

// 表格相关
const searchForm = ref({
  keyword: "",
});
const selectedRows = ref([]);
const commonTableRef = ref();

const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "code",
        colWidth: "120",
        title: "往来单位编码",
        type: "text",
        isCheck: true,
      },
      {
        key: "name",
        colWidth: "200",
        title: "往来单位名称",
        type: "text",
        isCheck: true,
        status: "name",
      },
      {
        key: "categoryName",
        colWidth: "120",
        title: "所属分类",
        type: "text",
        isCheck: true,
      },
      {
        key: "shortName",
        colWidth: "120",
        title: "往来单位简称",
        type: "text",
        isCheck: true,
      },
      {
        key: "englishName",
        colWidth: "150",
        title: "往来单位英文名称",
        type: "text",
        isCheck: true,
      },
      {
        key: "address",
        colWidth: "200",
        title: "往来单位地址",
        type: "text",
        isCheck: true,
      },
      {
        key: "phone",
        colWidth: "120",
        title: "往来单位电话",
        type: "text",
        isCheck: true,
      },
      {
        key: "email",
        colWidth: "150",
        title: "往来单位邮箱",
        type: "text",
        isCheck: true,
      },
      {
        key: "website",
        colWidth: "150",
        title: "往来单位官网",
        type: "text",
        isCheck: true,
      },
      {
        key: "creditCode",
        colWidth: "180",
        title: "统一社会信用代码",
        type: "text",
        isCheck: true,
      },
      {
        key: "gradeStr",
        colWidth: "120",
        title: "往来单位等级",
        type: "text",
        isCheck: true,
        status: "gradeStrStatus",
      },
      {
        key: "enabled",
        colWidth: "120",
        title: "是否启用",
        type: "tag",
        isCheck: true,
        status: "useStatus",
      },
      {
        key: "remark",
        colWidth: "150",
        title: "备注",
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
      operateWidth: "200",
    },
    param: {
      pageNum: 1,
      pageSize: 10,
    },
  },
});

// 弹框相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增往来单位");
const formRef = ref();

const formData = ref({
  id: "",
  code: "",
  name: "",
  englishName: "",
  shortName: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  creditCode: "",
  introduction: "",
  logo: "",
  officialSeal: "",
  enabled: 0,
  isShare: 2,
  grade: null,
  batchNum: "",
  accountBank: "",
  accountNum: "",
  contacts: [],
  remark: "",
  categoryId: null,
});

const formRules = reactive({
  code: [
    { required: true, message: "往来单位编码不能为空", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9_]{4,20}$/,
      message: "编码为4-20位字母、数字或下划线",
      trigger: "blur",
    },
  ],
  name: [
    { required: true, message: "往来单位名称不能为空", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9\s\u4e00-\u9fa5]{2,50}$/,
      message: "名称为2-50位中文、英文、数字或空格",
      trigger: "blur",
    },
  ],
  englishName: [
    {
      pattern: /^[A-Za-z0-9\s-]{2,100}$/,
      message: "英文名称为2-100位英文、数字、空格或连字符",
      trigger: "blur",
    },
  ],
  address: [
    { required: true, message: "往来单位地址不能为空", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9\s\u4e00-\u9fa5]{2,100}$/,
      message: "地址为2-100位中文、英文、数字或空格",
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: "往来单位电话不能为空", trigger: "blur" },
    {
      pattern: /^(?:1[3-9]\d{9}|\d{3,4}-\d{7,8})$/,
      message: "请输入有效的手机号码或固定电话（如13812345678或010-12345678）",
      trigger: "blur",
    },
  ],
  email: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入有效的邮箱地址",
      trigger: "blur",
    },
  ],
  website: [
    {
      pattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
      message: "请输入有效的网址（如http://example.com）",
      trigger: "blur",
    },
  ],
  accountBank: [
    {
      pattern: /^[A-Za-z0-9\s\u4e00-\u9fa5]{2,50}$/,
      message: "开户银行为2-50位中文、英文、数字或空格",
      trigger: "blur",
    },
  ],
  accountNum: [
    {
      pattern: /^\d{12,19}(-\d{1,4})?$/,
      message: "银行账号为12-19位数字，可包含连字符",
      trigger: "blur",
    },
  ],
  batchNum: [
    {
      pattern: /^[A-Za-z0-9_]{4,20}$/,
      message: "批次号为4-20位字母、数字或下划线",
      trigger: "blur",
    },
  ],
  isShare: [{ required: true, message: "请选择是否分享", trigger: "change" }],
});

// 往来单位等级选项
const gradeOptions = ref([]);

// 树形操作方法
const getCategoryTreeData = async () => {
  const params = {
    id: 0,
    name: treeFilterForm.value.keyword,
  };
  const res = await getCategoryTree(params);
  categoryTreeData.value = res.data;
  // 如果有数据，自动选中第一个节点
  if (categoryTreeData.value && categoryTreeData.value.length > 0) {
    const firstNode = categoryTreeData.value[0];
    currentNode.value = firstNode;
    selectedCategoryId.value = firstNode.id;
    // 设置树形控件选中状态
    nextTick(() => {
      categoryTreeRef.value?.setCurrentKey(firstNode.id);
    });
    // 获取表格数据
    getTableData();
  }
};

const handleCategoryClick = (data) => {
  currentNode.value = data;
  selectedCategoryId.value = data.id;
  // 重新加载表格数据，根据选中的分类过滤
  state.tableData.param.pageNum = 1;
  getTableData();
};

const handleAddRootCategory = () => {
  categoryDialogTitle.value = "新增分类";
  categoryFormData.value = {
    id: 0,
    name: "",
    parentId: null,
  };
  categoryDialogVisible.value = true;
};

const handleAddCategory = (data) => {
  categoryDialogTitle.value = "新增分类";
  categoryFormData.value = {
    id: 0,
    name: "",
    parentId: data.id,
  };
  categoryDialogVisible.value = true;
};

const handleEditCategory = (data) => {
  categoryDialogTitle.value = "编辑分类";
  categoryFormData.value = {
    id: data.id,
    name: data.name,
    parentId: data.parentId,
  };
  categoryDialogVisible.value = true;
};

const handleDeleteCategory = async (data) => {
  if (!data) {
    ElMessage.warning("请先选择一个往来单位分类");
    return;
  }

  await ElMessageBox.confirm(
    `确认删除分类"${data.name}"吗？删除后该分类下的所有分类将一并删除！`,
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  );

  await deleteCategory({ id: data.id });
  ElMessage.success("删除成功");
  currentNode.value = null;
  selectedCategoryId.value = null;
  getCategoryTreeData();
};

const resetCategoryFormData = () => {
  categoryFormData.value = {
    id: 0,
    name: "",
    parentId: null,
  };
  categoryFormRef.value?.resetFields();
  categoryDialogVisible.value = false;
};

const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return;
  await categoryFormRef.value.validate();
  await saveCategory(categoryFormData.value);
  ElMessage.success(categoryFormData.value.id ? "编辑成功" : "新增成功");
  resetCategoryFormData();
  getCategoryTreeData();
};

// 联系人操作方法
const handleAddContact = () => {
  contactDialogTitle.value = "新增联系人";
  contactFormData.value = {
    id: null,
    name: "",
    phone: "",
    email: "",
    remark: "",
    supplierId: null,
  };
  editingContactIndex.value = null;
  contactDialogVisible.value = true;
};

const handleEditContact = (index) => {
  contactDialogTitle.value = "编辑联系人";
  contactFormData.value = { ...formData.value.contacts[index] };
  editingContactIndex.value = index;
  contactDialogVisible.value = true;
};

const handleDeleteContact = (index) => {
  ElMessageBox.confirm("确定删除该联系人吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      formData.value.contacts.splice(index, 1);
      ElMessage.success("删除联系人成功");
    })
    .catch(() => {});
};

const resetContactFormData = () => {
  contactFormData.value = {
    id: null,
    name: "",
    phone: "",
    email: "",
    remark: "",
    supplierId: null,
  };
  contactFormRef.value?.resetFields();
  contactDialogVisible.value = false;
};

const submitContactForm = async () => {
  if (!contactFormRef.value) return;
  try {
    await contactFormRef.value.validate();
    if (editingContactIndex.value === null) {
      // 新增
      formData.value.contacts.push({ ...contactFormData.value });
      ElMessage.success("新增联系人成功");
    } else {
      // 编辑
      formData.value.contacts[editingContactIndex.value] = {
        ...contactFormData.value,
      };
      ElMessage.success("编辑联系人成功");
    }
    resetContactFormData();
  } catch (error) {
    ElMessage.error("保存联系人失败");
  }
};

// 获取往来单位等级
const getGradeOptions = async () => {
  const res = await getSupplierGrades();
  gradeOptions.value = res.data;
};

// 获取自动编码
const getAutoCode = async () => {
  try {
    const res = await getSupplierAutoCode();
    formData.value.code = res.data;
  } catch (error) {
    console.error("获取往来单位编码失败:", error);
  }
};

// 表格操作
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

// 获取表格数据
const getTableData = async () => {
  state.tableData.config.loading = true;
  const params = {
    first: 0,
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    query: {
      categoryId: selectedCategoryId.value,
      supplierCode: "",
      supplierId: 0,
      supplierName: searchForm.value.keyword,
    },
    queryid: 0,
    sort: "",
    sortField: "",
  };
  const res = await getSupplierList(params);
  state.tableData.data = res.data.rows;
  state.tableData.config.total = res.data.records;
  state.tableData.config.loading = false;
};

// 往来单位操作
const handleAdd = async () => {
  if (!selectedCategoryId.value) {
    ElMessage.warning("请先选择一个往来单位分类");
    return;
  }
  dialogTitle.value = "新增往来单位";
  formData.value = {
    id: "",
    code: "",
    name: "",
    englishName: "",
    shortName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    creditCode: "",
    introduction: "",
    logo: "",
    officialSeal: "",
    enabled: 0,
    isShare: 2,
    grade: null,
    batchNum: "",
    accountBank: "",
    accountNum: "",
    contacts: [],
    remark: "",
    categoryId: selectedCategoryId.value,
  };
  await getAutoCode();
  dialogVisible.value = true;
};

const handleEdit = async (row) => {
  dialogTitle.value = "编辑往来单位";
  const res = await getSupplierDetail({ id: row.id });
  formData.value = {
    ...res.data,
    categoryId: String(res.data.categoryId),
  };
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await deleteSupplier({ id: row.id });
    ElMessage.success("删除成功");
    getTableData();
  } catch (error) {
    console.error("删除供应商失败:", error);
    ElMessage.error("删除失败");
  }
};

const handleDeleteBatch = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的供应商");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要批量删除选中的供应商吗？", "提示", {
      type: "warning",
    });

    const deletePromises = selectedRows.value.map((row) =>
      deleteSupplier({ id: row.id })
    );
    await Promise.all(deletePromises);

    ElMessage.success("批量删除成功");
    commonTableRef.value?.clearCheckboxState();
    selectedRows.value = [];
    getTableData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("批量删除供应商失败:", error);
      ElMessage.error("批量删除失败");
    }
  }
};

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.enabled === 1 ? 0 : 1;
    await toggleSupplierStatus({ id: row.id, enabled: newStatus });
    ElMessage.success(`供应商状态已${newStatus === 1 ? "启用" : "禁用"}`);
    getTableData();
  } catch (error) {
    console.error("更新供应商状态失败:", error);
    ElMessage.error("更新状态失败");
  }
};

const resetFormData = () => {
  formData.value = {
    id: "",
    code: "",
    name: "",
    englishName: "",
    shortName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    creditCode: "",
    introduction: "",
    logo: "",
    officialSeal: "",
    enabled: 0,
    isShare: 2,
    grade: null,
    batchNum: "",
    accountBank: "",
    accountNum: "",
    contacts: [],
    remark: "",
    categoryId: null,
  };
  formRef.value?.resetFields();
  dialogVisible.value = false;
};

const submitForm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    // Prepare data for API, mapping contacts to SuppliersContacts structure
    const submitData = {
      ...formData.value,
      contacts: formData.value.contacts.map((contact) => ({
        id: contact.id || null,
        name: contact.name || "",
        phone: contact.phone || "",
        email: contact.email || "",
        remark: contact.remark || "",
        supplierId: formData.value.id || null,
      })),
    };
    await saveSupplier(submitData);
    ElMessage.success(formData.value.id ? "编辑成功" : "新增成功");
    resetFormData();
    getTableData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("保存供应商失败:", error);
      ElMessage.error(formData.value.id ? "编辑失败" : "新增失败");
    }
  }
};

// 监听搜索关键字变化
watch(
  () => searchForm.value.keyword,
  () => {
    state.tableData.param.pageNum = 1;
    getTableData();
  }
);

onMounted(() => {
  getCategoryTreeData();
  getGradeOptions();
});

// 提供Excel导入配置
const uploadConfig = {
  url: "/contact/units/importData",
  data: {
    categoryId: selectedCategoryId.value,
  },
};

// 导入模版
const templateConfig = {
  url: "/contact/units/importTemplate",
  fileName: "往来单位导入模版.xlsx",
};

// 提供配置给子组件
provide("uploadConfig", uploadConfig);
provide("templateConfig", templateConfig);
</script>

<style scoped lang="scss">
.suppliers-padding {
  padding: 15px;

  .suppliers-container {
    display: flex;

    .suppliers-left {
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
        height: calc(100vh - 170px);
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

      .blue-title::before {
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
        height: calc(100vh - 170px);
      }
    }
  }
}

.add-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }

  :deep(.el-dialog__footer) {
    padding: 15px 20px 20px;
    border-top: 1px solid #ebeef5;
  }

  // 分割线样式
  :deep(.el-divider) {
    margin: 25px 0 20px;

    .el-divider__text {
      background-color: #fff;
      color: #409eff;
      font-weight: 500;
      font-size: 14px;
    }
  }

  // 表单项间距
  .mb20 {
    margin-bottom: 20px;
  }

  // 联系人相关样式
  .contact-header {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-bottom: 10px;

    .contact-tip {
      font-size: 12px;
      color: #909399;
    }
  }

  // 表单标签对齐
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }

  // 必填项标记样式
  :deep(.el-form-item.is-required .el-form-item__label::before) {
    color: #f56c6c;
    margin-right: 4px;
  }

  // 输入框样式
  :deep(.el-input__wrapper) {
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc;
    }
  }

  // 选择器样式
  :deep(.el-select) {
    width: 100%;
  }

  // 单选按钮组样式
  :deep(.el-radio-group) {
    .el-radio {
      margin-right: 20px;
    }
  }

  // 表格样式
  :deep(.el-table) {
    border-radius: 4px;

    .el-table__header th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 500;
    }

    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

// 对话框底部按钮样式
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    min-width: 80px;
  }
}
</style>

<template>
  <div class="test-template layout-padding">
    <div class="test-template-padding layout-padding-view layout-padding-auto">
      <div class="search-area">
        <el-form :model="searchForm">
          <el-row>
            <el-col :span="4">
              <el-form-item label="检验单名称">
                <el-input
                  v-model="searchForm.name"
                  placeholder="请输入检验单名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="20" style="text-align: right">
              <el-button type="success" @click="toggleAdvancedSearch">
                <el-icon><ArrowDown /></el-icon>高级查询
              </el-button>
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>新增
              </el-button>
              <el-button type="danger" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>批量删除
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <!-- 高级查询 -->
      <div class="advanced-search" v-show="showAdvanced">
        <el-form :inline="true" :model="searchForm" class="advanced-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="检验单名称">
                <el-input
                  v-model="searchForm.name"
                  placeholder="请输入检验单名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="检验单编码">
                <el-input
                  v-model="searchForm.code"
                  placeholder="请输入检验单编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="产品名称">
                <el-input
                  v-model="searchForm.productsName"
                  placeholder="请输入产品名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="产品编码">
                <el-input
                  v-model="searchForm.productCode"
                  placeholder="请输入产品编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="规格型号">
                <el-input
                  v-model="searchForm.specification"
                  placeholder="请输入规格型号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="本次接收数量">
                <el-input-number
                  v-model="searchForm.receivedNum"
                  placeholder="请输入本次接收数量"
                  class="w-full"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="不合格数量">
                <el-input-number
                  v-model="searchForm.unqualifiedNum"
                  placeholder="请输入不合格数量"
                  class="w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="检验日期">
                <el-date-picker
                  v-model="testTimeDate"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  @change="testTimeChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="检验结果">
                <el-select
                  v-model="searchForm.checkState"
                  placeholder="请选择检验结果"
                  class="w-full"
                >
                  <el-option label="待检验" :value="0" />
                  <el-option label="合格" :value="1" />
                  <el-option label="不合格" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="来料日期">
                <el-date-picker
                  v-model="arrivalTimeDate"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  @change="arriveTimeChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="备注">
                <el-input
                  v-model="searchForm.remark"
                  placeholder="请输入备注"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" justify="end">
            <el-col :span="24" style="text-align: right">
              <el-button type="primary" @click="handleAdvancedSearch">
                <el-icon><Search /></el-icon>查询
              </el-button>
              <el-button @click="handleAdvancedReset">
                <el-icon><Refresh /></el-icon>重置
              </el-button>
              <el-button @click="toggleAdvancedSearch">
                <el-icon><Close /></el-icon>关闭
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
        <template #operate="{ row }">
          <el-button
            type="success"
            link
            @click="handleViews(row)"
            v-if="row.checkState != 0"
            >查看</el-button
          >
          <template v-else>
            <el-button type="primary" link @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button type="danger" link @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </template>
      </CommonTable>
    </div>

    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="1000px"
      :close-on-click-modal="false"
      destroy-on-close
      class="add-dialog"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="auto"
        class="dialog-form"
      >
        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="检验单编码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="自动生成"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检验单名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入检验单名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关联采购合同" required prop="contractCode">
              <el-input
                placeholder="请输入关联采购合同"
                v-model="formData.contractName"
                readonly
                @click="toggleOrder"
              >
                <template #suffix>
                  <el-icon class="toggle"><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="产品物料名称" prop="productsId" required>
              <el-select
                v-model="formData.productsId"
                placeholder="请选择产品物料"
                class="w-full"
                @change="handleMaterialChange"
              >
                <el-option
                  v-for="item in materialOption"
                  :key="item.materialsId"
                  :label="item.name"
                  :value="item.materialsId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="接收数量" prop="receivedNum">
              <el-input-number
                v-model="formData.receivedNum"
                :min="0"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检验数量" prop="checkNum">
              <el-input-number
                v-model="formData.checkNum"
                :min="0"
                class="w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb20">
          <el-col :span="8">
            <el-form-item label="来料日期" prop="arriveTime">
              <el-date-picker
                v-model="formData.arriveTime"
                type="datetime"
                class="w-full"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="center">检验项</el-divider>
        <el-table
          :data="inspectionItemsList"
          border
          style="width: 100%"
          height="260"
          class="mb20"
          row-key="id"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
          v-loading="inspectionItemsPage.inspectionItemsLoading"
        >
          <el-table-column type="selection" width="55" fixed="left" />
          <el-table-column
            label="检验项名称"
            prop="itemName"
            min-width="150"
            fixed="left"
          />
          <el-table-column label="检验项编码" prop="itemCode" min-width="150" />
          <el-table-column label="检验项类型" prop="itemTypeStr" width="120" />
          <el-table-column label="检验工具" prop="itemTool" min-width="120" />
          <el-table-column
            label="检验要求"
            prop="requirement"
            min-width="150"
          />
          <el-table-column label="标准值" prop="standardValue" width="100" />
          <el-table-column
            label="致命缺陷数量"
            prop="criticalDefectNum"
            width="120"
          />
          <el-table-column
            label="严重缺陷数量"
            prop="seriousDefectNum"
            width="120"
          />
          <el-table-column
            label="轻微缺陷数量"
            prop="minorDefectNum"
            width="120"
          />
          <el-table-column label="备注" prop="remark" min-width="150" />
        </el-table>
        <div class="table-pagination">
          <el-pagination
            v-model:current-page="inspectionItemsPage.pageNum"
            v-model:page-size="inspectionItemsPage.pageSize"
            :page-sizes="[10, 20, 30, 40]"
            :total="inspectionItemsPage.total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageCurrentChange"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting"
          >确 定</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      title="检验单详情"
      v-model="viewDialogVisible"
      width="1000px"
      :close-on-click-modal="false"
      destroy-on-close
      class="view-dialog add-dialog"
    >
      <div class="view-content">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="检验单编码">{{
            viewData.code
          }}</el-descriptions-item>
          <el-descriptions-item label="检验单名称">{{
            viewData.name
          }}</el-descriptions-item>
          <el-descriptions-item label="产品物料编码">{{
            viewData.productsCode
          }}</el-descriptions-item>

          <el-descriptions-item label="产品名称">{{
            viewData.productsName
          }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{
            viewData.specifications
          }}</el-descriptions-item>
          <el-descriptions-item label="接收数量">{{
            viewData.receivedNum
          }}</el-descriptions-item>

          <el-descriptions-item label="检验数量">{{
            viewData.checkNum
          }}</el-descriptions-item>
          <el-descriptions-item label="合格数量">{{
            viewData.qualifiedNum
          }}</el-descriptions-item>
          <el-descriptions-item label="不合格数量">{{
            viewData.unqualifiedNum
          }}</el-descriptions-item>

          <el-descriptions-item label="来料日期">{{
            viewData.arriveTime
          }}</el-descriptions-item>
          <el-descriptions-item label="检验日期">{{
            viewData.inspectionTime
          }}</el-descriptions-item>
          <el-descriptions-item label="检验人">{{
            viewData.checkUserName
          }}</el-descriptions-item>

          <el-descriptions-item label="检验结果" :span="3">
            <el-tag :type="getCheckStateType(viewData.checkState)">
              {{ getCheckStateText(viewData.checkState) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{
            viewData.remark
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- 检验项列表 -->
        <div class="inspection-items mt20">
          <div class="title">检验项列表</div>
          <el-table
            :data="inspectionItemsList"
            border
            style="width: 100%"
            class="mt10"
            :cell-style="{ textAlign: 'center' }"
            :header-cell-style="{ 'text-align': 'center' }"
          >
            <el-table-column type="selection" width="50" fixed />
            <el-table-column type="index" label="序号" width="65" fixed />
            <el-table-column
              label="检验项名称"
              prop="itemName"
              min-width="150"
              fixed
            />
            <el-table-column
              label="检验项编码"
              prop="itemCode"
              min-width="150"
            />
            <el-table-column
              label="检验项类型"
              prop="itemTypeStr"
              width="120"
            />
            <el-table-column label="检验工具" prop="itemTool" min-width="120" />
            <el-table-column
              label="检验要求"
              prop="requirement"
              min-width="150"
            />
            <el-table-column label="标准值" prop="standardValue" width="100" />
            <el-table-column label="误差上限" prop="upperLimit" width="100" />
            <el-table-column label="误差下限" prop="lowerLimit" width="100" />
            <el-table-column
              label="致命缺陷数量"
              prop="criticalDefectNum"
              width="120"
            />
            <el-table-column
              label="严重缺陷数量"
              prop="seriousDefectNum"
              width="120"
            />
            <el-table-column
              label="轻微缺陷数量"
              prop="minorDefectNum"
              width="120"
            />
          </el-table>
        </div>
      </div>
    </el-dialog>
    <!-- 订单选择弹窗 -->
    <el-dialog
      v-model="orderSelectVisible"
      title="选择合同"
      width="1000px"
      append-to-body
      class="select-dialog"
    >
      <el-table
        :data="orderList"
        height="400"
        border
        stripe
        highlight-current-row
        @row-click="handleOrderSelect"
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ 'text-align': 'center' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="合同编号" width="" />
        <el-table-column prop="name" label="合同名称" width="" />
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="orderPage"
          v-model:page-size="orderPageSize"
          :page-sizes="[5, 10, 20]"
          :total="orderTotal"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleOrderSizeChange"
          @current-change="handleOrderPageChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="js">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { Delete, Plus, Refresh, Search, ArrowDown, Close, Document } from '@element-plus/icons-vue';
import CommonTable from '@/components/CommonTable/index.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
	getIncomingTestList,
	addOrEditIncomingTest,
	autoIncomingTestCode,
	getInspectionItemsList,
	getIncomingTestDetail,
	deleteIncomingTest,
} from '@/api/quality/incomingTest';
import { getProductDownList } from '@/api/leanScheduling/productManage';
import { getAllContactList,getContactMaterialShow } from "@/api/purchase/contract";

const commonTableRef = ref();
const selectedRows = ref([]);

const searchForm = ref({
	beginArriveTime: '',
	beginInspectionTime: '',
	checkState: null,
	code: '',
	endArriveTime: '',
	endInspectionTime: '',
	name: '',
	productCode: '',
	productsName: '',
	receivedNum: null,
	remark: '',
	specification: '',
	unqualifiedNum: null,
});
const testTimeDate = ref([]);
const testTimeChange = (val) => {
	if (val && val.length === 2) {
		searchForm.value.beginInspectionTime = val[0];
		searchForm.value.endInspectionTime = val[1];
	} else {
		searchForm.value.beginInspectionTime = '';
		searchForm.value.endInspectionTime = '';
	}
};
const arrivalTimeDate = ref([]);
const arriveTimeChange = (val) => {
	if (val && val.length === 2) {
		searchForm.value.beginArriveTime = val[0];
		searchForm.value.endArriveTime = val[1];
	} else {
		searchForm.value.beginArriveTime = '';
		searchForm.value.endArriveTime = '';
	}
};

const state = reactive({
	tableData: {
		data: [], // 实际数据会通过 API 获取
		header: [
			{ key: 'code', title: '检验单编号', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'name', title: '检验单名称', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'suppliersCode', title: '供应商编码', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'suppliersName', title: '供应商名称', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'suppliersBatchNum', title: '供应商批次号', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'productCode', title: '产品物料编码', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'productName', title: '产品物料名称', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'specifications', title: '规格型号', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'checkNum', title: '接收数量', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'receivedNum', title: '检验数量', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'unqualifiedNum', title: '不合格数', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'arriveTime', title: '来料日期', type: 'text', isCheck: true, colWidth: '200' },
			{ key: 'checkTime', title: '检验日期', type: 'text', isCheck: true, colWidth: '200' },
			{ key: 'checkUserName', title: '检验人员', type: 'text', isCheck: true, colWidth: '150' },
			{ key: 'checkState', title: '检验状态', type: 'text', isCheck: true, colWidth: '150', status: 'checkState' },
		],
		config: {
			total: 0,
			loading: false,
			isBorder: true,
			isSerialNo: true,
			isSelection: true,
			isOperate: true,
			operateWidth: '200',
			isFixed: true,
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

// 获取表格数据
const getTableData = async () => {
	state.tableData.config.loading = true;
	const params = {
		first: 0,
		pageNum: state.tableData.param.pageNum,
		pageSize: state.tableData.param.pageSize,
		query: {
			beginArriveTime: searchForm.value.beginArriveTime,
			beginInspectionTime: searchForm.value.beginInspectionTime,
			checkState: searchForm.value.checkState,
			code: searchForm.value.code,
			endArriveTime: searchForm.value.endArriveTime,
			endInspectionTime: searchForm.value.endInspectionTime,
			name: searchForm.value.name,
			productCode: searchForm.value.productCode,
			productsName: searchForm.value.productsName,
			receivedNum: searchForm.value.receivedNum,
			remark: searchForm.value.remark,
			specification: searchForm.value.specification,
			unqualifiedNum: searchForm.value.unqualifiedNum,
		},
		queryid: 0,
		sort: '',
		sortField: '',
	};
	try {
		const res = await getIncomingTestList(params);
		state.tableData.data = res.data.rows;
		state.tableData.config.total = res.data.records;
	} finally {
		state.tableData.config.loading = false;
	}
};

// 无按钮搜索
watch(
	() => searchForm.value.name,
	() => {
		getTableData();
	},
	{ deep: true }
);

// 重置
const handleReset = () => {
	searchForm.value = {
		beginArriveTime: '',
		beginInspectionTime: '',
		checkState: null,
		code: '',
		endArriveTime: '',
		endInspectionTime: '',
		name: '',
		productCode: '',
		productsName: '',
		receivedNum: null,
		remark: '',
		specification: '',
		unqualifiedNum: null,
	};
};

// 弹框相关
const dialogVisible = ref(false);
const dialogTitle = computed(() => (formData.value.id ? '编辑来料检验单' : '新增来料检验单'));
const formRef = ref();
const submitting = ref(false);
const inspectionItemsList = ref([]);

// 表单数据
const formData = ref({
	arriveTime: '',
	checkNum: 0,
	checkTime: '',
	code: '',
	contractCode: '',
  contractId: 0,
	id: 0,
	key: '',
	name: '',
	receivedNum: 0,
	remark: '',
	unqualifiedNum: 0,
});

// 表单校验规则
const formRules = {
	name: [{ required: true, message: '请输入检验单名称', trigger: 'blur' }],
	checkType: [{ required: true, message: '请选择检验类型', trigger: 'blur' }],
	productsId: [{ required: true, message: '请选择产品编码', trigger: 'change' }],
	receivedNum: [{ required: true, message: '请输入接收数量', trigger: 'blur' }],
	checkNum: [{ required: true, message: '请输入检验数量', trigger: 'blur' }],
};



// 新增方法
const handleAdd = async () => {
	formData.value = {
		arriveTime: '',
		checkNum: 0,
		checkTime: '',
		code: '',
		id: 0,
		key: '',
		name: '',
		contractCode: '',
		contractId: 0,
		receivedNum: 0,
		remark: '',
		unqualifiedNum: 0,
	};
		const res = await autoIncomingTestCode();
		formData.value.code = res.data || '';

	dialogVisible.value = true;
};


const handleMaterialChange = ()=>{
  getInspectionItemsListData1(formData.value.productsId);
}
const inspectionItemsPage = ref({
	pageNum: 1,
	pageSize: 10,
	total: 0,
	inspectionItemsLoading: false,
});
const getInspectionItemsListData1 = async (materialsId) => {
	inspectionItemsPage.value.inspectionItemsLoading = true;
	const params = {
		first: 0,
		pageNum: inspectionItemsPage.value.pageNum,
		pageSize: inspectionItemsPage.value.pageSize,
		query: {
			examineType: 1,
			productId: materialsId,
		},
		queryid: 0,
		sort: '',
		sortField: '',
	};
	const res = await getInspectionItemsList(params);
	inspectionItemsList.value = res.data.rows;
	inspectionItemsPage.value.total = res.data.records;
	inspectionItemsPage.value.inspectionItemsLoading = false;
};
const getInspectionItemsListData = async (materialsId) => {
	inspectionItemsPage.value.inspectionItemsLoading = true;
	const params = {
		first: 0,
		pageNum: inspectionItemsPage.value.pageNum,
		pageSize: inspectionItemsPage.value.pageSize,
		query: {
			examineType: 1,
			id: materialsId,
		},
		queryid: 0,
		sort: '',
		sortField: '',
	};
	const res = await getInspectionItemsList(params);
	inspectionItemsList.value = res.data.rows;
	inspectionItemsPage.value.total = res.data.records;
	inspectionItemsPage.value.inspectionItemsLoading = false;
};

const handlePageSizeChange = (pageSize) => {
	inspectionItemsPage.value.pageSize = pageSize;
	getInspectionItemsListData(formData.value.productsId);
};
const handlePageCurrentChange = (cureet) => {
	inspectionItemsPage.value.pageNum = cureet;
	getInspectionItemsListData(formData.value.productsId);
};

// 编辑方法
const handleEdit = async (row) => {
	const res = await getIncomingTestDetail({ id: row.id });
	formData.value =res.data,
	dialogVisible.value = true;
  getContactMaterial({id: formData.value.contractId});
  getInspectionItemsListData(res.data.id);
};

// 选择采购合同
const orderSelectVisible = ref(false);
const orderList = ref([]);
const orderPage = ref(1);
const orderPageSize = ref(10);
const orderTotal = ref(0);
const toggleOrder = () => {
  orderSelectVisible.value = true;
};
const getOrderListData = async () => {
  const parameter = {
    pageNum: orderPage.value,
    pageSize: orderPageSize.value,
    checkState: 1,
  };
  const res = await getAllContactList(parameter);
  orderList.value = res.data;
  orderTotal.value = res.data.length;
};

const handleOrderSelect = (row) => {
  formData.value.contractId = row.id;
  formData.value.contractCode = row.code;
  formData.value.contractName = row.name;
  orderSelectVisible.value = false;
  getContactMaterial(row);
};

const materialOption = ref([])
const getContactMaterial = async (row) => {
  const res = await getContactMaterialShow(row.id);
  materialOption.value = res.data;
};

const handleOrderSizeChange = (val) => {
  orderPageSize.value = val;
  getOrderListData();
};

const handleOrderPageChange = (val) => {
  orderPage.value = val;
  getOrderListData();
};

// 添加查看详情弹框相关变量
const viewDialogVisible = ref(false);
const viewData = ref({
	code: '',
	name: '',
	productsCode: '',
	productsName: '',
	specification: '',
	receivedNum: 0,
	checkNum: 0,
	qualifiedNum: 0, // 合格数量
	unqualifiedNum: 0, // 不合格数量
	checkTime: '', // 检验日期
	checkUserName: '', // 检验人
	checkState: '', // 检验结果
	arriveTime: '',
	remark: '',
});

// 修改查看方法
const handleViews = async (row) => {
	try {
		const res = await getIncomingTestDetail({ id: row.id });
		viewData.value = res.data;
		viewDialogVisible.value = true;
		getInspectionItemsListData(res.data.id);
	} catch (error) {
		console.error('获取详情失败', error);
		ElMessage.error('获取详情失败');
	}
};

// 提交表单
const handleSubmit = async () => {
	if (!formRef.value) return;

	await formRef.value.validate();
	if(!inspectionItemsList.value.length) return ElMessage.warning('请至少添加一个检验项');
	submitting.value = true;
	try {
		// TODO: 调用保存API
		const isEdit = !!formData.value.id;
		if (!isEdit) {
			formData.value.key = inspectionItemsList.value[0].key;
		}
		await addOrEditIncomingTest(formData.value);
		ElMessage.success(`${isEdit ? '编辑' : '新增'}成功`);
		dialogVisible.value = false;
		getTableData();
	} catch (error) {
		console.error(error);
		ElMessage.error(`${formData.value.id ? '编辑' : '新增'}失败`);
	} finally {
		submitting.value = false;
	}
};

// 单个删除操作
const handleDelete = async (row) => {
	try {
		const confirm = await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		});
		if (confirm) {
			await deleteIncomingTest({ id: row.id });
			ElMessage.success('删除成功');
			getTableData(); // 重新获取数据
		}
	} catch (error) {
	}
};

// 批量删除操作
const handleBatchDelete = async () => {
	if (!selectedRows.value.length) {
		ElMessage.warning('请选择要删除的记录');
		return;
	}
	try {
		const confirm = await ElMessageBox.confirm('确定要删除选中的记录吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		});
		if (confirm) {
			await deleteIncomingTest(selectedRows.value.map((item) => item.id));
			ElMessage.success('删除成功');
			getTableData(); // 重新获取数据
			commonTableRef.value.clearCheckboxState();
		}
	} catch (error) {
	}
};

// 添加表格选择事件
const handleSelectionChange = (selection) => {
	selectedRows.value = selection;
};

// 添加高级搜索相关的状态和方法
const showAdvanced = ref(false);

// 切换高级搜索显示/隐藏
const toggleAdvancedSearch = () => {
	showAdvanced.value = !showAdvanced.value;
};

// 高级搜索
const handleAdvancedSearch = () => {
	getTableData();
	showAdvanced.value = false;
};

// 高级搜索重置
const handleAdvancedReset = () => {
	handleReset();
	showAdvanced.value = false;
};


const getCheckStateType = (state) => {
	const typeMap = {
		0: 'info',
		1: 'success',
		2: 'danger',
	};
	return typeMap[state] || 'info';
};

const getCheckStateText = (state) => {
	const textMap = {
		0: '待检验',
		1: '合格',
		2: '不合格',
	};
	return textMap[state] || '';
};

onMounted(() => {
	getTableData();
	getOrderListData();
});
</script>

<style lang="scss" scoped>
.test-template-padding {
  padding: 20px;
  position: relative;

  .search-area {
    background: #fff;
    border-radius: 4px;

    :deep(.el-form-item) {
      width: 100%;

      .el-form-item__content {
        width: calc(100% - 100px);
      }
    }

    :deep(.el-button) {
      margin-left: 12px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .advanced-search {
    position: absolute;
    top: 75px;
    left: 20px;
    right: 20px;
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 999;
    border: 1px solid var(--el-border-color-light);

    .advanced-form {
      :deep(.el-form-item) {
        margin-bottom: 18px;
        width: 100%;

        .el-form-item__content {
          width: calc(100% - 100px);
        }
      }
    }

    :deep(.el-button) {
      margin-left: 12px;

      .el-icon {
        margin-right: 4px;
      }
    }

    .el-row:last-child {
      margin-bottom: 0;
    }
  }

  .table-demo {
    height: calc(100vh - 180px);
    background: #fff;
    z-index: 0;
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-form {
  .w-full {
    width: 100%;
  }
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.view-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .view-content {
    .title {
      font-size: 16px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 10px;
      padding-left: 8px;
      border-left: 4px solid var(--el-color-primary);
    }

    .mt20 {
      margin-top: 20px;
    }

    .mt10 {
      margin-top: 10px;
    }

    .attachment-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .attachment-item {
        width: 120px;
        height: 120px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
        overflow: hidden;

        .attachment-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .attachment-file {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--el-text-color-secondary);

          .el-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }

          span {
            font-size: 12px;
            padding: 0 4px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }
    }
  }
}
</style>

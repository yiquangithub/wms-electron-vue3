<template>
  <div class="file-approve layout-padding">
    <div class="file-approve-padding layout-padding-view layout-padding-auto">
      <!-- Tabs 切换 -->
      <el-tabs
        v-model="activeTab"
        class="approve-tabs"
        @tab-change="handleTabChange"
      >
        <!-- 文件审批 Tab -->
        <el-tab-pane label="我的审批" name="fileApprove">
          <!-- 搜索区域 -->
          <div class="search-area">
            <el-form :model="searchForm">
              <el-row :gutter="30" justify="start" align="middle">
                <el-col :span="5">
                  <el-form-item label="审核类型">
                    <el-select
                      v-model="searchForm.flowId"
                      placeholder="请选择审核类型"
                      clearable
                    >
                      <el-option
                        v-for="item in approveTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="审核状态">
                    <el-select
                      v-model="searchForm.checkStatus"
                      placeholder="请选择审核状态"
                      clearable
                    >
                      <el-option
                        v-for="item in checkStatusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-button type="success" @click="handleBatchApprove">
                    <el-icon><Check /></el-icon>批量审批
                  </el-button>
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
            @clickChangeCode="handleCheckTypePreview"
          >
            <template #operate="{ row }">
              <el-button
                link
                type="success"
                :icon="Check"
                @click="handleApproveDialog(row)"
                v-if="row.userCheckStatus === -2"
              >
                审批
              </el-button>
              <el-button
                type="primary"
                link
                :icon="View"
                @click="handleViewDetail(row)"
              >
                查看审批详情
              </el-button>
            </template>
          </CommonTable>
        </el-tab-pane>

        <!-- 审批设置 Tab -->
        <el-tab-pane
          label="审批设置"
          name="approveSetting"
          v-loading="approveSettingLoading"
          v-if="checkPermi(['flow:nodes:list'])"
        >
          <!-- 搜索区域 -->
          <div class="search-area">
            <el-form :model="searchFormSetting">
              <el-row :gutter="30" justify="start" align="middle">
                <el-col :span="5">
                  <el-form-item label="审核类型">
                    <el-select
                      v-model="searchFormSetting.flowId"
                      placeholder="请选择审核类型"
                      clearable
                      @change="getApprovalSettingData"
                    >
                      <el-option
                        v-for="item in approveTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <div class="setting-content">
            <!-- 现有的审批层级卡片 -->
            <el-card
              v-for="(level, key) in approceSettingData"
              :key="key"
              class="level-card"
              :shadow="editingLevel === level.id ? 'hover' : 'never'"
            >
              <template #header>
                <div class="level-header">
                  <span class="level-title">{{ level.nodeName }}</span>
                  <div class="level-actions">
                    <template v-if="editingLevel === level.id">
                      <el-button type="primary" link @click="handleSave(level)">
                        保存
                      </el-button>
                      <el-button type="info" link @click="handleCancel">
                        取消
                      </el-button>
                    </template>
                    <template v-else>
                      <el-button type="primary" link @click="handleEdit(level)">
                        编辑
                      </el-button>
                      <el-button
                        type="danger"
                        link
                        @click="handleDelete(level)"
                      >
                        删除
                      </el-button>
                    </template>
                  </div>
                </div>
              </template>

              <el-form :disabled="editingLevel !== level.id">
                <div class="notify-methods">
                  <p class="section-title">通知方式</p>
                  <el-checkbox-group v-model="level.sendTypes">
                    <el-checkbox :value="1">系统通知</el-checkbox>
                    <el-checkbox :value="2">邮件通知</el-checkbox>
                  </el-checkbox-group>
                </div>

                <div class="approve-method">
                  <p class="section-title">审批方式</p>
                  <el-radio-group v-model="level.approveMethod">
                    <el-radio :value="1">依次审批</el-radio>
                    <el-radio :value="2">或签审批</el-radio>
                  </el-radio-group>
                </div>
                <div class="approver-type">
                  <p class="section-title">审批类型</p>
                  <el-radio-group v-model="level.approverType">
                    <el-radio :value="1">按用户选择</el-radio>
                    <el-radio :value="2">按角色选择</el-radio>
                  </el-radio-group>
                </div>
                <div class="approvers" v-if="level.approverType === 1">
                  <p class="section-title">审批人</p>
                  <el-input
                    v-model="level.usersName"
                    placeholder="请选择审批人"
                    readonly
                    @click="showUserDialog(level)"
                  >
                  </el-input>
                </div>
                <div class="approvers" v-else>
                  <p class="section-title">审批角色</p>
                  <el-select
                    v-model="level.roleId"
                    filterable
                    placeholder="请选择审批角色"
                  >
                    <el-option
                      v-for="item in roleOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </div>
              </el-form>
            </el-card>
            <!-- 添加新增按钮 -->
            <el-card class="level-card add-card" v-if="!isAdding">
              <div class="add-button" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                <span>新增审批层级</span>
              </div>
            </el-card>

            <!-- 新增表单卡片 -->
            <el-card v-if="isAdding" class="level-card">
              <template #header>
                <div class="level-header">
                  <span class="level-title">新增审批层级</span>
                  <div class="level-actions">
                    <el-button type="primary" link @click="handleSaveNew"
                      >保存</el-button
                    >
                    <el-button type="info" link @click="handleCancelAdd"
                      >取消</el-button
                    >
                  </div>
                </div>
              </template>

              <el-form>
                <div class="node-name">
                  <p class="section-title">层级名称</p>
                  <el-input
                    v-model="newLevel.nodeName"
                    placeholder="请输入层级名称"
                  />
                </div>
                <div class="notify-methods">
                  <p class="section-title">通知方式</p>
                  <el-checkbox-group v-model="newLevel.sendTypes">
                    <el-checkbox :label="1">系统通知</el-checkbox>
                    <el-checkbox :label="2">邮件通知</el-checkbox>
                  </el-checkbox-group>
                </div>

                <div class="approve-method">
                  <p class="section-title">审批方式</p>
                  <el-radio-group v-model="newLevel.approveMethod">
                    <el-radio :label="1">依次审批</el-radio>
                    <el-radio :label="2">或签审批</el-radio>
                  </el-radio-group>
                </div>

                <div class="approver-type">
                  <p class="section-title">审批类型</p>
                  <el-radio-group v-model="newLevel.approverType">
                    <el-radio :label="1">按用户选择</el-radio>
                    <el-radio :label="2">按角色选择</el-radio>
                  </el-radio-group>
                </div>

                <div class="approvers" v-if="newLevel.approverType === 1">
                  <p class="section-title">审批人</p>
                  <el-input
                    v-model="newLevel.usersName"
                    placeholder="请选择审批人"
                    readonly
                    @click="showUserDialog(null)"
                  />
                </div>
                <div class="approvers" v-else>
                  <p class="section-title">审批角色</p>
                  <el-select
                    v-model="newLevel.roleId"
                    filterable
                    placeholder="请选择审批角色"
                  >
                    <el-option
                      v-for="item in roleOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </div>
              </el-form>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>

      <MultipleUserSelectDialog
        ref="userDialogRef"
        v-model="userDialogVisible"
        :multiple="true"
        @select-user="handleUserSelected"
        :default-selected-users="currentSelectedUsers"
      />

      <!-- 审批弹框 -->
      <el-dialog
        v-model="approveDialogVisible"
        :title="isBatchMode ? '批量审批' : '审批'"
        width="600px"
        :close-on-click-modal="false"
        :show-close="true"
      >
        <div class="approve-dialog-content">
          <p class="dialog-tip">
            {{ isBatchMode ? "请选择批量审批结果：" : "请选择审批结果：" }}
          </p>

          <!-- 通过选项 -->
          <el-radio
            v-model="approveForm.status"
            :label="1"
            class="approve-option"
          >
            <div class="option-content">
              <el-icon class="option-icon"><Check /></el-icon>
              <div class="option-text">
                <div class="option-title">
                  {{ isBatchMode ? "批量通过" : "通过" }}
                </div>
                <div class="option-desc">
                  {{
                    isBatchMode
                      ? "批准选中的申请，无需填写备注。"
                      : "批准该申请，无需填写备注。"
                  }}
                </div>
              </div>
            </div>
          </el-radio>

          <!-- 不通过选项 -->
          <el-radio
            v-model="approveForm.status"
            :label="-1"
            class="approve-option"
          >
            <div class="option-content">
              <el-icon class="option-icon" :color="rejectColor"
                ><Close
              /></el-icon>
              <div class="option-text">
                <div class="option-title">
                  {{ isBatchMode ? "批量不通过" : "不通过" }}
                </div>
                <div class="option-desc">
                  {{
                    isBatchMode
                      ? "驳回选中的申请，请填写不通过原因。"
                      : "驳回该申请，请填写不通过原因。"
                  }}
                </div>
              </div>
            </div>
          </el-radio>

          <!-- 备注输入（仅不通过时显示） -->
          <el-form
            v-if="approveForm.status === -1"
            :model="approveForm"
            :rules="approveRules"
            ref="approveFormRef"
          >
            <el-form-item
              label="不通过原因"
              prop="remark"
              class="remark-form-item"
            >
              <el-input
                v-model="approveForm.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入不通过原因（必填，最多200字）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-form>

          <!-- 批量模式下的选中数量提示 -->
          <div v-if="isBatchMode" class="batch-info">
            <el-icon><InfoFilled /></el-icon>
            <span
              >本次批量审批的文件数量：{{
                selectedRowsForBatch.length
              }}
              个</span
            >
          </div>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleApproveDialogClose">取消</el-button>
            <el-button
              type="primary"
              :loading="approveLoading"
              @click="handleApproveSubmit"
            >
              {{ isBatchMode ? "提交批量审批" : "提交审批" }}
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 审批详情弹框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="审批详情"
        width="800px"
        :close-on-click-modal="false"
        :show-close="true"
        top="5vh"
      >
        <div v-loading="detailLoading" class="detail-dialog-content">
          <div v-if="detailData.length === 0" class="no-data">
            <el-empty description="暂无审批记录" />
          </div>
          <div v-else class="approval-flow">
            <el-steps
              :active="currentStepIndex"
              direction="vertical"
              class="approval-steps"
              finish-status="success"
            >
              <el-step
                v-for="(step, index) in detailData"
                :key="index"
                :title="step.nodeName"
                :status="getStepStatus(step, index)"
              >
                <template #icon>
                  <div class="step-icon">
                    <!-- 有checkTime说明已处理，根据checkStatus显示图标 -->
                    <template v-if="step.checkTime">
                      <el-icon v-if="step.checkStatus === 1" color="#67c23a">
                        <Check />
                      </el-icon>
                      <el-icon
                        v-else-if="step.checkStatus === -1"
                        color="#f56c6c"
                      >
                        <Close />
                      </el-icon>
                      <!-- 有时间但没有状态码，默认为成功 -->
                      <el-icon v-else color="#67c23a">
                        <Check />
                      </el-icon>
                    </template>
                    <!-- 没有checkTime，根据checkStatus显示图标 -->
                    <template v-else>
                      <el-icon
                        v-if="step.checkStatus === -2 || step.checkStatus === 0"
                        color="#e6a23c"
                      >
                        <Clock />
                      </el-icon>
                      <el-icon
                        v-else-if="step.checkStatus === 1"
                        color="#67c23a"
                      >
                        <Check />
                      </el-icon>
                      <el-icon
                        v-else-if="step.checkStatus === -1"
                        color="#f56c6c"
                      >
                        <Close />
                      </el-icon>
                      <!-- 默认待处理状态 -->
                      <el-icon v-else color="#909399">
                        <Clock />
                      </el-icon>
                    </template>
                  </div>
                </template>
                <template #title>
                  <div class="step-title">
                    {{ step.nodeName }}
                    <!-- 根据不同状态显示标签 -->
                    <template v-if="step.checkTime">
                      <el-tag
                        v-if="step.checkStatus === 1"
                        type="success"
                        size="small"
                        class="status-tag"
                      >
                        已通过
                      </el-tag>
                      <el-tag
                        v-else-if="step.checkStatus === -1"
                        type="danger"
                        size="small"
                        class="status-tag"
                      >
                        不通过
                      </el-tag>
                      <!-- 有时间但没有状态码，默认为已完成 -->
                      <el-tag
                        v-else
                        type="success"
                        size="small"
                        class="status-tag"
                      >
                        已完成
                      </el-tag>
                    </template>
                    <!-- 没有checkTime时的状态 -->
                    <template v-else>
                      <el-tag
                        v-if="step.checkStatus === -2"
                        type="warning"
                        size="small"
                        class="status-tag"
                      >
                        {{ step.checkStatusStr || "待审核" }}
                      </el-tag>
                      <el-tag
                        v-else-if="step.checkStatus === 0"
                        type="warning"
                        size="small"
                        class="status-tag"
                      >
                        待审批
                      </el-tag>
                      <el-tag
                        v-else-if="step.checkStatus === 1"
                        type="success"
                        size="small"
                        class="status-tag"
                      >
                        已通过
                      </el-tag>
                      <el-tag
                        v-else-if="step.checkStatus === -1"
                        type="danger"
                        size="small"
                        class="status-tag"
                      >
                        不通过
                      </el-tag>
                      <!-- 默认待处理状态 -->
                      <el-tag
                        v-else
                        type="info"
                        size="small"
                        class="status-tag"
                      >
                        待处理
                      </el-tag>
                    </template>
                  </div>
                </template>
                <template #description>
                  <div class="step-description">
                    <div class="approver">{{ step.creatorName }}</div>
                    <div v-if="step.checkRemark" class="remark">
                      备注：{{ step.checkRemark }}
                    </div>
                    <div v-if="step.checkTime" class="time">
                      {{ formatTime(step.checkTime) }}
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleDetailDialogClose">关闭</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 销售合同 -->
      <previewSalesDialog ref="previewSalesDialogRef" />
      <!-- 采购合同 -->
      <previewPurchaseDialog ref="previewPurchaseDialogRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Check,
  Plus,
  Close,
  Clock,
  View,
  InfoFilled,
} from "@element-plus/icons-vue";
import CommonTable from "@/components/CommonTable/index.vue";
import {
  batchAudit,
  getFlowNodes,
  deleteFlowNode,
  saveFlowNode,
  getFlowRole,
  getCheckStatus,
  getAllFlowList,
  getAuditRecords,
  getFileApprovalDetail,
} from "@/api/fileApprove";
import previewSalesDialog from "@/views/sales/contracts/components/previewDialog.vue";
import previewPurchaseDialog from "@/views/purchase/contracts/components/previewDialog.vue";
import MultipleUserSelectDialog from "@/components/MultipleUserSelectDialog/index.vue";
import { checkPermi } from "@/utils/permission";

// Tab 切换
const activeTab = ref("fileApprove");
const handleTabChange = async (name) => {
  if (name === "fileApprove") {
    await getApproveTypeFn();
    getCheckStatusFn();
    getTableData();
  } else if (name === "approveSetting") {
    await getApproveTypeFn();
    getApprovalSettingData();
  }
};

// 搜索表单
const searchForm = reactive({
  checkStatus: "",
  flowId: "",
});

// 表格数据
const state = reactive({
  tableData: {
    data: [],
    header: [
      {
        key: "flowName",
        title: "审核类型",
        type: "text",
        isCheck: true,
        status: "linkButton",
      },
      {
        key: "nodeName",
        title: "审核节点",
        type: "text",
        isCheck: true,
      },
      {
        key: "userCheckStatusStr",
        title: "审核状态",
        type: "text",
        isCheck: true,
      },
      {
        key: "createTime",
        title: "提交时间",
        type: "text",
        isCheck: true,
      },
      {
        key: "creatorName",
        title: "提交人",
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
      operateWidth: "250",
      isImport: true,
    },
    param: {
      pageNum: 1,
      pageSize: 10,
    },
  },
});

const commonTableRef = ref();

// 审批设置相关变量
const approveSettingLoading = ref(false);
const approceSettingData = ref([]);
const roleOptions = ref([]);
const editingLevel = ref(null);
const isAdding = ref(false);
const newLevel = reactive({
  nodeName: "",
  sendTypes: [],
  approveMethod: 1,
  approverType: 1,
  userIds: [],
  roleId: null,
  users: "", // 显示的用户名称字符串
});

// 当前选中的层级（用于用户选择回显）
const currentEditingLevel = ref(null);
const currentSelectedUsers = ref([]); // 当前选中的用户数组 [{ id, name }]
const userDialogVisible = ref(false);

// 用户选择对话框
const showUserDialog = (data) => {
  if (data) {
    currentEditingLevel.value = data;
    currentSelectedUsers.value = data.users;
  } else {
    currentEditingLevel.value = null;
    currentSelectedUsers.value = [];
  }
  userDialogVisible.value = true;
};

// 处理用户选择
const handleUserSelected = (users) => {
  if (!currentEditingLevel.value) {
    // 新增层级
    newLevel.userIds = users.map((item) => item.id);
    newLevel.usersName = users.map((item) => item.name).join("、");
    currentSelectedUsers.value = users;
  } else {
    // 编辑现有层级
    const level = approceSettingData.value.find(
      (l) => l.id === currentEditingLevel.value.id
    );
    if (level) {
      level.userIds = users.map((item) => item.id);
      level.usersName = users.map((item) => item.name).join("、");
      currentSelectedUsers.value = users;
    }
  }
  userDialogVisible.value = false;
};

// 获取表格数据
const getTableData = async () => {
  state.tableData.config.loading = true;
  const params = {
    pageNum: state.tableData.param.pageNum,
    pageSize: state.tableData.param.pageSize,
    checkStatus: searchForm.checkStatus,
    flowId: searchForm.flowId,
  };
  const response = await getAuditRecords(params);
  state.tableData.data = response.rows;
  state.tableData.config.total = response.total;
  state.tableData.config.loading = false;
};

// 表格分页事件
const onTablePageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

// 表格排序事件
const onSortHeader = (data) => {
  state.tableData.header = data;
};

// 批量审批 - 打开审批弹框
const handleBatchApprove = () => {
  const selection = commonTableRef.value?.getSelectRowList() || [];
  if (selection.length === 0) {
    ElMessage.warning("请选择要审批的文件");
    return;
  }

  // 只允许userCheckStatus为-2的数据批量审批
  const validSelection = selection.filter(
    (item) => item.userCheckStatus === -2
  );
  if (validSelection.length !== selection.length) {
    ElMessage.warning("只能批量审批待审批的数据");
    return;
  }
  if (validSelection.length === 0) {
    ElMessage.warning("请选择待审批的数据");
    return;
  }

  // 设置批量模式
  selectedRowsForBatch.value = validSelection;
  isBatchMode.value = true;
  currentRow.value = null; // 清空单个行数据

  // 重置表单
  approveForm.status = 1;
  approveForm.remark = "";

  approveDialogVisible.value = true;
};

// 审核类型查看
const previewSalesDialogRef = ref(null);
const previewPurchaseDialogRef = ref(null);
const handleCheckTypePreview = (row) => {
  if (row.flowId === 4) {
    previewSalesDialogRef.value.acceptParams({
      title: "查看",
      row: {
        id: row.ownerId,
      },
    });
  } else if (row.flowId === 5) {
    previewPurchaseDialogRef.value.acceptParams({
      title: "查看",
      row: {
        id: row.ownerId,
      },
    });
  }
};

// 审批弹框相关变量
const approveDialogVisible = ref(false);
const isBatchMode = ref(false); // 是否批量模式
const selectedRowsForBatch = ref([]); // 批量选中的行数据
const approveForm = reactive({
  status: 1, // 默认通过
  remark: "",
});
const approveRules = reactive({
  remark: [
    { required: true, message: "不通过原因不能为空", trigger: "blur" },
    { max: 200, message: "不通过原因不能超过200字", trigger: "blur" },
  ],
});
const approveFormRef = ref();
const approveLoading = ref(false);
const currentRow = ref(null); // 当前审批行数据（单个模式）

// 打开审批弹框（单个审批）
const handleApproveDialog = (row) => {
  // 验证是否为待审批状态
  if (row.userCheckStatus !== -2) {
    ElMessage.warning("只能审批待审批的数据");
    return;
  }

  currentRow.value = row;
  isBatchMode.value = false; // 单个模式
  selectedRowsForBatch.value = []; // 清空批量数据

  // 重置表单
  approveForm.status = 1;
  approveForm.remark = "";

  approveDialogVisible.value = true;
};

// 关闭审批弹框
const handleApproveDialogClose = () => {
  approveDialogVisible.value = false;
  if (approveFormRef.value) {
    approveFormRef.value.resetFields();
  }
  // 重置模式
  isBatchMode.value = false;
  selectedRowsForBatch.value = [];
  currentRow.value = null;
};

// 监听状态变化，控制备注显示
watch(
  () => approveForm.status,
  (newVal) => {
    if (newVal !== -1) {
      approveForm.remark = "";
    }
  }
);

// 提交审批
const handleApproveSubmit = async () => {
  let params;

  if (isBatchMode.value) {
    // 批量模式验证
    if (approveForm.status === -1) {
      // 验证备注（批量模式下使用临时的form ref验证）
      try {
        await approveFormRef.value.validate();
      } catch {
        return;
      }
    }
    params = {
      userCheckId: selectedRowsForBatch.value.map((item) => item.userCheckId),
      userCheckStatus: approveForm.status,
      userCheckRemark: approveForm.status === -1 ? approveForm.remark : "",
    };
  } else {
    // 单个模式验证
    if (approveForm.status === -1) {
      await approveFormRef.value.validate();
    }
    params = {
      userCheckId: [currentRow.value.userCheckId],
      userCheckStatus: approveForm.status,
      userCheckRemark: approveForm.status === -1 ? approveForm.remark : "",
    };
  }

  approveLoading.value = true;
  try {
    const res = await batchAudit(params);
    if (res.code === 200) {
      const successMsg = isBatchMode.value
        ? `${approveForm.status === 1 ? "批量" : "批量"}审批${
            approveForm.status === 1 ? "通过" : "不通过"
          }成功`
        : `${approveForm.status === 1 ? "审批通过成功" : "审批不通过成功"}`;
      ElMessage.success(successMsg);
      getTableData(); // 刷新表格
      handleApproveDialogClose();
    } else {
      ElMessage.error(res.data || "审批失败");
    }
  } catch (error) {
    ElMessage.error("审批请求失败，请重试");
  } finally {
    approveLoading.value = false;
  }
  commonTableRef.value.clearCheckboxState(); // 清除表格选中状态
};

// 查看审批详情
const handleViewDetail = async (row) => {
  detailDialogVisible.value = true;
  detailLoading.value = true;
  try {
    const response = await getFileApprovalDetail(row.id);
    detailData.value = response.data; // 直接赋值数组
  } catch (error) {
    ElMessage.error("获取审批详情失败");
    detailData.value = [];
  } finally {
    detailLoading.value = false;
  }
};

// 不通过图标颜色（computed）
const rejectColor = computed(() => "#f56c6c");

// 获取审批设置数据
const searchFormSetting = reactive({
  flowId: null, // 审批类型
});

const getApprovalSettingData = async () => {
  if (!searchFormSetting.flowId) {
    approceSettingData.value = [];
    return;
  }

  approveSettingLoading.value = true;
  const response = await getFlowNodes({ id: searchFormSetting.flowId });

  // 处理返回的数据，确保数据格式正确
  approceSettingData.value = response.data.map((item) => ({
    ...item, // 展开item的所有属性
    id: item.id,
    nodeName: item.nodeName,
    sendTypes: item.sendTypes ? item.sendTypes.split(",").map(Number) : [],
    approveMethod: item.checkType,
    approverType: item.checkUserType,
    userIds: item.userIds || [],
    roleId: item.checkRoleId || null,
    usersName: item.checkUserNames, // 假设API返回用户名称字符串
  }));

  // 获取角色数据
  const roles = await getFlowRole({});
  roleOptions.value = roles.data.map((role) => ({
    id: role.id,
    name: role.name,
    remarks: role.remarks,
    isSystem: role.isSystem,
    levelNum: role.levelNum,
  }));
  approveSettingLoading.value = false;
};

// 监听搜索表单变化
watch(
  [() => searchForm.checkStatus, () => searchForm.flowId],
  () => {
    state.tableData.param.pageNum = 1;
    getTableData();
  },
  { deep: true }
);

// 编辑某一层级
const handleEdit = async (level) => {
  editingLevel.value = level.id;
};

// 删除某一层级
const handleDelete = async (level) => {
  ElMessageBox.confirm("确定要删除该审批节点吗？", "提示", {
    type: "warning",
  }).then(async () => {
    try {
      await deleteFlowNode({ id: level.id });
      ElMessage.success("删除成功");
      getApprovalSettingData();
    } catch (error) {
      ElMessage.error("删除失败");
    }
  });
};

// 保存某一层级
const handleSave = async (level) => {
  try {
    if (!level.nodeName) {
      ElMessage.warning("请输入层级名称");
      return;
    }

    if (level.approverType === 1) {
      if (!level.userIds || level.userIds.length === 0) {
        ElMessage.warning("请选择审批人");
        return;
      }
    } else {
      if (!level.roleId) {
        ElMessage.warning("请选择审批角色");
        return;
      }
    }

    const saveData = {
      id: level.id,
      nodeName: level.nodeName,
      checkType: level.approveMethod,
      checkUserType: level.approverType,
      sendTypes: level.sendTypes,
      userIds: level.approverType === 1 ? level.userIds : [],
      checkRoleId: level.approverType === 2 ? level.roleId : 0,
      flowId: searchFormSetting.flowId,
    };

    await saveFlowNode(saveData);

    editingLevel.value = null;
    ElMessage.success("保存成功");
    getApprovalSettingData();
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 取消编辑
const handleCancel = () => {
  editingLevel.value = null;
  getApprovalSettingData();
};

// 新增操作
const handleAdd = () => {
  isAdding.value = true;
  // 重置newLevel
  Object.assign(newLevel, {
    nodeName: "",
    sendTypes: [],
    approveMethod: 1,
    approverType: 1,
    userIds: [],
    roleId: null,
    usersName: "",
  });
};

// 保存新增
const handleSaveNew = async () => {
  try {
    if (!newLevel.nodeName) {
      ElMessage.warning("请输入层级名称");
      return;
    }

    if (newLevel.approverType === 1) {
      if (!newLevel.userIds || newLevel.userIds.length === 0) {
        ElMessage.warning("请选择审批人");
        return;
      }
    } else {
      if (!newLevel.roleId) {
        ElMessage.warning("请选择审批角色");
        return;
      }
    }

    const saveData = {
      nodeName: newLevel.nodeName,
      checkType: newLevel.approveMethod,
      checkUserType: newLevel.approverType,
      sendTypes: newLevel.sendTypes,
      userIds: newLevel.approverType === 1 ? newLevel.userIds : [],
      checkRoleId: newLevel.approverType === 2 ? newLevel.roleId : 0,
      flowId: searchFormSetting.flowId,
      id: 0,
    };

    await saveFlowNode(saveData);

    isAdding.value = false;
    ElMessage.success("新增成功");
    getApprovalSettingData();
  } catch (error) {
    ElMessage.error("新增失败");
  }
};

// 取消新增
const handleCancelAdd = () => {
  isAdding.value = false;
};

// 审核类型选项
const approveTypeOptions = ref([]); // 审核类型选项
const getApproveTypeFn = async () => {
  const response = await getAllFlowList();
  approveTypeOptions.value = response.data.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  searchForm.flowId = approveTypeOptions.value[0]?.value; // 默认选择第一个审核类型
  searchFormSetting.flowId = approveTypeOptions.value[0]?.value; // 默认选择第一个审核类型
};

// 审核状态选项
const checkStatusOptions = ref([]);
const getCheckStatusFn = async () => {
  try {
    const response = await getCheckStatus();
    checkStatusOptions.value = response.data.map((item) => ({
      label: item.dictLabel,
      value: Number(item.dictValue), // 确保值为数字类型
    }));
    if (checkStatusOptions.value.length > 0) {
      searchForm.checkStatus = checkStatusOptions.value[0]?.value; // 默认选择第一个审核状态
    }
  } catch (error) {
    ElMessage.error("获取审核状态失败");
  }
};

// 审批详情相关变量
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref([]); // CheckNodeDetailsVO 数组

// 计算当前步骤索引
const currentStepIndex = computed(() => {
  // 找到当前待审批节点的索引（checkStatus === -2 或 checkStatus === 0）
  return detailData.value.findIndex(
    (item) =>
      item.checkStatus === -2 ||
      item.checkStatus === 0 ||
      (!item.checkTime && item.checkStatus === undefined)
  );
});

// 获取步骤状态
const getStepStatus = (step, index) => {
  // 如果有checkTime说明已经处理过了
  if (step.checkTime) {
    // 有checkStatus就按checkStatus判断，否则认为是完成状态
    if (step.checkStatus !== undefined) {
      return step.checkStatus === 1
        ? "success"
        : step.checkStatus === -1
        ? "error"
        : "success";
    }
    return "success"; // 有时间但没有状态，认为是完成
  }

  // 没有checkTime的情况
  if (step.checkStatus === -2 || step.checkStatus === 0) {
    return "process"; // 待审核状态
  } else if (step.checkStatus === 1) {
    return "success"; // 已通过
  } else if (step.checkStatus === -1) {
    return "error"; // 已拒绝
  }

  return "wait"; // 未开始
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  try {
    return new Date(timeStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    return timeStr;
  }
};

// 关闭详情弹框
const handleDetailDialogClose = () => {
  detailDialogVisible.value = false;
  detailData.value = [];
  detailLoading.value = false;
};

onMounted(() => {
  handleTabChange("fileApprove");
});
</script>

<style lang="scss" scoped>
/* 审批弹框样式 */
.approve-dialog-content {
  padding: 20px;

  .dialog-tip {
    margin-bottom: 20px;
    color: var(--el-text-color-regular);
    font-size: 20px;
  }

  :deep(.el-radio) {
    margin-right: 0 !important;
  }
  .approve-option {
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 16px;
    padding: 40px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    transition: border-color 0.3s;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &.is-checked {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .option-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .option-icon {
        font-size: 20px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .option-text {
        flex: 1;

        .option-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .option-desc {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          line-height: 1.4;
        }
      }
    }
  }

  .remark-form-item {
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    :deep(.el-textarea) {
      .el-textarea__inner {
        resize: vertical;
        min-height: 80px;
      }
    }
  }

  .batch-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 12px;
    background-color: var(--el-color-info-light-9);
    border-radius: 4px;
    color: var(--el-color-info);

    .el-icon {
      font-size: 16px;
    }
  }
}

.file-approve-padding {
  padding: 15px;

  .search-area {
    .el-form {
      :deep(.el-form-item) {
        margin-bottom: 0;
      }

      .el-button {
        margin-left: 15px;
      }

      .el-checkbox {
        margin-right: 15px;
      }
    }
    margin-bottom: 15px;
  }

  .setting-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    overflow: auto;
    height: calc(100vh - 274px);

    .level-card {
      width: calc(33.33% - 20px);
      min-width: 300px;
      margin-right: 20px;
      margin-bottom: 20px;

      &:nth-child(3n) {
        margin-right: 0;
      }

      :deep(.el-card__header) {
        padding: 0;
        border-bottom: 1px solid var(--el-border-color-light);
        background: linear-gradient(
          to right,
          var(--el-color-primary-light-8),
          var(--el-color-primary-light-9)
        );
      }

      .level-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;

        .level-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          &::before {
            content: "";
            display: inline-block;
            width: 4px;
            height: 16px;
            margin-right: 8px;
            background-color: var(--el-color-primary);
            vertical-align: middle;
            border-radius: 2px;
          }
        }

        .level-actions {
          .el-button {
            margin-left: 12px;

            &:hover {
              background-color: var(--el-color-primary-light-9);
            }
          }
        }
      }

      :deep(.el-card__body) {
        padding: 20px;
        overflow: auto;
      }

      .el-form {
        .section-title {
          margin: 0 0 12px;
          font-size: 14px;
          color: var(--el-text-color-regular);
        }

        .notify-methods,
        .approve-method,
        .approver-type {
          margin-bottom: 20px;
        }

        .approvers {
          .approver-select {
            width: 100%;
          }

          .selected-users {
            margin-top: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;

            .el-tag {
              max-width: 150px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }

        :deep(.el-checkbox) {
          margin-right: 24px;
          margin-bottom: 8px;
        }

        :deep(.el-input) {
          margin-bottom: 8px;
        }
      }
    }

    .add-card {
      width: 400px;

      .add-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        cursor: pointer;
        color: var(--el-text-color-secondary);
        transition: color 0.3s;

        &:hover {
          color: var(--el-color-primary);
        }

        .el-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        span {
          font-size: 14px;
        }
      }
    }

    .node-name {
      margin-bottom: 20px;
    }
  }

  .table-demo {
    height: calc(100vh - 220px);
  }
}

/* 审批详情弹框样式 */
.detail-dialog-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;

  .no-data {
    text-align: center;
    padding: 40px 0;
  }

  .approval-flow {
    .approval-steps {
      :deep(.el-step__head) {
        .step-icon {
          .el-icon {
            font-size: 18px;
          }
        }
      }

      :deep(.el-step__title) {
        .step-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;

          .status-tag {
            margin-left: auto;
          }
        }
      }

      :deep(.el-step__main) {
        .step-description {
          .approver {
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .remark {
            color: var(--el-text-color-regular);
            font-size: 12px;
            margin-bottom: 4px;
            word-break: break-word;
            line-height: 1.4;
          }

          .time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }

          .status-text {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            font-style: italic;
          }
        }
      }

      :deep(.el-step__tail) {
        .el-step__line {
          &.is-success {
            background-color: var(--el-color-success);
          }
          &.is-error {
            background-color: var(--el-color-danger);
          }
          &.is-process {
            background-color: var(--el-color-warning);
          }
          &.is-wait {
            background-color: var(--el-border-color-light);
          }
        }
      }
    }
  }
}
</style>

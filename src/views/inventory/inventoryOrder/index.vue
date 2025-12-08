<template>
  <div class="inventory-container layout-padding">
    <div class="inventory-padding layout-padding-view layout-padding-auto">
      <!-- 顶部统计卡片 - 盘点统计 -->
      <div class="stats-wrapper">
        <div class="stat-card">
          <div class="label">本月盘点单数</div>
          <div class="num">8</div>
        </div>
        <div class="stat-card success">
          <div class="label">无差异盘点单</div>
          <div class="num">5</div>
        </div>
        <div class="stat-card warning">
          <div class="label">有差异盘点单</div>
          <div class="num">3</div>
        </div>
        <div class="stat-card danger">
          <div class="label">待处理盘点单</div>
          <div class="num">2</div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-container">
        <el-form ref="searchFormRef" :model="searchForm" class="table-form">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-form-item style="width: 100%">
                <el-select
                  v-model="searchForm.status"
                  placeholder="全部状态"
                  clearable
                >
                  <el-option label="全部状态" value="" />
                  <el-option label="待盘点" value="pending" />
                  <el-option label="盘点中" value="inProgress" />
                  <el-option label="待审核" value="waitingReview" />
                  <el-option label="已调整" value="adjusted" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item style="width: 100%">
                <el-select
                  v-model="searchForm.type"
                  placeholder="全部类型"
                  clearable
                >
                  <el-option label="全部类型" value="" />
                  <el-option label="全盘" value="full" />
                  <el-option label="抽盘" value="partial" />
                  <el-option label="动碰盘点" value="dynamic" />
                  <el-option label="循环盘点" value="cycle" />
                  <el-option label="座位盘点" value="seat" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-date-picker
                  v-model="searchForm.startDate"
                  type="date"
                  placeholder="年/月/日"
                  value-format="YYYY-MM-DD"
                />
                <span style="margin: 0 10px">至</span>
                <el-date-picker
                  v-model="searchForm.endDate"
                  type="date"
                  placeholder="年/月/日"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-input
                  v-model.trim="searchForm.keyword"
                  placeholder="盘点单号"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-button
                  type="primary"
                  @click="handleCommand('add')"
                  class="add-btn"
                >
                  <el-icon><Plus /></el-icon>
                  新增盘点单
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 表格 -->
      <CommonTable
        ref="tableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onPageChange"
        @selection-change="handleSelectionChange"
      >
        <!-- 状态列自定义 -->
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="dark" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
        <!-- 操作列 -->
        <template #operate="{ row }">
          <div class="operateBox">
            <el-button link type="primary" @click="handleCommand('view', row)"
              >详情</el-button
            >
            <el-button
              v-if="row.status === 'pending'"
              link
              type="primary"
              class="primary-btn"
              @click="handleStartInventory(row)"
              >开始盘点</el-button
            >
            <el-button
              v-if="row.status === 'inProgress'"
              link
              type="primary"
              class="warning-btn"
              @click="handleContinueInventory(row)"
              >继续盘点</el-button
            >
            <el-button
              v-if="row.status === 'adjusted'"
              link
              type="primary"
              class="success-btn"
              @click="handleDifference(row)"
              >差异</el-button
            >
            <el-button
              link
              type="primary"
              @click="handleCommand('edit', row)"
              :disabled="row.status !== 'pending'"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleSingleDelete(row)"
              :disabled="row.status !== 'pending'"
            >
              删除
            </el-button>
          </div>
        </template>
      </CommonTable>
    </div>

    <!-- 新增/编辑盘点弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      @close="closeDialog"
      :title="dialogProps.title"
      :destroy-on-close="true"
      width="65%"
      draggable
      class="add-dialog"
    >
      <el-form
        ref="ruleFormRef"
        label-width="120px"
        label-suffix=" :"
        :rules="rules"
        :disabled="dialogProps.isView"
        :model="formData"
        :hide-required-asterisk="dialogProps.isView"
        label-position="top"
      >
        <el-row class="form-box">
          <el-col :span="24">
            <CustomDivider title="盘点基础信息"></CustomDivider>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="盘点单号" prop="code">
              <el-input
                placeholder="可不填写，自动生成"
                v-model="formData.code"
                :disabled="dialogProps.mode === 'edit'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="盘点类型" required prop="inventoryType">
              <el-select
                placeholder="请选择盘点类型"
                v-model="formData.inventoryType"
                :disabled="
                  dialogProps.mode === 'edit' && formData.status !== 'pending'
                "
              >
                <el-option
                  v-for="item in inventoryTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="盘点仓库" required prop="warehouseId">
              <el-select
                placeholder="请选择盘点仓库"
                v-model="formData.warehouseId"
                :disabled="
                  dialogProps.mode === 'edit' && formData.status !== 'pending'
                "
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.warehouseId"
                  :label="item.warehouseName"
                  :value="item.warehouseId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="计划盘点日期" required prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择计划盘点日期"
                :disabled="
                  dialogProps.mode === 'edit' && formData.status !== 'pending'
                "
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="负责人" prop="container"> </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="盘点区域" prop="container"> </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                placeholder="请输入备注内容"
                :rows="2"
                type="textarea"
                maxlength="300"
                show-word-limit
                v-model="formData.remark"
                :disabled="formData.status !== 'pending'"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="form-box detail-info">
        <el-col :span="20">
          <CustomDivider title="盘点物料信息"></CustomDivider>
        </el-col>
        <el-button
          type="primary"
          :icon="Plus"
          plain
          size="default"
          @click="chooseMaterial"
          v-if="!dialogProps.isView && formData.status === 'pending'"
          >选择物料</el-button
        >
      </div>
      <div class="detail-table">
        <el-table
          :data="formData.products"
          border
          class="table-demo"
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ 'text-align': 'center' }"
          :disabled="dialogProps.isView || formData.status !== 'pending'"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column
            prop="productName"
            label="物料名称"
            min-width="150"
          />
          <el-table-column
            prop="productCode"
            label="物料编号"
            min-width="120"
          />
          <el-table-column
            prop="specification"
            label="规格型号"
            min-width="150"
          />
          <el-table-column prop="unit" label="单位" min-width="60" />
          <el-table-column prop="batch" label="批次" min-width="100" />
          <el-table-column
            prop="stockQuantity"
            label="库存数量"
            min-width="100"
          />
          <el-table-column
            label="盘点数量"
            min-width="100"
            v-if="formData.status === 'pending'"
          >
            <template #default="{ row }">
              <el-input
                v-model="row.inventoryQuantity"
                placeholder="请输入盘点数量"
                :disabled="dialogProps.isView || formData.status !== 'pending'"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="inventoryQuantity"
            label="盘点数量"
            min-width="100"
            v-else
          />
          <el-table-column
            label="操作"
            width="100"
            fixed="right"
            v-if="!dialogProps.isView && formData.status === 'pending'"
          >
            <template #default="{ row }">
              <div class="operateBox">
                <el-button
                  type="danger"
                  text
                  size="default"
                  @click="handleDetailCommand('del', row)"
                  :icon="Delete"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button
          v-show="!dialogProps.isView && formData.status === 'pending'"
          type="primary"
          @click="handleSubmit"
          >确定</el-button
        >
        <el-button @click="closeDialog">取消</el-button>
      </template>
    </el-dialog>

    <!-- 选择物料弹窗 -->
    <WarehouseProductSelectDialog
      v-model="showMaterialSelect"
      @confirm="onMaterialSelect"
      title="选择盘点物料"
      selectionMode="multiple"
      :defaultSelected="defaultSelected"
    />

    <!-- 盘点执行弹窗（开始盘点 / 继续盘点） -->
    <el-dialog
      v-model="inventoryExecuteVisible"
      :title="inventoryExecuteTitle"
      width="90%"
      top="5vh"
      destroy-on-close
      class="inventory-execute-dialog"
      @opened="handleDialogOpened"
    >
      <!-- 物料盘点区域 -->
      <div class="material-inventory-section">
        <div class="inventory-info">
          <div class="info-item">
            <span class="label">盘点单号:</span>
            <span class="value">{{ currentInventory.code }}</span>
          </div>
          <div class="info-item">
            <span class="label">盘点类型:</span>
            <span class="value">{{
              getInventoryTypeText(currentInventory.type)
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">盘点货柜:</span>
            <span class="value">{{ currentInventory.container }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态:</span>
            <span class="value">
              <el-tag
                :type="
                  currentInventory.status === 'pending' ? 'danger' : 'success'
                "
                size="medium"
              >
                {{ getStatusText(currentInventory.status) }}
              </el-tag>
            </span>
          </div>
        </div>
        <!-- 待盘点物料表格 -->
        <div class="inventory-table-container">
          <!-- 扫码接收区域 -->
          <div class="scan-receive-section">
            <div class="section-header">
              <h3>扫码接收</h3>
            </div>
            <div class="scan-content">
              <!-- 扫描输入框 -->
              <div class="scan-input-wrapper">
                <svg-icon icon-class="qrcode" />
                <div class="title">扫描物料或货位条形码</div>
              </div>
              <!-- 手动输入区域 -->
              <div class="manual-input-area">
                <div class="current-location">
                  <span class="label">当前库位</span>
                  <el-input
                    v-model="currentLocation"
                    placeholder="A-01-01"
                    style="width: 200px; margin-right: 10px"
                    @keyup.enter="queryByLocation"
                  />
                  <el-button type="primary" @click="queryByLocation">
                    查询
                  </el-button>
                </div>
                <div class="manual-material-input">
                  <span class="label">物料编码</span>
                  <el-input
                    v-model="manualMaterialCode"
                    placeholder="手动输入物料编码"
                    style="width: 200px; margin-right: 10px"
                    @keyup.enter="queryByMaterialCode"
                  />
                  <el-button type="primary" @click="queryByMaterialCode">
                    查询
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <div class="table-container">
            <div class="section-header">
              <h3>盘点物料</h3>
            </div>
            <el-table
              :data="inventoryMaterials"
              border
              class="material-inventory-table"
              :cell-style="{ textAlign: 'center' }"
              :header-cell-style="{
                'text-align': 'center',
                'background-color': '#f5f7fa',
                'font-weight': 'bold',
              }"
              :row-class-name="tableRowClassName"
              highlight-current-row
              @row-click="handleRowClick"
            >
              <el-table-column
                prop="materialCode"
                label="物料编码"
                width="140"
                align="center"
                fixed="left"
              />
              <el-table-column
                prop="materialName"
                label="物料名称"
                min-width="150"
                align="center"
                fixed="left"
              />
              <el-table-column
                prop="specification"
                label="规格型号"
                min-width="150"
                align="center"
              />
              <el-table-column
                prop="unit"
                label="单位"
                width="80"
                align="center"
              />
              <el-table-column
                prop="stockQuantity"
                label="库存数量"
                width="100"
                align="center"
              />
              <el-table-column label="盘点数量" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.currentInventory"
                    :min="0"
                    :precision="0"
                    size="small"
                    controls-position="right"
                    @change="updateInventoryStats"
                    @focus="handleInputFocus(row)"
                    :ref="setInputRef(row.materialCode)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="货位" width="120" align="center">
                <template #default="{ row }">
                  <el-select
                    v-model="row.location"
                    placeholder="选择货位"
                    size="small"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="loc in warehouseLocations"
                      :key="loc.value"
                      :label="loc.label"
                      :value="loc.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="差异" width="100" align="center">
                <template #default="{ row }">
                  <span :class="getDifferenceClass(row.difference)">
                    {{ row.difference > 0 ? "+" : "" }}{{ row.difference }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    link
                    @click="removeMaterialFromInventory(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="submit-container">
              <el-button
                type="primary"
                @click="confirmInventory"
                style="margin-top: 20px"
                :loading="executeLoading"
              >
                确认盘点
              </el-button>
            </div>
          </div>
        </div>
        <div class="inventory-locations">
          <div class="section-header">
            <h3>已盘点库位</h3>
          </div>
          <div class="inventory-content">
            <el-tag
              v-for="loc in inventoryLocations"
              :key="loc"
              type="success"
              size="medium"
            >
              {{ loc }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 差异详情弹窗 -->
    <el-dialog
      v-model="differenceDialogVisible"
      title="盘点差异详情"
      width="80%"
      top="5vh"
      destroy-on-close
      class="difference-dialog"
    >
      <div class="difference-content">
        <div class="difference-header">
          <div class="header-info">
            <div class="info-item">
              <span class="label">盘点单号:</span>
              <span class="value">{{ currentDifference.code }}</span>
            </div>
            <div class="info-item">
              <span class="label">盘点类型:</span>
              <span class="value">{{
                getInventoryTypeText(currentDifference.type)
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">盘点仓库:</span>
              <span class="value">{{
                currentDifference.warehouse || "&nbsp;"
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <span class="value difference-total">
                <el-tag
                  :type="
                    currentDifference.status === 'pending'
                      ? 'danger'
                      : 'success'
                  "
                  size="medium"
                >
                  {{ getStatusText(currentDifference.status) }}
                </el-tag>
              </span>
            </div>
          </div>

          <div class="stats-wrapper">
            <div class="stat-card">
              <div class="label">盘点物料总数</div>
              <div class="num">8</div>
            </div>
            <div class="stat-card success">
              <div class="label">无差异物料</div>
              <div class="num">5</div>
            </div>
            <div class="stat-card warning">
              <div class="label">盘盈物料</div>
              <div class="num">3</div>
            </div>
            <div class="stat-card danger">
              <div class="label">盘亏物料</div>
              <div class="num">2</div>
            </div>
          </div>
        </div>
        <div class="difference-table-container">
          <el-table
            :data="differenceMaterials"
            border
            height="400"
            class="difference-table"
            :cell-style="{ textAlign: 'center' }"
            :header-cell-style="{
              'text-align': 'center',
              'background-color': '#f5f7fa',
              'font-weight': 'bold',
            }"
          >
            <el-table-column
              prop="materialCode"
              label="物料编码"
              width="140"
              align="center"
            />
            <el-table-column
              prop="materialName"
              label="物料名称"
              min-width="150"
              align="center"
            />
            <el-table-column
              prop="specification"
              label="规格型号"
              min-width="150"
              align="center"
            />
            <el-table-column
              prop="unit"
              label="单位"
              width="120"
              align="center"
            />
            <el-table-column
              prop="systemStock"
              label="系统库存"
              width="120"
              align="center"
            />
            <el-table-column
              prop="inventoryStock"
              label="盘点库存"
              width="120"
              align="center"
            />
            <el-table-column
              prop="differenceQuantity"
              label="差异数量"
              width="120"
              align="center"
            />
            <el-table-column
              prop="differenceType"
              label="盘亏/盘盈"
              width="120"
              align="center"
            />
            <el-table-column
              prop="location"
              label="库位"
              width="120"
              align="center"
            />
            <el-table-column
              prop="processingStatus"
              label="处理状态"
              width="120"
              align="center"
            />
            <el-table-column label="操作" width="150" align="center">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="default"
                  link
                  @click="handleAdjustDetail(scope.row, 'detail')"
                  >详情</el-button
                >
                <el-button
                  type="danger"
                  size="default"
                  link
                  @click="openAdjustDialog(scope.row, 'adjust')"
                  >调整</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeDifferenceDialog">取消</el-button>
        <el-button type="primary"> 完成盘点 </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="adjustVisible"
      :title="adjustTitle"
      width="480px"
      destroy-on-close
      @close="closeAdjustDialog"
      align-center
    >
      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        label-width="90px"
        label-suffix=":"
        :disabled="!isAdjustDetail"
      >
        <el-form-item
          label="调整原因"
          prop="adjustReason"
          :rules="[{ required: true, message: '请输入调整原因' }]"
        >
          <el-select
            v-model="adjustForm.adjustReason"
            placeholder="请选择调整原因"
            filterable
            clearable
          >
            <el-option
              v-for="item in adjustReasonList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="调整备注"
          prop="adjustRemark"
          :rules="[{ required: true, message: '请输入调整备注' }]"
        >
          <el-input
            v-model="adjustForm.adjustRemark"
            placeholder="请输入调整备注"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeAdjustDialog" v-if="isAdjustDetail"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="submitAdjust"
          :loading="adjustLoading"
          v-if="isAdjustDetail"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";
import CustomDivider from "@/components/CustomDivider/index.vue";
import { Plus, Delete, Edit, Search, Camera } from "@element-plus/icons-vue";
import WarehouseProductSelectDialog from "@/components/WarehouseProductSelectDialog/index.vue";

const searchForm = reactive({
  status: "",
  type: "",
  startDate: "",
  endDate: "",
  keyword: "",
});

// 盘点类型映射
const inventoryTypeList = [
  { value: "full", label: "全盘" },
  { value: "partial", label: "抽盘" },
  { value: "dynamic", label: "动碰盘点" },
  { value: "cycle", label: "循环盘点" },
  { value: "seat", label: "座位盘点" },
];

const getInventoryTypeText = (type) => {
  const map = {
    full: "全盘",
    partial: "抽盘",
    dynamic: "动碰盘点",
    cycle: "循环盘点",
    seat: "座位盘点",
  };
  return map[type] || type;
};

// 状态映射
const getStatusText = (status) => {
  const map = {
    pending: "待盘点",
    inProgress: "盘点中",
    waitingReview: "待审核",
    adjusted: "已调整",
  };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = {
    pending: "info",
    inProgress: "warning",
    waitingReview: "primary",
    adjusted: "success",
  };
  return map[status] || "info";
};

// 表格核心数据
const state = reactive({
  tableData: {
    data: [
      {
        id: 1,
        code: "IN-2025-001",
        type: "full",
        container: "A1",
        warehouseId: 1,
        startDate: "2025-05-15",
        endDate: "2025-06-15",
        status: "adjusted",
        remark: "测试盘点单",
        products: [
          {
            productId: 1,
            productCode: "EC001",
            productName: "电子元件A",
            specification: "10KΩ 0.25W",
            unit: "个",
            batch: "BATCH001",
            stockQuantity: 100,
            inventoryQuantity: 95,
          },
        ],
      },
      {
        id: 2,
        code: "IN-2025-002",
        type: "seat",
        container: "A1",
        warehouseId: 2,
        startDate: "2025-05-15",
        endDate: "2025-06-15",
        status: "pending",
        remark: "座位盘点测试",
        products: [],
      },
      {
        id: 3,
        code: "IN-2025-003",
        type: "full",
        container: "A1",
        warehouseId: 1,
        startDate: "2025-05-15",
        endDate: "2025-06-15",
        status: "inProgress",
        remark: "正在盘点中",
        products: [
          {
            productId: 1,
            productCode: "EC001",
            productName: "电子元件A",
            specification: "10KΩ 0.25W",
            unit: "个",
            batch: "BATCH001",
            stockQuantity: 100,
            inventoryQuantity: 50,
          },
        ],
      },
      {
        id: 4,
        code: "IN-2025-004",
        type: "full",
        container: "A1",
        warehouseId: 3,
        startDate: "2025-05-15",
        endDate: "2025-06-15",
        status: "waitingReview",
        remark: "等待审核",
        products: [
          {
            productId: 2,
            productCode: "EC002",
            productName: "电子元件B",
            specification: "20KΩ 0.5W",
            unit: "个",
            batch: "BATCH002",
            stockQuantity: 200,
            inventoryQuantity: 195,
          },
        ],
      },
    ],
    header: [
      { key: "code", title: "盘点单号", width: 180, isCheck: true },
      {
        key: "type",
        title: "盘点类型",
        isCheck: true,
        formatter: getInventoryTypeText,
      },
      { key: "container", title: "盘点货柜", width: 120, isCheck: true },
      { key: "startDate", title: "开始日期", width: 140, isCheck: true },
      { key: "endDate", title: "完成日期", width: 140, isCheck: true },
    ],
    config: {
      total: 68,
      loading: false,
      isBorder: true,
      isStripe: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      operateWidth: "300",
      isImport: true,
      isStatusConfig: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

// 选中数据相关
const selectedRows = ref([]);
const selectedCount = computed(() => selectedRows.value.length);
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 批量编辑
const handleBatchEdit = () => {
  if (selectedRows.value.length === 1) {
    handleCommand("edit", selectedRows.value[0]);
  } else {
    ElMessage.warning("请选择一条数据进行编辑");
  }
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }

  // 检查是否包含不可删除的状态
  const undeletableItems = selectedRows.value.filter(
    (item) => item.status !== "pending"
  );

  if (undeletableItems.length > 0) {
    ElMessage.warning("只能删除状态为'待盘点'的盘点单");
    return;
  }

  ElMessageBox.confirm(
    `确定删除选中的 ${selectedRows.value.length} 条盘点单吗？`,
    "温馨提示",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      // 从表格数据中移除选中的行
      const idsToDelete = selectedRows.value.map((item) => item.id);
      state.tableData.data = state.tableData.data.filter(
        (item) => !idsToDelete.includes(item.id)
      );

      ElMessage({
        type: "success",
        message: "删除成功",
      });

      // 清空选中状态
      selectedRows.value = [];
      getTableData();
    })
    .catch(() => {});
};

// 单个删除
const handleSingleDelete = (row) => {
  if (row.status !== "pending") {
    ElMessage.warning("只能删除状态为'待盘点'的盘点单");
    return;
  }

  ElMessageBox.confirm(`确定删除盘点单 "${row.code}" 吗？`, "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 从表格数据中移除该行
      const index = state.tableData.data.findIndex(
        (item) => item.id === row.id
      );
      if (index !== -1) {
        state.tableData.data.splice(index, 1);
      }

      ElMessage({
        type: "success",
        message: "删除成功",
      });

      getTableData();
    })
    .catch(() => {});
};

// 方法
const handleSearch = () => {
  state.tableData.param.pageNum = 1;
  getTableData();
};

const resetSearch = () => {
  searchForm.status = "";
  searchForm.type = "";
  searchForm.startDate = "";
  searchForm.endDate = "";
  searchForm.keyword = "";
  handleSearch();
};

const onPageChange = (page) => {
  state.tableData.param.pageNum = page.pageNum;
  state.tableData.param.pageSize = page.pageSize;
  getTableData();
};

const getTableData = () => {
  state.tableData.config.loading = true;
  setTimeout(() => {
    state.tableData.config.loading = false;
  }, 300);
};

// ========== 新增/编辑盘点弹框相关代码 ==========
const dialogVisible = ref(false);
const dialogProps = ref({
  isView: false,
  title: "",
  row: {},
  mode: "add", // 'add' | 'edit' | 'view'
});

const rules = reactive({
  code: [{ required: false, message: "请输入盘点单号", trigger: "blur" }],
  inventoryType: [
    { required: true, message: "请选择盘点类型", trigger: "change" },
  ],
  warehouseId: [
    { required: true, message: "请选择盘点仓库", trigger: "change" },
  ],
  startDate: [{ required: true, message: "请选择开始日期", trigger: "change" }],
});

const ruleFormRef = ref();
const formData = ref({
  code: "",
  id: 0,
  inventoryType: null,
  warehouseId: 0,
  startDate: "",
  endDate: "",
  container: "",
  products: [],
  remark: "",
  status: "pending",
});

const warehouseList = ref([
  { warehouseId: 1, warehouseName: "主仓库" },
  { warehouseId: 2, warehouseName: "成品仓" },
  { warehouseId: 3, warehouseName: "原材料仓" },
]);

const handleCommand = async (command, row) => {
  if (command === "add") {
    dialogProps.value = {
      isView: false,
      title: "新增盘点单",
      mode: "add",
    };
    formData.value = {
      code: `IN-${new Date().getFullYear()}-${String(Math.random()).substr(
        2,
        4
      )}`,
      id: 0,
      inventoryType: null,
      warehouseId: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      container: "",
      products: [],
      remark: "",
      status: "pending",
    };
    dialogVisible.value = true;
  } else if (command === "edit") {
    if (row.status !== "pending") {
      ElMessage.warning("只能编辑状态为'待盘点'的盘点单");
      return;
    }

    dialogProps.value = {
      isView: false,
      title: "编辑盘点单",
      mode: "edit",
    };
    formData.value = {
      code: row.code,
      id: row.id,
      inventoryType: row.type,
      warehouseId: row.warehouseId,
      startDate: row.startDate,
      endDate: row.endDate,
      container: row.container,
      products: [...row.products],
      remark: row.remark,
      status: row.status,
    };
    dialogVisible.value = true;
  } else if (command === "view") {
    dialogProps.value = {
      isView: true,
      title: "查看盘点单",
      mode: "view",
    };
    formData.value = {
      code: row.code,
      id: row.id,
      inventoryType: row.type,
      warehouseId: row.warehouseId,
      startDate: row.startDate,
      endDate: row.endDate,
      container: row.container,
      products: [...row.products],
      remark: row.remark,
      status: row.status,
    };
    dialogVisible.value = true;
  }
};

const handleDetailCommand = (command, row) => {
  if (command === "del") {
    const index = formData.value.products.findIndex(
      (item) => item.productId === row.productId
    );
    if (index !== -1) {
      formData.value.products.splice(index, 1);
      ElMessage.success("删除物料成功");
    }
  }
};

const handleSubmit = async () => {
  if (ruleFormRef.value) {
    ruleFormRef.value.validate(async (valid) => {
      if (!valid) return;

      try {
        if (dialogProps.value.mode === "add") {
          // 新增操作
          const newId =
            Math.max(...state.tableData.data.map((item) => item.id)) + 1;
          const newItem = {
            ...formData.value,
            id: newId,
            status: "pending",
            type: formData.value.inventoryType,
          };
          state.tableData.data.unshift(newItem);

          ElMessage.success("新增盘点单成功");
        } else if (dialogProps.value.mode === "edit") {
          // 编辑操作
          const index = state.tableData.data.findIndex(
            (item) => item.id === formData.value.id
          );
          if (index !== -1) {
            state.tableData.data[index] = {
              ...state.tableData.data[index],
              ...formData.value,
              type: formData.value.inventoryType,
            };
          }

          ElMessage.success("编辑盘点单成功");
        }

        ruleFormRef.value?.resetFields();
        dialogVisible.value = false;
        getTableData();
      } catch (error) {
        ElMessage.error("操作失败：" + error.message);
      }
    });
  }
};

const closeDialog = () => {
  ruleFormRef.value?.resetFields();
  dialogVisible.value = false;
};

// 选择物料相关
const showMaterialSelect = ref(false);
const defaultSelected = ref([]);

const chooseMaterial = () => {
  defaultSelected.value = formData.value.products.map((item) => ({
    id: item.productId,
    code: item.productCode,
    name: item.productName,
    specification: item.specification || "",
    unitName: item.unit || "",
  }));
  showMaterialSelect.value = true;
};

const onMaterialSelect = (data) => {
  data.forEach(async (item) => {
    const exists = formData.value.products.some((product) => {
      return product.productId === item.productId;
    });
    if (!exists) {
      formData.value.products.push({
        batch: item.batch || "",
        productId: item.productId,
        stockQuantity: item.stockQuantity || 0,
        inventoryQuantity: 0,
        productName: item.productName,
        productCode: item.productCode,
        specification: item.specification || "",
        unit: item.unitName || "",
      });
    }
  });
  showMaterialSelect.value = false;
  ElMessage.success("添加物料成功");
};

// ========== 盘点执行相关 ==========
const inventoryExecuteVisible = ref(false);
const inventoryExecuteTitle = ref("");
const executeLoading = ref(false);
const currentInventory = ref({});

// 仓库货位选项
const warehouseLocations = ref([
  { label: "A区-01-01", value: "A-01-01" },
  { label: "A区-01-02", value: "A-01-02" },
  { label: "B区-02-01", value: "B-02-01" },
  { label: "B区-02-02", value: "B-02-02" },
  { label: "C区-03-01", value: "C-03-01" },
]);

// 盘点状态记录
const inventoryStatus = ref([]);

// 物料盘点相关
const inventoryMaterials = ref([]);
const inventoryMaterialTypes = ref(0);
const inventoryTotalQuantity = ref(0);

// 盘点状态文本映射
const getInventoryStatusText = (status) => {
  const map = {
    pending: "待盘点",
    inProgress: "盘点中",
    completed: "已盘点",
    adjusted: "已调整",
  };
  return map[status] || status;
};

const getInventoryStatusType = (status) => {
  const map = {
    pending: "info",
    inProgress: "warning",
    completed: "primary",
    adjusted: "success",
  };
  return map[status] || "info";
};

// 差异样式
const getDifferenceClass = (difference) => {
  if (difference > 0) return "difference-positive";
  if (difference < 0) return "difference-negative";
  return "difference-zero";
};

// ========== 扫码接收相关 ==========
const scanInput = ref("");
const scanInputRef = ref(null);
const currentLocation = ref("A-01-01");
const manualMaterialCode = ref("");
const scanTips = ref("请扫描物料条形码或货位条形码，或手动输入查询");
const inputRefs = ref({});

// 设置输入框引用
const setInputRef = (materialCode) => (el) => {
  if (el) {
    inputRefs.value[materialCode] = el;
  }
};

// 表格行类名
const tableRowClassName = ({ row }) => {
  if (row.isHighlighted) return "highlight-row";
  return "";
};

// 行点击事件
const handleRowClick = (row) => {
  inventoryMaterials.value.forEach((item) => {
    item.isHighlighted = false;
  });
  row.isHighlighted = true;
  setTimeout(() => {
    focusMaterialInput(row.materialCode);
  }, 100);
};

// 输入框聚焦事件
const handleInputFocus = (row) => {
  inventoryMaterials.value.forEach((item) => {
    item.isHighlighted = item.materialCode === row.materialCode;
  });
};

// 弹窗打开事件
const handleDialogOpened = () => {
  setTimeout(() => {
    focusScanInput();
  }, 300);
};

// 扫码输入处理
const handleScanInput = async () => {
  if (!scanInput.value.trim()) {
    ElMessage.warning("请输入扫描内容");
    return;
  }
  const scanValue = scanInput.value.trim();
  if (isMaterialCode(scanValue)) {
    await handleMaterialScan(scanValue);
  } else if (isLocationCode(scanValue)) {
    await handleLocationScan(scanValue);
  } else {
    ElMessage.warning("无法识别的条形码格式");
  }
  scanInput.value = "";
  await nextTick();
  focusScanInput();
};

// 判断是否为物料编码
const isMaterialCode = (code) => {
  return (
    code.startsWith("W-") ||
    code.startsWith("MAT-") ||
    code.startsWith("P-") ||
    code.startsWith("EC-")
  );
};

// 判断是否为货位编码
const isLocationCode = (code) => {
  return code.includes("-") && !isMaterialCode(code);
};

// 处理物料扫码
const handleMaterialScan = async (materialCode) => {
  try {
    const material = inventoryMaterials.value.find(
      (item) => item.materialCode === materialCode
    );
    if (!material) {
      const confirm = await ElMessageBox.confirm(
        `物料 ${materialCode} 不在当前盘点单中，是否添加到盘点单？`,
        "添加物料",
        {
          confirmButtonText: "添加",
          cancelButtonText: "取消",
          type: "warning",
        }
      );
      if (confirm) {
        await addMaterialToInventory(materialCode);
      }
      return;
    }
    inventoryMaterials.value.forEach((item) => {
      item.isHighlighted = item.materialCode === materialCode;
    });
    focusMaterialInput(materialCode);
    scanTips.value = `已定位到物料：${material.materialName}`;
  } catch (error) {
    ElMessage.error("物料扫码处理失败");
  }
};

// 处理货位扫码
const handleLocationScan = async (locationCode) => {
  try {
    currentLocation.value = locationCode;
    inventoryMaterials.value.forEach((item) => {
      item.isHighlighted = item.location === locationCode;
    });
    scanTips.value = `已切换到货位：${locationCode}`;
    const firstMaterial = inventoryMaterials.value.find(
      (item) => item.location === locationCode
    );
    if (firstMaterial) {
      focusMaterialInput(firstMaterial.materialCode);
    }
  } catch (error) {
    ElMessage.error("货位扫码处理失败");
  }
};

// 根据货位查询物料
const queryByLocation = async () => {
  if (!currentLocation.value.trim()) {
    ElMessage.warning("请输入货位");
    return;
  }
  await handleLocationScan(currentLocation.value.trim());
};

// 根据物料编码查询
const queryByMaterialCode = async () => {
  if (!manualMaterialCode.value.trim()) {
    ElMessage.warning("请输入物料编码");
    return;
  }
  await handleMaterialScan(manualMaterialCode.value.trim());
  manualMaterialCode.value = "";
};

// 添加物料到盘点单
const addMaterialToInventory = async (materialCode) => {
  try {
    const newMaterial = {
      materialCode: materialCode,
      materialName: "新增物料",
      specification: "规格型号",
      unit: "个",
      batch: "BATCH-NEW",
      stockQuantity: 0,
      inventoryQuantity: 0,
      currentInventory: 0,
      location: currentLocation.value || "A-01-01",
      status: "pending",
      difference: 0,
      isNew: true,
      isHighlighted: true,
    };
    inventoryMaterials.value.push(newMaterial);
    updateInventoryStats();
    ElMessage.success(`已添加物料 ${materialCode} 到盘点单`);
    setTimeout(() => {
      focusMaterialInput(materialCode);
    }, 100);
  } catch (error) {
    ElMessage.error("添加物料失败");
  }
};

// 从盘点单移除物料
const removeMaterialFromInventory = (row) => {
  ElMessageBox.confirm(
    `确定从盘点单中移除物料 "${row.materialName}" 吗？`,
    "移除物料",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      const index = inventoryMaterials.value.findIndex(
        (item) => item.materialCode === row.materialCode
      );
      if (index !== -1) {
        inventoryMaterials.value.splice(index, 1);
        updateInventoryStats();
        ElMessage.success("移除物料成功");
      }
    })
    .catch(() => {});
};

// 聚焦到扫码输入框
const focusScanInput = () => {
  if (scanInputRef.value) {
    scanInputRef.value.focus();
    scanInputRef.value.select();
  }
};

// 聚焦到物料输入框
const focusMaterialInput = (materialCode) => {
  setTimeout(() => {
    const inputRef = inputRefs.value[materialCode];
    if (inputRef) {
      const input = inputRef.$el.querySelector("input");
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, 100);
};

// 初始化盘点物料数据
const initInventoryMaterials = (row) => {
  inventoryMaterials.value = [
    {
      materialCode: "W-2025-001",
      materialName: "电阻器",
      specification: "10KΩ 0.25W",
      unit: "个",
      batch: "BATCH001",
      stockQuantity: 100,
      inventoryQuantity: 50,
      currentInventory: 0,
      location: "A-01-01",
      status: "pending",
      difference: 0,
      isHighlighted: false,
    },
    {
      materialCode: "W-2025-002",
      materialName: "轴承",
      specification: "25×52×15",
      unit: "套",
      batch: "BATCH002",
      stockQuantity: 50,
      inventoryQuantity: 20,
      currentInventory: 0,
      location: "B-02-01",
      status: "pending",
      difference: 0,
      isHighlighted: false,
    },
    {
      materialCode: "W-2025-003",
      materialName: "纸箱",
      specification: "30×20×15cm",
      unit: "个",
      batch: "BATCH003",
      stockQuantity: 80,
      inventoryQuantity: 30,
      currentInventory: 0,
      location: "C-03-01",
      status: "pending",
      difference: 0,
      isHighlighted: false,
    },
    {
      materialCode: "EC001",
      materialName: "电子元件A",
      specification: "标准型号",
      unit: "个",
      batch: "BATCH004",
      stockQuantity: 120,
      inventoryQuantity: 60,
      currentInventory: 0,
      location: "A-01-01",
      status: "pending",
      difference: 0,
      isHighlighted: false,
    },
  ];
  inventoryStatus.value = [];
  currentInventory.value = row;
  updateInventoryStats();
  scanInput.value = "";
  currentLocation.value = "A-01-01";
  manualMaterialCode.value = "";
  scanTips.value = "请扫描物料条形码或货位条形码，或手动输入查询";
  inputRefs.value = {};
};

// 更新盘点统计
const updateInventoryStats = () => {
  inventoryMaterialTypes.value = inventoryMaterials.value.length;
  inventoryTotalQuantity.value = inventoryMaterials.value.reduce(
    (total, item) => {
      return total + (item.currentInventory || 0);
    },
    0
  );
};

// 开始盘点和继续盘点方法
const handleStartInventory = (row) => {
  inventoryExecuteTitle.value = "开始盘点 - " + row.code;
  initInventoryMaterials(row);
  inventoryExecuteVisible.value = true;
};

const handleContinueInventory = (row) => {
  inventoryExecuteTitle.value = "继续盘点 - " + row.code;
  initInventoryMaterials(row);
  inventoryExecuteVisible.value = true;
};

// 确认盘点
const confirmInventory = async () => {
  const totalInventory = inventoryMaterials.value.reduce(
    (sum, item) => sum + (item.currentInventory || 0),
    0
  );
  if (totalInventory === 0) {
    ElMessage.warning("请填写盘点数量");
    return;
  }

  executeLoading.value = true;
  try {
    // 模拟更新库存状态
    for (const material of inventoryMaterials.value) {
      if (material.currentInventory > 0) {
        const difference = material.currentInventory - material.stockQuantity;
        material.status = "completed";
        material.difference = difference;
        material.inventoryQuantity = material.currentInventory;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        inventoryStatus.value.unshift({
          time: timeStr,
          materialName: material.materialName,
          quantity: material.currentInventory,
          difference: difference,
          message:
            difference === 0
              ? "无差异"
              : `差异: ${difference > 0 ? "+" : ""}${difference}件`,
        });

        material.currentInventory = 0;
      }
    }

    // 更新表格中的盘点单状态
    const index = state.tableData.data.findIndex(
      (item) => item.id === currentInventory.value.id
    );
    if (index !== -1) {
      state.tableData.data[index].status = "waitingReview";
    }

    ElMessage.success("盘点完成，已提交审核！");
    inventoryExecuteVisible.value = false;
    getTableData();
  } catch (error) {
    ElMessage.error("盘点过程中出现错误");
  } finally {
    executeLoading.value = false;
  }
};

// ========== 差异详情相关 ==========
const differenceDialogVisible = ref(false);
const currentDifference = ref({});
const differenceMaterials = ref([]);
const inventoryLocations = ref(["A-01-01", "B-02-01", "C-03-01"]);

const handleDifference = (row) => {
  currentDifference.value = row;
  differenceMaterials.value = [
    {
      materialCode: "W-2025-001",
      materialName: "电阻器",
      specification: "10KΩ 0.25W",
      unit: "个",
      batch: "BATCH001",
      location: "A-01-01",
      stockQuantity: 100,
      inventoryQuantity: 95,
      difference: -5,
      differenceRate: -0.05,
      processed: false,
    },
    {
      materialCode: "W-2025-002",
      materialName: "轴承",
      specification: "25×52×15",
      unit: "套",
      batch: "BATCH002",
      location: "B-02-01",
      stockQuantity: 50,
      inventoryQuantity: 52,
      difference: 2,
      differenceRate: 0.04,
      processed: true,
    },
    {
      materialCode: "W-2025-003",
      materialName: "纸箱",
      specification: "30×20×15cm",
      unit: "个",
      batch: "BATCH003",
      location: "C-03-01",
      stockQuantity: 80,
      inventoryQuantity: 78,
      difference: -2,
      differenceRate: -0.025,
      processed: false,
    },
  ];
  differenceDialogVisible.value = true;
};
const closeDifferenceDialog = () => {
  differenceDialogVisible.value = false;
};

// 差异调整
const adjustVisible = ref(false);
const adjustForm = reactive({
  adjustReason: "",
  adjustRemark: "",
});
const adjustFormRef = ref(null);
const adjustLoading = ref(false);
const adjustTitle = ref("差异调整");
const adjustReasonList = ref([
  { value: "stockError", label: "库存错误" },
  { value: "materialError", label: "物料错误" },
  { value: "other", label: "其他" },
]);

// 打开差异调整弹窗
const isAdjustDetail = ref(false);
const openAdjustDialog = (row, type) => {
  if (type === "detail") {
    adjustTitle.value = "差异详情";
  } else {
    adjustTitle.value = "差异调整";
    isAdjustDetail.value = true;
  }
  adjustForm.adjustReason = "";
  adjustForm.adjustRemark = "";
  adjustVisible.value = true;
};

const handleAdjustDetail = (row, type) => {
  if (type === "detail") {
    adjustTitle.value = "差异详情";
    isAdjustDetail.value = false;
  } else {
    adjustTitle.value = "差异调整";
  }
  adjustForm.adjustReason = row.adjustReason;
  adjustForm.adjustRemark = row.adjustRemark;
  adjustVisible.value = true;
};

// 关闭差异调整弹窗
const closeAdjustDialog = () => {
  adjustVisible.value = false;
};

// 提交差异调整
const submitAdjust = () => {
  adjustFormRef.value.validate((valid) => {
    if (valid) {
      adjustLoading.value = true;
      // 提交调整逻辑
      ElMessage.success("差异调整成功");
      adjustLoading.value = false;
      closeAdjustDialog();
      getTableData();
    } else {
      ElMessage.error("请填写调整原因和备注");
    }
  });
};

// 监听盘点数量变化
watch(
  inventoryMaterials,
  () => {
    updateInventoryStats();
  },
  { deep: true }
);

// 搜索监听
watch(
  () => [searchForm.keyword, searchForm.status, searchForm.type],
  () => {
    handleSearch();
  },
  { deep: true }
);

onMounted(() => {
  getTableData();
});
</script>

<style scoped lang="scss">
.inventory-padding {
  padding: 18px;
}

.stats-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  .stat-card {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 16px 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    .label {
      font-size: 14px;
      color: #606266;
    }
    .num {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
    &.success .num {
      color: #67c23a;
    }
    &.warning .num {
      color: #e6a23c;
    }
    &.danger .num {
      color: #f56c6c;
    }
  }
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  .add-btn {
    .el-icon {
      margin-right: 4px;
    }
  }
}

.search-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-demo {
  height: calc(100vh - 288px);
}

.operateBox {
  display: flex;
  gap: 8px;
  .primary-btn {
    color: #409eff !important;
  }
  .warning-btn {
    color: #e6a23c !important;
  }
  .success-btn {
    color: #67c23a !important;
  }
}

.detail-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.form-box {
  padding: 10px 0;
}

:deep(.detail-table) {
  .table-demo {
    height: calc(100vh - 650px);
  }
}

.inventory-execute-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.material-inventory-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .inventory-info {
    display: flex;
    justify-content: space-around;
    gap: 12px;
    height: 100px;
    align-items: center;
    box-shadow: 0 4px 8px 0 rgba(216, 205, 205, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 8px;
    margin-bottom: 10px;

    .info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .label {
        font-size: 18px;
        color: #606266;
        font-weight: 700;
      }

      .value {
        font-size: 16px;
        color: #303133;
      }
    }
  }

  .inventory-table-container {
    border-radius: 4px;
    display: flex;
    margin-top: 20px;

    .scan-receive-section {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #ebeef5;
      flex: 1;

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .scan-content {
        .scan-input-wrapper {
          margin-bottom: 20px;
          border: 3px dashed #ebeef5;
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .svg-icon {
            font-size: 50px;
          }

          .title {
            font-size: 16px;
            color: #606266;
            margin-top: 12px;
          }
        }

        .manual-input-area {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;

          .current-location,
          .manual-material-input {
            display: flex;
            align-items: center;

            .label {
              color: #606266;
              font-weight: 500;
              margin-right: 8px;
              white-space: nowrap;
            }

            :deep(.el-input) {
              .el-input__wrapper {
                height: 32px;
              }
            }
          }
        }
      }
    }

    .table-container {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #ebeef5;
      margin-left: 20px;
      width: calc(100% - 500px);

      .material-inventory-table {
        width: 100%;
        height: calc(100vh - 600px) !important;

        :deep(.highlight-row) {
          background-color: #f0f9ff;
        }
      }

      .submit-container {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .inventory-locations {
    margin-top: 20px;

    .inventory-content {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .el-tag {
        margin: 0 8px;
      }
    }
  }
}

.difference-dialog {
  .difference-content {
    .difference-header {
      margin-bottom: 20px;

      .header-info {
        display: flex;
        justify-content: space-around;
        gap: 12px;
        height: 100px;
        align-items: center;
        border-radius: 8px;
        margin-bottom: 10px;

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          .label {
            font-size: 18px;
            color: #606266;
            font-weight: 700;
          }

          .value {
            font-size: 16px;
            color: #303133;
          }
        }
      }
    }

    .difference-table-container {
      margin-bottom: 20px;
    }

    .difference-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }
}

.difference-positive {
  color: #f56c6c;
  font-weight: bold;
}

.difference-negative {
  color: #67c23a;
  font-weight: bold;
}

.difference-zero {
  color: #909399;
}

.difference-rate-low {
  color: #67c23a;
}

.difference-rate-medium {
  color: #e6a23c;
}

.difference-rate-high {
  color: #f56c6c;
}
</style>

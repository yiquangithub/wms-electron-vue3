<template>
  <div class="inbound-container layout-padding">
    <div class="inbound-padding layout-padding-view layout-padding-auto">
      <!-- 顶部统计卡片 - 和异常页面完全一致 -->
      <div class="stats-wrapper">
        <div class="stat-card">
          <div class="label">今日入库单数</div>
          <div class="num">18</div>
        </div>
        <div class="stat-card">
          <div class="label">本周入库总量</div>
          <div class="num">1286 <span class="unit">件</span></div>
        </div>
        <div class="stat-card warning">
          <div class="label">待处理入库单</div>
          <div class="num">5</div>
        </div>
      </div>

      <!-- 搜索栏 - 严格按照截图布局 -->
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
                  <el-option label="已完成" value="completed" />
                  <el-option label="部分入库" value="partial" />
                  <el-option label="已审核" value="audited" />
                  <el-option label="待审核" value="pending" />
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
                  <el-option label="采购入库" value="purchase" />
                  <el-option label="退货入库" value="return" />
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
                  placeholder="入库单号/供应商"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-button type="primary" @click="handleCommand('add')"
                  >新增入库单</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 表格 - 完全兼容你们项目的 CommonTable -->
      <CommonTable
        ref="tableRef"
        v-bind="state.tableData"
        class="table-demo"
        @pageChange="onPageChange"
        @clickChangeCode="clickChangeCode"
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
              v-if="row.status === 'partial'"
              link
              type="primary"
              class="warning-btn"
              @click="handleContinue(row)"
              >继续入库</el-button
            >
            <el-button
              v-if="row.status === 'audited'"
              link
              type="primary"
              @click="handleStart(row)"
              >开始入库</el-button
            >
            <el-button
              v-if="row.status === 'pending'"
              link
              type="primary"
              @click="handleCommand('edit', row)"
              >编辑</el-button
            >
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              @click="handleCommand('del', row)"
              >删除</el-button
            >
          </div>
        </template>
      </CommonTable>
    </div>

    <!-- 新增入库弹窗 -->
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
        :disabled="dialogProps.isView || dialogProps.isAudit"
        :model="formData"
        :hide-required-asterisk="dialogProps.isView"
        label-position="top"
      >
        <el-row class="form-box">
          <el-col :span="24">
            <CustomDivider title="入库基础信息"></CustomDivider>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="入库单编号" prop="">
              <el-input
                placeholder="可不填写，自动生成"
                v-model="formData.code"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="入库单类型" required prop="">
              <el-select
                placeholder="请选择入库类别"
                v-model="formData.inventoryType"
              >
                <el-option
                  v-for="item in storeType"
                  :key="item.category"
                  :label="item.categoryName"
                  :value="item.category"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="关联订单号" required prop="">
              <el-input
                placeholder="请输入关联订单号"
                v-model="formData.orderCode"
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
        <el-row :gutter="20" justify="space-between">
          <el-col :span="6">
            <el-form-item label="预计入库日期" prop="" required>
              <el-date-picker
                v-model="formData.inboundDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择预计入库日期"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供应商名称" prop="">
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
          <el-col :span="6">
            <el-form-item label="入库仓库" required prop="">
              <el-select
                placeholder="请选择入库仓库"
                v-model="formData.warehouseId"
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
          <el-col :span="24">
            <el-form-item label="备注" prop="">
              <el-input
                placeholder="请输入内容"
                :rows="2"
                type="textarea"
                maxlength="300"
                show-word-limit
                v-model="formData.remark"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="form-box detail-info">
        <el-col :span="20">
          <CustomDivider title="入库物料信息"></CustomDivider>
        </el-col>
        <el-button
          type="primary"
          :icon="Plus"
          plain
          size="default"
          @click="chooseMaterial"
          v-if="!dialogProps.isAudit && !dialogProps.isView"
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
          :disabled="dialogProps.isView"
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
          <el-table-column label="批次" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.batch"
                placeholder="请输入批次"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="单价" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.price"
                placeholder="请输入单价"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="入库数量" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.quantity"
                placeholder="请输入入库数量"
                :disabled="dialogProps.isView"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100"
            fixed="right"
            v-if="!dialogProps.isView"
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
          v-show="!dialogProps.isView && !dialogProps.isAudit"
          type="primary"
          @click="handleSubmit"
          >确定</el-button
        >
        <el-button @click="closeDialog">取消</el-button>
      </template>
    </el-dialog>

    <!-- 订单选择弹窗 -->
    <el-dialog
      v-model="orderSelectVisible"
      title="选择订单"
      width="1000px"
      append-to-body
      class="select-dialog"
    >
      <div class="search-bar">
        <el-input
          v-model="orderSearchKeyword"
          placeholder="输入客户名称搜索"
          clearable
          @input="handleOrderSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
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
        <el-table-column prop="code" label="订单号" width="180" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="productName" label="物料" />
        <el-table-column
          prop="workOrderNum"
          label="数量"
          width="100"
          align="center"
        />
        <el-table-column
          prop="deliveryDate"
          label="交付日期"
          width="150"
          align="center"
        />
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

    <WarehouseProductSelectDialog
      v-model="showMaterialSelect"
      @confirm="onMaterialSelect"
      title="选择仓库物料"
      selectionMode="multiple"
      :defaultSelected="defaultSelected"
    />

    <ContactSelectDialog
      v-model="showContactSelect"
      @confirm="onContactSelect"
      title="选择供应商/公司"
      selectionMode="single"
      :defaultSelected="defaultContactSelected"
    />

    <!-- 入库执行弹窗（开始入库 / 继续入库） -->
    <el-dialog
      v-model="inboundExecuteVisible"
      :title="inboundExecuteTitle"
      width="90%"
      top="5vh"
      destroy-on-close
      class="inbound-execute-dialog"
    >
      <div class="execute-content">
        <!-- 格子库存与负载情况 -->
        <div class="cabinet-section">
          <div class="title">
            <svg-icon icon-class="grid-condition" />
            <h3>格子库存与负载情况</h3>
            <div class="legend">
              <span><i class="dot normal"></i>正常</span>
              <span><i class="dot unbalance"></i>偏载</span>
              <span><i class="dot overload"></i>过载</span>
            </div>
          </div>

          <div class="cabinet-grid">
            <template
              v-for="(floor, floorIndex) in inboundFloors"
              :key="floorIndex"
            >
              <div class="floor">
                <div class="floor-header">
                  <span class="floor-title">{{ floor.name }}</span>
                  <div class="floor-stats">
                    <el-tag type="danger" size="small" effect="dark"
                      >过载: {{ floor.overload }}</el-tag
                    >
                    <el-tag type="warning" size="small" effect="dark"
                      >偏载: {{ floor.unbalance }}</el-tag
                    >
                  </div>
                </div>
                <div class="slots-row">
                  <div
                    v-for="slot in floor.slots"
                    :key="slot.id"
                    class="slot-item"
                    :class="getInboundSlotClass(slot)"
                    @click="selectSlot(slot, floor.name)"
                  >
                    <div class="slot-id">{{ slot.id }}</div>
                    <div class="slot-weight" v-if="slot.status === 'occupied'">
                      {{ slot.weight }}kg
                    </div>
                    <div class="slot-empty" v-else>空</div>
                    <div class="overload-dot" v-if="slot.weight > 7.0"></div>
                    <div
                      class="unbalance-dot"
                      v-if="slot.weight > 5.7 && slot.weight <= 7.0"
                    ></div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 物料接收区域 -->
        <div class="material-receive-section">
          <div class="section-header">
            <svg-icon icon-class="grid-condition" />
            <h3>物料接收</h3>
          </div>
          <div class="inbound-info">
            <div class="info-item">
              <span class="label">入库单编号:</span>
              <span class="value"> 20230824001 </span>
            </div>
            <div class="info-item">
              <span class="label">供应商/公司:</span>
              <span class="value"> 供应商A </span>
            </div>
            <div class="info-item">
              <span class="label">入库类型:</span>
              <span class="value"> 普通入库 </span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <span class="value"> 已完成 </span>
            </div>
          </div>
          <div class="receive-controls">
            <div class="control-left">
              <el-button
                type="primary"
                class="scan-btn"
                @click="handleScanReceive"
              >
                <el-icon><Camera /></el-icon>
                扫码接收
              </el-button>
              <div class="scan-desc">扫描物料二维码</div>
            </div>

            <div class="control-right">
              <div class="manual-input-group">
                <el-input
                  v-model="manualMaterialCode"
                  placeholder="手动输入物料编码"
                  clearable
                  @keyup.enter="handleManualQuery"
                  class="manual-input"
                />
                <el-button
                  type="primary"
                  @click="handleManualQuery"
                  class="query-btn"
                >
                  查询
                </el-button>
              </div>
            </div>
          </div>

          <!-- 待接收物料统计 -->
          <div class="receive-summary">
            <span class="summary-label">待接收的物料</span>
            <span class="summary-info">
              共接收{{ receiveMaterialTypes }}种物料，总数量{{
                receiveTotalQuantity
              }}件
            </span>
          </div>

          <!-- 待接收物料表格 -->
          <div class="receive-table-container">
            <el-table
              :data="receiveMaterials"
              border
              height="200"
              class="material-receive-table"
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
                width="80"
                align="center"
              />
              <el-table-column
                prop="planQuantity"
                label="计划数量"
                width="100"
                align="center"
              />
              <el-table-column
                prop="receivedQuantity"
                label="已入数量"
                width="100"
                align="center"
              />
              <el-table-column label="本次接收" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.currentReceive"
                    :min="0"
                    :max="row.planQuantity - row.receivedQuantity"
                    :precision="0"
                    size="small"
                    controls-position="right"
                    @change="updateReceiveStats"
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="batchCode"
                label="批次号"
                width="120"
                align="center"
              >
                <template #default="{ row }">
                  <el-input
                    v-model="row.batchCode"
                    placeholder="批次号"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="120"
                fixed="right"
                align="center"
              >
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="confirmReceive(row)"
                    >
                      确认
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="deleteReceive(row)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 分配库位区域 - 按照新需求调整字段 -->
        <div class="material-section">
          <div class="section-header">
            <svg-icon icon-class="grid-condition" />
            <h3>分配库位</h3>
          </div>
          <el-table
            :data="allocationMaterials"
            border
            height="240"
            class="material-table"
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
            >
              <template #default="{ row }">
                <el-select
                  v-model="row.materialCode"
                  placeholder="选择物料编码"
                  size="small"
                  style="width: 100%"
                  @change="handleMaterialCodeChange(row)"
                >
                  <el-option
                    v-for="material in availableMaterials"
                    :key="material.materialCode"
                    :label="material.materialCode"
                    :value="material.materialCode"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              prop="materialName"
              label="物料名称"
              min-width="160"
              align="center"
            />
            <el-table-column
              prop="specification"
              label="规格型号"
              min-width="140"
              align="center"
            />
            <el-table-column
              prop="unit"
              label="单位"
              width="80"
              align="center"
            />
            <el-table-column
              prop="receiveQuantity"
              label="接收数量"
              width="100"
              align="center"
            />
            <el-table-column
              prop="batchCode"
              label="批次号"
              width="120"
              align="center"
            />
            <el-table-column label="层号" width="100" align="center">
              <template #default="{ row }">
                <el-select
                  v-model="row.floorNumber"
                  placeholder="选择层号"
                  size="small"
                  style="width: 100%"
                  @change="handleFloorChange(row)"
                >
                  <el-option
                    v-for="floor in availableFloors"
                    :key="floor.value"
                    :label="floor.label"
                    :value="floor.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="格号" width="100" align="center">
              <template #default="{ row }">
                <el-select
                  v-model="row.slotNumber"
                  placeholder="选择格号"
                  size="small"
                  style="width: 100%"
                  :disabled="!row.floorNumber"
                >
                  <el-option
                    v-for="slot in getAvailableSlots(row.floorNumber)"
                    :key="slot.id"
                    :label="slot.id"
                    :value="slot.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="料盒" width="100" align="center">
              <template #default="{ row }">
                <el-select
                  v-model="row.boxNumber"
                  placeholder="选择料盒"
                  size="small"
                  style="width: 100%"
                >
                  <el-option
                    v-for="box in availableBoxes"
                    :key="box.value"
                    :label="box.label"
                    :value="box.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :max="row.maxQuantity"
                  :precision="0"
                  size="small"
                  controls-position="right"
                  style="width: 100px"
                  @change="validateQuantity(row)"
                />
                <div v-if="row.quantityError" class="error-text">
                  {{ row.quantityError }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="80"
              fixed="right"
              align="center"
              v-if="!dialogProps.isView"
            >
              <template #default="{ row }">
                <div class="operateBox">
                  <el-button
                    type="danger"
                    text
                    size="small"
                    @click="handleAllocationDelete(row)"
                    :icon="Delete"
                  ></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="inboundExecuteVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="executeLoading"
          @click="confirmInbound"
          :disabled="!isAllocationValid"
        >
          确认入库
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CommonTable from "@/components/CommonTable/index.vue";
import CustomDivider from "@/components/CustomDivider/index.vue";
import {
  Plus,
  View,
  Delete,
  EditPen,
  Search,
  Connection,
  Camera,
} from "@element-plus/icons-vue";
import ContactSelectDialog from "@/components/ContactSelectDialog/index.vue";
import WarehouseProductSelectDialog from "@/components/WarehouseProductSelectDialog/index.vue";
import router from "@/router";

const searchForm = reactive({
  status: "",
  type: "",
  startDate: "",
  endDate: "",
  keyword: "",
});

// 状态映射
const getStatusText = (status) => {
  const map = {
    completed: "已完成",
    partial: "部分入库",
    audited: "已审核",
    pending: "待审核",
  };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = {
    completed: "success",
    partial: "warning",
    audited: "primary",
    pending: "info",
  };
  return map[status] || "info";
};

// 表格核心数据
const state = reactive({
  tableData: {
    data: [
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 100,
        status: "completed",
      },
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 80,
        status: "partial",
      },
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 0,
        status: "audited",
      },
      {
        id: "IN-2025-001",
        type: "采购入库",
        supplier: "深圳电子元件有限公司",
        planDate: "2025-05-15",
        totalQty: 100,
        inQty: 0,
        status: "pending",
      },
    ],
    header: [
      { key: "id", title: "入库单号", width: 160, isCheck: true },
      { key: "type", title: "入库类型", isCheck: true },
      { key: "supplier", title: "供应商", minWidth: 220, isCheck: true },
      { key: "planDate", title: "预计入库日期", width: 140, isCheck: true },
      {
        key: "totalQty",
        title: "总数量",
        width: 100,
        align: "center",
        isCheck: true,
      },
      {
        key: "inQty",
        title: "已入库数量",
        width: 120,
        align: "center",
        isCheck: true,
        status: "linkButton",
      },
    ],
    config: {
      total: 68,
      loading: false,
      isBorder: true,
      isStripe: true,
      isSerialNo: true,
      isSelection: true,
      isOperate: true,
      operateWidth: "200",
      isImport: true,
      isStatusConfig: true,
    },
    param: { pageNum: 1, pageSize: 10 },
  },
});

// 方法
const handleSearch = () => {
  state.tableData.param.pageNum = 1;
  getTableData();
};

const clickChangeCode = (row) => {
  console.log(
    "%c [ row ]-579",
    "font-size:13px; background:pink; color:#bf2c9f;",
    row
  );
  router.push({
    path: "/warehouse/recordStorage",
  });
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

// ========== 新增入库弹框相关代码 ==========
const dialogVisible = ref(false);
const dialogProps = ref({
  isView: false,
  isAudit: false,
  title: "",
  row: {},
});

const rules = reactive({});
const ruleFormRef = ref();
const formData = ref({
  code: "",
  id: 0,
  inventoryType: null,
  orderId: 0,
  inboundDate: "",
  warehouseId: 0,
  orderCode: "",
  products: [],
  remark: "",
  supplierContacts: "",
  supplierId: 0,
  supplierCode: "",
  supplierName: "",
  supplierPhone: "",
});

const warehouseList = ref([]);

const handleCommand = async (command, row) => {
  if (command === "add") {
    dialogProps.value = {
      isView: false,
      isAudit: false,
      title: "新增入库单",
    };
    formData.value = {
      code: "",
      id: 0,
      inventoryType: null,
      orderId: 0,
      orderCode: "",
      products: [],
      remark: "",
      supplierContacts: "",
      supplierId: 0,
      supplierCode: "",
      supplierName: "",
      supplierPhone: "",
    };
    dialogVisible.value = true;
  } else if (command === "edit") {
    dialogProps.value = {
      isView: false,
      isAudit: false,
      title: "编辑入库单",
    };
    formData.value = {
      code: row.id,
      id: 1,
      inventoryType: "purchase",
      orderId: 1,
      orderCode: "ORDER-001",
      products: [
        {
          batch: "BATCH001",
          price: 100,
          productId: 1,
          quantity: 50,
          warehouseId: 1,
          productName: "电子元件A",
          productCode: "EC001",
          warehouseName: "主仓库",
        },
      ],
      remark: "测试入库单",
      supplierContacts: "张经理",
      supplierId: 1,
      supplierCode: "SUP001",
      supplierName: row.supplier,
      supplierPhone: "13800138000",
    };
    dialogVisible.value = true;
  } else if (command === "view") {
    dialogProps.value = {
      isView: true,
      isAudit: false,
      title: "查看入库单",
    };
    formData.value = {
      code: row.id,
      id: 1,
      inventoryType: "purchase",
      orderId: 1,
      orderCode: "ORDER-001",
      products: [
        {
          batch: "BATCH001",
          price: 100,
          productId: 1,
          quantity: 50,
          warehouseId: 1,
          productName: "电子元件A",
          productCode: "EC001",
          warehouseName: "主仓库",
        },
      ],
      remark: "测试入库单",
      supplierContacts: "张经理",
      supplierId: 1,
      supplierCode: "SUP001",
      supplierName: row.supplier,
      supplierPhone: "13800138000",
    };
    dialogVisible.value = true;
  } else if (command === "del") {
    deleteData(row);
  }
};

const handleDetailCommand = (command, row) => {
  if (command === "del") {
    const index = formData.value.products.findIndex(
      (item) => item.productId === row.productId
    );
    if (index !== -1) {
      formData.value.products.splice(index, 1);
    }
  }
};

const deleteData = async (params) => {
  ElMessageBox.confirm("您确定删除该数据吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      ElMessage({
        type: "success",
        message: "删除成功",
      });
      getTableData();
    })
    .catch(() => {});
};

const handleSubmit = async () => {
  if (ruleFormRef.value) {
    ruleFormRef.value.validate(async (valid) => {
      if (valid) {
        ElMessage({
          message: "操作成功",
          type: "success",
        });
        ruleFormRef.value?.resetFields();
        dialogVisible.value = false;
        getTableData();
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
    brand: "",
    importantParts: 0,
    externalCode: "",
    internalCode: "",
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
        batch: "",
        price: item.productPrice || 0,
        productId: item.productId,
        specification: item.productSpecifications || "",
        unit: item.unitName || "",
        quantity: 0,
        warehouseId: item.warehouseId,
        productName: item.productName,
        productCode: item.productCode,
        warehouseName: item.warehouseName,
      });
    }
  });

  showMaterialSelect.value = false;
};

// 供应商相关
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

// 获取入库单类型
const storeType = ref([
  { category: "purchase", categoryName: "采购入库" },
  { category: "return", categoryName: "退货入库" },
  { category: "transfer", categoryName: "调拨入库" },
  { category: "other", categoryName: "其他入库" },
]);

// 订单选择相关
const orderSelectVisible = ref(false);
const orderSearchKeyword = ref("");
const orderList = ref([]);
const orderPage = ref(1);
const orderPageSize = ref(10);
const orderTotal = ref(0);

const toggleOrder = () => {
  orderSelectVisible.value = true;
  getOrderListData();
};

const handleOrderSearch = () => {
  orderPage.value = 1;
  orderPageSize.value = 10;
  getOrderListData();
};

const getOrderListData = async () => {
  orderList.value = [
    {
      id: 1,
      code: "ORDER-001",
      customerName: "客户A",
      productName: "电子元件A",
      workOrderNum: 100,
      deliveryDate: "2025-05-20",
    },
    {
      id: 2,
      code: "ORDER-002",
      customerName: "客户B",
      productName: "电子元件B",
      workOrderNum: 200,
      deliveryDate: "2025-05-25",
    },
    {
      id: 3,
      code: "ORDER-003",
      customerName: "客户C",
      productName: "电子元件C",
      workOrderNum: 150,
      deliveryDate: "2025-05-30",
    },
  ];
  orderTotal.value = 3;
};

const handleOrderSelect = (row) => {
  formData.value.orderId = row.id;
  formData.value.orderCode = row.code;
  orderSelectVisible.value = false;
};

const handleOrderSizeChange = (val) => {
  orderPageSize.value = val;
  getOrderListData();
};

const handleOrderPageChange = (val) => {
  orderPage.value = val;
  getOrderListData();
};

// 入库执行相关
const inboundExecuteVisible = ref(false);
const inboundExecuteTitle = ref("");
const executeMaterials = ref([]);
const executeLoading = ref(false);

// 分配库位相关数据
const allocationMaterials = ref([]);

// 可用物料列表（从接收物料中获取）
const availableMaterials = computed(() => {
  return receiveMaterials.value.map((material) => ({
    materialCode: material.materialCode,
    materialName: material.materialName,
    specification: material.specification,
    unit: material.unit,
    receiveQuantity: material.currentReceive,
    batchCode: material.batchCode,
    maxQuantity: material.currentReceive,
  }));
});

// 可用层号
const availableFloors = ref([
  { value: "第一层", label: "第一层" },
  { value: "第二层", label: "第二层" },
  { value: "第三层", label: "第三层" },
  { value: "第四层", label: "第四层" },
]);

// 可用料盒
const availableBoxes = ref([
  { value: "BOX-001", label: "BOX-001" },
  { value: "BOX-002", label: "BOX-002" },
  { value: "BOX-003", label: "BOX-003" },
  { value: "BOX-004", label: "BOX-004" },
]);

// 模拟格子数据
const inboundFloors = ref([
  {
    name: "第一层",
    overload: 2,
    unbalance: 2,
    slots: [
      { id: "01", weight: 0, status: "empty" },
      { id: "02", weight: 5.7, status: "occupied" },
      { id: "03", weight: 5.7, status: "occupied" },
      { id: "04", weight: 5.7, status: "occupied" },
      { id: "05", weight: 6.8, status: "occupied" },
      { id: "06", weight: 5.7, status: "occupied" },
      { id: "07", weight: 5.7, status: "occupied" },
      { id: "08", weight: 7.5, status: "occupied" },
      { id: "09", weight: 0, status: "empty" },
      { id: "10", weight: 5.7, status: "occupied" },
      ...Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 11).padStart(2, "0"),
        weight: 5.7,
        status: "occupied",
      })),
    ],
  },
  {
    name: "第二层",
    overload: 2,
    unbalance: 2,
    slots: [
      { id: "01", weight: 0, status: "empty" },
      { id: "02", weight: 5.7, status: "occupied" },
      { id: "03", weight: 5.7, status: "occupied" },
      { id: "04", weight: 5.7, status: "occupied" },
      { id: "05", weight: 7.8, status: "occupied" },
      { id: "06", weight: 6.5, status: "occupied" },
      ...Array.from({ length: 14 }, (_, i) => ({
        id: String(i + 7).padStart(2, "0"),
        weight: i === 0 ? 7.8 : i === 5 ? 6.5 : 5.7,
        status: "occupied",
      })),
    ],
  },
]);

// 获取可用格子
const getAvailableSlots = (floorNumber) => {
  const floor = inboundFloors.value.find((f) => f.name === floorNumber);
  return floor ? floor.slots.filter((slot) => slot.weight <= 7.0) : [];
};

// 物料编码变化处理
const handleMaterialCodeChange = (row) => {
  const material = availableMaterials.value.find(
    (m) => m.materialCode === row.materialCode
  );
  if (material) {
    row.materialName = material.materialName;
    row.specification = material.specification;
    row.unit = material.unit;
    row.receiveQuantity = material.receiveQuantity;
    row.batchCode = material.batchCode;
    row.maxQuantity = material.receiveQuantity;
    // 重置数量为最大可用数量
    row.quantity = material.receiveQuantity;
    validateQuantity(row);
  }
};

// 层号变化处理
const handleFloorChange = (row) => {
  // 清空格号
  row.slotNumber = "";
};

// 验证数量
const validateQuantity = (row) => {
  if (row.quantity > row.maxQuantity) {
    row.quantityError = `数量不能大于接收数量 ${row.maxQuantity}`;
    return false;
  } else {
    row.quantityError = "";
    return true;
  }
};

// 删除分配行
const handleAllocationDelete = (row) => {
  const index = allocationMaterials.value.indexOf(row);
  if (index !== -1) {
    allocationMaterials.value.splice(index, 1);
  }
};

// 验证分配数据
const isAllocationValid = computed(() => {
  if (allocationMaterials.value.length === 0) return false;

  return allocationMaterials.value.every((row) => {
    return (
      row.materialCode &&
      row.floorNumber &&
      row.slotNumber &&
      row.quantity > 0 &&
      !row.quantityError
    );
  });
});

// 已选择的格子
const selectedSlots = ref([]);

// 选择格子
const selectSlot = (slot, floorName) => {
  if (slot.weight > 7.0) {
    ElMessage.warning("该格子已过载，无法入库");
    return;
  }
  if (slot.weight > 5.7) {
    ElMessageBox.confirm("该格子偏载，是否继续入库？", "警告", {
      type: "warning",
    })
      .then(() => doSelect(slot, floorName))
      .catch(() => {});
  } else {
    doSelect(slot, floorName);
  }
};

const doSelect = (slot, floorName) => {
  const totalQty = allocationMaterials.value.reduce(
    (sum, m) => sum + (m.quantity || 0),
    0
  );
  if (totalQty === 0) {
    ElMessage.warning("请先填写分配数量");
    return;
  }

  ElMessageBox.prompt(
    `将 ${totalQty} 件物料放入 ${floorName}-${slot.id}格？`,
    "确认入库储位",
    {
      inputValue: totalQty,
      inputType: "number",
    }
  )
    .then(({ value }) => {
      const qty = Number(value);
      if (qty > 0) {
        selectedSlots.value.push({
          position: `${floorName}-${slot.id}格`,
          qty,
          slot,
        });
        ElMessage.success("储位已选择");
      }
    })
    .catch(() => {});
};

const removeSelectedSlot = (item) => {
  selectedSlots.value = selectedSlots.value.filter((i) => i !== item);
};

// 格子样式
const getInboundSlotClass = (slot) => {
  if (slot.status === "empty") return "empty";
  if (slot.weight > 7.0) return "overload";
  if (slot.weight > 5.7) return "unbalance";
  return "normal";
};

const confirmInbound = () => {
  const total = allocationMaterials.value.reduce(
    (s, m) => s + (m.quantity || 0),
    0
  );
  if (total === 0) return ElMessage.warning("请填写分配数量");
  if (selectedSlots.value.length === 0)
    return ElMessage.warning("请选择储位格子");

  ElMessageBox.confirm(`确认将 ${total} 件物料入库到已选格子？`, "确认入库", {
    type: "warning",
  }).then(() => {
    executeLoading.value = true;
    setTimeout(() => {
      ElMessage.success("入库成功！");
      inboundExecuteVisible.value = false;
      executeLoading.value = false;
      getTableData();
    }, 1000);
  });
};

// 物料接收相关
const manualMaterialCode = ref("");
const receiveMaterials = ref([]);
const receiveMaterialTypes = ref(0);
const receiveTotalQuantity = ref(0);

// 初始化接收物料数据
const initReceiveMaterials = () => {
  receiveMaterials.value = [
    {
      materialCode: "W-2025-001",
      materialName: "电阻器",
      specification: "10KΩ 0.25W",
      unit: "个",
      planQuantity: 100,
      receivedQuantity: 100,
      currentReceive: 10,
      batchCode: "BT-01",
    },
    {
      materialCode: "W-2025-002",
      materialName: "轴承",
      specification: "25×52×15",
      unit: "套",
      planQuantity: 100,
      receivedQuantity: 100,
      currentReceive: 10,
      batchCode: "BT-02",
    },
    {
      materialCode: "W-2025-003",
      materialName: "纸箱",
      specification: "30×20×15cm",
      unit: "个",
      planQuantity: 100,
      receivedQuantity: 100,
      currentReceive: 10,
      batchCode: "BT-03",
    },
  ];
  updateReceiveStats();
};

// 更新接收统计
const updateReceiveStats = () => {
  receiveMaterialTypes.value = receiveMaterials.value.length;
  receiveTotalQuantity.value = receiveMaterials.value.reduce((total, item) => {
    return total + (item.currentReceive || 0);
  }, 0);
};

// 扫码接收
const handleScanReceive = () => {
  ElMessage.info("扫码功能待实现");
};

// 手动查询物料
const handleManualQuery = () => {
  if (!manualMaterialCode.value.trim()) {
    ElMessage.warning("请输入物料编码");
    return;
  }

  const foundMaterial = {
    materialCode: manualMaterialCode.value,
    materialName: "查询的物料",
    specification: "规格型号",
    unit: "个",
    planQuantity: 100,
    receivedQuantity: 0,
    currentReceive: 0,
    batchCode: "",
  };

  const exists = receiveMaterials.value.some(
    (item) => item.materialCode === manualMaterialCode.value
  );

  if (!exists) {
    receiveMaterials.value.push(foundMaterial);
    updateReceiveStats();
    ElMessage.success("物料查询成功");
  } else {
    ElMessage.warning("该物料已在接收列表中");
  }

  manualMaterialCode.value = "";
};

// 确认接收单行物料
const confirmReceive = (row) => {
  if (!row.currentReceive || row.currentReceive <= 0) {
    ElMessage.warning("请输入本次接收数量");
    return;
  }

  if (row.currentReceive > row.planQuantity - row.receivedQuantity) {
    ElMessage.warning("接收数量不能超过剩余数量");
    return;
  }

  ElMessage.success(`成功接收 ${row.currentReceive} 件 ${row.materialName}`);
};

// 删除接收行
const deleteReceive = (row) => {
  const index = receiveMaterials.value.findIndex((item) => item === row);
  if (index !== -1) {
    receiveMaterials.value.splice(index, 1);
    updateReceiveStats();
    ElMessage.success("删除成功");
  }
};

// 修改 handleStart 和 handleContinue 方法
const handleStart = (row) => {
  inboundExecuteTitle.value = "开始入库 - " + row.id;
  executeMaterials.value =
    row.products?.map((p) => ({
      ...p,
      currentQty: p.quantity,
      inboundQty: 0,
    })) || [];
  selectedSlots.value = [];
  allocationMaterials.value = []; // 清空分配数据
  initReceiveMaterials();
  inboundExecuteVisible.value = true;
};

const handleContinue = (row) => {
  inboundExecuteTitle.value = "继续入库 - " + row.id;
  executeMaterials.value =
    row.products?.map((p) => ({
      ...p,
      currentQty: p.quantity - (p.inboundQty || 0),
      inboundQty: p.inboundQty || 0,
    })) || [];
  selectedSlots.value = [];
  allocationMaterials.value = []; // 清空分配数据
  initReceiveMaterials();
  inboundExecuteVisible.value = true;
};

// 监听接收数量变化
watch(
  receiveMaterials,
  () => {
    updateReceiveStats();
  },
  { deep: true }
);

// 搜索监听
watch(
  () => searchForm.keyword,
  () => {
    handleSearch();
  }
);

onMounted(() => {
  getTableData();
  getOrderListData();
});
</script>

<style scoped lang="scss">
.inbound-padding {
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
    }
    .num {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      .unit {
        font-size: 16px;
        margin-left: 4px;
      }
    }
    &.warning .num {
      color: #e6a23c;
    }
  }
}

.table-operate-btn {
  margin-bottom: 12px;
  text-align: right;
}

.table-demo {
  height: calc(100vh - 288px);
}

.operateBox .warning-btn {
  color: #e6a23c !important;
}

.detail-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  p {
    font-size: 16px;
    font-weight: bold;
  }
}

.form-box {
  padding: 10px 0;
}

:deep(.detail-table) {
  .table-demo {
    height: calc(100vh - 600px);
  }
}

.select-dialog {
  .search-bar {
    margin-bottom: 15px;
  }

  .pagination-container {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
}

.toggle {
  cursor: pointer;
  font-size: 16px;
  color: #409eff;

  &:hover {
    color: #79bbff;
  }
}

.inbound-execute-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.execute-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.material-receive-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;

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

  .inbound-info {
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
      gap: 4px;
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

  .receive-controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
    gap: 20px;

    .control-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .scan-btn {
        height: 36px;
        padding: 0 20px;

        .el-icon {
          margin-right: 6px;
        }
      }

      .scan-desc {
        font-size: 12px;
        color: #909399;
        line-height: 1.4;
      }
    }

    .control-right {
      .manual-input-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .manual-input {
          width: 200px;
        }

        .query-btn {
          height: 32px;
          white-space: nowrap;
        }
      }
    }
  }

  .receive-summary {
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;

    .summary-label {
      color: #606266;
      margin-right: 12px;
    }

    .summary-info {
      color: #409eff;
      font-weight: 500;
    }
  }

  .receive-table-container {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;

    :deep(.material-receive-table) {
      .el-table__header-wrapper {
        background: #f5f7fa;
      }

      .el-table__body {
        .el-input-number {
          width: 100px;
        }

        .el-input {
          .el-input__wrapper {
            padding: 1px 7px;
          }
        }
      }
    }

    .table-actions {
      display: flex;
      gap: 4px;
      justify-content: center;

      .el-button {
        padding: 5px 8px;
        height: auto;
      }
    }
  }
}

.material-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  :deep(.material-table) {
    border: 1px solid #ebeef5;

    .el-table__header-wrapper {
      background: #f5f7fa;
    }

    .el-input-number {
      width: 100px;
    }

    .el-select {
      width: 100%;
    }

    .error-text {
      color: #f56c6c;
      font-size: 12px;
      margin-top: 4px;
    }
  }

  .allocation-actions {
    margin-top: 16px;
    text-align: left;
  }
}

.cabinet-section {
  margin: 30px 0;
  .title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    h3 {
      margin: 0;
      font-size: 18px;
    }
    .legend {
      margin-left: auto;
      font-size: 13px;
      span {
        margin-left: 16px;
      }
      .dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;
        &.normal {
          background: #67c23a;
        }
        &.unbalance {
          background: #e6a23c;
        }
        &.overload {
          background: #f56c6c;
        }
      }
    }
  }
}
.cabinet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.floor {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.floor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.slots-row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 10px;
}
.slot-item {
  position: relative;
  height: 76px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  .slot-id {
    font-weight: bold;
    font-size: 14px;
  }
  .slot-weight {
    font-weight: bold;
    margin-top: 4px;
  }
  .overload-dot,
  .unbalance-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #f56c6c;
  }
  .unbalance-dot {
    background: #e6a23c;
  }
}
.slot-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.empty {
  background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
  border: 2px dashed #dcdfe6;
  color: #999;
}
.normal {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
}
.unbalance {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
}
.overload {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
}
.selected-slots {
  margin-top: 20px;
  .el-tag {
    margin-right: 12px;
    margin-bottom: 8px;
  }
}

@media (max-width: 1200px) {
  .receive-controls {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px !important;

    .control-right {
      width: 100%;

      .manual-input-group {
        width: 100%;

        .manual-input {
          flex: 1;
          width: auto !important;
        }
      }
    }
  }

  .cabinet-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
}
</style>

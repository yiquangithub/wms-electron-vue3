<template>
  <div class="table-container">
    <div class="table-box">
      <el-table
        ref="tableRef"
        id="printable-content"
        row-key="id"
        height="100%"
        v-loading="config.loading"
        :data="data"
        :border="setBorder"
        v-bind="$attrs"
        stripe
        style="width: 100%"
        :cell-style="{ textAlign: 'center' }"
        :header-cell-style="{ 'text-align': 'center' }"
        @selection-change="onSelectionChange"
        @select="selectCheckboxList"
        @select-all="selectCheckboxList"
        @row-click="clickChangeRow"
        @expand-change="handleExpandChange"
      >
        <!-- 多选操作 -->
        <el-table-column
          type="selection"
          :fixed="config.isFixed"
          :reserve-selection="true"
          width="50"
          v-if="config.isSelection"
          class="column-box"
        />
        <!-- 序号 -->
        <el-table-column
          type="index"
          label="序号"
          :fixed="config.isFixed"
          width="65"
          v-if="config.isSerialNo"
        />
        <!-- Expandable Column -->
        <el-table-column
          type="expand"
          width="50"
          :fixed="config.isFixed"
          v-if="config.isExpandable"
        >
          <template v-slot="scope">
            <slot name="expand" :row="scope.row"></slot>
          </template>
        </el-table-column>
        <!-- 表头 -->
        <el-table-column
          v-for="(item, index) in setHeader"
          :key="index"
          show-overflow-tooltip
          :prop="item.key"
          :fixed="isColumnFixed(item) && config.isFixed ? true : false"
          :width="item.colWidth"
          :label="item.title"
        >
          <!-- 自定义列的内容显示 -->
          <template v-slot="scope">
            <!-- 判断是图片 -->
            <template v-if="item.status === 'image'">
              <el-image
                :style="{
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                }"
                :src="scope.row[item.key]"
                :zoom-rate="1.2"
                :preview-src-list="[scope.row[item.key]]"
                preview-teleported
                fit="cover"
                @click.stop
              />
            </template>
            <template v-else-if="item.status === 'qrCodeImage'">
              <VueQrcode
                :value="scope.row[item.key]"
                :width="100"
                :color="{ dark: '#000', light: '#FFF' }"
                type="image/png"
              ></VueQrcode>
            </template>
            <!-- 判断状态 -->
            <template v-else-if="item.status === 'are'">
              <el-tag :type="scope.row[item.key] ? 'success' : 'danger'">
                {{ scope.row[item.key] ? "是" : "否" }}
              </el-tag>
            </template>
            <template v-else-if="item.status === 'task'">
              <el-tag :type="scope.row[item.key] ? 'success' : 'danger'">
                {{ scope.row[item.key] ? "是" : "否" }}
              </el-tag>
            </template>
            <template v-else-if="item.status === 'start'">
              <el-tag :type="scope.row[item.key] ? 'success' : 'danger'">
                {{ scope.row[item.key] ? "启用" : "未启用" }}
              </el-tag>
            </template>
            <template v-else-if="item.status === 'useStatus'">
              <el-tag :type="scope.row[item.key] ? 'success' : 'danger'">
                {{ scope.row[item.key] ? "启用" : "禁用" }}
              </el-tag>
            </template>
            <template v-else-if="item.status === 'materialType'">
              <el-tag :type="scope.row[item.key] == 1 ? 'success' : 'primary'">
                {{ scope.row[item.key] == 1 ? "产品" : "物料" }}
              </el-tag>
            </template>
            <template v-else-if="item.status === 'importantParts'">
              <el-tag :type="scope.row[item.key] ? 'success' : 'danger'">
                {{ scope.row[item.key] == 1 ? "是" : "否" }}
              </el-tag>
            </template>
            <template v-else-if="item.status === 'stateNum'">
              <el-tag v-if="scope.row[item.key] == 0">未接收</el-tag>
              <el-tag v-else-if="scope.row[item.key] == 1">接收中</el-tag>
              <el-tag v-else-if="scope.row[item.key] == 2">已接收</el-tag>
            </template>
            <template v-else-if="item.status === 'issueStateStatus'">
              <el-tag v-if="scope.row[item.key] == 1" type="danger"
                >挂起</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 2" type="success"
                >生产中</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 3" type="warning"
                >已完成</el-tag
              >
            </template>
            <template v-else-if="item.status === 'cameraStatus'">
              <el-tag v-if="scope.row[item.key] == 0" type="danger"
                >离线</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 1" type="success"
                >在线</el-tag
              >
            </template>
            <template v-else-if="item.status === 'deviceStatus'">
              <el-tag v-if="scope.row[item.key] == 1" type="success"
                >正常运行</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 2" type="danger"
                >故障停机</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 3" type="warning"
                >维修中</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 4" type="primary"
                >正常停机</el-tag
              >
            </template>
            <template v-else-if="item.status === 'startStocktakingStr'">
              <el-tag v-if="scope.row[item.key] == 1" type="success"
                >已盘点</el-tag
              >
              <el-tag v-else type="danger">未盘点</el-tag>
            </template>
            <template v-else-if="item.status === 'publishStatusStr'">
              <el-tag v-if="scope.row[item.key] == 1" type="success"
                >已发布</el-tag
              >
              <el-tag v-else type="danger">未发布</el-tag>
            </template>
            <template v-else-if="item.status === 'checkStateStr'">
              <el-tag
                v-if="scope.row[item.key] == 0 || scope.row[item.key] == -2"
                type="info"
                >待审核</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == -1" type="danger"
                >审核不通过</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 1" type="success"
                >审核通过</el-tag
              >
              <el-tag v-else-if="scope.row[item.key] == 2" type="warning"
                >审核中</el-tag
              >
            </template>

            <!-- 生成类型 -->
            <template v-else-if="item.status === 'typesStr'">
              <el-tag type="success" v-if="scope.row['types'] == 1">
                {{ scope.row[item.key] }}
              </el-tag>
              <el-tag type="danger" v-else-if="scope.row['types'] == 2">
                {{ scope.row[item.key] }}
              </el-tag>
            </template>
            <!-- 检验类型 -->
            <template v-else-if="item.status === 'checkType'">
              <el-tag type="success">
                {{ scope.row[item.key] }}
              </el-tag>
            </template>
            <!-- 供应商等级 -->
            <template v-else-if="item.status === 'gradeStrStatus'">
              <el-tag type="success">
                {{ scope.row[item.key] }}
              </el-tag>
            </template>

            <!-- 检测结果 -->
            <template v-else-if="item.status === 'checkState'">
              <el-tag type="primary" v-if="scope.row[item.key] == 0">
                {{ "待检验" }}
              </el-tag>
              <el-tag type="success" v-else-if="scope.row[item.key] == 1">
                {{ "合格" }}
              </el-tag>
              <el-tag type="danger" v-else-if="scope.row[item.key] == 2">
                {{ "不合格" }}
              </el-tag>
            </template>

            <!-- 链接按钮样式 -->
            <template v-else-if="item.status === 'linkButton'">
              <el-button
                type="primary"
                link
                @click="clickChangeCode(scope.row, item.key)"
                ref="buttonRef"
              >
                {{ scope.row[item.key] }}
              </el-button>
            </template>
            <template v-else-if="item.status === 'linkButtonDevice'">
              <el-button
                type="success"
                link
                @click="clickChangeCode(scope.row, item.key)"
              >
                <span v-if="scope.row[item.key]">
                  {{ scope.row[item.key] }}
                </span>
                <span v-else>
                  {{ "添加设备" }}
                </span>
              </el-button>
            </template>
            <!-- 百分比显示 -->
            <template v-else-if="item.status === 'testProgress'">
              {{ scope.row[item.key] }}%
            </template>

            <!-- 面包屑数据显示方式 -->
            <template
              v-else-if="item.key === 'department' && scope.row.department"
            >
              <el-breadcrumb separator="/">
                <el-breadcrumb-item
                  class="crumb-box"
                  v-for="crumb in flattenCrumbs(scope.row.department)"
                  :key="crumb.text"
                >
                  {{ crumb }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </template>
            <!-- 数组平级显示 -->
            <template v-else-if="item.status === 'handleUserNames'">
              {{ scope.row[item.key].join("、") }}
            </template>
            <!-- 确认人 -->
            <template v-else-if="item.status === 'confirmUsersStatus'">
              <div class="confirm-users-status">
                <el-tag
                  v-for="user in scope.row[item.key]"
                  :key="user.id"
                  type="success"
                  closable
                  style="margin-right: 10px"
                  @close="clickDeleteUser(scope.row, user.id)"
                >
                  {{ user.name }}
                </el-tag>
                <!-- <SvgIcon
                  name="el-Plus"
                  :size="19"
                  @click="clickChangeCode(scope.row, item.key)"
                /> -->
              </div>
            </template>

            <!-- 不满足以上直接展示 -->
            <template v-else>
              {{ scope.row[item.key] }}
            </template>
          </template>
        </el-table-column>
        <!-- 备注列顺序处理 -->
        <el-table-column
          prop="remarks"
          label="备注"
          v-if="config.isOtherInfo"
          width="200"
        />
        <!-- 操作栏 -->
        <el-table-column
          label="操作"
          v-if="config.isOperate"
          :fixed="config.isFixed ? 'right' : undefined"
          :width="config.operateWidth ? config.operateWidth : ''"
          class="no-print"
        >
          <template v-slot="scope">
            <slot name="operate" :row="scope.row"></slot>
          </template>
        </el-table-column>
        <!-- 数据为空时显示的组件 -->
        <template #empty>
          <el-empty
            :description="
              config.isCustomContent ? config.isCustomContent : '暂无数据'
            "
          />
        </template>
      </el-table>
    </div>
    <!-- 页脚 -->
    <div class="table-footer">
      <!-- 分页组件 -->
      <el-pagination
        v-if="!config.isPaging"
        v-model:current-page="state.page.pageNum"
        v-model:page-size="state.page.pageSize"
        :pager-count="5"
        :page-sizes="[10, 20, 30, config.total]"
        :total="config.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="onHandleSizeChange"
        @current-change="onHandleCurrentChange"
      >
      </el-pagination>
      <!-- 工具组件 -->
      <div class="table-footer-tool" v-if="!config.isTool">
        <!-- 打印 -->
        <svg-icon
          icon-class="print"
          title="打印"
          @click="onPrintTable"
          v-if="!config.isPrint"
        />
        <!-- 导入 -->
        <UploadExcel v-if="!config.isImport" />
        <!-- 导出 -->
        <span v-if="!config.isExport" title="导出">
          <svg-icon icon-class="export" @click="onImportTable" />
        </span>

        <!-- 设置表格结构弹框-->
        <el-popover
          placement="top-end"
          trigger="click"
          transition="el-zoom-in-top"
          popper-class="table-tool-popper"
          :width="300"
          :persistent="false"
          @show="onSetTable"
        >
          <template #reference>
            <svg-icon icon-class="setting" title="设置" />
          </template>
          <template #default>
            <div class="tool-box">
              <el-tooltip content="拖动进行排序" placement="top-start">
                <span class="ml11">
                  <svg-icon icon-class="drag" color="#909399" />
                </span>
              </el-tooltip>
              <el-checkbox
                v-model="state.checkListAll"
                :indeterminate="state.checkListIndeterminate"
                class="ml10 mr1"
                label="列显示"
                @change="onCheckAllChange"
              />
              <el-checkbox
                v-model="getConfig.isSerialNo"
                class="ml12 mr1"
                label="序号"
              />
              <el-checkbox
                v-model="getConfig.isSelection"
                class="ml12 mr1"
                label="多选"
              />
            </div>
            <!-- 拖动排序 -->
            <el-scrollbar>
              <div ref="toolSetRef" class="tool-sortable">
                <div
                  class="tool-sortable-item"
                  v-for="v in header"
                  :key="v.key"
                  :data-key="v.key"
                >
                  <span class="cursor-pointer handle">
                    <svg-icon icon-class="drag" color="#909399" />
                  </span>
                  <el-checkbox
                    v-model="v.isCheck"
                    size="default"
                    class="ml12 mr8"
                    :label="v.title"
                    @change="onCheckChange"
                  />
                </div>
              </div>
            </el-scrollbar>
          </template>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, nextTick, ref } from "vue";
import { ElMessage } from "element-plus";
import UploadExcel from "@/components/UploadExcel/index.vue";
import printJs from "print-js";
import table2excel from "js-table2excel";
import Sortable from "sortablejs";
import { storeToRefs } from "pinia";
import "@/assets/styles/tableTool.scss";
import VueQrcode from "vue-qrcode";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  header: {
    type: Array,
    default: () => [],
  },
  headerSon: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => {},
  },
  secondaryHeader: {
    type: String,
    default: () => "",
  },
  printName: {
    type: String,
    default: () => "",
  },
});

const emit = defineEmits([
  "pageChange",
  "sortHeader",
  "checkboxChange",
  "toDetailPages",
  "clickChangeCode",
  "clickDeleteUser",
  "expand-change",
]);

const toolSetRef = ref();
const state = reactive({
  page: {
    pageNum: 1,
    pageSize: 10,
  },
  selectlist: [],
  checkListAll: true,
  checkListIndeterminate: false,
});
const tableRef = ref();

const setBorder = computed(() => {
  return props.config.isBorder ? true : false;
});
const getConfig = computed(() => {
  return props.config;
});
const setHeader = computed(() => {
  return props.header.filter((v) => v.isCheck);
});

const onCheckAllChange = (val) => {
  if (val) props.header.forEach((v) => (v.isCheck = true));
  else props.header.forEach((v) => (v.isCheck = false));
  state.checkListIndeterminate = false;
};

const onCheckChange = () => {
  const headers = props.header.filter((v) => v.isCheck).length;
  state.checkListAll = headers === props.header.length;
  state.checkListIndeterminate = headers > 0 && headers < props.header.length;
};

const onSelectionChange = (val) => {
  state.selectlist = val;
};

const onHandleSizeChange = (val) => {
  state.page.pageSize = val;
  emit("pageChange", state.page);
};

const onHandleCurrentChange = (val) => {
  state.page.pageNum = val;
  emit("pageChange", state.page);
};

const pageReset = () => {
  state.page.pageNum = 1;
  state.page.pageSize = 10;
  emit("pageChange", state.page);
};

const properties = props.header
  .filter((v) => v.isCheck)
  .map((v) => ({
    field: v.key,
    displayName: v.title,
  }));
const onPrintTable = () => {
  if (props.data.length <= 0) return ElMessage.warning("暂无数据可打印");
  printJs({
    printable: props.data,
    properties: properties,
    type: "json",
    header: props.printName,
    headerStyle: "font-size: 24px; text-align: center;",
    style: `
		table {
			width: 100%;
			border-collapse: collapse;
		}
		th, td {
			text-align: center;
			padding: 8px;
			border: 2px solid #ddd;
		}
		th {
			background-color: #f2f2f2;
		}
		@page {size:landscape}
    `,
  });
};

const onImportTable = () => {
  const tableData = JSON.parse(JSON.stringify(props.data));
  const tableHeader = JSON.parse(JSON.stringify(props.header));

  if (tableData.length <= 0) {
    return ElMessage.warning("没有数据可以导出，请先添加数据！");
  }

  const fieldToProcess = {
    department: true,
    location: true,
    companyType: true,
    category: true,
  };

  function formatData(data) {
    return data.map((item) => {
      for (const field of tableHeader) {
        if (field.status === "timeFormat") {
          item[field.key] = new Date(item[field.key]).toLocaleString();
        } else if (fieldToProcess[field.key]) {
          if (field.key == "department") {
            const department = exportFlattenCrumbs(item[field.key]);
            item[field.key] = department.join("/");
          } else if (field.key == "location") {
            const location = exportFlattenCrumbs(item[field.key]);
            item[field.key] = location.join("/");
          } else if (field.key == "companyType") {
            item[field.key] = exportFlattenCrumbs(item[field.key]);
          } else if (field.key == "category") {
            const location = exportFlattenCrumbs(item[field.key]);
            item[field.key] = location.join("/");
          }
        }
      }
      return item;
    });
  }

  const formattedData = formatData(tableData);
  table2excel(
    props.header,
    formattedData,
    new Date().toLocaleString(),
    props.config.excelTitle
  );
};

const onSetTable = () => {
  nextTick(() => {
    const sortable = Sortable.create(toolSetRef.value, {
      handle: ".handle",
      dataIdAttr: "data-key",
      animation: 150,
      onEnd: () => {
        const headerList = [];
        sortable.toArray().forEach((val) => {
          props.header.forEach((v) => {
            if (v.key === val) headerList.push({ ...v });
          });
        });
        emit("sortHeader", headerList);
      },
    });
  });
};

const flattenCrumbs = (obj) => {
  const result = [];

  const extractText = (data) => {
    if (data && data.text) {
      result.push(data.text);
    }
    if (data && data.children) {
      if (Array.isArray(data.children)) {
        data.children.forEach((child) => extractText(child));
      } else {
        extractText(data.children);
      }
    }
  };
  extractText(obj);
  return result;
};

const exportFlattenCrumbs = (obj) => {
  const result = [];

  const extractText = (data) => {
    if (data && data.text) {
      result.push(data.text);
    }
    if (data && data.children) {
      if (Array.isArray(data.children)) {
        data.children.forEach((child) => extractText(child));
      } else {
        extractText(data.children);
      }
    }
  };
  extractText(obj);
  return result;
};

const selectCheckboxList = (row) => {
  const dataList = row;
  emit("checkboxChange", dataList);
};

const clearCheckboxState = () => {
  tableRef.value.clearSelection();
};

const isColumnFixed = (item) => {
  if (item.key == "orderCode" && item.status == "orderCode") {
    return true;
  } else if (item.key == "productName" && item.status == "productName") {
    return true;
  } else if (item.key == "machineNo" && item.status == "machineNo") {
    return true;
  } else if (item.key == "name" && item.status == "testName") {
    return true;
  } else if (item.key == "issueState" && item.status == "issueStateStatus") {
    return true;
  } else if (item.key == "code" && item.status == "code") {
    return true;
  } else if (item.key == "name" && item.status == "nameStatus") {
    return true;
  } else if (item.key == "taskCode" && item.status == "linkButton") {
    return true;
  } else if (item.key == "name" && item.status == "name") {
    return true;
  } else if (
    item.key == "startStocktaking" &&
    item.status == "startStocktakingStr"
  ) {
    return true;
  } else if (
    item.key == "inventoryTypeStr" &&
    item.status == "inventoryTypeStr"
  ) {
    return true;
  }
};

const clickChangeRow = (row) => {
  emit("toDetailPages", row);
};

const clickChangeCode = (row, key) => {
  emit("clickChangeCode", row, key);
};

const clickDeleteUser = (row, id) => {
  emit("clickDeleteUser", row, id);
};

const getSelectRowList = (mark) => {
  const dataList = tableRef.value.getSelectionRows();
  if (mark == "radio") {
    if (dataList.length > 1) {
      tableRef.value.clearSelection();
      tableRef.value.toggleRowSelection(dataList.pop());
      ElMessage.info("单选模式");
      return [];
    }
  }
  return dataList;
};

const handleExpandChange = (row, expandedRows) => {
  // 触发父组件事件，传递展开行数据
  emit("expand-change", row, expandedRows);
};

defineExpose({
  pageReset,
  clearCheckboxState,
  getSelectRowList,
});
</script>

<style scoped lang="scss">
.table-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 180px);

  :deep(.table-box) {
    flex: 1;
    overflow: auto;

    .crumb-box {
      float: none;
    }

    .is-green:before {
      content: " ";
      display: inline-block;
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      background-color: #23c343;
    }
    .is-grey:before {
      content: " ";
      display: inline-block;
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      background-color: #b7bbbf;
    }

    .is-blue:before {
      content: " ";
      display: inline-block;
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      background-color: red;
    }
  }

  .table-footer {
    margin-top: 15px;
    display: flex;

    .table-footer-tool {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      :deep(svg, span) {
        margin-right: 10px;
        cursor: pointer;
        color: var(--el-text-color-regular);
      }

      svg {
        margin-right: 8px;
        font-size: 20px;
      }

      .el-tooltip__trigger {
        margin-right: 0;
      }
    }
  }
}

:deep(.el-popper) {
  max-width: 60%;
  z-index: 12001 !important;
  &.is-dark {
    color: #fff;
    border: 1px solid var(--el-text-color-primary);
    background: var(--el-text-color-primary);
  }
}

.confirm-users-status {
  display: flex;
  align-items: center;

  :deep(.el-icon) {
    cursor: pointer;
  }
}

.table-tool-popper {
  padding: 0 !important;

  .tool-box {
    display: flex;
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-sizing: border-box;
    color: var(--el-text-color-primary);
    height: 40px;
    align-items: center;
    svg {
      margin-right: 8px;
      font-size: 20px;
    }
  }

  .tool-sortable {
    max-height: 303px;

    .tool-sortable-item {
      display: flex;
      box-sizing: border-box;
      color: var(--el-text-color-primary);
      align-items: center;
      padding: 0 12px;

      &:hover {
        background: var(--el-fill-color-lighter);
      }

      svg {
        margin-right: 8px;
        font-size: 20px;
      }
    }
  }
}
</style>

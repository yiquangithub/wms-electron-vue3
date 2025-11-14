<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    class="material-select-dialog add-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <div class="material-select-container">
      <!-- 左侧分类树 -->
      <div class="category-tree" v-if="showCategoryTree">
        <div class="tree-top-block">
          <span class="tree-top-title">{{ categoryTitle }}</span>
        </div>
        <div class="filter-input">
          <el-input
            placeholder="请输入产品/物料分类名称"
            v-model.trim="materialTreeFilter"
            clearable
            size="default"
            :suffix-icon="Search"
          />
        </div>
        <el-tree
          ref="materialTreeRef"
          :data="materialTreeData"
          :props="categoryProps"
          :highlight-current="true"
          :expand-on-click-node="false"
          :default-expand-all="true"
          node-key="id"
          @node-click="handleCategorySelect"
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
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧产品/物料列表 -->
      <div class="material-list" :class="{ 'full-width': !showCategoryTree }">
        <div class="search-bar">
          <el-input
            v-model="materialSearchKeyword"
            :placeholder="searchPlaceholder"
            :suffix-icon="Search"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <el-table
          ref="materialTableRef"
          :data="materialTableData"
          style="width: 100%"
          @selection-change="handleMaterialSelectionChange"
          class="material-table2"
          v-loading="loading"
          :height="tableHeight"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="checkSelectable"
          />
          <el-table-column
            prop="code"
            label="产品/物料编号"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="name"
            label="产品/物料名称"
            width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="specifications"
            label="规格型号"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="externalCode"
            label="内部编码"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="internalCode"
            label="外部编码"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="brand"
            label="品牌"
            width="120"
            show-overflow-tooltip
          />
          <el-table-column prop="importantParts" label="关重件" width="120">
            <template #default="scope">
              <el-tag
                :type="scope.row.importantParts == 1 ? 'success' : 'danger'"
              >
                {{ scope.row.importantParts == 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="unitName"
            label="计量单位"
            width="80"
            show-overflow-tooltip
          />
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <div class="selected-materials">
      <span>已选择 {{ selectedRows.length }} 个产品/物料</span>
      <span v-if="maxSelection > 0">(最多可选 {{ maxSelection }} 项)</span>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// import SvgIcon from '/@/components/SvgIcon/index.vue';
import { getMaterialTreeList, getMaterialList } from '@/api/sales/material'
import { onMounted } from 'vue'

interface MaterialItem {
  id: number | string
  code: string
  name: string
  specifications: string
  externalCode: string
  internalCode: string
  brand: string
  importantParts: number
  unitName: string
}

interface CategoryNode {
  id: number
  name: string
  children?: CategoryNode[]
}

const props = defineProps({
  title: {
    type: String,
    default: '选择产品/物料',
  },
  width: {
    type: String,
    default: '80%',
  },
  selectionMode: {
    type: String as () => 'single' | 'multiple',
    default: 'single',
    validator: (value: string) => ['single', 'multiple'].includes(value),
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  maxSelection: {
    type: Number,
    default: 0, // 0 表示不限制
  },
  showCategoryTree: {
    type: Boolean,
    default: true,
  },
  categoryTitle: {
    type: String,
    default: '产品/物料分类',
  },
  searchPlaceholder: {
    type: String,
    default: '请输入产品/物料名称/编号搜索',
  },
  tableHeight: {
    type: String,
    default: '450px',
  },
  defaultSelected: {
    type: Array as () => MaterialItem[],
    default: () => [],
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// 计算属性处理v-model
const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  },
})

// 数据相关
const materialTreeFilter = ref('')
const materialSearchKeyword = ref('')
const materialTreeData = ref<CategoryNode[]>([])
const materialTableData = ref<MaterialItem[]>([])
const selectedRows = ref<MaterialItem[]>([])
const loading = ref(false)
const treeLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const materialTreeRef = ref()
const materialTableRef = ref()
const currentCategoryId = ref(0)
const materialCurrentNode = ref<CategoryNode | null>(null)
const isInitialized = ref(false)

// 分类树配置
const categoryProps = {
  label: 'name',
  children: 'children',
} as const

// 检查是否可选
const checkSelectable = () => {
  return true
}

// 获取分类树数据
const getMaterialTreeData = async () => {
  if (treeLoading.value) {
    return
  }
  
  try {
    treeLoading.value = true
    const params = {
      id: 0,
      name: materialTreeFilter.value,
    }
    const res = await getMaterialTreeList(params)
    if (res.code === 200) {
      materialTreeData.value = res.data
      // 只有在没有选中节点时才自动选中第一个节点
      if (
        materialTreeData.value &&
        materialTreeData.value.length > 0 &&
        !currentCategoryId.value
      ) {
        const firstNode = materialTreeData.value[0]
        materialCurrentNode.value = firstNode
        currentCategoryId.value = firstNode.id
        // 设置树形控件选中状态
        materialTreeRef.value?.setCurrentKey(firstNode.id)
        // 获取表格数据
        await loadTableData()
      }
      isInitialized.value = true
    } else {
      ElMessage.error(res.message || '获取物料分类失败')
    }
  } catch (error) {
    console.error('获取物料分类失败:', error)
    ElMessage.error('获取物料分类失败')
  } finally {
    treeLoading.value = false
  }
}

// 加载表格数据
const loadTableData = async () => {
  if (!currentCategoryId.value) {
    ElMessage.warning('请先选择物料分类')
    return
  }

  if (loading.value) {
    return
  }

  try {
    loading.value = true
    const params = {
      first: 0,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      query: {
        categoryId: currentCategoryId.value,
        code: '',
        name: materialSearchKeyword.value,
        supplierId: 0,
        type: '',
      },
      queryid: 0,
      sort: '',
      sortField: '',
    }
    const res = await getMaterialList(params)
    materialTableData.value = res.data.rows
    total.value = res.data.records
  } catch (error) {
    console.error('获取物料列表失败:', error)
    // ElMessage.error('获取物料列表失败')
  } finally {
    loading.value = false
  }
}

// 分类选择
const handleCategorySelect = (data: CategoryNode) => {
  currentCategoryId.value = data.id
  materialCurrentNode.value = data
  currentPage.value = 1
  loadTableData()
}

// 表格选择改变
const handleMaterialSelectionChange = (rows: MaterialItem[]) => {
  if (props.selectionMode === 'single') {
    // 单选模式下，只保留最后选中的一项
    if (rows.length > 1) {
      const lastSelected = rows[rows.length - 1]
      materialTableRef.value.clearSelection()
      materialTableRef.value.toggleRowSelection(lastSelected, true)
      selectedRows.value = [lastSelected]
    } else {
      selectedRows.value = rows
    }
  } else {
    // 多选模式下，检查是否超过最大选择数量
    if (props.maxSelection > 0 && rows.length > props.maxSelection) {
      ElMessage.warning(`最多只能选择 ${props.maxSelection} 项`)
      // 移除最后选中的项
      const lastSelected = rows[rows.length - 1]
      materialTableRef.value.toggleRowSelection(lastSelected, false)
      selectedRows.value = rows.slice(0, props.maxSelection)
    } else {
      selectedRows.value = rows
    }
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadTableData()
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadTableData()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadTableData()
}

// 关闭弹框
const handleClose = () => {
  dialogVisible.value = false
  materialSearchKeyword.value = ''
  materialTreeFilter.value = ''
  selectedRows.value = []
  currentPage.value = 1
  if (materialTableRef.value) {
    materialTableRef.value.clearSelection()
  }
}

// 确认选择
const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择产品/物料')
    return
  }

  if (props.selectionMode === 'single' && selectedRows.value.length > 1) {
    ElMessage.warning('单选模式下只能选择一项')
    return
  }

  if (
    props.maxSelection > 0 &&
    selectedRows.value.length > props.maxSelection
  ) {
    ElMessage.warning(`最多只能选择 ${props.maxSelection} 项`)
    return
  }

  // 根据模式返回不同格式的数据
  const result =
    props.selectionMode === 'single'
      ? selectedRows.value[0]
      : selectedRows.value
  emit('confirm', result)
  handleClose()
}

// 监听弹框显示
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && isInitialized.value && currentCategoryId.value) {
      loadTableData()
      // 如果有默认选中项，设置选中状态
      if (props.defaultSelected && props.defaultSelected.length > 0) {
        nextTick(() => {
          // 在表格数据加载完成后设置选中状态
          materialTableData.value.forEach((row) => {
            const found = props.defaultSelected.find(
              (item) => item.id === row.id
            )
            if (found) {
              materialTableRef.value?.toggleRowSelection(row, true)
              selectedRows.value.push(row)
            }
          })
        })
      }
    }
  }
)

// 监听表格数据变化，重新设置选中状态
watch(
  () => materialTableData.value,
  () => {
    if (props.defaultSelected && props.defaultSelected.length > 0) {
      nextTick(() => {
        materialTableData.value.forEach((row) => {
          const found = props.defaultSelected.find((item) => item.id === row.id)
          if (found) {
            materialTableRef.value?.toggleRowSelection(row, true)
            if (!selectedRows.value.find((item) => item.id === row.id)) {
              selectedRows.value.push(row)
            }
          }
        })
      })
    }
  }
)

// 防抖函数
let searchTimer: NodeJS.Timeout | null = null
let treeFilterTimer: NodeJS.Timeout | null = null

// 监听搜索关键词变化
watch(materialSearchKeyword, () => {
  if (!isInitialized.value) return
  
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    if (currentCategoryId.value) {
      loadTableData()
    }
  }, 300)
})

// 监听分类过滤变化
watch(materialTreeFilter, () => {
  if (treeFilterTimer) {
    clearTimeout(treeFilterTimer)
  }
  treeFilterTimer = setTimeout(() => {
    getMaterialTreeData()
  }, 300)
})

// 初始化
onMounted(() => {
   // 弹框显示时才初始化数据
  if (props.modelValue) {
    getMaterialTreeData()
  }
})

 watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !isInitialized.value) {
      getMaterialTreeData()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.material-select-container {
  display: flex;
  gap: 20px;
  height: 600px;

  .category-tree {
    width: 250px;
    border-right: 1px solid var(--el-border-color-light);
    padding-right: 20px;

    .tree-top-block {
      margin-bottom: 16px;

      .tree-top-title {
        font-size: 16px;
        font-weight: bold;
      }
    }

    .filter-input {
      margin-bottom: 16px;
    }
  }

  .material-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    &.full-width {
      width: 100%;
    }

    .search-bar {
      margin-bottom: 16px;
    }

    .material-table2 {
      flex: 1;
    }
  }
}

.selected-materials {
  margin-top: 16px;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-secondary);
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>

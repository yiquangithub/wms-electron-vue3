<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    class="contact-select-dialog add-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <div class="contact-select-container">
      <!-- 左侧分类树 -->
      <div class="category-tree" v-if="showCategoryTree">
        <div class="tree-top-block">
          <span class="tree-top-title">{{ categoryTitle }}</span>
        </div>
        <div class="filter-input">
          <el-input
            placeholder="请输入供应商/公司名称"
            v-model.trim="ContactTreeFilter"
            clearable
            size="default"
            :suffix-icon="Search"
          />
        </div>
        <el-tree
          ref="ContactTreeRef"
          :data="ContactTreeData"
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

      <!-- 右侧供应商/公司列表 -->
      <div class="contact-list" :class="{ 'full-width': !showCategoryTree }">
        <div class="search-bar">
          <el-input
            v-model="ContactSearchKeyword"
            :placeholder="searchPlaceholder"
            :suffix-icon="Search"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <el-table
          ref="ContactTableRef"
          :data="ContactTableData"
          style="width: 100%"
          @selection-change="handleContactSelectionChange"
          class="contact-table2"
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
            label=" 编号"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="name"
            label="名称"
            width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="englishName"
            label="英文名称"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="address"
            label="地址"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="phone"
            label="电话"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="brand"
            label="email"
            width="120"
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
    <div class="selected-Contacts">
      <span>已选择 {{ selectedRows.length }} 个供应商/公司</span>
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

<script setup lang="ts" name="ContactSelectDialog">
import { ref, computed, watch, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// import SvgIcon from '/@/components/SvgIcon/index.vue';
import { getContactTreeList, getContactList } from '@/api/sales/contactUnits.js'
import { onMounted } from 'vue'

interface ContactItem {
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
    default: '选择供应商/公司',
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
    default: '供应商/公司',
  },
  searchPlaceholder: {
    type: String,
    default: '请输入供应商/公司名称/编号搜索',
  },
  tableHeight: {
    type: String,
    default: '450px',
  },
  defaultSelected: {
    type: Array as () => ContactItem[],
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
const ContactTreeFilter = ref('')
const ContactSearchKeyword = ref('')
const ContactTreeData = ref<CategoryNode[]>([])
const ContactTableData = ref<ContactItem[]>([])
const selectedRows = ref<ContactItem[]>([])
const loading = ref(false)
const treeLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const ContactTreeRef = ref()
const ContactTableRef = ref()
const currentCategoryId = ref(0)
const ContactCurrentNode = ref<CategoryNode | null>(null)
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
const getContactTreeData = async () => {
  if (treeLoading.value) {
    return
  }
  
  try {
    treeLoading.value = true
    const params = {
      id: 0,
      name: ContactTreeFilter.value,
    }
    const res = await getContactTreeList(params)
    if (res.code === 200) {
      ContactTreeData.value = res.data
      // 只有在没有选中节点时才自动选中第一个节点
      if (
        ContactTreeData.value &&
        ContactTreeData.value.length > 0 &&
        !currentCategoryId.value
      ) {
        const firstNode = ContactTreeData.value[0]
        ContactCurrentNode.value = firstNode
        currentCategoryId.value = firstNode.id
        // 设置树形控件选中状态
        ContactTreeRef.value?.setCurrentKey(firstNode.id)
        // 获取表格数据
        await loadTableData()
      }
      isInitialized.value = true
    } else {
      ElMessage.error(res.message || '获取公司失败')
    }
  } catch (error) {
    console.error('获取公司失败:', error)
    ElMessage.error('获取公司失败')
  } finally {
    treeLoading.value = false
  }
}

// 加载表格数据
const loadTableData = async () => {
  if (!currentCategoryId.value) {
    ElMessage.warning('请先选择公司')
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
        name: ContactSearchKeyword.value,
        supplierId: 0,
        type: '',
      },
      queryid: 0,
      sort: '',
      sortField: '',
    }
    const res = await getContactList(params)
    ContactTableData.value = res.data.rows
    total.value = res.data.records
  } catch (error) {
    console.error('获取公司列表失败:', error)
    // ElMessage.error('获取公司列表失败')
  } finally {
    loading.value = false
  }
}

// 分类选择
const handleCategorySelect = (data: CategoryNode) => {
  currentCategoryId.value = data.id
  ContactCurrentNode.value = data
  currentPage.value = 1
  loadTableData()
}

// 表格选择改变
const handleContactSelectionChange = (rows: ContactItem[]) => {
  if (props.selectionMode === 'single') {
    // 单选模式下，只保留最后选中的一项
    if (rows.length > 1) {
      const lastSelected = rows[rows.length - 1]
      ContactTableRef.value.clearSelection()
      ContactTableRef.value.toggleRowSelection(lastSelected, true)
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
      ContactTableRef.value.toggleRowSelection(lastSelected, false)
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
  ContactSearchKeyword.value = ''
  ContactTreeFilter.value = ''
  selectedRows.value = []
  currentPage.value = 1
  if (ContactTableRef.value) {
    ContactTableRef.value.clearSelection()
  }
}

// 确认选择
const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择供应商/公司')
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
          ContactTableData.value.forEach((row) => {
            const found = props.defaultSelected.find(
              (item) => item.id === row.id
            )
            if (found) {
              ContactTableRef.value?.toggleRowSelection(row, true)
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
  () => ContactTableData.value,
  () => {
    if (props.defaultSelected && props.defaultSelected.length > 0) {
      nextTick(() => {
        ContactTableData.value.forEach((row) => {
          const found = props.defaultSelected.find((item) => item.id === row.id)
          if (found) {
            ContactTableRef.value?.toggleRowSelection(row, true)
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
watch(ContactSearchKeyword, () => {
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
watch(ContactTreeFilter, () => {
  if (treeFilterTimer) {
    clearTimeout(treeFilterTimer)
  }
  treeFilterTimer = setTimeout(() => {
    getContactTreeData()
  }, 300)
})

// 初始化
onMounted(() => {
  // 在弹框显示时才初始化数据
  if (props.modelValue) {
    getContactTreeData()
  }
})

// 监听弹框显示状态，用于初始化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !isInitialized.value) {
      getContactTreeData()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.contact-select-container {
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

  .contact-list {
    flex: 1;
    display: flex;
    flex-direction: column;

    &.full-width {
      width: 100%;
    }

    .search-bar {
      margin-bottom: 16px;
    }

    .contact-table2 {
      flex: 1;
    }
  }
}

.selected-Contacts {
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

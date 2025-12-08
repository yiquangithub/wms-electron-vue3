<template>
  <div>
    <el-dialog
      v-model="userDialogVisible"
      title="选择负责人"
      width="900px"
      class="operator-dialog"
      :before-close="handleUserDialogClose"
      destroy-on-close
    >
      <div class="operator-container">
        <div class="department-tree">
          <div class="filter-input">
            <el-input
              v-model="departmentKeyword"
              placeholder="部门名称"
              clearable
              :prefix-icon="Search"
            />
          </div>
          <el-tree
            ref="departmentTreeRef"
            :data="departmentTreeData"
            :props="departmentProps"
            node-key="id"
            highlight-current
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="handleDepartmentClick"
          >
            <template #default="{ data }">
              <span class="custom-tree-node">
                <el-icon
                  style="
                    margin-right: 10px;
                    font-size: 18px;
                    color: darkgoldenrod;
                  "
                >
                  <Folder />
                </el-icon>
                <span>{{ data.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>

        <div class="user-list">
          <div class="search-box">
            <el-input
              v-model="userSearchKeyword"
              placeholder="用户姓名"
              clearable
              :prefix-icon="Search"
              @input="handleUserSearch"
            />
          </div>

          <el-table
            ref="userTableRef"
            v-loading="userTableLoading"
            :data="userList"
            style="width: 100%"
            @selection-change="handleUserSelectionChange"
            row-key="userId"
            class="operator-table"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="userName" label="用户名称" />
            <el-table-column prop="name" label="用户昵称" />
            <el-table-column prop="phonenumber" label="手机号" />
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="userPagination.pageNum"
              v-model:page-size="userPagination.pageSize"
              :total="userPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleUserDialogClose">取消</el-button>
          <el-button type="primary" @click="confirmUserSelection"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { ref, reactive, watch, nextTick } from "vue";
import { Search, Folder } from "@element-plus/icons-vue";
import { deptTreeSelect, listUser } from "@/api/system/user";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  defaultSelectedUsers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "select-user"]);

const userDialogVisible = ref(props.modelValue);
const departmentTreeData = ref([]);
const departmentKeyword = ref("");
const departmentProps = { label: "label", children: "children" };
const departmentTreeRef = ref(null);
const currentDepartmentId = ref(null);
const userTableRef = ref(null);
const userTableLoading = ref(false);
const userList = ref([]);
const userSearchKeyword = ref("");
const userPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
const selectedUsers = ref([]);

watch(
  () => props.modelValue,
  (val) => {
    userDialogVisible.value = val;
    if (val) {
      getDepartmentTree();
      getUserList();
    }
  }
);

watch([userSearchKeyword, currentDepartmentId], () => {
  userPagination.pageNum = 1;
  getUserList();
});

// 获取部门树数据
const getDepartmentTree = async () => {
  const res = await deptTreeSelect();
  departmentTreeData.value = res.data;
};

// 获取用户列表
const getUserList = async () => {
  userTableLoading.value = true;
  const params = {
    pageNum: userPagination.pageNum,
    pageSize: userPagination.pageSize,
    deptId: currentDepartmentId.value || undefined,
    userName: userSearchKeyword.value,
  };
  const res = await listUser(params);
  userList.value = res.rows;
  userPagination.total = res.total;
  userTableLoading.value = false;

  // 数据加载后预选默认用户
  await nextTick();
  setDefaultSelections();
};

watch(departmentKeyword, (val) => {
  departmentTreeRef.value.filter(val);
});

// 部门树过滤
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};

const handleDepartmentClick = (data) => {
  currentDepartmentId.value = data.id;
  userPagination.pageNum = 1;
  getUserList();
};

// 用户表格选择变化
const handleUserSelectionChange = (selection) => {
  selectedUsers.value = selection;

  // 如果是单选模式，强制只保留一个
  if (!props.multiple && selection.length > 1) {
    const lastSelected = selection[selection.length - 1];
    selectedUsers.value = [lastSelected];
    userTableRef.value.clearSelection();
    userTableRef.value.toggleRowSelection(lastSelected, true);
  }
};
// 设置默认选中
const setDefaultSelections = () => {
  if (!userTableRef.value) return;

  // 清空当前选中
  userTableRef.value.clearSelection();

  // 根据 defaultSelectedUsers 预选行
  props.defaultSelectedUsers.forEach((defaultUser) => {
    const row = userList.value.find((user) => user.userId === defaultUser.id);
    if (row) {
      userTableRef.value.toggleRowSelection(row, true);
    }
  });

  // 更新 selectedUsers 为默认值（如果没有用户交互）
  if (selectedUsers.value.length === 0) {
    selectedUsers.value = userList.value.filter((user) =>
      props.defaultSelectedUsers.some((du) => du.id === user.userId)
    );
  }
};

// 确认选择用户
const confirmUserSelection = () => {
  if (selectedUsers.value.length > 0) {
    const users = selectedUsers.value.map((user) => ({
      id: user.userId,
      name: user.name,
    }));
    emit("select-user", props.multiple ? users : users[0]);
    handleUserDialogClose();
  } else {
    ElMessage.warning("请至少选择一个用户");
  }
};

// 关闭弹窗
const handleUserDialogClose = () => {
  selectedUsers.value = [];
  if (userTableRef.value) {
    userTableRef.value.clearSelection();
  }
  emit("update:modelValue", false);
};

// 分页大小变化
const handleSizeChange = (val) => {
  userPagination.pageSize = val;
  getUserList();
};

// 分页页码变化
const handleCurrentChange = (val) => {
  userPagination.pageNum = val;
  getUserList();
};

// 用户搜索
const handleUserSearch = () => {
  getUserList();
};
</script>

<style scoped lang="scss">
.operator-dialog {
  :deep(.el-dialog__header) {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.operator-container {
  display: flex;
  height: 500px;

  .department-tree {
    width: 250px;
    border-right: 1px solid #dcdfe6;
    padding-right: 15px;
    overflow: auto;

    .filter-input {
      margin-bottom: 15px;
    }

    :deep(.el-tree-node__content) {
      height: 32px;
    }

    .custom-tree-node {
      display: flex;
      align-items: center;
      font-size: 14px;

      .tree-item-svg {
        margin-right: 5px;
        font-size: 16px;
      }
    }
  }

  .user-list {
    flex: 1;
    padding-left: 15px;
    display: flex;
    flex-direction: column;

    .search-box {
      margin-bottom: 15px;
    }

    .operator-table {
      flex: 1;
      overflow: auto;
    }

    .pagination-container {
      margin-top: 15px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

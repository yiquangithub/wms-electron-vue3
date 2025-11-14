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
            @current-change="handleUserCurrentChange"
            highlight-current-row
            class="operator-table"
          >
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
import { ref, reactive, watch } from "vue";
import { Search, Folder } from "@element-plus/icons-vue";
import { deptTreeSelect, listUser } from "@/api/system/user";
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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
const tempSelectedUser = ref(null);
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
};
watch(departmentKeyword, (val) => {
  departmentTreeRef.value.filter(val);
});
// 部门树
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};

const handleDepartmentClick = (data) => {
  currentDepartmentId.value = data.id;
  userPagination.pageNum = 1;
  getUserList();
};

// 用户表格行选择
const handleUserCurrentChange = (row) => {
  tempSelectedUser.value = row;
};

// 确认选择用户
const confirmUserSelection = () => {
  if (tempSelectedUser.value) {
    emit("select-user", {
      id: tempSelectedUser.value.userId,
      name: tempSelectedUser.value.name,
    });
    handleUserDialogClose();
  } else {
    ElMessage.warning("请选择一个用户");
  }
};

// 关闭弹窗
const handleUserDialogClose = () => {
  tempSelectedUser.value = null;
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

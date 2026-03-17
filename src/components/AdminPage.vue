<template>
  <div class="admin-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="220px" class="admin-aside">
        <div class="admin-logo">
          <span>⚙️ 超级管理后台</span>
        </div>
        <el-menu
          default-active="user"
          class="admin-menu"
        >
          <el-menu-item index="user">
            <el-icon><user /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="admin-header">
          <div class="header-left">
            <span class="page-title">用户管理</span>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :icon="UserFilled" />
                <span class="username">超级管理员</span>
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToHome">返回首页</el-dropdown-item>
                  <el-dropdown-item divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="admin-main">
          <el-card class="filter-card">
            <el-form :inline="true" :model="userFilterForm">
              <el-form-item label="角色">
                <el-select v-model="userFilterForm.role" placeholder="全部角色" clearable style="width: 120px">
                  <el-option label="普通用户" value="user" />
                  <el-option label="审核员" value="reviewer" />
                  <el-option label="管理员" value="admin" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="userFilterForm.status" placeholder="全部状态" clearable style="width: 120px">
                  <el-option label="正常" value="active" />
                  <el-option label="禁用" value="disabled" />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="userFilterForm.keyword" placeholder="用户名/邮箱" clearable style="width: 200px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUserSearch">查询</el-button>
                <el-button @click="resetUserFilter">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card class="table-card">
            <el-table :data="userList" style="width: 100%" v-loading="userLoading">
              <el-table-column type="index" width="50" />
              <el-table-column prop="username" label="用户名" min-width="120" />
              <el-table-column prop="email" label="邮箱" min-width="180" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="{ row }">
                  <el-tag :type="getRoleType(row.role)">
                    {{ getRoleText(row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="uploadCount" label="上传数" width="90" align="center" />
              <el-table-column prop="registerTime" label="注册时间" width="160" />
              <el-table-column prop="status" label="状态" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                    {{ row.status === 'active' ? '正常' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="handleEditUser(row)">编辑</el-button>
                  <el-button 
                    :type="row.status === 'active' ? 'danger' : 'success'" 
                    size="small" 
                    @click="handleToggleUserStatus(row)"
                  >
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="userPage"
                v-model:page-size="userPageSize"
                :page-sizes="[10, 20, 50]"
                :total="userTotal"
                layout="total, sizes, prev, pager, next"
                @size-change="handleUserSizeChange"
                @current-change="handleUserPageChange"
              />
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="userEditDialogVisible" title="编辑用户" width="500px">
      <el-form :model="editUserForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editUserForm.email" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editUserForm.role" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="审核员" value="reviewer" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, UserFilled, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();

// 用户管理相关
const userLoading = ref(false);
const userPage = ref(1);
const userPageSize = ref(10);
const userTotal = ref(100);
const userEditDialogVisible = ref(false);

const userFilterForm = reactive({
  role: '',
  status: '',
  keyword: ''
});

const userList = ref([
  { id: 1, username: '张三', email: 'zhangsan@example.com', role: 'user', uploadCount: 5, registerTime: '2024-01-15 10:00', status: 'active' },
  { id: 2, username: '李四', email: 'lisi@example.com', role: 'reviewer', uploadCount: 12, registerTime: '2024-01-10 14:30', status: 'active' },
  { id: 3, username: '王五', email: 'wangwu@example.com', role: 'admin', uploadCount: 8, registerTime: '2024-01-05 09:00', status: 'active' },
  { id: 4, username: '赵六', email: 'zhaoliu@example.com', role: 'user', uploadCount: 0, registerTime: '2024-03-01 16:00', status: 'disabled' },
  { id: 5, username: '钱七', email: 'qianqi@example.com', role: 'user', uploadCount: 3, registerTime: '2024-02-20 11:30', status: 'active' },
]);

const editUserForm = reactive({
  id: null,
  username: '',
  email: '',
  role: ''
});

const getRoleType = (role) => {
  const map = {
    user: '',
    reviewer: 'warning',
    admin: 'danger'
  };
  return map[role] || '';
};

const getRoleText = (role) => {
  const map = {
    user: '普通用户',
    reviewer: '审核员',
    admin: '管理员'
  };
  return map[role] || role;
};

const handleUserSearch = () => {
  ElMessage.success('查询成功');
  userPage.value = 1;
};

const resetUserFilter = () => {
  userFilterForm.role = '';
  userFilterForm.status = '';
  userFilterForm.keyword = '';
};

const handleEditUser = (row) => {
  editUserForm.id = row.id;
  editUserForm.username = row.username;
  editUserForm.email = row.email;
  editUserForm.role = row.role;
  userEditDialogVisible.value = true;
};

const handleSaveUser = () => {
  const user = userList.value.find(u => u.id === editUserForm.id);
  if (user) {
    user.role = editUserForm.role;
    ElMessage.success('保存成功');
  }
  userEditDialogVisible.value = false;
};

const handleToggleUserStatus = (row) => {
  const action = row.status === 'active' ? '禁用' : '启用';
  ElMessageBox.confirm(`确定${action}用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'active' ? 'disabled' : 'active';
    ElMessage.success(`${action}成功`);
  });
};

const handleUserSizeChange = (val) => {
  userPageSize.value = val;
};

const handleUserPageChange = (val) => {
  userPage.value = val;
};

const goToHome = () => {
  router.push('/main');
};

onMounted(() => {
  // 模拟加载数据
});
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.admin-aside {
  background-color: #304156;
  min-height: 100vh;
}

.admin-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #1f2d3d;
}

.admin-menu {
  border-right: none;
  background-color: #304156;
}

:deep(.admin-menu .el-menu-item) {
  color: #bfcbd9;
}

:deep(.admin-menu .el-menu-item:hover) {
  background-color: #263445;
}

:deep(.admin-menu .el-menu-item.is-active) {
  color: #409eff;
  background-color: #263445;
}

.admin-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.admin-main {
  padding: 20px;
}

.filter-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

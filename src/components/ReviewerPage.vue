<template>
  <div class="reviewer-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="220px" class="reviewer-aside">
        <div class="reviewer-logo">
          <span>审核中心</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="reviewer-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="all">
            <el-icon><document /></el-icon>
            <span>全部 PDF</span>
          </el-menu-item>
          <el-menu-item index="pending">
            <el-icon><document-checked /></el-icon>
            <span>待审核 PDF</span>
            <el-tag v-if="pendingCount > 0" type="danger" size="small" class="menu-badge">{{ pendingCount }}</el-tag>
          </el-menu-item>
          <el-menu-item index="approved">
            <el-icon><circle-check /></el-icon>
            <span>已通过</span>
          </el-menu-item>
          <el-menu-item index="rejected">
            <el-icon><circle-close /></el-icon>
            <span>已拒绝</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="reviewer-header">
          <div class="header-left">
            <span class="page-title">{{ getPageTitle() }}</span>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :icon="UserFilled" />
                <span class="username">审核员</span>
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

        <el-main class="reviewer-main">
          <el-card class="filter-card">
            <el-form :inline="true" :model="filterForm">
              <el-form-item label="课程">
                <el-select v-model="filterForm.course" placeholder="全部课程" clearable style="width: 140px">
                  <el-option label="高等数学" value="math" />
                  <el-option label="线性代数" value="algebra" />
                  <el-option label="大学物理" value="physics" />
                  <el-option label="计算机基础" value="cs" />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="filterForm.keyword" placeholder="标题/作者" clearable style="width: 200px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetFilter">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card class="table-card">
            <el-table :data="filteredPdfList" style="width: 100%" v-loading="loading">
              <el-table-column type="index" width="50" />
              <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="course" label="关联课程" width="120" />
              <el-table-column prop="author" label="上传者" width="120" />
              <el-table-column prop="uploadTime" label="上传时间" width="160" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="{ row }">
                  <el-button 
                    v-if="row.status === 'pending'" 
                    type="success" 
                    size="small" 
                    @click="handleApprove(row)"
                  >
                    通过
                  </el-button>
                  <el-button 
                    v-if="row.status === 'pending'" 
                    type="danger" 
                    size="small" 
                    @click="handleReject(row)"
                  >
                    拒绝
                  </el-button>
                  <el-button 
                    v-if="row.status === 'approved'" 
                    type="warning" 
                    size="small" 
                    @click="handleRemove(row)"
                  >
                    下架
                  </el-button>
                  <el-button 
                    v-if="row.status === 'removed'" 
                    type="primary" 
                    size="small" 
                    @click="handleRestore(row)"
                  >
                    恢复
                  </el-button>
                  <el-button type="info" size="small" @click="handleViewDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="total"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>

    <!-- PDF 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="PDF 详情" width="600px">
      <el-descriptions :column="1" border v-if="currentPdf">
        <el-descriptions-item label="标题">{{ currentPdf.title }}</el-descriptions-item>
        <el-descriptions-item label="关联课程">{{ currentPdf.course }}</el-descriptions-item>
        <el-descriptions-item label="上传者">{{ currentPdf.author }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentPdf.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPdf.status)">
            {{ getStatusText(currentPdf.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentPdf.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, DocumentChecked, CircleCheck, CircleClose, UserFilled, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const activeMenu = ref('all');
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(100);
const detailDialogVisible = ref(false);
const currentPdf = ref(null);

const filterForm = reactive({
  course: '',
  keyword: ''
});

const pdfList = ref([
  { id: 1, title: '高等数学期末复习资料', course: '高等数学', author: '张三', uploadTime: '2024-03-10 10:30', status: 'pending', description: '包含历年真题和重点知识点总结' },
  { id: 2, title: '线性代数习题集', course: '线性代数', author: '李四', uploadTime: '2024-03-09 15:20', status: 'approved', description: '第三章习题详细解答' },
  { id: 3, title: '大学物理实验报告模板', course: '大学物理', author: '王五', uploadTime: '2024-03-08 09:00', status: 'removed', description: '物理实验报告格式模板' },
  { id: 4, title: '计算机基础课件', course: '计算机基础', author: '赵六', uploadTime: '2024-03-07 14:30', status: 'pending', description: '第一章至第三章PPT' },
  { id: 5, title: '英语四级词汇表', course: '英语', author: '钱七', uploadTime: '2024-03-06 11:00', status: 'rejected', description: '高频词汇整理' },
  { id: 6, title: '数据结构笔记', course: '计算机基础', author: '孙八', uploadTime: '2024-03-05 16:00', status: 'pending', description: '树和图的相关知识' },
]);

const pendingCount = computed(() => pdfList.value.filter(pdf => pdf.status === 'pending').length);

const filteredPdfList = computed(() => {
  let result = pdfList.value;
  
  // 根据菜单筛选状态
  if (activeMenu.value === 'pending') {
    result = result.filter(pdf => pdf.status === 'pending');
  } else if (activeMenu.value === 'approved') {
    result = result.filter(pdf => pdf.status === 'approved');
  } else if (activeMenu.value === 'rejected') {
    result = result.filter(pdf => pdf.status === 'rejected');
  }
  // 'all' 显示全部
  
  // 根据课程筛选
  if (filterForm.course) {
    result = result.filter(pdf => pdf.course.includes(filterForm.course));
  }
  
  // 根据关键词筛选
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase();
    result = result.filter(pdf => 
      pdf.title.toLowerCase().includes(keyword) || 
      pdf.author.toLowerCase().includes(keyword)
    );
  }
  
  return result;
});

const getPageTitle = () => {
  const titles = {
    pending: '待审核 PDF',
    all: '全部 PDF',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return titles[activeMenu.value] || 'PDF 管理';
};

const handleMenuSelect = (index) => {
  activeMenu.value = index;
};

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    removed: 'info',
    rejected: 'danger'
  };
  return map[status] || 'info';
};

const getStatusText = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    removed: '已下架',
    rejected: '已拒绝'
  };
  return map[status] || status;
};

const handleSearch = () => {
  ElMessage.success('查询成功');
  page.value = 1;
};

const resetFilter = () => {
  filterForm.course = '';
  filterForm.keyword = '';
};

const handleApprove = (row) => {
  ElMessageBox.confirm(`确定通过 "${row.title}" 的审核吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    row.status = 'approved';
    ElMessage.success('审核通过');
  });
};

const handleReject = (row) => {
  ElMessageBox.confirm(`确定拒绝 "${row.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'rejected';
    ElMessage.success('已拒绝');
  });
};

const handleRemove = (row) => {
  ElMessageBox.confirm(`确定下架 "${row.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'removed';
    ElMessage.success('已下架');
  });
};

const handleRestore = (row) => {
  row.status = 'approved';
  ElMessage.success('已恢复');
};

const handleViewDetail = (row) => {
  currentPdf.value = row;
  detailDialogVisible.value = true;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handlePageChange = (val) => {
  page.value = val;
};

const goToHome = () => {
  router.push('/main');
};

onMounted(() => {
  // 模拟加载数据
});
</script>

<style scoped>
.reviewer-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.reviewer-aside {
  background: linear-gradient(180deg, #ff9a56 0%, #ff6b6b 100%);
  min-height: 100vh;
}

.reviewer-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.reviewer-menu {
  border-right: none;
  background: transparent;
}

:deep(.reviewer-menu .el-menu-item) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.reviewer-menu .el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.15);
}

:deep(.reviewer-menu .el-menu-item.is-active) {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.25);
}

.menu-badge {
  margin-left: 8px;
}

.reviewer-header {
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

.reviewer-main {
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

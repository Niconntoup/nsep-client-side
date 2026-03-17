<template>
  <div class="publish-pdf-container">
    <div class="publish-content">
      <el-card class="publish-card">
        <template #header>
          <div class="card-header">
            <span>📤 发布的资料</span>
          </div>
        </template>

        <el-form :model="form" label-position="top" class="publish-form">
          <el-form-item label="类型">
            <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
              <el-option label="PDF" value="pdf" />
              <el-option label="批注" value="annotation" />
            </el-select>
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>

          <el-form-item label="关联课程">
            <el-select v-model="form.course" placeholder="请选择关联课程" style="width: 100%">
              <el-option label="高等数学" value="math" />
              <el-option label="线性代数" value="algebra" />
              <el-option label="大学物理" value="physics" />
              <el-option label="计算机基础" value="cs" />
              <el-option label="英语" value="english" />
            </el-select>
          </el-form-item>

          <el-form-item label="标签">
            <el-select-v2 v-model="form.tags" :options="tagOptions" placeholder="请选择标签" multiple clearable
              style="width: 100%" />
          </el-form-item>

          <el-form-item label="PDF 文件">
            <el-upload class="pdf-uploader" drag action="#" :auto-upload="false" :on-change="handleFileChange"
              accept=".pdf">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  请上传 PDF 格式文件，文件大小不超过 50MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item label="资料描述">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请描述这份资料的内容、用途等信息" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
              提交审核
            </el-button>
            <el-button size="large" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 审核状态提示 -->
      <el-dialog v-model="auditDialogVisible" title="提交成功" width="400px" center>
        <div class="audit-status-content">
          <el-result icon="success" title="提交成功" sub-title="您的 PDF 资料已提交审核，审核通过后将自动发布">
            <template #extra>
              <el-button type="primary" @click="auditDialogVisible = false">确定</el-button>
              <el-button @click="goToMyPdfs">查看我的发布</el-button>
            </template>
          </el-result>
        </div>
      </el-dialog>
    </div>

    <!-- <MainFooter /> -->
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import MainHeader from './MainHeader.vue';

const router = useRouter();
const submitting = ref(false);
const auditDialogVisible = ref(false);

const form = reactive({
  type: '',
  title: '',
  course: '',
  tags: [],
  description: '',
  file: null
});

const tagOptions = [
  { value: 'exam', label: '考试资料' },
  { value: 'homework', label: '作业习题' },
  { value: 'notes', label: '课堂笔记' },
  { value: 'ppt', label: '课件PPT' },
  { value: 'reference', label: '参考文献' },
  { value: 'past_paper', label: '历年真题' },
];

const handleFileChange = (file) => {
  form.file = file.raw;
  ElMessage.success(`已选择文件: ${file.name}`);
};

const handleSubmit = async () => {
  if (!form.title) {
    ElMessage.warning('请输入PDF标题');
    return;
  }
  if (!form.course) {
    ElMessage.warning('请选择关联课程');
    return;
  }
  if (!form.file) {
    ElMessage.warning('请上传PDF文件');
    return;
  }

  submitting.value = true;

  // 模拟提交
  setTimeout(() => {
    submitting.value = false;
    auditDialogVisible.value = true;
  }, 1500);
};

const handleReset = () => {
  form.title = '';
  form.course = '';
  form.tags = [];
  form.description = '';
  form.file = null;
};

const goToMyPdfs = () => {
  auditDialogVisible.value = false;
  // 可以跳转到我的发布页面
  ElMessage.info('功能开发中...');
};
</script>

<style scoped>
.publish-pdf-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* background-color: #f5f7fa; */
}

.publish-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0px auto;
  padding: 0 20px;
}

.publish-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.publish-form {
  padding: 20px 0;
}

.pdf-uploader {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

.audit-status-content {
  padding: 20px;
}
</style>

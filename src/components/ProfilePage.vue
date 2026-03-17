<template>
  <div class="page-content-wrapper">
    <div class="center-column">
      <el-card class="paper-card content-list-container">
        <template #header>
          <div class="card-header">
            <span>发布的PDF和批注</span>
          </div>
        </template>
        <div class="main-content">
          <el-table :data="tableData" stripe @cell-click="handelTableCellClick" style="width: 100%">
            <el-table-column prop="file_name" label="Type" sortable />
            <el-table-column prop="course_name" label="Status" sortable>
              <template #default="scope">
                <el-popover effect="light" trigger="hover" placement="top" width="auto">
                  <template #default>
                    <div>{{ scope.row.state == 'approved' ? '已审核' : '未审核或不通过' }}</div>
                  </template>
                  <template #reference>
                    <el-tag :type="scope.row.state == 'approved' ? 'success' : 'info'">{{
                      scope.row.state }}</el-tag>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="upload_time" label="Upload Time" sortable />
            <el-table-column prop="likes" label="Likes" sortable />
            <el-table-column label="Operation">
              <template #default="scope">
                <el-button type="primary" plain @click="handleEdit(scope.$index, scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" plain @click="handleDelete(scope.$index, scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

      </el-card>
    </div>
  </div>


</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import http from '@/utils/http';

const store = useStore();
const router = useRouter();

const tableData = ref([
  {
    file_name: 'Sample PDF 1',
    course_name: 'Course A',
    upload_time: '2024-01-15',
    likes: 10,
    state: 'approved'
  },
  {
    file_name: 'Sample PDF 2',
    course_name: 'Course B',
    upload_time: '2024-02-20',
    likes: 5,
    state: 'pending'
  },
  {
    file_name: 'Sample PDF 3',
    course_name: 'Course C',
    upload_time: '2024-03-10',
    likes: 8,
    state: 'approved'
  }
]);


const handleEdit = (index, row) => {
  console.log('Edit clicked for:', row);
  // Implement edit functionality here

  router.push("/profile/edit");
};
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.content-list-container {
  max-width: 1500px;
  width: 100%;
  /* Set a max width for better readability */
  margin: 0 auto;
  /* Center the container within the right column */
}

.paper-card {
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.page-content-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* Align items to the top */
  gap: 20px;
  /* The space between the two columns */
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  --top-spacing: 20px;
  /* Define a variable for top spacing */
}

.center-column {
  width: 1500px;
  flex-shrink: 0;
  /* Prevent the left column from shrinking */
  position: sticky;
  /* Header height (60px) + desired top spacing */
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* Space between the two cards in the left column */
}
</style>

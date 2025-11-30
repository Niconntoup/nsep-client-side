<template>
    <div class="main-page-container">
        <div class="page-content-wrapper">
            <!-- Left Column (Sticky) -->
            <div class="left-column">
                <el-card class="paper-card hot-list-card">
                    <template #header>
                        <div class="card-header">
                            <span>😼 爆炸词云</span>
                        </div>
                    </template>

                    <div class="tag-container">
                        <el-tag v-for="tag in pdfWordCloud" :key="tag" type="primary">{{ tag }}</el-tag>
                    </div>
                </el-card>

                <el-card class="paper-card hot-list-card">
                    <template #header>
                        <div class="card-header">
                            <span>🔥 上传贡献</span>
                        </div>
                    </template>
                    <ul>
                        <li v-for="author in hotAuthors" :key="author.id" class="hot-list-item">
                            <span class="rank-badge">{{ author.rank }}</span>
                            <span class="item-name">{{ author.name }}</span>
                        </li>
                    </ul>
                </el-card>

                <el-card class="paper-card hot-list-card">
                    <template #header>
                        <div class="card-header">
                            <span>🎓 课程关联最多</span>
                        </div>
                    </template>
                    <ul>
                        <li v-for="course in hotCourses" :key="course.id" class="hot-list-item">
                            <span class="rank-badge">{{ course.rank }}</span>
                            <span class="item-name">{{ course.title }}</span>
                        </li>
                    </ul>
                </el-card>
            </div>

            <!-- Right Column (Scrollable) -->
            <div class="right-column">
                <el-card class="paper-card content-list-container">
                    <template #header>
                        <div class="card-header">
                            <span>所收藏的PDFs</span>
                        </div>
                    </template>
                    <div class="main-content">
                        <el-table :data="tableData" stripe @cell-click="handelTableCellClick" style="width: 100%">
                            <el-table-column prop="file_name" label="PDF" sortable />
                            <el-table-column prop="course_name" label="Course" sortable />
                            <el-table-column prop="upload_time" label="Upload Time" sortable />
                            <el-table-column prop="likes" label="Likes" sortable />
                            <el-table-column prop="state" label="State" sortable>
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
                            <el-table-column label="Operation">
                                <template #default="scope">
                                    <el-button size="small" type="danger" :disabled="isTableError"
                                        @click="handleDelete(scope.$index, scope.row)">
                                        取消收藏
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

export default {
    name: 'MainPage',
    components: {
        Search
    },
    data() {
        return {
            isTableError: false,
            tableData: [
                {
                    pdf_id: "1",
                    uploader_id: "12323",
                    file_name: "TEST",
                    description: "描述 1",
                    course_name: "jed101",
                    file_size: 0,
                    likes: 0,
                    upload_time: "2024-06-01 12:00:00",
                    file_path: "./sda",
                    state: "approved"
                },
            ],
            errorTableData: [
                {
                    pdf_id: "__ERROR__",
                    uploader_id: "12323",
                    file_name: "ERROR",
                    description: "描述 1",
                    course_name: "jed101",
                    file_size: 0,
                    likes: 0,
                    upload_time: "2024-06-01 12:00:00",
                    file_path: "./sda",
                    state: "approved"
                },
            ],
            searchQuery: '',
            likes_pdf: [],
            hotAuthors: [
                { id: 1, rank: 1, name: '作家A' },
                { id: 2, rank: 2, name: '作家B' },
                { id: 3, rank: 3, name: '作家C' },
                { id: 4, rank: 4, name: '作家D' },
                { id: 5, rank: 5, name: '作家E' },
            ],
            hotCourses: [
                { id: 1, rank: 1, title: 'Vue 3 入门到精通' },
                { id: 2, rank: 2, title: '现代 CSS 布局' },
                { id: 3, rank: 3, title: 'JavaScript 设计模式' },
                { id: 4, rank: 4, title: 'Node.js 全栈开发' },
                { id: 5, rank: 5, title: '数据结构与算法' },
            ]
        };
    },
    computed: {
        pdfWordCloud() {
            return this.$store.state.wordCloudPdfnames;
        }
    },
    created() {
        // 请求用户收藏的PDFs
        this.$http.post("/http/api/user/like-pdfs/", { "likes_pdf_id": this.$store.state.userInfo.likes_pdf_id })
            .then((response) => {
                let httpStatus = response.status;
                response = response.data;
                if (httpStatus == 200) {
                    this.likes_pdf = response.likes_pdf;
                    this.isTableError = false;
                } else {
                    ElNotification({
                        title: '错误',
                        message: response.message || '发生未知错误',
                        type: 'error',
                        duration: 2000,
                    })
                    this.isTableError = true;
                }
            })
            .catch((error) => {
                console.log(error);
                ElNotification({
                    title: '网络错误',
                    message: '获取收藏PDF失败',
                    type: 'error',
                    duration: 2000,
                })
                this.isTableError = true;
            });

        // 请求词云数据
        this.$http.get("/http/api/wordcloud-pdfnames/")
            .then((response) => {
                let httpStatus = response.status;
                response = response.data;
                if (httpStatus == 200) {
                    this.$store.commit('updateWordCloudPdfnames', response.pdf_top_words);
                } else {
                    ElNotification({
                        title: '错误',
                        message: response.message || '发生未知错误',
                        type: 'error',
                        duration: 2000,
                    })
                    this.$store.commit('updateWordCloudPdfnames', ["ERROR", "错误", "请求失败", "请重试", "网络问题", "服务器", "异常", "联系管理员", "检查日志", "调试"]);
                }
            })
            .catch((error) => {
                console.log(error);
                ElNotification({
                    title: '网络错误',
                    message: '词云请求失败',
                    type: 'error',
                    duration: 2000,
                })
                this.$store.commit('updateWordCloudPdfnames', ["ERROR", "错误", "请求失败", "请重试", "网络问题", "服务器", "异常", "联系管理员", "检查日志", "调试"]);
            })
    },
    methods: {
        handelTableCellClick(row, column, cell, event) {
            if (column.property === 'file_name') {
                const pdfId = row.pdf_id;
                // TODO:  设计请求跳转到 PDF 详情页
                this.$router.push({ name: 'PdfViewPage', query: { pdfId: row.pdf_id } });
            }
        },
        handleDelete(index, row) {
            this.tableData.splice(index, 1);
            // 请求数据库删除用户收藏
            this.$http.post("/http/api/user/delete/like-pdf/", { "delete_like_pdf_id": row.pdf_id })
                .then((response) => {

                    let httpStatus = response.status;
                    response = response.data;

                    if (httpStatus == 200) {
                        this.tableData.splice(index, 1); // 从表格数据中移除该行
                    } else {
                        ElNotification({
                            title: '错误',
                            message: response.message || '发生未知错误',
                            type: 'error',
                            duration: 2000,
                        })

                        this.tableData = this.errorTableData;
                    }
                })
                .catch((error) => {
                    console.log(error);
                    ElNotification({
                        title: '网络错误',
                        message: '词云请求失败',
                        type: 'error',
                        duration: 2000,
                    })
                    this.tableData = this.errorTableData;
                })
        },
        performSearch() {
            if (!this.searchQuery.trim()) {
                console.log('Search query is empty');
                return;
            }
            console.log('Searching for:', this.searchQuery);
        }
    }
};
</script>

<style scoped>
.main-page-container {
    padding-bottom: 20px;
}

.content-list-container {
    max-width: 1200px;
    /* Set a max width for better readability */
    margin: 0 auto;
    /* Center the container within the right column */
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

.left-column {
    width: 300px;
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

.right-column {
    flex-grow: 1;
    /* The right column takes up the remaining space */
    min-width: 0;
    /* Prevents flexbox overflow issues */
}

.paper-card {
    border-radius: 8px;
    border: 1px solid #e8e8e8;
}

.main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.card-header {
    font-size: 16px;
    font-weight: bold;
}

.card-header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.course-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.hot-list-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.hot-list-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    font-size: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.hot-list-item:last-child {
    border-bottom: none;
}

.rank-badge {
    display: inline-block;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 4px;
    background-color: #f0f2f5;
    color: #606266;
    font-weight: bold;
    margin-right: 15px;
}

.hot-list-item:nth-child(1) .rank-badge,
.hot-list-item:nth-child(2) .rank-badge,
.hot-list-item:nth-child(3) .rank-badge {
    background-color: #f56c6c;
    color: #fff;
}

.item-name {
    color: #303133;
}

.main-content {
    line-height: 1.8;
}

.tag-container {
    display: flex;
    flex-wrap: wrap;
    /* 当标签太多时，允许它们换行 */
    gap: 8px;
    /* 设置标签之间的间距为 8px */
    justify-content: center;
    /* 新增：将标签行在容器内居中对齐 */
}
</style>
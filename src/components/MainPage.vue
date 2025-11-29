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
                <el-card class="paper-card">
                    <template #header>
                        <div class="card-header">
                            <span>你的主内容区</span>
                        </div>
                    </template>
                    <div class="main-content">
                        <h1>欢迎来到你的创作空间</h1>
                        <p>这里是你可以自由编辑和滚动的内容区域。</p>
                        <p v-for="i in 50" :key="i">这是第 {{ i }} 行内容，用于演示滚动效果...</p>
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
            searchQuery: '',
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
        this.$http.get("/api/wordcloud-pdfnames/")
            .then((response) => {
                response = response.data;
                if (response.state == 200) {
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

.card-header {
    font-size: 18px;
    font-weight: bold;
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
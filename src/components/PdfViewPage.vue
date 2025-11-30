<template>
    <div class="pdf-view-container">
        <el-row :gutter="20" class="column-wrapper">
            <!-- Left Column -->
            <el-col :span="6" class="column">
                <div class="custom-card">
                    <div class="custom-card-header">
                        <span>相关文件</span>
                    </div>
                    <div class="custom-card-body">
                        <el-table :data="annotationInfo" stripe style="width: 100%">
                            <el-table-column prop="page_num" label="pageNum" />
                            <el-table-column prop="likes" label="likes" />
                            <el-table-column prop="create_time" label="create_time" />
                            <el-table-column prop="description" label="description" />
                        </el-table>
                    </div>
                </div>
            </el-col>

            <!-- Middle Column -->
            <el-col :span="9" class="column">
                <div class="custom-card pdf-card">
                    <div class="custom-card-header">
                        <span>{{ pdfInfo.file_name || '文档预览' }}</span>
                    </div>
                    <div class="pdf-info-bar">
                        <span class="info-item" v-if="pdfInfo.course_name">
                            <el-icon>
                                <CollectionTag />
                            </el-icon> {{ pdfInfo.course_name }}
                        </span>
                        <span class="info-item" v-if="pdfInfo.upload_time">
                            <el-icon>
                                <Timer />
                            </el-icon> {{ pdfInfo.upload_time }}
                        </span>
                        <span class="info-item description" v-if="pdfInfo.description">
                            <el-icon>
                                <Document />
                            </el-icon> {{ pdfInfo.description }}
                        </span>
                    </div>
                    <div class="pdf-viewer-wrapper">
                        <vue-pdf-app v-if="pdf_file_content" :pdf="pdf_file_content" :page-number="pdf_page_number"
                            @loaded="onPdfLoaded" />
                        <div v-else class="loading-pdf">
                            <el-icon class="is-loading" :size="30">
                                <Loading />
                            </el-icon>
                            <p>正在加载 PDF 文件...</p>
                        </div>
                    </div>
                </div>
            </el-col>

            <!-- Right Column -->
            <el-col :span="9" class="column">
                <div class="custom-card">
                    <div class="custom-card-header">
                        <span>批注</span>
                    </div>
                    <div class="custom-card-body">
                        <p>这里是批注内容...</p>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import VuePdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";
import { ElNotification, ElRow, ElCol, ElIcon } from 'element-plus';
import { CollectionTag, Timer, Document, Loading } from '@element-plus/icons-vue';

export default {
    name: 'PdfViewPage',
    components: {
        VuePdfApp,
        ElRow,
        ElCol,
        ElIcon,
        CollectionTag,
        Timer,
        Document,
        Loading
    },
    data() {
        return {
            pdfInfo: {
                pdf_id: this.$route.query.pdfId || null, // 从路由初始化
                // ... 其他字段会从API填充
            },
            annotationInfo: [],// 用于存储批注信息
            pdf_file_content: null, // 用于存储 PDF 的二进制数据
            pdf_page_number: 1,
        };
    },
    created() {
        if (this.pdfInfo.pdf_id) {
            this.fetchPdfData();
            this.getApprovedAnnoation();

        } else {
            ElNotification({
                title: '错误',
                message: '未提供 PDF ID',
                type: 'error',
                duration: 3000,
            });
        }
    },
    methods: {
        async fetchPdfData() {
            try {
                // --- 步骤 1: 获取 PDF 元数据 ---
                // 注意: 您的 URL "/http/api/user/pdf-info/" 可能需要根据您的代理配置调整。
                // 通常应该是 "/api/user/pdf-info/"。
                const infoResponse = await this.$http.post("/http/api/user/pdf-info/", { "pdf_id": this.pdfInfo.pdf_id });

                if (infoResponse.status !== 200) {
                    throw new Error(infoResponse.data.message || '获取PDF信息失败');
                }

                this.pdfInfo = infoResponse.data.pdf_info;

                // --- 步骤 2: 获取 PDF 文件内容 ---
                // 依赖 axios 的全局配置，它会自动添加 Authorization 头
                const fileResponse = await this.$http.get(`/http/api/pdf/download/${this.pdfInfo.pdf_id}`, {
                    // 无需手动设置 headers，axios 会使用默认值
                    responseType: 'blob' // 关键：告诉 axios 期望接收一个二进制大对象
                });

                // 将返回的 blob 数据转换为 VuePdfApp 可以使用的格式
                this.pdf_file_content = await fileResponse.data.arrayBuffer();


            } catch (error) {
                console.error(error);
                const errorMessage = error.response?.data?.message || error.message || '发生未知网络错误';
                ElNotification({
                    title: '错误',
                    message: errorMessage,
                    type: 'error',
                    duration: 3000,
                });
            }
        },
        async getApprovedAnnoation() {
            try {
                const infoResponse = await this.$http.post("/http/api/user/annotations/by-pdf-id-pagenumber/", { "pdf_id": this.pdfInfo.pdf_id, "pdf_page_number": this.pdf_page_number });

                if (infoResponse.status !== 200) {
                    throw new Error(infoResponse.data.message || '获取Annoation信息失败');
                }

                this.annotationInfo = infoResponse.data.annotations;

            } catch (error) {
                console.error(error);
                const errorMessage = error.response?.data?.message || error.message || '发生未知网络错误';
                ElNotification({
                    title: '错误',
                    message: errorMessage,
                    type: 'error',
                    duration: 3000,
                });
            }
        },
        onPdfLoaded() {
            console.log('PDF 在查看器中加载完成');
        },
    },
};
</script>

<style scoped>
.pdf-view-container {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 120px);
    box-sizing: border-box;
}

.column-wrapper {
    height: 100%;
    width: 100%;
}

.column {
    height: 100%;
}

.custom-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    height: calc(100vh - 150px);
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.3s;
}

.custom-card:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.custom-card-header {
    padding: 18px 20px;
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.custom-card-body {
    padding: 20px;
    flex-grow: 1;
    overflow-y: auto;
}

.pdf-card {
    padding: 0;
}

.pdf-card .custom-card-header {
    padding: 18px 20px;
}

.pdf-card .pdf-viewer-wrapper {
    padding: 0;
}

.pdf-info-bar {
    padding: 10px 20px;
    background-color: #fafafa;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 14px;
    color: #606266;
}

.info-item {
    display: flex;
    align-items: center;
}

.info-item .el-icon {
    margin-right: 5px;
}

.description {
    flex-basis: 100%;
}

.pdf-viewer-wrapper {
    flex-grow: 1;
    overflow: hidden;
    position: relative;
}

.loading-pdf {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #909399;
}
</style>

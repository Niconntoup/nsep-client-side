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
                        <el-table :data="annotationInfo" stripe @cell-click="handelTableCellClick"
                            style="height: 100%; width: 100%">
                            <el-table-column prop="page_num" label="page" width="80" sortable />
                            <el-table-column prop="likes" label="likes" width="80" sortable />
                            <el-table-column prop="create_time" label="time" width="100" sortable />
                            <el-table-column prop="description" label="desc" />
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
                        <!-- 添加 :config="pdfConfig" -->
                        <iframe v-if="pdfUrl" :src="pdfUrl" style="width: 100%; height: 100%; border: none;">
                        </iframe>
                        <!-- 否则显示loading状态 -->
                        <div v-else class="loading-pdf">
                            <el-icon>
                                <Loading />
                            </el-icon>
                            <span>正在加载 PDF...</span>
                        </div>
                    </div>
                </div>
            </el-col>

            <!-- Right Column -->
            <el-col :span="9" class="column">
                <div class="custom-card pdf-card">
                    <div class="custom-card-header">
                        <span>批注：{{ pdfInfo.file_name || '文档预览' }}</span>
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
                        <!-- 修改这里：绑定到 pdfUrl，并添加 v-if 确保有值才渲染 -->
                        <iframe v-if="pdfUrl" :src="pdfUrl" style="width: 100%; height: 100%; border: none;">
                        </iframe>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import VuePdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";
import { ElNotification, ElRow, ElCol, ElIcon } from 'element-plus';
import { CollectionTag, Timer, Document, Loading } from '@element-plus/icons-vue';
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue';
import { useRoute } from "vue-router";
import http from "@/utils/http";
import MarkdownIt from 'markdown-it';

const mdi = new MarkdownIt({
    html: false,
    linkify: true,
});

// 处理并渲染Markdown内容
const renderedMarkdown = computed(() => {

    return mdi.render("这里是一些 **Markdown** 内容，包含数学公式：$A^2$ (如果未显示，请尝试 \\(A^2\\))。");
});

const route = useRoute();

// 触发 MathJax 重新渲染
const renderMath = () => {
    nextTick(() => {
        if (window.MathJax) {
            // MathJax 3.x
            if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            }
            // MathJax 2.x
            else if (window.MathJax.Hub && window.MathJax.Hub.Queue) {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }
        }
    });
};

const pdfInfo = reactive({ "pdf_id": route.query.pdfId || null });
const annotationInfo = ref([]); // 用于存储批注信息
const annotation_content = ref(null);
const pdf_file_content = ref(null); // 用于存储 PDF 的二进制数据
const pdfUrl = ref(''); // 【新增】用于存储 iframe 可用的 Blob URL
const annotation_pdfUrl = ref(''); // 用于存储批注 PDF 的 Blob URL
const pdf_page_number = ref(1);


// 【修复】添加 PDF 配置以解决 CMap 404 错误
const pdfConfig = {
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
};

const handelTableCellClick = (row, column, cell, event) => {

    // 请求对应的批注内容并显示
    console.log(`点击了文件名，annotation_id: ${annotation_id}`);
    getApprovedAnnotationContent(row.annotation_id, row.annotation_type);

};

const fetchPdfData = async () => {
    const infoResponse = await http.post("/http/api/user/pdf-info/", { "pdf_id": pdfInfo.pdf_id });
    if (infoResponse.status == 200) {
        // pdfInfo = infoResponse.data.pdf_info;
        Object.assign(pdfInfo, infoResponse.data.pdf_info);
    } else {
        ElNotification({
            title: '错误',
            message: errorMessage,
            type: 'error',
            duration: 3000,
        });
    }

    const fileResponse = await http.get(`/http/api/pdf/download/${pdfInfo.pdf_id}`, {
        responseType: 'blob'
    });

    // 【修改】同时生成 ArrayBuffer (给 vue-pdf-app) 和 Blob URL (给 iframe)
    const blob = fileResponse.data;
    // // 1. 给左侧 vue-pdf-app 使用
    // pdf_file_content.value = await blob.arrayBuffer();
    // 2. 给右侧 iframe 使用
    pdfUrl.value = URL.createObjectURL(blob);
};

const getApprovedAnnotation = async () => {
    try {
        const infoResponse = await http.post("/http/api/user/annotations/by-pdf-id-all/", { "pdf_id": pdfInfo.pdf_id });

        if (infoResponse.status !== 200) {
            throw new Error(infoResponse.data.message || '获取Annoation信息失败');
        }

        annotationInfo.value = infoResponse.data.annotations;

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
};

const getApprovedAnnotationContent = async (annotation_id, annotation_type) => {
    // 根据 annotation_id 获取批注内容并显示
    try {
        if (annotation_type === "markdown") { // markdown
            const response = await http.post("/http/api/user/annotations/typemarkdowncontent/", { "annotation_id": annotation_id });

            if (response.status !== 200) {
                throw new Error(response.data.message || '获取批注内容失败');
            }

            // 此时里面装的是markdown内容 string
            annotation_content.value = response.data.annotation_markdown_content;

        } else { // pdf
            const response = await http.get(`/http/api/user/annotations/download/${annotation_id}`, {
                responseType: 'blob'
            });

            if (response.status !== 200) {
                throw new Error('获取批注内容失败');
            }
            const blob = response.data;
            // 生成 Blob URL
            annotation_pdfUrl.value = URL.createObjectURL(blob);
            //  TODO:dsfdsfds

        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: '获取批注内容失败',
            type: 'error',
            duration: 3000,
        });
    }
};

onMounted(async () => {
    // 页面挂载后尝试渲染公式
    renderMath();

    if (pdfInfo.pdf_id) {
        fetchPdfData();
        getApprovedAnnotation();
    } else {
        ElNotification({
            title: '错误',
            message: '未提供 PDF ID',
            type: 'error',
            duration: 3000,
        });
    }
});


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

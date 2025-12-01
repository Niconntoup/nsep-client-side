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
                        <el-table :data="annotationInfoList" :row-class-name="tableClassName"
                            @cell-click="handelTableCellClick" style="height: 100%; width: 100%">
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
                        <div><span>{{ pdfInfo.file_name || '文档预览' }}</span></div>
                        <div class="pdf-annotation-create">
                            <span>点赞</span>
                            <el-button :type="buttonsTypeName.pdf_like" @click="handleLikePdf"
                                :loading="buttonsLoading.pdf_like" :icon="CirclePlus" circle />
                            <span>收藏</span>
                            <el-button :type="buttonsTypeName.pdf_favorite" @click="handleFavoritePdf"
                                :loading="buttonsLoading.pdf_favorite" :icon="Star" circle />
                            <span>批注创建</span>
                            <div class="button-row">
                                <el-button type="primary" plain
                                    @click="handleCreatePdfAnnotation"><b>PDF</b></el-button>
                                <el-button type="success" plain
                                    @click="handleCreateMarkdownAnnotation"><b>Markdown</b></el-button>
                            </div>
                        </div>
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
                        <span v-if="isCreateAnnotation">{{ createAnnotationType == 'pdf' ? '创建 PDF 批注' : '创建 Markdown批注'
                            }}</span>
                        <span v-else>批注：{{ annotation_type }}</span>
                        <div v-if="isCreateAnnotation" class="pdf-annotation-create">
                            <el-button type="primary" @click="handleUploadNewAnnotation"><b>提交批注</b></el-button>
                        </div>
                        <div v-else-if="!isCreateAnnotation && currentAnnotationInfo" class="pdf-annotation-create">
                            <span>点赞</span>
                            <el-button :type="buttonsTypeName.annotation_like" @click="handleLikeAnnotation"
                                :loading="buttonsLoading.annotation_like" :icon="CirclePlus" circle />
                        </div>
                    </div>



                    <div v-if="isCreateAnnotation"
                        style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
                        <div class="pdf-info-bar">
                            <span class="info-item" v-if="pdfInfo.course_name">
                                <el-icon>
                                    <CollectionTag />
                                </el-icon> {{ pdfInfo.course_name }}
                            </span>
                        </div>

                        <div class="create-annotation-form">
                            <el-row :gutter="15">
                                <el-col :span="8">
                                    <div class="form-item">
                                        <span class="label">页码：</span>
                                        <el-input v-model="newAnnotation.page_num" placeholder="页码" />
                                    </div>
                                </el-col>
                                <el-col :span="16">
                                    <div class="form-item">
                                        <span class="label">描述：</span>
                                        <el-input v-model="newAnnotation.description" placeholder="请输入描述" />
                                    </div>
                                </el-col>
                            </el-row>
                        </div>
                        <el-divider></el-divider> <!-- 分割线 -->

                        <div v-if="createAnnotationType == 'pdf'" class="create-annotation-form">
                            <el-upload class="upload-demo" drag
                                :action="(proxy.$config.api_base_url || '') + '/http/api/user/annotations/upload/typepdf/'"
                                :headers="uploadHeaders" :data="moreUploadData" :on-success="handlePdfUploadSuccess"
                                :on-error="handlePdfUploadError">
                                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                <div class="el-upload__text">
                                    将文件拖到此处，或<em>点击上传</em>
                                    只有 PDF 文件格式被支持
                                </div>
                            </el-upload>
                        </div>
                        <div v-if="createAnnotationType == 'markdown'" class="create-annotation-form"
                            style="flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;">
                            <div class="form-item" style="display: flex; flex-direction: column; flex-grow: 1;">
                                <!-- <div style="margin-bottom: 8px; color: #606266; font-size: 14px;">Markdown 内容：</div> -->
                                <el-input v-model="newAnnotation.content" type="textarea"
                                    placeholder="在此输入 Markdown 内容..." resize="none" style="height: 100%;"
                                    input-style="height: 100%;" />
                            </div>
                        </div>

                    </div>
                    <div v-else style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
                        <div class="pdf-info-bar">
                            <span class="info-item" v-if="pdfInfo.course_name">
                                <el-icon>
                                    <CollectionTag />
                                </el-icon> {{ pdfInfo.course_name }}
                            </span>

                            <span class="info-item" v-if="currentAnnotationInfo?.create_time">
                                <el-icon>
                                    <Timer />
                                </el-icon> {{ currentAnnotationInfo.create_time }}
                            </span>
                            <!-- 修复：添加 ?. 防止 currentAnnotationInfo 为 null 时报错 -->
                            <span class="info-item description" v-if="currentAnnotationInfo?.description">
                                <el-icon>
                                    <Document />
                                </el-icon> {{ currentAnnotationInfo.description }}
                            </span>
                        </div>

                        <div class="pdf-viewer-wrapper">
                            <!-- 修改这里：绑定到 pdfUrl，并添加 v-if 确保有值才渲染 -->
                            <iframe v-if="annotation_type === 'pdf' && annotation_pdfUrl" :src="pdfUrl"
                                style="width: 100%; height: 100%; border: none;"></iframe>
                            <div v-else-if="annotation_type === 'markdown'" class="markdown-viewer"
                                style="padding: 15px; overflow-y: auto; height: 100%; box-sizing: border-box;">
                                <div v-html="renderedMarkdown"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import "vue3-pdf-app/dist/icons/main.css";
import { ElNotification, ElRow, ElCol, ElIcon } from 'element-plus';
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { useRoute } from "vue-router";
import http from "@/utils/http";
import MarkdownIt from 'markdown-it';
import { getCurrentInstance } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue'
import {
    CirclePlus,
    Star,
} from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();

const route = useRoute();

const pdfInfo = reactive({ "pdf_id": route.query.pdfId || null });
const annotationInfoList = ref([]); // 用于存储批注信息
const currentAnnotationInfo = ref(null); // 用于存储当前选中的批注信息
const annotation_content = ref(""); // 用于存储批注markdown内容
const pdf_file_content = ref(null); // 用于存储 PDF 的二进制数据
const pdfUrl = ref(''); // 【新增】用于存储 iframe 可用的 Blob URL
const annotation_pdfUrl = ref(''); // 用于存储批注 PDF 的 Blob URL
const annotation_type = ref('');
const isCreateAnnotation = ref(false); // 是否处于创建批注状态
const createAnnotationType = ref('markdown');

const newAnnotation = reactive({
    page_num: '',
    description: '',
    content: ''
});


const buttonsTypeName = reactive({
    "pdf_like": "",
    "pdf_favorite": "",
    "annotation_like": ""
});

const buttonsLoading = reactive({
    "pdf_like": false,
    "pdf_favorite": false,
    "annotation_like": false
});


// 上传批注时的附加数据
const moreUploadData = computed(() => ({
    "pdf_id": pdfInfo.pdf_id,
    "user_id": proxy.$store.state.userInfo.user_id,
    "page_num": newAnnotation.page_num,
    "description": newAnnotation.description
}));


const uploadHeaders = computed(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
});

const mdi = new MarkdownIt({
    html: false,
    linkify: true,
});

// 处理并渲染Markdown内容
const renderedMarkdown = computed(() => {

    return mdi.render(annotation_content.value || '暂无批注内容');
});



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

const tableClassName = ({ row, rowIndex }) => {
    if (row.status === 'pending') {
        return 'warning-row'
    } else {
        return ''
    }
};

const handleLikePdf = async () => {
    buttonsLoading.pdf_like = true;

    // 如果此时buttonType是waring就是已点赞，现在再点击就是要取消点赞，反之亦然
    const operate_type = buttonsTypeName.pdf_like === "warning" ? "remove" : "add";

    try {
        const response = await http.post("/http/api/user/update/likes-pdf/", {
            "operate_type": operate_type,
            "user_id": proxy.$store.state.userInfo.user_id,
            "likes_pdf_id": pdfInfo.pdf_id,
        });

        if (response.status === 200) {
            // 同时更新 Vuex 中的用户信息
            proxy.$store.commit('updateUserLikesPdfId', {
                "operate_type": operate_type,
                "pdf_id": pdfInfo.pdf_id
            });

            // TODO：通知后端更新该PDF的总点赞数

            // 成功，对按钮状态进行切换
            buttonsTypeName.pdf_like = buttonsTypeName.pdf_like === "warning" ? "" : "warning";

        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: 'LikePdf 请求失败',
            type: 'error',
        });
    } finally {
        buttonsLoading.pdf_like = false;
    }
};

const handleFavoritePdf = async () => {
    buttonsLoading.pdf_favorite = true;
    // 如果此时buttonType是waring就是已收藏，现在再点击就是要取消收藏，反之亦然
    const operate_type = buttonsTypeName.pdf_favorite === "warning" ? "remove" : "add";

    try {
        const response = await http.post("/http/api/user/update/favorited-pdf/", {
            "operate_type": operate_type,
            "user_id": proxy.$store.state.userInfo.user_id,
            "favorited_pdf_id": pdfInfo.pdf_id,
        });

        if (response.status === 200) {
            // 同时更新 Vuex 中的用户信息
            proxy.$store.commit('updateUserFavoritedPdfId', {
                "operate_type": operate_type,
                "pdf_id": pdfInfo.pdf_id
            });

            // TODO：通知后端更新该PDF的总收藏数

            // 成功，对按钮状态进行切换
            buttonsTypeName.pdf_favorite = buttonsTypeName.pdf_favorite === "warning" ? "" : "warning";
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: 'FavoritePdf 请求失败',
            type: 'error',
        });
    } finally {
        buttonsLoading.pdf_favorite = false;
    }

};

const handleLikeAnnotation = async () => {
    buttonsLoading.annotation_like = true;
    // 如果此时buttonType是waring就是已点赞，现在再点击就是要取消点赞，反之亦然
    const operate_type = buttonsTypeName.annotation_like === "warning" ? "remove" : "add";
    try {
        const response = await http.post("/http/api/user/update/likes-annotation/", {
            "operate_type": operate_type,
            "user_id": proxy.$store.state.userInfo.user_id,
            "likes_annotation_id": currentAnnotationInfo.value.annotation_id,
        });

        if (response.status === 200) {
            // 同时更新 Vuex 中的用户信息
            proxy.$store.commit('updateUserLikesAnnotationId', {
                "operate_type": operate_type,
                "annotation_id": currentAnnotationInfo.value.annotation_id
            });

            // TODO：通知后端更新该批注的总点赞数
            // TODO：直接更新当前批注的点赞数显示，tableData中
            // 成功，对按钮状态进行切换
            buttonsTypeName.annotation_like = buttonsTypeName.annotation_like === "warning" ? "" : "warning";
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: 'LikeAnnotation 请求失败',
            type: 'error',
        });
    } finally {
        buttonsLoading.annotation_like = false;
    }

};

const handlePdfUploadSuccess = (response, uploadFile) => {
    ElNotification({
        title: '成功',
        message: 'PDF 批注上传成功',
        type: 'success',
        duration: 3000,
    });
    getApprovedAnnotation();
    isCreateAnnotation.value = false;
};

const handlePdfUploadError = (error, uploadFile) => {
    ElNotification({
        title: '错误',
        message: 'PDF 批注上传失败',
        type: 'error',
        duration: 3000,
    });
};

const handleUploadNewAnnotation = async () => {
    // 提交新的Markdown批注，PDF批注通过el-upload自动上传
    const uploadPostData = {
        "pdf_id": pdfInfo.pdf_id,
        "user_id": proxy.$store.state.userInfo.user_id,
        "page_num": newAnnotation.page_num,
        "description": newAnnotation.description,
        "markdown_content": newAnnotation.content
    };

    try {
        const response = await http.post("/http/api/user/annotations/upload/typemarkdown/", uploadPostData);

        if (response.status === 200) {
            ElNotification({
                title: '成功',
                message: '批注提交成功',
                type: 'success',
                duration: 3000,
            });
            // 提交成功后刷新批注列表
            getApprovedAnnotation();
            // 重置创建状态
            isCreateAnnotation.value = false;
        } else {
            throw new Error(response.data.message || '提交批注失败');
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: '提交批注失败',
            type: 'error',
            duration: 3000,
        });
    }
};

const handleCreatePdfAnnotation = () => {
    isCreateAnnotation.value = true;
    createAnnotationType.value = 'pdf';
    currentAnnotationInfo.value = null;

};

const handleCreateMarkdownAnnotation = () => {
    isCreateAnnotation.value = true;
    createAnnotationType.value = 'markdown';
    currentAnnotationInfo.value = null;
};


// 【修复】添加 PDF 配置以解决 CMap 404 错误
const pdfConfig = {
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
};

const handelTableCellClick = (row, column, cell, event) => {
    currentAnnotationInfo.value = row;
    isCreateAnnotation.value = false;

    // 请求对应的批注内容并显示
    console.log(`点击了文件名，annotation_id: ${row.annotation_id}`);
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

    // pdf_file_content.value = await blob.arrayBuffer();
    // 2. 给右侧 iframe 使用
    pdfUrl.value = URL.createObjectURL(blob);
};

const getApprovedAnnotation = async () => {
    try {
        const infoResponse = await http.post("/http/api/user/annotations/by-pdf-id-all/", { "pdf_id": pdfInfo.pdf_id, "user_id": proxy.$store.state.userInfo.user_id });

        if (infoResponse.status !== 200) {
            throw new Error(infoResponse.data.message || '获取Annoation信息失败');
        }

        annotationInfoList.value = infoResponse.data.annotations;

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

const getApprovedAnnotationContent = async (annotation_id, fun_annotation_type) => {
    // 根据 annotation_id 获取批注内容并显示
    annotation_type.value = fun_annotation_type;
    try {
        if (fun_annotation_type === "markdown") { // markdown
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

const set_button_types = () => {
    // 设置按钮状态
    const userInfo = proxy.$store.state.userInfo;

    // PDF 点赞状态
    if (userInfo.likes_pdf_id.includes(pdfInfo.pdf_id)) {
        buttonsTypeName.pdf_like = "warning";
    } else {
        buttonsTypeName.pdf_like = "";
    }

    // PDF 收藏状态
    if (userInfo.favorited_pdf_id.includes(pdfInfo.pdf_id)) {
        buttonsTypeName.pdf_favorite = "warning";
    } else {
        buttonsTypeName.pdf_favorite = "";
    }

    // 批注点赞状态
    if (currentAnnotationInfo.value && userInfo.likes_annotation_id.includes(currentAnnotationInfo.value.annotation_id)) {
        buttonsTypeName.annotation_like = "warning";
    } else {
        buttonsTypeName.annotation_like = "";
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

    // 初始化参数
    annotation_type.value = 'markdown';
    annotation_content.value = proxy.$config.guide_tip.annotation.markdown_content || '暂无批注内容';

    set_button_types();
});


</script>

<style scoped>
/* 修改这里：添加 :deep() */
:deep(.el-table .warning-row) {
    --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

:deep(.el-table .success-row) {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
}

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

.pdf-annotation-create {
    display: flex;
    align-items: center;
    gap: 15px;
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

.button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
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

.create-annotation-form {
    padding: 20px;
}

.form-item {
    display: flex;
    align-items: center;
}

.form-item .label {
    white-space: nowrap;
    margin-right: 10px;
    font-size: 14px;
    color: #606266;
    min-width: 45px;
    text-align: right;
}
</style>

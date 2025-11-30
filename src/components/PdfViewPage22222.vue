<template>
    <div class="pdf-view-container">
        <div style="height: 100%; box-shadow: var(--el-border-color-light) 0px 0px 10px">
            <el-splitter>
                <el-splitter-panel :min="200">
                    <div class="demo-panel">2</div>
                </el-splitter-panel>
                <el-splitter-panel>
                    <div class="demo-panel">
                        <div v-if="isLoading" class="loading-spinner">
                            <el-icon class="is-loading">
                                <Loading />
                            </el-icon>
                            <span>正在加载 PDF...</span>
                        </div>
                        <div v-else-if="pdfSource" class="pdf-embed-wrapper">

                            <iframe style="width: 100%; height: 98%;" :src="pdfSource"></iframe>
                            <!-- <vue-pdf-embed :source="pdfSource" /> -->
                            <!-- <VuePDFjs :source="pdfSource" /> -->

                        </div>
                        <div v-else class="error-message">
                            <el-icon>
                                <CircleCloseFilled />
                            </el-icon>
                            <span>无法加载 PDF。请检查文件路径或网络连接。</span>
                        </div>

                    </div>
                </el-splitter-panel>
                <el-splitter-panel :min="200">
                    <div class="demo-panel">2</div>
                </el-splitter-panel>
            </el-splitter>
        </div>


    </div>
</template>

<script>
import VuePdfEmbed from 'vue-pdf-embed';
import { Loading, CircleCloseFilled } from '@element-plus/icons-vue';
import { VuePDFjs } from "@tuttarealstep/vue-pdf.js";
import "@tuttarealstep/vue-pdf.js/dist/style.css";

export default {
    name: 'PdfViewPage',
    components: {
        VuePdfEmbed,
        Loading,
        CircleCloseFilled
    },
    data() {
        return {
            pdfId: 11,
            pdfSource: null, // This will hold the URL or Base64 data for the PDF
            isLoading: true,
        };
    },
    created() {
        //TODO this.pdfId = this.$route.query.pdfId;
        if (this.pdfId) {
            this.fetchPdf();
        } else {
            console.error('No PDF ID provided in the route query.');
            this.isLoading = false;
        }
    },
    methods: {
        fetchPdf() {
            this.isLoading = true;
            // **重要**: 为了演示，我将使用一个存放在 `public` 文件夹下的示例 PDF。
            // 你需要将 PDF 文件放入 `public` 目录，然后代码才能正确加载它。
            // 这里的 '毕业生信息.pdf' 应该替换成你放在 public 目录下的实际文件名。
            // 将来你可以根据 this.pdfId 从后端动态获取文件名。
            const pdfFileName = '教材帮 高中数学 选择性必修第三册 RJA.pdf'; // TODO: 替换成你的文件名, 或根据pdfId动态获取
            const pdfUrl = `/${pdfFileName}`; // 这会指向 public/毕业生信息.pdf

            // --- 使用 public 文件夹中的文件 ---
            // 这种方式是让开发服务器提供文件，是正确的方式。
            this.pdfSource = pdfUrl;
            this.isLoading = false;

            // --- 从后端获取文件的示例 ---
            // 当你准备好后端API后，可以切换到下面的代码
            /*
            this.$http.get(`/api/get-pdf/${this.pdfId}`, { responseType: 'blob' })
                .then(response => {
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    this.pdfSource = URL.createObjectURL(blob);
                    this.isLoading = false;
                })
                .catch(error => {
                    console.error('Error fetching PDF from backend:', error);
                    this.isLoading = false;
                });
            */
        }
    }
};
</script>

<style scoped>
.demo-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.pdf-view-container {
    height: calc(100vh - 150px);
    /* 100vh - header height (80px) - padding (20px*2) */
    width: 100%;
    background-color: #f0f2f5;
}


.pdf-embed-wrapper {
    width: 100%;
    height: 99%;
    overflow-y: auto;
    /* Allow scrolling for the PDF content */
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-spinner,
.error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    color: #606266;
}

.loading-spinner .el-icon {
    font-size: 48px;
}

.error-message .el-icon {
    font-size: 48px;
    color: #f56c6c;
}
</style>
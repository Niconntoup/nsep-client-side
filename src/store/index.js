import { createStore } from 'vuex';
import _, { update } from 'lodash';
import createPersistedState from 'vuex-persistedstate'; // 1. 导入插件

export default createStore({
    state: {
        // 全局状态
        userInfo: {
            user_id: "",
            username: "",
            create_time: "",
            permission: "",
            token: ""
        },
        wordCloudPdfnames: [],
        user_likes_pdf_id: [],
        user_likes_annotation_id: [],
        user_favorited_pdf_id: []
    },
    getters: {

    },
    mutations: {

        updateUserLikesPdfId(state, likes_pdf_id) {
            state.user_likes_pdf_id = likes_pdf_id;
        },
        updateUserLikesAnnotationId(state, likes_annotation_id) {
            state.user_likes_annotation_id = likes_annotation_id;
        },
        updateUserFavoritedPdfId(state, favorited_pdf_id) {
            state.user_favorited_pdf_id = favorited_pdf_id;
        },
        // 同步修改 state（必须同步）
        updateUserInfo(state, userInfo) {
            state.userInfo = _.cloneDeep(userInfo);
        },
        updateWordCloudPdfnames(state, pdfnames) {
            state.wordCloudPdfnames = pdfnames;
        },

        removeBlogByBlogId(state, id) {
            const index = state.Info.blogs.findIndex(blog => blog.id === id);
            if (index !== -1) {
                state.Info.blogs.splice(index, 1);  // 删除该元素
            }
            state.Info.userInfo.blogNums -= 1;
            state.Info.userInfo.blogNums < 0 ? 0 : state.Info.userInfo.blogNums;
        }
    },
    actions: {

    },
    modules: {

    },
    // 2. 添加 plugins 配置
    plugins: [
        // 使用持久化状态插件
        createPersistedState({
            storage: window.localStorage, // 默认使用 localStorage，可以改为 sessionStorage
            // 你还可以指定需要持久化的模块
            // paths: ['userInfo'] 
        }),
    ],
});
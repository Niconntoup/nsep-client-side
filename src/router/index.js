import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/components/Login.vue')
    },
    {
        path: '/main',
        name: 'MainPage',
        component: () => import('@/components/MainPage.vue')
    },
    {
        path: '/profile',
        name: 'ProfilePage',
        component: () => import('@/components/ProfilePage.vue')
    },
    {
        // 有query参数{pdfId: 'xxx'}，用于获取PDF详情
        path: '/pdf/view',
        name: 'PdfViewPage',
        component: () => import('@/components/PdfViewPage.vue')
    },
];



// 创建路由实例
const router = createRouter({
    history: createWebHistory("/"), // 使用HTML5 History模式
    routes, // 配置路由
});

export default router;

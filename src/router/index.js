import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: '/',
        redirect: '/main'
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
];



// 创建路由实例
const router = createRouter({
    history: createWebHistory("/"), // 使用HTML5 History模式
    routes, // 配置路由
});

export default router;

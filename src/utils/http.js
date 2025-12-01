import axios from 'axios';
import { ElNotification } from 'element-plus';
import router from '../router'; // 导入你的路由实例

// 创建 axios 实例
const http = axios.create({
    // 你的后端 API 基础 URL
    // baseURL: '/api', 
    timeout: 5000, // 请求超时时间
});

// 请求拦截器
http.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器 (在这里统一处理 401 错误)
http.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            ElNotification({
                title: '认证失败',
                message: '您的登录已过期，请重新登录。',
                type: 'warning',
                duration: 3000,
            });
            localStorage.removeItem('token');
            router.push('/login'); // 跳转到登录页
        }
        // 将错误继续抛出，以便组件中的 catch 块可以捕获
        return Promise.reject(error);
    }
);

export default http;
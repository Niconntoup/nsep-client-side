// 导入 Vue 和其他依赖
import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import axios from "axios";
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import router from "./router/index.js"
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import "@/assets/global.css";
import _ from 'lodash';
import store from "./store";
import pdfMasterv from 'pdf-masterv'
import 'pdf-masterv/lib/pdf-masterv.css'

// 创建 Vue 应用实例
const app = createApp(App);

// 配置 axios
// axios.defaults.baseURL = "http://127.0.0.1:5000"; // <--- 注释或删除此行

// 将 axios 挂载到 Vue 3 的全局属性
app.config.globalProperties.$http = axios;

// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 使用 ElementPlus 组件库
app.use(ElementPlus, {
    locale: zhCn,
})

// 将 store 实例作为插件安装
app.use(store);
app.use(router);
app.use(pdfMasterv);
// 挂载应用
app.mount("#app");

// 防抖函数的实现
const debounce = (fn, delay) => {
    let timer
    return (...args) => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}

// 重写 ResizeObserver 类
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
        callback = debounce(callback, 200);
        super(callback);
    }
}
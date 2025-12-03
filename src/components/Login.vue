<template>
    <div class="login-container">
        <div id="background-animation"></div>
        <div class="login-box">
            <div class="login-header">
                <h2>{{ isLogin ? '注 册' : '登 录' }}</h2>
            </div>
            <div class="form-content">
                <div class="input-wrapper">
                    <el-icon>
                        <User />
                    </el-icon>
                    <input type="text" spellcheck="false" v-model="username" placeholder="账号" class="input-field" />
                </div>
                <div class="input-wrapper">
                    <el-icon>
                        <Lock />
                    </el-icon>
                    <input type="password" spellcheck="false" v-model="password" placeholder="密码" class="input-field"
                        @keyup.enter="isLogin ? loginerUser() : findUser()" />
                </div>
                <button class="login-button" @click="isLogin ? loginerUser() : findUser()">
                    {{ isLogin ? '注册' : '登录' }}
                </button>
            </div>
            <div class="message">
                <a href="#" @click.prevent="toggleForm">
                    {{ isLogin ? '已有账号？立即登录' : '没有账号？立即注册' }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import CryptoJS from 'crypto-js';
import { colProps, ElNotification } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import http from '@/utils/http';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';

const store = useStore();
const router = useRouter();

const isLogin = ref(false);
const username = ref("");
const password = ref("");
const hashPassword = ref("");

const toggleForm = async () => {
    isLogin.value = !isLogin.value;
    username.value = "";
    password.value = "";
};

const findUser = async () => {
    if (!username.value || !password.value) {
        ElNotification({
            title: '警告',
            message: '账号或密码不能为空',
            type: 'warning',
        });
        return;
    }
    loginerUser(true); // Pass a flag to indicate it's a login attempt
};

const loginerUser = async (isLoginAttempt = false) => {
    if (!username.value || !password.value) {
        ElNotification({
            title: '警告',
            message: '账号和密码不能为空',
            type: 'warning',
        });
        return;
    }

    hashPassword.value = CryptoJS.SHA256(password.value).toString(CryptoJS.enc.Base64);

    ElNotification({
        title: '提示',
        message: isLoginAttempt ? '正在登录...' : '正在注册...',
        type: 'info',
        duration: 1500,
    });

    vertifyOrRegisterUser(isLoginAttempt);
};

const vertifyOrRegisterUser = async (isLoginAttempt) => {
    try {
        const response = await http.post(`/http/${isLoginAttempt ? 'login' : 'register/user'}/`, { username: username.value, password: hashPassword.value });

        if (response.status === 200 && response.data.token) {
            ElNotification({
                title: '成功',
                message: '登录成功',
                type: 'success',
                duration: 2000,
            });

            localStorage.setItem('token', response.data.token);
            http.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            // 将用户信息更新到 Vuex store
            store.commit('updateUserInfo', response.data);

            // 并行获取用户偏好数据
            await Promise.all([
                fetchUserLikesPdfId(),
                fetchUserLikesAnnotationId(),
                fetchUserFavoritedPdfId()
            ]);


            // 跳转到主页
            router.push("/main");
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: '请求失败，请稍后重试',
            type: 'error',
        });
    }
};

const fetchUserLikesPdfId = async () => {
    try {
        const response = await http.post("/http/api/user/get/likes/", { "user_id": store.state.userInfo.user_id, "item_type": "pdf" });

        if (response.status === 200 && response.data) {
            store.commit('updateUserLikesPdfId', response.data.liked_items);
        } else {
            throw new Error("Failed to fetch user likes PDF IDs");
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: '获取用户喜欢的PDF列表失败',
            type: 'error',
        });
    }
};

const fetchUserLikesAnnotationId = async () => {
    try {
        const response = await http.post("/http/api/user/get/likes/", { "user_id": store.state.userInfo.user_id, "item_type": "annotation" });

        if (response.status === 200 && response.data) {
            store.commit('updateUserLikesAnnotationId', response.data.liked_items);
        } else {
            throw new Error("Failed to fetch user likes annotation IDs");
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: '获取用户喜欢的注释列表失败',
            type: 'error',
        });
    }
};

const fetchUserFavoritedPdfId = async () => {
    try {
        const response = await http.post("/http/api/user/get/favorites/", { "user_id": store.state.userInfo.user_id });

        if (response.status === 200 && response.data) {
            store.commit('updateUserFavoritedPdfId', response.data.favorited_pdf_id);
        } else {
            throw new Error("Failed to fetch user favorited PDF IDs");
        }
    } catch (error) {
        ElNotification({
            title: '错误',
            message: '获取用户喜欢的注释列表失败',
            type: 'error',
        });
    }
};



</script>

<style scoped>
@keyframes gradient-animation {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

#background-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(-45deg, #bfee52, #3cd3e7, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: gradient-animation 15s ease infinite;
    z-index: 0;
}

/* General body and background styling */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
    overflow: hidden;
}

/* The main login box with glassmorphism effect */
.login-box {
    width: 380px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.15);
    /* Slightly more transparent */
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    backdrop-filter: blur(15px);
    /* More blur */
    -webkit-backdrop-filter: blur(15px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #fff;
    /* White text for contrast against dark background */
    transition: all 0.3s ease;
    z-index: 1;
}

/* Header style */
.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    font-size: 2.8rem;
    /* Larger font */
    font-weight: 700;
    margin: 0;
    color: #fff;
    text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    /* Stronger shadow */
}

/* Wrapper for input fields and icons */
.input-wrapper {
    position: relative;
    margin-bottom: 25px;
}

.input-wrapper .el-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.3rem;
}

/* Input field styling */
.input-field {
    width: 100%;
    padding: 15px 15px 15px 50px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 500;
    outline: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.input-field::placeholder {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
}

.input-field:focus {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

/* Login button styling */
.login-button {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: #fff;
    font-size: 1.3rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
    letter-spacing: 3px;
    backdrop-filter: blur(5px);
}

.login-button:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

/* Message for switching between login and register */
.message {
    text-align: center;
    margin-top: 30px;
}

.message a {
    color: #fff;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.message a:hover {
    text-decoration: underline;
}
</style>
<template>
    <div class="login-container">
        <div id="background-animation"></div>
        <div class="login-box">
            <div class="login-header">
                <h2>NESP</h2>
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

<script>
import CryptoJS from 'crypto-js';
import { ElNotification } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

export default {
    name: "Login",
    components: {
        User,
        Lock
    },
    data: function () {
        return {
            isLogin: false,
            username: "",
            password: "",
            hashPassword: "",
            Info: {
                state: 200,
                userInfo: {
                    name: "",
                    blogNums: 0,
                    views: 0
                },
                blogs: [
                    {
                        id: 0,
                        visible: true,
                        title: "",
                        contentHtml: "",
                        tag: "",
                        uploadTime: "",
                        views: 0
                    }
                ]
            }
        }
    },
    methods: {
        toggleForm() {
            this.isLogin = !this.isLogin;
            this.Info.userInfo.name = '';
            this.password = '';
        },
        findUser() {
            if (!this.Info.userInfo.name || !this.password) {
                ElNotification({
                    title: '警告',
                    message: '账号或密码不能为空',
                    type: 'warning',
                });
                return;
            }
            this.loginerUser(true); // Pass a flag to indicate it's a login attempt
        },
        loginerUser(isLoginAttempt = false) {
            if (!this.Info.userInfo.name || !this.password) {
                ElNotification({
                    title: '警告',
                    message: '账号和密码不能为空',
                    type: 'warning',
                });
                return;
            }
            this.hashPassword = CryptoJS.SHA256(this.password).toString(CryptoJS.enc.Base64);

            ElNotification({
                title: '提示',
                message: isLoginAttempt ? '正在登录...' : '正在注册...',
                type: 'info',
                duration: 1500,
            });

            this.$http.post("/login/", { username: this.username, password: this.hashPassword })
                .then((response) => {
                    response = response.data;
                    if (response.state == 200 && response.token) { // 登录成功，并且返回了 token
                        ElNotification({
                            title: '成功',
                            message: '登录成功',
                            type: 'success',
                            duration: 2000,
                        });

                        // 1. 将 token 存储到 localStorage
                        localStorage.setItem('token', response.token);

                        // 2. 为后续的 axios 请求设置默认的 Authorization 头
                        this.$http.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

                        // (保留) 将用户信息更新到 Vuex store
                        this.$store.commit('updateUserInfo', response);

                        // 3. 跳转到主页
                        this.$router.push('/main');

                    } else if (response.state == 401) { // Password error
                        ElNotification({
                            title: '错误',
                            message: '账号或密码错误',
                            type: 'error',
                            duration: 2000,
                        })
                    } else {
                        ElNotification({
                            title: '错误',
                            message: response.message || '发生未知错误', // Use server message if available
                            type: 'error',
                            duration: 2000,
                        })
                    }
                })
                .catch((error) => {
                    console.log(error);
                    ElNotification({
                        title: '网络错误',
                        message: isLoginAttempt ? '登录失败' : '注册失败',
                        type: 'error',
                        duration: 2000,
                    })
                })
        }
    }
}
</script>

<style>
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
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: gradient-animation 15s ease infinite;
    z-index: 0;
}

/* General body and background styling */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
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
<template>
    <el-header class="main-header">
        <div class="header-left">
            <img src="@/assets/logo.png" alt="Logo" class="logo" />
            <span class="site-name">Designed by Niconntoup</span>
        </div>
        <div class="header-center">
            <el-input v-model="searchQuery" placeholder="发现新内容..." class="header-search-input" size="large" min="50%"
                @keyup.enter="performSearch">
                <template #append>
                    <el-button type="primary" :icon="Search">Search</el-button>
                </template>
            </el-input>
        </div>
        <div class="header-right">
            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    <el-avatar :size="40" :src="avatarUrl" />
                    <span class="username">{{ username }}</span>
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                        <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </el-header>
</template>

<script>
import { ArrowDown } from '@element-plus/icons-vue';
import { Search } from '@element-plus/icons-vue';

export default {
    name: 'MainHeader',
    components: {
        ArrowDown,
        Search
    },
    data() {
        return {
            searchQuery: '',
            username: this.$store.state.userInfo.username || '用户名',
            avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        };
    },
    methods: {
        handleCommand(command) {
            switch (command) {
                case 'profile':
                    this.$router.push('/profile');
                    break;
                case 'logout':
                    // Handle logout logic here
                    console.log('User logged out');
                    this.$router.push('/login');
                    break;
            }
        },
        performSearch() {
            if (!this.searchQuery.trim()) {
                console.log('Search query is empty');
                return;
            }
            console.log('Searching for:', this.searchQuery);
            // Add your search logic here, e.g., redirect to a search results page
            // this.$router.push({ path: '/search', query: { q: this.searchQuery } });
        }
    }
};
</script>

<style scoped>
.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    height: 60px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.header-left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    /* Prevent shrinking */
}

.logo {
    height: 40px;
    margin-right: 10px;
}

.site-name {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
}

.header-center {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    padding: 0 40px;
    /* Add some space around the search bar */
}

.header-search-input {
    max-width: 600px;
    width: 100%;
}

.header-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    /* Prevent shrinking */
}

.el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.username {
    margin-left: 10px;
    font-size: 16px;
    color: #606266;
}
</style>

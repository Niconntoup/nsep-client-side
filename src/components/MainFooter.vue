<template>
    <el-footer class="main-footer">
        <div class="footer-content">
            <div class="designer-info">
                <span>Designed by Niconntoup</span>
            </div>
            <div class="friendship-links">
                <span>友情链接:</span>
                <a v-for="link in links" :key="link.name" :href="link.url" target="_blank">{{ link.name }}</a>
            </div>
        </div>
    </el-footer>
</template>

<script>
export default {
    name: 'MainFooter',
    data() {
        return {
            links: [
                { name: 'GitHub', url: 'https://github.com' },
                { name: 'Vue.js', url: 'https://vuejs.org/' },
                { name: 'Element Plus', url: 'https://element-plus.org/' }
            ]
        };
    }
};
</script>

<style scoped>
.main-footer {
    background-color: #f5f7fa;
    color: #909399;
    padding: 20px 50px;
    border-top: 1px solid #e4e7ed;
    height: auto;
    text-align: center;
    /* Center text for all children */
}

.footer-content {
    display: flex;
    flex-direction: column;
    /* Stack items vertically */
    align-items: center;
    /* Center items horizontally */
    gap: 10px;
    /* Add space between the two lines */
    max-width: 1200px;
    margin: 0 auto;
}

.friendship-links {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    /* Allow links to wrap on smaller screens */
    justify-content: center;
    /* Center the links themselves */
}

.friendship-links span {
    font-weight: bold;
}

.friendship-links a {
    color: #606266;
    text-decoration: none;
    transition: color 0.3s;
}

.friendship-links a:hover {
    color: #409EFF;
}

.designer-info {
    font-style: italic;
}
</style>

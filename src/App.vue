<template>
  <div id="app-container">
    <MainHeader v-if="!isLoginPage" />
    <main class="content-area">
      <router-view></router-view>
    </main>
    <MainFooter v-if="!isLoginPage" />
  </div>
</template>

<script>
import MainHeader from './components/MainHeader.vue';
import MainFooter from './components/MainFooter.vue';

export default {
  name: "App",
  components: {
    MainHeader,
    MainFooter
  },
  computed: {
    isLoginPage() {
      return this.$route.path === '/login';
    }
  }
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-area {
  flex: 1;
  padding: 20px;
  padding-top: 80px;
  /* 60px for header + 20px for spacing */
  background-color: #f0f2f5;
  /* Apply background color here */
  overflow: hidden;
  /* Prevent scrolling on the content area itself */
}
</style>

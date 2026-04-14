<template>
  <div v-if="$route.path !== '/login'">
    <router-link to="login">登录</router-link>
  </div>
    <router-view></router-view>
</template>

<script setup>
  import {ref,reactive} from 'vue'
</script>

<style scoped>
</style>
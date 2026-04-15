<template>
  <div class="app-container">
   
    <aside class="sidebar">
     
      <div class="logo-container">
        
        <h2 class="system-title">颐养管理系统</h2>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <ul>
          <!-- 床位管理 -->
          <li class="menu-item">
            <div class="menu-title" @click="toggleMenu('BedManage')">
              <span>床位管理</span>
              <span :class="['arrow', { 'rotated': state.BedManage }]">▼</span>
            </div>
            <transition name="slide-down">
              <ul v-show="state.BedManage" class="submenu">
                <li><router-link to="/bedlayout">床位示意图</router-link></li>
                <li><router-link to="/bedmanagement">床位管理</router-link></li>
              </ul>
            </transition>
          </li>

          <!-- 客户管理 -->
          <li class="menu-item">
        <div class="menu-title" @click="toggleMenu('CustomerManage')">
          <span>客户管理</span>
          <span :class="['arrow', { 'rotated': state.CustomerManage }]">▼</span>
        </div>
        <transition name="slide-down">
          <ul v-show="state.CustomerManage" class="submenu">
            <!-- 原有子项 -->
            <li><router-link to="/customerlist">客户信息列表</router-link></li>
            <li><router-link to="/CheckInDialog">入住登记</router-link></li>
            <li><router-link to="/check-out">外出登记</router-link></li>
            <li><router-link to="/return-check">退住登记</router-link></li>
          </ul>
        </transition>
      </li>
          <!-- 护理管理 -->
          <li class="menu-item">
            <div class="menu-title" @click="toggleMenu('NursingManage')">
              <span>护理管理</span>
              <span :class="['arrow', { 'rotated': state.NursingManage }]">▼</span>
            </div>
            <transition name="slide-down">
              <ul v-show="state.NursingManage" class="submenu">
                <li><router-link to="/care-level">护理级别</router-link></li>
                <li><router-link to="/care-items">护理项目</router-link></li>
                <li><router-link to="/care-settings">客户护理设置</router-link></li>
                <li><router-link to="/care-records">护理记录</router-link></li>
              </ul>
            </transition>
          </li>

          <!-- 健康管家 -->
          <li class="menu-item">
            <div class="menu-title" @click="toggleMenu('HealthManager')">
              <span>健康管家</span>
              <span :class="['arrow', { 'rotated': state.HealthManager }]">▼</span>
            </div>
            <transition name="slide-down">
              <ul v-show="state.HealthManager" class="submenu">
                <li><router-link to="/service-targets">设置服务对象</router-link></li>
                <li><router-link to="/service-focus">服务关注</router-link></li>
              </ul>
            </transition>
          </li>

          <!-- 用户管理 -->
          <li class="menu-item">
            <div class="menu-title" @click="toggleMenu('UserManage')">
              <span>用户管理</span>
              <span :class="['arrow', { 'rotated': state.UserManage }]">▼</span>
            </div>
            <transition name="slide-down">
              <ul v-show="state.UserManage" class="submenu">
                <li><router-link to="/user-maintenance">基础数据维护</router-link></li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <header class="header">
        <!-- <div class="top-bar">
          <div class="logo-section">
            <span class="page-title">首页 / 床位示意图</span>
          </div>
          <div class="user-info">
            <span>admin</span>
            <select class="user-select">
              <option>admin</option>
            </select>
          </div>
        </div> -->
      </header>
      
      <div class="content-area">
        <!-- <div class="empty-content"> -->
          <h3>欢迎使用东软颐养中心管理系统</h3>
          <p>请点击左侧菜单展开子项，并点击具体功能进入页面。</p >
           <router-view />
        <!-- </div> -->
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

// 定义菜单展开状态
const state = reactive({
  BedManage: false,
  CustomerManage: false,
  NursingManage: false,
  HealthManager: false,
  UserManage: false
});

// 切换菜单展开/收起
const toggleMenu = (key) => {
  // 可选：如果希望每次只展开一个，可以先把其他都关闭
  // Object.keys(state).forEach(k => { if(k !== key) state[k] = false; });
  
  // 切换当前点击的菜单状态
  state[key] = !state[key];
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f0f2f5;
}

/* --- 左侧侧边栏 --- */
.sidebar {
  width: 220px;
  background-color: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #001529; /* 深色背景更像管理系统 */
}

.system-title {
  color: #fff;
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding-top: 10px;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 5px;
}

/* 一级菜单标题 */
.menu-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.menu-title:hover {
  color: #1890ff;
  background-color: #e6f7ff;
}

/* 箭头图标 */
.arrow {
  font-size: 12px;
  transition: transform 0.3s;
  color: #999;
}

.arrow.rotated {
  transform: rotate(180deg);
  color: #1890ff;
}

/* 二级子菜单 */
.submenu {
  background-color: #fafafa;
  overflow: hidden;
}

.submenu li a {
  display: block;
  padding: 10px 20px 10px 45px; /* 缩进显示层级 */
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.submenu li a:hover {
  color: #1890ff;
  background-color: #fff;
}

/* 激活状态的路由链接 */
.submenu li a.router-link-active {
  color: #1890ff;
  background-color: #e6f7ff;
  border-left-color: #1890ff;
}

/* --- 右侧主内容 --- */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 50px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.top-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 14px;
  color: #666;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.user-select {
  padding: 2px 5px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

.empty-content {
  background: #fff;
  padding: 40px;
  border-radius: 4px;
  text-align: center;
  color: #999;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

/* --- 动画效果 --- */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  max-height: 200px; /* 足够容纳子菜单的高度 */
  opacity: 1;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
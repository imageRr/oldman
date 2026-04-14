<template>
  <div class="app-container">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="logo-container">
        <h2 class="system-title">颐养管理系统123</h2>
      </div>

      <nav class="nav-menu">
        <ul>
          <li class="menu-item">
            <div class="menu-title" @click="toggleMenu('BedManage')">
              <span>床位管理</span>
              <span :class="['arrow', { 'rotated': state.BedManage }]">▼</span>
            </div>
            <transition name="slide-down">
              <ul v-show="state.BedManage" class="submenu">
                <li><router-link to="/bed-layout">床位示意图</router-link></li>
                <li><router-link to="/bed-management">床位管理</router-link></li>
              </ul>
            </transition>
          </li>

          <li class="menu-item">
            <div class="menu-title" @click="toggleMenu('CustomerManage')">
              <span>客户管理</span>
              <span :class="['arrow', { 'rotated': state.CustomerManage }]">▼</span>
            </div>
            <transition name="slide-down">
              <ul v-show="state.CustomerManage" class="submenu">
                <li><router-link to="/check-in">入住登记</router-link></li>
                <li><router-link to="/check-out">外出登记</router-link></li>
                <li><router-link to="/return-check">退住登记</router-link></li>
              </ul>
            </transition>
          </li>

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
        <div class="top-bar">
          <div class="logo-section">
            <span class="page-title">首页 / 健康管家</span>
          </div>
          <div class="user-info">
            <span>admin</span>
          </div>
        </div>

        <!-- 🔥 顶部导航条：客户列表同级切换栏 -->
        <div class="top-nav-tabs">
          <div
            class="nav-tab"
            :class="{ active: currentTab === 'customerList' }"
            @click="switchTab('customerList')"
          >
            客户列表
          </div>
          <div
            class="nav-tab"
            :class="{ active: currentTab === 'careItems' }"
            @click="switchTab('careItems')"
          >
            客户护理项目
          </div>
          <div
            class="nav-tab"
            :class="{ active: currentTab === 'careRecords' }"
            @click="switchTab('careRecords')"
          >
            护理记录
          </div>
          <div
            class="nav-tab"
            :class="{ active: currentTab === 'outApply' }"
            @click="switchTab('outApply')"
          >
            外出申请
          </div>
          <div
            class="nav-tab"
            :class="{ active: currentTab === 'checkOut' }"
            @click="switchTab('checkOut')"
          >
            退住申请
          </div>
        </div>
      </header>

      <div class="content-area">
        <!-- 客户列表 -->
        <div v-show="currentTab === 'customerList'">
          <!-- 你原来的客户列表内容直接放这里 -->
          <div class="page-container">
            <div class="search-area">
              <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="客户姓名">
                  <el-input v-model="searchForm.name" placeholder="请输入客户姓名" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">查询</el-button>
                  <el-button @click="handleReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table :data="tableData" border style="width: 100%" :loading="loading">
              <el-table-column prop="id" label="序号" width="80" align="center" />
              <el-table-column prop="name" label="客户姓名" width="120" align="center" />
              <el-table-column prop="age" label="年龄" width="80" align="center" />
              <el-table-column prop="gender" label="性别" width="80" align="center" />
              <el-table-column prop="roomNo" label="房间号" width="100" align="center" />
              <el-table-column prop="bedNo" label="床号" width="100" align="center" />
              <el-table-column prop="floor" label="所属楼房" width="100" align="center" />
              <el-table-column prop="phone" label="联系电话" width="150" align="center" />
              <el-table-column prop="careLevel" label="护理级别" width="100" align="center" />
              <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="openDailyCare(scope.row)">
                    日常护理
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10,20,50]"
              :total="total"
              layout="total,sizes,prev,pager,next,jumper"
              class="pagination"
            />
          </div>
        </div>

        <!-- 客户护理项目 -->
        <div v-show="currentTab === 'careItems'">
          <div class="page-container">
            <h3>客户护理项目</h3>
            <el-table :data="careItemList" border style="width:100%">
              <el-table-column label="客户" prop="customerName" align="center" />
              <el-table-column label="护理项目" prop="itemName" align="center" />
              <el-table-column label="护理次数" prop="count" align="center" />
            </el-table>
          </div>
        </div>

        <!-- 护理记录 -->
        <div v-show="currentTab === 'careRecords'">
          <div class="page-container">
            <h3>护理记录</h3>
            <el-table :data="careRecordList" border style="width:100%">
              <el-table-column label="客户" prop="customerName" align="center" />
              <el-table-column label="项目" prop="item" align="center" />
              <el-table-column label="时间" prop="time" align="center" />
            </el-table>
          </div>
        </div>

        <!-- 外出申请 -->
        <div v-show="currentTab === 'outApply'">
          <div class="page-container">
            <h3>外出申请</h3>
            <el-table :data="outApplyList" border style="width:100%">
              <el-table-column label="客户" prop="customerName" align="center" />
              <el-table-column label="事由" prop="reason" align="center" />
              <el-table-column label="状态" prop="status" align="center" />
            </el-table>
          </div>
        </div>

        <!-- 退住申请 -->
        <div v-show="currentTab === 'checkOut'">
          <div class="page-container">
            <h3>退住申请</h3>
            <el-table :data="checkOutList" border style="width:100%">
              <el-table-column label="客户" prop="customerName" align="center" />
              <el-table-column label="退住类型" prop="type" align="center" />
              <el-table-column label="状态" prop="status" align="center" />
            </el-table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 菜单展开
const state = reactive({
  BedManage: false,
  CustomerManage: false,
  NursingManage: false,
  HealthManager: false,
  UserManage: false
})
const toggleMenu = (key) => { state[key] = !state[key] }

// 🔥 顶部标签切换
const currentTab = ref('customerList')
const switchTab = (tab) => {
  currentTab.value = tab
}

// 客户列表数据
const tableData = ref([])
const loading = ref(false)
const total = ref(2)
const currentPage = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ name: '' })

const mockData = [
  { id:1, name:'孙瑞英', age:68, gender:'女', roomNo:'2012', bedNo:'2012-1', floor:'606', phone:'18167564213', careLevel:'二级' },
  { id:2, name:'张帆', age:77, gender:'女', roomNo:'1014', bedNo:'1014-1', floor:'606', phone:'17745189064', careLevel:'' }
]

const initTable = () => { tableData.value = mockData }
const handleSearch = () => { initTable() }
const handleReset = () => { searchForm.name = ''; initTable() }
const openDailyCare = (row) => { ElMessage.success('打开日常护理：'+row.name) }

// 模拟其他列表
const careItemList = ref([{ customerName:'孙瑞英', itemName:'测血压', count:5 }])
const careRecordList = ref([{ customerName:'孙瑞英', item:'测血压', time:'2026-04-14' }])
const outApplyList = ref([{ customerName:'孙瑞英', reason:'家属探望', status:'待审核' }])
const checkOutList = ref([{ customerName:'孙瑞英', type:'正常退住', status:'待审批' }])

onMounted(() => { initTable() })
</script>

<style scoped>
.app-container { display: flex; height: 100vh; font-family: 'Microsoft YaHei'; background: #f0f2f5; }
.sidebar { width: 220px; background: #fff; border-right: 1px solid #e8e8e8; display: flex; flex-direction: column; }
.logo-container { height: 60px; display: flex; align-items: center; justify-content: center; background: #001529; }
.system-title { color: #fff; font-size: 16px; margin: 0; font-weight: 600; }
.nav-menu { flex: 1; overflow-y: auto; padding-top: 10px; }
.nav-menu ul { list-style: none; padding: 0; margin: 0; }
.menu-item { margin-bottom: 5px; }
.menu-title { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; color: #333; font-weight: 500; cursor: pointer; }
.menu-title:hover { color: #1890ff; background: #e6f7ff; }
.arrow { font-size: 12px; transition: transform 0.3s; color: #999; }
.arrow.rotated { transform: rotate(180deg); color: #1890ff; }
.submenu { background: #fafafa; overflow: hidden; }
.submenu li a { display: block; padding: 10px 20px 10px 45px; color: #666; text-decoration: none; font-size: 14px; }
.submenu li a:hover { color: #1890ff; background: #fff; }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* 顶部条 */
.header { background: #fff; border-bottom: 1px solid #e8e8e8; }
.top-bar { height: 50px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.page-title { font-size: 14px; color: #666; }
.user-info { font-size: 14px; }

/* 🔥 顶部导航标签样式 */
.top-nav-tabs {
  display: flex;
  height: 44px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  gap: 2px;
}
.nav-tab {
  padding: 0 20px;
  height: 44px;
  line-height: 44px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
}
.nav-tab.active {
  color: #1890ff;
  font-weight: 500;
}
.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 15px;
  right: 15px;
  height: 2px;
  background: #1890ff;
}

.content-area { flex: 1; padding: 20px; overflow-y: auto; background: #f0f2f5; }
.page-container { background: #fff; padding: 15px; border-radius: 4px; }
.search-area { margin-bottom: 15px; padding: 15px; background: #f5f7fa; border-radius: 4px; }
.pagination { margin-top: 15px; text-align: right; }

.slide-down-enter-active, .slide-down-leave-active {
  transition: max-height 0.3s, opacity 0.3s; max-height: 300px;
}
.slide-down-enter-from, .slide-down-leave-to { max-height: 0; opacity: 0; }
</style>
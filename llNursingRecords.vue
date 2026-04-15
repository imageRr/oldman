<template>
  <div class="nursing-records-container">
    <!-- 1. 顶部查询区域 -->
    <div class="search-box">
      <el-input
        v-model="queryParams.name"
        placeholder="请输入客户姓名进行模糊查询"
        clearable
        @keyup.enter="handleQuery"
        style="width: 200px; margin-right: 10px;"
      />
      <el-button type="primary" @click="handleQuery">查询</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <!-- 2. 主体内容：左右分栏 -->
    <div class="main-content">
      <!-- 左侧：客户信息 -->
      <div class="left-panel">
        <div class="table-title">客户信息</div>
        <el-table
          :data="customerList"
          highlight-current-row
          @current-change="handleCustomerClick"
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column type="index" label="序号" width="60" text-align="center" />
          <el-table-column prop="name" label="姓名" text-align="center" />
          <el-table-column prop="age" label="年龄" width="60" text-align="center" />
          <el-table-column prop="gender" label="性别" width="60" text-align="center" />
          <el-table-column prop="bedNumber" label="床号" text-align="center" />
          <el-table-column prop="levelName" label="护理级别" text-align="center" />
        </el-table>

        <!-- 左侧分页 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="customerTotal"
            v-model:current-page="queryParams.pageNum"
            :page-size="queryParams.pageSize"
            @current-change="handleQuery"
          />
        </div>
      </div>

      <!-- 右侧：护理记录 -->
      <div class="right-panel">
        <div class="table-title">
          护理记录 
          <span v-if="currentCustomer" style="font-size: 14px; font-weight: normal; margin-left: 10px;">
            (客户: {{ currentCustomer.name }})
          </span>
        </div>
        
        <div v-if="!currentCustomer" class="empty-tip">
          请在左侧选择一位客户以查看其护理记录
        </div>

        <el-table
          v-else
          :data="recordList"
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column type="index" label="序号" width="60" text-align="center" />
          <el-table-column prop="projectCode" label="护理项目编号" text-align="center" />
          <el-table-column prop="projectName" label="护理项目名称" text-align="center" />
          <el-table-column prop="quantity" label="护理数量" width="80" text-align="center" />
          <el-table-column prop="content" label="护理内容" text-align="center" show-overflow-tooltip />
          <el-table-column prop="nurseName" label="护理人员" width="80" text-align="center" />
          <el-table-column prop="nursePhone" label="护理人员手机" width="120" text-align="center" />
          <el-table-column prop="recordTime" label="护理时间" width="120" text-align="center" />
          <el-table-column label="操作" width="80" text-align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="danger"
                link
                size="small"
                @click="handleRemoveRecord(scope.row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 右侧分页 -->
        <div class="pagination-container" v-if="currentCustomer">
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="recordTotal"
            v-model:current-page="recordQueryParams.pageNum"
            :page-size="recordQueryParams.pageSize"
            @current-change="fetchRecords"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 1. 客户信息查询相关 ---
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '' // 模糊查询字段
})

const customerList = ref([])
const customerTotal = ref(0)
const loading = ref(false)
const currentCustomer = ref(null) // 当前选中的客户对象

// 模拟全量客户数据 (实际项目中应从后端获取全部或分页数据)
const allMockCustomers = [
  { id: 1, name: '孙端英', age: 68, gender: '女', bedNumber: '2012-1', levelName: '二级' },
  { id: 2, name: '张帆', age: 77, gender: '男', bedNumber: '1014-1', levelName: '三级' },
  { id: 3, name: '苗月兰', age: 67, gender: '女', bedNumber: '2005-1', levelName: '一级' },
  { id: 4, name: '李建国', age: 82, gender: '男', bedNumber: '3005-2', levelName: '一级' },
  { id: 5, name: '王秀兰', age: 75, gender: '女', bedNumber: '1001-1', levelName: '一级' },
]

// 模拟查询客户列表 (实现模糊查询)
const handleQuery = () => {
  loading.value = true
  
  // 模拟 API 请求延迟
  setTimeout(() => {
    let filteredList = allMockCustomers

    // 【核心修改】实现模糊查询
    if (queryParams.name && queryParams.name.trim() !== '') {
      const keyword = queryParams.name.toLowerCase()
      filteredList = allMockCustomers.filter(item => 
        item.name.toLowerCase().includes(keyword)
      )
    }

    // 模拟分页逻辑 (前端切片)
    customerTotal.value = filteredList.length
    const start = (queryParams.pageNum - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    customerList.value = filteredList.slice(start, end)
    
    loading.value = false
  }, 300)
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.pageNum = 1
  handleQuery()
}

// --- 2. 护理记录查询相关 ---
const recordQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerId: null // 根据选中的客户ID查询
})

const recordList = ref([])
const recordTotal = ref(0)

// 当点击左侧表格行时触发
const handleCustomerClick = (row) => {
  if (row) {
    currentCustomer.value = row
    recordQueryParams.customerId = row.id
    recordQueryParams.pageNum = 1 // 重置页码
    fetchRecords()
  }
}

// 模拟全量护理记录数据 (Key为客户ID)
const allMockRecords = {
  1: [
    { id: 101, customerId: 1, projectCode: 'HLXM0001', projectName: '吸氧', quantity: 1, content: '常规吸氧护理，观察血氧饱和度', nurseName: '吴伟', nursePhone: '13517178987', recordTime: '2023-11-24 09:00' },
    { id: 102, customerId: 1, projectCode: 'HLXM0002', projectName: '协助服药', quantity: 1, content: '协助服用降压药', nurseName: '吴伟', nursePhone: '13517178987', recordTime: '2023-11-24 10:00' },
    { id: 103, customerId: 1, projectCode: 'HLXM0005', projectName: '测量血压', quantity: 1, content: '血压正常', nurseName: '李娜', nursePhone: '13800001111', recordTime: '2023-11-24 14:00' },
  ],
  2: [
    { id: 201, customerId: 2, projectCode: 'HLXM0003', projectName: '翻身拍背', quantity: 1, content: '每2小时翻身一次', nurseName: '赵敏', nursePhone: '13900002222', recordTime: '2023-11-24 08:00' },
  ],
  // 其他客户暂无记录
}

// 查询护理记录
const fetchRecords = () => {
  if (!recordQueryParams.customerId) {
    recordList.value = []
    recordTotal.value = 0
    return
  }

  loading.value = true
  
  // 模拟 API 请求
  setTimeout(() => {
    // 获取该客户的所有记录
    const customerRecords = allMockRecords[recordQueryParams.customerId] || []
    
    // 模拟分页
    recordTotal.value = customerRecords.length
    const start = (recordQueryParams.pageNum - 1) * recordQueryParams.pageSize
    const end = start + recordQueryParams.pageSize
    recordList.value = customerRecords.slice(start, end)
    
    loading.value = false
  }, 300)
}

// --- 3. 移除护理记录 (实现隐藏/删除逻辑) ---
const handleRemoveRecord = (row) => {
  if (!currentCustomer.value) return

  ElMessageBox.confirm(
    `确定要移除客户 "${currentCustomer.value.name}" 的护理记录 "${row.projectName}" 吗？\n此操作将隐藏该条记录。`, 
    '警告', 
    {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 【核心修改】实现真正的移除逻辑
    
    // 1. 从当前显示的列表中移除
    const index = recordList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      recordList.value.splice(index, 1)
      recordTotal.value-- // 更新总数
    }

    // 2. (可选) 如果需要在内存全量数据中也移除，防止翻页后又出现
    // 在实际项目中，这里应该调用后端 API: deleteNursingRecord(row.id)
    // 假设调用成功：
    /*
    api.deleteRecord(row.id).then(() => {
       ElMessage.success('移除成功')
       fetchRecords() // 重新拉取最新数据
    })
    */
   
    ElMessage.success('移除成功')
    
    // 如果当前页数据为空且不是第一页，自动跳回上一页
    if (recordList.value.length === 0 && recordQueryParams.pageNum > 1) {
      recordQueryParams.pageNum--
      fetchRecords()
    }

  }).catch(() => {
    // 用户取消操作
  })
}

// 初始化加载客户列表
handleQuery()
</script>

<style scoped>
.nursing-records-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 顶部查询框 */
.search-box {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

/* 主体左右布局 */
.main-content {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.left-panel, .right-panel {
  width: 49%; /* 稍微调整宽度以适应间隙 */
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 蓝色表头样式 */
.table-title {
  background-color: #409EFF; /* Element UI 主色 */
  color: white;
  padding: 10px 15px;
  font-weight: bold;
  font-size: 16px;
  margin: -15px -15px 15px -15px; /* 让标题背景延伸到边缘 */
  border-radius: 4px 4px 0 0;
}

.empty-tip {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

/* 分页组件位置 */
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
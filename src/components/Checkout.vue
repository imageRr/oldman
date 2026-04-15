<template>
  <!--最外层容器-->
  <div class="out">
    <el-card class="box-card">
      
      <!--卡片头部-->
      <template #header>
        <div class="card-header">
          <span>📋 退住登记</span>
          <!-- 标签，放在右边 -->
          <el-tag type="info" effect="plain">申请退住 & 审批管理</el-tag>
        </div>
      </template>

      <!-- 查询区域 -->
      <div class="searchout">
        <div class="searchform">
          <el-input 
            v-model="searchName"
            placeholder="客户姓名" 
            clearable
            style="width: 200px"
          />
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <!-- 退住申请记录表格 -->
      <div class="application-table-section">
        <h4 class="section-title">📋 退住申请记录</h4>
        <el-table :data="searchResult" border>
          
          <el-table-column prop="customerName" label="客户姓名" />
          
          <el-table-column prop="checkInDate" label="入住时间" />
          
          <el-table-column prop="checkOutDate" label="退住时间" />
          
          <el-table-column prop="checkOutType" label="退住类型" />
          
          <el-table-column prop="reason" label="退住原因" />
          
          <el-table-column prop="approvalDate" label="审批时间" />
          
          <el-table-column label="审批状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'pending'" type="warning">待审批</el-tag>
              <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
              <el-tag v-else-if="row.status === 'rejected'" type="danger">不通过</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="bedNo" label="床位" />

          <!-- 操作按钮 -->
          <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
              <template v-if="row.status === 'pending'">
                <el-button type="success" size="small" plain @click="approve(row.id)">通过</el-button>
                <el-button type="danger" size="small" plain @click="reject(row.id)">驳回</el-button>
              </template>
              <span v-else style="color: #909399;">已处理</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="0"
          />
        </div>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 搜索关键词
const searchName = ref('')

// 搜索结果（根据搜索关键词筛选）
const searchResult = computed(() => {
  if (!searchName.value) {
    return checkoutApplications.value
  }
  return checkoutApplications.value.filter(item => 
    item.customerName.includes(searchName.value)
  )
})

// 查询方法
const handleSearch = () => {
  // 计算属性会自动响应 searchName 的变化
  console.log('查询:', searchName.value)
}

// 通过审批
const approve = (id) => {
  const item = checkoutApplications.value.find(item => item.id === id)
  if (item && item.status === 'pending') {
    item.status = 'approved'
  }
}

// 驳回审批
const reject = (id) => {
  const item = checkoutApplications.value.find(item => item.id === id)
  if (item && item.status === 'pending') {
    item.status = 'rejected'
  }
}

// 预设的退住申请记录数据
const checkoutApplications = ref([
  {
    id: 1,
    customerName: '孙瑞英',
    checkInDate: '2023-11-10',
    checkOutDate: '2023-11-15',
    checkOutType: '正常退住',
    reason: '家国有安排',
    approvalDate: '2023-12-30',
    bedNo: '1201-1',
    status: 'approved'
  },
  {
    id: 2,
    customerName: '孙瑞英',
    checkInDate: '2023-11-10',
    checkOutDate: '2023-11-20',
    checkOutType: '保留床位',
    reason: '回家看看',
    approvalDate: '2023-12-30',
    bedNo: '1201-1',
    status: 'rejected'
  },
  {
    id: 3,
    customerName: '孙瑞英',
    checkInDate: '2023-11-10',
    checkOutDate: '2023-12-30',
    checkOutType: '死亡退住',
    reason: '因病去世',
    approvalDate: '2023-12-30',
    bedNo: '1201-1',
    status: 'pending'
  }
])
</script>

<style scoped>
/* 最外层的div */
.out {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

/* 卡片样式 */
.box-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 卡片头*/
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
}

/* 解决标题和标签距离太近的问题 */
.card-header span {
  margin-right: 20px;
}

/* 查询的输入框和按钮 */
.searchout {
  margin-bottom: 20px;
}

.searchform {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 表格标题 */
.section-title {
  margin: 16px 0 12px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

/* 退住申请记录的表格 */
.application-table-section {
  margin-top: 30px;
}

/* 分页组件 */
.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

/* 表格内部样式优化 */
.el-table {
  border-radius: 4px;
  overflow: hidden;
}

/* 表格操作按钮之间的间距 */
.el-table .el-button + .el-button {
  margin-left: 8px;
}
</style>
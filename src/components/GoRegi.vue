<template>
  <!--最外层容器-->
  <div class="out">
    <el-card class="box-card">

      <!--卡片头部-->
      <template #header>
        <div class="card-header">
          <span>📋 外出登记</span>
          <!-- 标签，放在右边 -->
          <el-tag type="info" effect="plain">申请外出 & 审批管理</el-tag>
        </div>
      </template>

      <!-- 查询区域 -->
      <div class="searchout">
        <div class="searchform">
          <el-input v-model="searchName" placeholder="客户姓名" clearable style="width: 200px" />
          <el-button type="primary">查询</el-button>
        </div>
      </div>

      <!-- 外出申请记录表格 -->
      <div class="goouttable">
        <h4 class="goootitle">📋 外出申请记录</h4>
        <el-table :data="searchResult" border>
          <el-table-column prop="customerName" label="客户姓名" />
          <el-table-column prop="reason" label="外出事由" />
          <el-table-column prop="goOutTime" label="外出时间" />
          <el-table-column prop="expectedReturnTime" label="预计回院时间" />
          <el-table-column prop="actualReturnTime" label="实际回院时间" />
          <el-table-column prop="companion" label="陪同人" />
          <el-table-column prop="relationship" label="与老人关系" />
          <el-table-column prop="companionPhone" label="陪同人电话" />

          <el-table-column label="审批状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'pending'" type="warning">待审批</el-tag>
              <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
              <el-tag v-else-if="row.status === 'rejected'" type="danger">不通过</el-tag>
            </template>
          </el-table-column>

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
          <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="0" />
        </div>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 搜索关键词
const searchName = ref('')
const searchResult = computed(() => {
  if (!searchName.value) {
    return gooutApplications.value
  }
  return gooutApplications.value.filter(item => 
    item.customerName.includes(searchName.value)
  )
})

// 通过id进行审批，只有状态是待审批才能审批
// 通过审批
const approve = (id) => {
  const item = gooutApplications.value.find(item => item.id === id)
  if (item && item.status === 'pending') {
    item.status = 'approved'
  }
}

// 驳回审批
const reject = (id) => {
  const item = gooutApplications.value.find(item => item.id === id)
  if (item && item.status === 'pending') {
    item.status = 'rejected'
  }
}

// 因为还没连上所以先预设的外出申请记录数据
const gooutApplications = ref([
  {
    id: 1,
    customerName: '孙瑞英',
    reason: '回家',
    goOutTime: '2023-11-03',
    expectedReturnTime: '2023-11-04',
    actualReturnTime: '2023-11-04',
    companion: '孙丽',
    relationship: '子女',
    companionPhone: '13456786754',
    status: 'approved'  // approved / rejected / pending
  },
  {
    id: 2,
    customerName: '张帆',
    reason: '买东西',
    goOutTime: '2023-11-10',
    expectedReturnTime: '2023-11-11',
    actualReturnTime: '',
    companion: '张明',
    relationship: '子女',
    companionPhone: '13812345678',
    status: 'rejected'
  },
  {
    id: 3,
    customerName: '苗月兰',
    reason: '学习',
    goOutTime: '2023-11-15',
    expectedReturnTime: '2023-11-16',
    actualReturnTime: '',
    companion: '苗华',
    relationship: '子女',
    companionPhone: '13987654321',
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

/* 第二个表格上边的标题 */
.goootitle {
  margin: 16px 0 12px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  font-weight: bold;
}

/* 外出申请记录的表格 */
.goouttable {
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
.el-table .el-button+.el-button {
  margin-left: 8px;
}
</style>
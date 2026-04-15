<!-- src/components/customerlist.vue -->
<template>
  <div class="customer-list-page">
    <h3>客户信息列表</h3>
    
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 客信息表格 -->
    <el-table :data="filteredCustomers" border stripe style="width: 100%">
      <!-- 固定列：序号 -->
      <el-table-column type="index" label="序号" width="60" fixed="left" />

      <!-- 核心信息列 -->
      <el-table-column prop="elderName" label="姓名" width="120" />
      <el-table-column prop="gender" label="性别" width="80">
        <template #default="{ row }">
          <span>{{ row.gender === 'M' ? '男' : '女'}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="roomNo" label="房间号" width="100" />
      <el-table-column prop="bedInfo" label="床位号" width="120" />
      <el-table-column prop="startDate" label="入住时间" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="editCustomer(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCustomer(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页插件 -->
    <div style="margin-top: 20px; text-align: center;">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { bedStore } from '@/store';

const searchForm = ref({name: ''});
const currentPage = ref(1);
const pageSize = ref(10);

// 获取所有客户（从床位中提取）
const allCustomers = computed(() => {
  const list = [];
  bedStore.rooms.forEach(floor => {
    floor.list.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.elderName && !list.some(c => c.id === bed.id)) {
          list.push({
            id: bed.id,
            elderName: bed.elderName,
            gender: bed.gender,
            roomNo: room.roomNo,
            bedInfo: `${room.roomNo}-${bed.bedNo}`,
            startDate: bed.startDate,
            status: bed.status
          });
        }
      });
    });
  });
  return list;
});

const filteredCustomers = computed(() => {
  let data =allCustomers.value;
  if (searchForm.value.name) {
    data = data.filter(item => item.elderName.includes(searchForm.value.name));
  }
  return data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const total = computed(() =>allCustomers.value.length);

const getStatusLabel = (status) => {
  const map = { 'occupied': '在住', 'out': '外出', 'maintain': '维修', 'empty': '空闲' };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = { 'occupied': 'success', 'out': 'warning', 'maintain': 'info', 'empty': '' };
  return map[status] || '';
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const editCustomer = (row) => {
  // 这里可以打开一个弹窗来编辑客户信息
  ElMessage.info(`编辑客户：${row.elderName}`);
};

const deleteCustomer = (row) => {
  ElMessageBox.confirm(
    `确定要删除${row.elderName}的记录吗？`,
    '提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    // 1. 从 bedStore.rooms 中移除该客户的的入住信息
    for (let floor of bedStore.rooms) {
      for (let room of floor.list) {
        const bedIndex = room.beds.findIndex(b => b.id === row.id);
        if (bedIndex !== -1) {
          // 将床位state改为 "empty" 并其他信息清空
          room.beds[bedIndex].status = 'empty';
          room.beds[bedIndex].elderName = '';
          room.beds[bedIndex].gender = '';
          room.beds[bedIndex].startDate = null;
          break;
        }
      }
    }

    // 2. 从 bedStore.customers 中移除该客户的详细档案
    const customerIndex = bedStore.customers.findIndex(c => c.id === row.id);
    if (customerIndex !== -1) {
      bedStore.customers.splice(customerIndex, 1);
    }

    ElMessage.success('删除成功');
  }).catch(() => {});
};
</script>

<style scoped>
.customer-list-page {
  padding: 20px;
}

/* 美化表格 */
el-table {
  --el-table-border-color: #ebeef5;
  --el-table-header-background-color: #f5f7fa;
  --el-table-header-text-color: #909399;
  --el-table-row-hover-bg-color: #f5f7fa;
}

/* 美化表头 */
el-table th {
  font-weight: 600;
  color: #303133;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

/* 美化单元格 */
el-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

/* 美化标签 */
el-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
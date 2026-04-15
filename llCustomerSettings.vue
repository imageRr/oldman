<template>
  <div class="customer-settings-container">
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

    <!-- 2. 客户信息表格 -->
    <el-table
      :data="customerList"
      style="width: 100%; margin-top: 20px"
      border
      v-loading="loading"
      stripe
    >
      <el-table-column type="index" label="序号" width="60" text-align="center" />
      <el-table-column prop="name" label="客户姓名" text-align="center" />
      <el-table-column prop="age" label="年龄" width="80" text-align="center" />
      <el-table-column prop="gender" label="性别" width="80" text-align="center" />
      <el-table-column prop="roomNo" label="房间号" text-align="center" />
      <el-table-column prop="bedNo" label="床号" text-align="center" />
      <el-table-column prop="building" label="所属楼房" text-align="center" />
      <el-table-column prop="phone" label="联系电话" text-align="center" />
      <el-table-column prop="levelName" label="当前护理级别" text-align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.levelName" type="success">{{ scope.row.levelName }}</el-tag>
          <span v-else style="color: #909399;">未设置</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" text-align="center" fixed="right">
        <template #default="scope">
          <!-- 如果没有级别，显示设置按钮 -->
          <el-button
            v-if="!scope.row.levelId"
            type="primary"
            link
            @click="openSettingDialog(scope.row)"
          >
            设置护理级别
          </el-button>

          <!-- 如果有级别，显示移除按钮 -->
          <el-button
            v-else
            type="danger"
            link
            @click="handleRemoveLevel(scope.row)"
          >
            移除护理级别
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="queryParams.pageSize"
        v-model:current-page="queryParams.pageNum"
        @current-change="fetchCustomerList"
      />
    </div>

    <!-- 3. 设置护理级别弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`设置护理级别 - ${currentCustomer.name}`"
      width="900px"
      @close="resetDialog"
      destroy-on-close
    >
      <el-alert
        title="注意：更改护理级别需先移除原有级别。此处仅为首次设置或重新设置。"
        type="info"
        show-icon
        style="margin-bottom: 15px;"
      />
      
      <el-form :model="form" label-width="120px">
        <!-- 选择护理级别 -->
        <el-form-item label="护理级别" required>
          <el-select
            v-model="form.levelId"
            placeholder="请选择护理级别"
            @change="handleLevelChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 全局购买日期提示 -->
        <el-form-item label="服务购买日期">
          <el-date-picker
            v-model="form.purchaseDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            disabled
            style="width: 100%"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 5px;">
            * 默认为当前系统时间，所有项目共用此购买日期
          </div>
        </el-form-item>

        <!-- 护理项目列表 -->
        <div v-if="form.projectList.length > 0" style="margin-top: 20px;">
          <div style="margin-bottom: 10px; font-weight: bold;">关联护理项目详情：</div>
          <el-table 
            :data="form.projectList" 
            style="width: 100%" 
            border 
            size="small"
          >
            <el-table-column type="index" label="序号" width="50" text-align="center" />
            <el-table-column prop="code" label="编号" text-align="center" width="100" />
            <el-table-column prop="name" label="项目名称" text-align="center" />
            <el-table-column prop="price" label="单价" text-align="center" width="100" />
            <el-table-column prop="cycle" label="执行周期" text-align="center" width="100" />
            <el-table-column prop="count" label="单次次数" text-align="center" width="100" />
            
            <el-table-column label="购买数量" text-align="center" width="120">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  size="small"
                  controls-position="right"
                />
              </template>
            </el-table-column>

            <el-table-column label="服务到期日期" text-align="center">
              <template #default="scope">
                <el-date-picker
                  v-model="scope.row.expireDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else-if="form.levelId" style="text-align: center; padding: 20px; color: #909399;">
          该级别下暂无配置项目
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSettings" :disabled="!form.levelId">确定设置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 模拟数据 ---
const mockCustomers = [
  { id: 1, name: '孙瑞英', age: 68, gender: '女', roomNo: '2012', bedNo: '2012-1', building: '606', phone: '18167564213', levelId: null, levelName: '' },
  { id: 2, name: '张帆', age: 77, gender: '女', roomNo: '1014', bedNo: '1014-1', building: '606', phone: '17745189064', levelId: 1, levelName: '一级护理' },
  { id: 3, name: '李建国', age: 82, gender: '男', roomNo: '3005', bedNo: '3005-2', building: '606', phone: '13900001111', levelId: null, levelName: '' },
  { id: 4, name: '王秀兰', age: 75, gender: '女', roomNo: '1001', bedNo: '1001-1', building: '606', phone: '13800002222', levelId: 2, levelName: '二级护理' },
]

const mockLevels = [
  { id: 1, name: '一级护理' },
  { id: 2, name: '二级护理' },
  { id: 3, name: '三级护理' },
]

// 模拟不同级别对应的项目配置
const mockLevelProjects = {
  1: [
    { id: 101, code: 'HLXM0001', name: '吸氧', price: '60元/次', cycle: '每天', count: 2 },
    { id: 102, code: 'HLXM0002', name: '协助服药', price: '免费', cycle: '每天', count: 3 },
    { id: 103, code: 'HLXM0005', name: '测量血压', price: '10元/次', cycle: '每天', count: 1 },
  ],
  2: [
    { id: 201, code: 'HLXM0003', name: '翻身拍背', price: '20元/次', cycle: '每2小时', count: 12 },
    { id: 202, code: 'HLXM0004', name: '口腔护理', price: '30元/次', cycle: '每天', count: 2 },
  ],
  3: [
    { id: 301, code: 'HLXM0001', name: '吸氧', price: '60元/次', cycle: '每天', count: 4 },
    { id: 302, code: 'HLXM0006', name: '全身擦浴', price: '50元/次', cycle: '每天', count: 1 },
    { id: 303, code: 'HLXM0007', name: '专业陪护', price: '200元/天', cycle: '每天', count: 1 },
  ]
}

// --- 状态定义 ---
const customerList = ref([])
const loading = ref(false)
const total = ref(0)
const levelOptions = ref([])

const queryParams = reactive({
  name: '',
  pageNum: 1,
  pageSize: 10
})

// 弹窗相关
const dialogVisible = ref(false)
const currentCustomer = ref({})

const form = reactive({
  customerId: null,
  levelId: null,
  purchaseDate: '', // 全局购买日期
  projectList: []   // 项目列表，包含每个项目的数量和到期日
})

// --- 方法 ---

// 辅助函数：格式化日期 YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 1. 查询客户列表 (实现模糊查询)
const fetchCustomerList = () => {
  loading.value = true
  // 模拟 API 调用延迟
  setTimeout(() => {
    let list = mockCustomers
    
    // 模糊查询逻辑
    if (queryParams.name && queryParams.name.trim() !== '') {
      const keyword = queryParams.name.toLowerCase()
      list = list.filter(c => c.name.toLowerCase().includes(keyword))
    }

    total.value = list.length
    
    // 模拟分页切片
    const start = (queryParams.pageNum - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    customerList.value = list.slice(start, end)
    
    loading.value = false
  }, 300)
}

const handleQuery = () => {
  queryParams.pageNum = 1
  fetchCustomerList()
}

const resetQuery = () => {
  queryParams.name = ''
  handleQuery()
}

// 2. 打开设置弹窗
const openSettingDialog = (row) => {
  currentCustomer.value = row
  form.customerId = row.id
  form.levelId = null
  form.projectList = []
  form.purchaseDate = formatDate(new Date()) // 默认当前时间
  
  dialogVisible.value = true

  // 加载护理级别选项
  levelOptions.value = mockLevels
}

// 3. 选择护理级别后，加载对应项目并初始化默认值
const handleLevelChange = (val) => {
  const projects = mockLevelProjects[val] || []
  
  // 计算默认到期日期：当前时间 + 3个月
  const today = new Date()
  const expireDateObj = new Date()
  expireDateObj.setMonth(today.getMonth() + 3)
  const defaultExpireDate = formatDate(expireDateObj)

  // 映射项目数据，添加默认的数量和到期日
  form.projectList = projects.map(p => ({
    ...p,
    quantity: 1, // 默认数量为1
    expireDate: defaultExpireDate // 默认3个月后到期
  }))
}

// 4. 提交设置
const submitSettings = () => {
  if (!form.levelId) {
    ElMessage.warning('请选择护理级别')
    return
  }
  
  if (form.projectList.length === 0) {
     ElMessage.warning('当前选中的级别没有可配置的项目')
     // 根据业务需求，这里可以选择允许保存空项目，或者禁止。此处假设必须有项目或允许空，仅提示
  }

  // 模拟后端保存逻辑
  console.log('提交数据:', {
    customerId: form.customerId,
    levelId: form.levelId,
    purchaseDate: form.purchaseDate,
    projects: form.projectList
  })

  // 更新本地模拟数据以反映变化
  const customer = mockCustomers.find(c => c.id === form.customerId)
  if (customer) {
    const level = mockLevels.find(l => l.id === form.levelId)
    customer.levelId = form.levelId
    customer.levelName = level ? level.name : ''
  }

  ElMessage.success('护理级别设置成功')
  dialogVisible.value = false
  fetchCustomerList() // 刷新列表
}

// 5. 移除护理级别
const handleRemoveLevel = (row) => {
  ElMessageBox.confirm(
    `确定要移除客户【${row.name}】的护理级别吗？\n此操作将同时移除该客户当前级别下的所有护理项目详情，且不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true
    }
  ).then(() => {
    // 模拟后端删除逻辑
    const customer = mockCustomers.find(c => c.id === row.id)
    if (customer) {
      customer.levelId = null
      customer.levelName = ''
    }
    
    ElMessage.success('移除成功，已级联删除相关项目')
    fetchCustomerList()
  }).catch((action) => {
    if (action === 'cancel') {
      // 用户取消
    }
  })
}

// 重置弹窗数据
const resetDialog = () => {
  form.levelId = null
  form.projectList = []
  form.purchaseDate = ''
}

// 初始化
onMounted(() => {
  fetchCustomerList()
})
</script>

<style scoped>
.customer-settings-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.search-box {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
}

/* 优化表格内输入框样式 */
:deep(.el-input-number .el-input__inner) {
  text-align: center;
}
</style>
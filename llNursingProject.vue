<template>
  <div class="nursing-project-container">
    <!-- 1. 顶部操作栏 -->
    <div class="top-bar">
      <div class="search-box">
        <el-input
          v-model="queryParams.name"
          placeholder="护理项目名称"
          clearable
          @keyup.enter="handleQuery"
        />
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>

      <div class="btn-group">
        <el-button type="primary" @click="handleAddProject">添加</el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </div>

    <!-- 2. 全局状态切换按钮 -->
    <div class="status-switch-container">
      <el-button type="primary" @click="handleEnableAll">启用</el-button>
      <el-button type="danger" @click="handleDisableAll">停用</el-button>
    </div>

    <!-- 3. 数据表格区域 -->
    <el-table
      :data="tableData"
      style="width: 100%; margin-top: 20px"
      border
      highlight-current-row
      v-loading="loading"
    >
      <el-table-column type="index" label="序号" width="60" text-align="center" />
      <el-table-column prop="code" label="编号" text-align="center" />
      <el-table-column prop="name" label="名称" text-align="center" />
      <el-table-column prop="price" label="价格" text-align="center">
        <template #default="scope">
          {{ scope.row.price }}元/次
        </template>
      </el-table-column>
      <el-table-column prop="cycle" label="执行周次" text-align="center" />
      <el-table-column prop="count" label="执行次数" text-align="center" />
      <el-table-column prop="description" label="描述" text-align="center" />
      <el-table-column prop="status" label="状态" text-align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" text-align="center" width="120">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEditProject(scope.row)">
            修改
          </el-button>
          <el-button link type="danger" size="small" @click="handleDeleteProject(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 4. 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        @current-change="handleQuery"
      />
    </div>

    <!-- 5. 添加/修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="编号" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="form.price" type="number" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="停用">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行周期" prop="cycle">
          <el-select v-model="form.cycle" style="width: 100%">
            <el-option label="每天" value="每天" />
            <el-option label="每2小时" value="每2小时" />
            <el-option label="每周" value="每周" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行次数" prop="count">
          <el-input-number v-model="form.count" :min="1" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 模拟数据源 ---
// 所有护理项目数据（模拟后端数据）
const allProjectsDB = ref([
  { id: 1, code: 'HLXM0001', name: '吸氧', price: 60, status: '启用', cycle: '每天', count: 2, description: '' },
  { id: 2, code: 'HLXM0002', name: '协助服药', price: 0, status: '启用', cycle: '每天', count: 3, description: '' },
  { id: 3, code: 'HLXM0003', name: '翻身拍背', price: 20, status: '启用', cycle: '每2小时', count: 12, description: '' },
  { id: 4, code: 'HLXM0004', name: '口腔护理', price: 30, status: '启用', cycle: '每天', count: 2, description: '' },
  { id: 5, code: 'HLXM0005', name: '测量血压', price: 10, status: '启用', cycle: '每天', count: 1, description: '' },
])

// --- 响应式数据 ---
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  name: '',
  pageNum: 1,
  pageSize: 10
})

// 表格数据 (直接使用 allProjectsDB 的过滤结果)
const tableData = computed(() => {
  let filtered = allProjectsDB.value.filter(item => {
    const matchName = !queryParams.name || item.name.includes(queryParams.name)
    return matchName
  })
  // 模拟分页
  return filtered.slice(
    (queryParams.pageNum - 1) * queryParams.pageSize,
    queryParams.pageNum * queryParams.pageSize
  )
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const form = reactive({
  id: undefined,
  code: '',
  name: '',
  price: undefined,
  status: '启用',
  cycle: '',
  count: 1,
  description: ''
})

const rules = {
  code: [{ required: true, message: '请输入编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  cycle: [{ required: true, message: '请选择执行周期', trigger: 'change' }],
  count: [{ required: true, message: '请输入执行次数', trigger: 'blur' }],
}

// --- 方法 ---

// 1. 初始化与查询
const handleQuery = () => {
  queryParams.pageNum = 1
  // 重新计算 tableData
  total.value = allProjectsDB.value.filter(item => {
    const matchName = !queryParams.name || item.name.includes(queryParams.name)
    return matchName
  }).length
}

// 2. 添加/修改项目
const handleAddProject = () => {
  dialogTitle.value = '添加护理项目'
  isEdit.value = false
  // 重置表单
  formRef.value?.resetFields()
  form.id = undefined
  form.code = ''
  form.name = ''
  form.price = undefined
  form.status = '启用'
  form.cycle = ''
  form.count = 1
  form.description = ''
  dialogVisible.value = true
}

const handleEditProject = (row) => {
  dialogTitle.value = '修改护理项目'
  isEdit.value = true
  // 填充表单
  formRef.value?.resetFields()
  Object.assign(form, row)
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 修改逻辑
        const index = allProjectsDB.value.findIndex(item => item.id === form.id)
        if (index > -1) {
          Object.assign(allProjectsDB.value[index], form)
        }
        ElMessage.success('修改成功')
      } else {
        // 添加逻辑
        const newId = allProjectsDB.value.length > 0 ? Math.max(...allProjectsDB.value.map(i => i.id)) + 1 : 1
        allProjectsDB.value.unshift({ ...form, id: newId })
        ElMessage.success('添加成功')
      }

      dialogVisible.value = false
      handleQuery() // 刷新列表
    }
  })
}

// 3. 删除项目
const handleDeleteProject = (row) => {
  ElMessageBox.confirm(`确认删除护理项目 "${row.name}" 吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    // 从数据源中移除
    const index = allProjectsDB.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      allProjectsDB.value.splice(index, 1)
    }
    handleQuery()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 4. 全局状态切换
const handleEnableAll = () => {
  ElMessageBox.confirm('确认要启用所有护理项目吗？', '提示', {
    type: 'warning'
  }).then(() => {
    allProjectsDB.value.forEach(item => {
      item.status = '启用'
    })
    handleQuery()
    ElMessage.success('已启用所有项目')
  }).catch(() => {})
}

const handleDisableAll = () => {
  ElMessageBox.confirm('确认要停用所有护理项目吗？', '提示', {
    type: 'warning'
  }).then(() => {
    allProjectsDB.value.forEach(item => {
      item.status = '停用'
    })
    handleQuery()
    ElMessage.success('已停用所有项目')
  }).catch(() => {})
}

// 5. 返回
const handleBack = () => {
  // 模拟返回上一页
  ElMessage.info('返回上一页')
}

// 初始化
onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.nursing-project-container {
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
}

.status-switch-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination-container {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
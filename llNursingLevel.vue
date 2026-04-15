<template>
  <div class="nursing-level-container">
    <!-- 1. 查询与状态切换区域 -->
    <div class="filter-container">
      <el-radio-group v-model="queryParams.status" @change="handleQuery">
        <el-radio-button label="启用" />
        <el-radio-button label="停用" />
      </el-radio-group>

      <el-button type="primary" class="add-btn" @click="handleAdd">添加</el-button>
    </div>

    <!-- 2. 数据表格区域 -->
    <el-table :data="tableData" style="width: 100%; margin-top: 20px" stripe row-key="id" >
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="levelName" label="护理级别"/>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" style="width: 100px;">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">修改</el-button>
          <el-button link type="success" size="small" @click="handleConfigProject(scope.row)">护理项目配置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 3. 添加/修改 对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="formVisible"
      width="400px"
      @close="resetForm"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-width="80px"
      >
        <el-form-item
          label="护理级别"
          prop="levelName"
          v-if="dialogType === 'add'"
        >
          <el-input v-model="formData.levelName" placeholder="请输入护理级别名称" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 4. 护理项目配置对话框 (改造为双表格布局，同步 llNursingProject.vue) -->
    <el-dialog
      title="护理项目配置"
      v-model="configVisible"
      width="900px"
    >
      <div class="config-dialog-content">
        <p class="config-title">正在配置：【{{ currentLevelName }}】的护理项目</p>
        
        <div class="dual-table-layout">
          <!-- 左侧：所有护理项目 -->
          <div class="table-card left-table">
            <div class="table-header">所有护理项目</div>
            <!-- 搜索框 -->
            <div class="search-box">
              <el-input
                v-model="projectQueryParams.name"
                placeholder="项目名称"
                clearable
                size="small"
                style="width: 120px;"
              />
              <el-button type="primary" size="small" @click="fetchProjectList" style="margin-left: 5px;">查询</el-button>
            </div>

            <el-table
              :data="allProjectList"
              style="width: 100%"
              border
              highlight-current-row
              @current-change="handleLeftSelectChange"
              v-loading="projectLoading"
              height="300"
            >
              <el-table-column type="index" label="序号" width="50" text-align="center" />
              <el-table-column prop="code" label="编号" text-align="center" width="100" />
              <el-table-column prop="name" label="名称" text-align="center" />
              <el-table-column prop="price" label="价格" text-align="center" width="80">
                <template #default="scope">
                  {{ scope.row.price }}
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <div class="pagination-container">
              <el-pagination
                small
                background
                layout="prev, pager, next"
                :total="projectTotal"
                v-model:current-page="projectQueryParams.pageNum"
                v-model:page-size="projectQueryParams.pageSize"
                @current-change="fetchProjectList"
              />
            </div>
          </div>

          <!-- 中间操作按钮 -->
          <div class="middle-operators">
            <el-button type="primary" @click="addToRight" :disabled="!leftSelectedRow">
              添加 &gt;
            </el-button>
            <el-button type="danger" @click="removeFromRight" :disabled="!rightSelectedRow">
              &lt; 移除
            </el-button>
          </div>

          <!-- 右侧：当前级别已配置项目 -->
          <div class="table-card right-table">
            <div class="table-header">已配置项目</div>
            <el-table
              :data="configuredProjectList"
              style="width: 100%"
              border
              highlight-current-row
              @current-change="handleRightSelectChange"
              height="300"
            >
              <el-table-column type="index" label="序号" width="50" text-align="center" />
              <el-table-column prop="code" label="编号" text-align="center" width="100" />
              <el-table-column prop="name" label="名称" text-align="center" />
              <el-table-column prop="price" label="价格" text-align="center" width="80">
                <template #default="scope">
                  {{ scope.row.price }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" text-align="center">
                <template #default="scope">
                  <el-button type="danger" link size="small" @click="removeFromRight(scope.row)">
                    ×
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveConfig">保存配置</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 模拟数据 ---
// 护理级别数据
const mockLevels = [
  { id: 1, levelName: '一级护理', status: '启用' },
  { id: 2, levelName: '二级护理', status: '启用' },
  { id: 3, levelName: '三级护理', status: '停用' },
]

// --- 同步 llNursingProject.vue 的数据源 ---
// 确保这里的数据结构与 llNursingProject.vue 中的 allProjectsDB 一致
const allProjectsDB = ref([
  { id: 1, code: 'HLXM0001', name: '吸氧', price: 60, status: '启用', cycle: '每天', count: 2, description: '' },
  { id: 2, code: 'HLXM0002', name: '协助服药', price: 0, status: '启用', cycle: '每天', count: 3, description: '' },
  { id: 3, code: 'HLXM0003', name: '翻身拍背', price: 20, status: '启用', cycle: '每2小时', count: 12, description: '' },
  { id: 4, code: 'HLXM0004', name: '口腔护理', price: 30, status: '启用', cycle: '每天', count: 2, description: '' },
  { id: 5, code: 'HLXM0005', name: '测量血压', price: 10, status: '启用', cycle: '每天', count: 1, description: '' },
  { id: 6, code: 'HLXM0006', name: '晨间护理', price: 15, status: '启用', cycle: '每天', count: 1, description: '' },
  { id: 7, code: 'HLXM0007', name: '晚间护理', price: 15, status: '启用', cycle: '每天', count: 1, description: '' },
])

// --- 状态定义 ---
const loading = ref(false)
const tableData = ref([])

// 查询参数
const queryParams = reactive({
  status: '启用' // 默认查询启用
})

// 对话框控制
const formVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('add') // 'add' or 'edit'

// 表单数据
const formData = reactive({
  id: null,
  levelName: '',
  status: '启用'
})
const formRef = ref(null)
const rules = {
  levelName: [{ required: true, message: '请输入护理级别名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// --- 护理项目配置相关 (同步 llNursingProject.vue 逻辑) ---
const configVisible = ref(false)
const currentLevelId = ref(null)
const currentLevelName = ref('')

// 左侧表格（所有项目）相关
const projectLoading = ref(false)
const allProjectList = ref([])
const projectTotal = ref(0)
const leftSelectedRow = ref(null)

// 右侧表格（已配置项目）相关
const configuredProjectList = ref([])
const rightSelectedRow = ref(null)

// 当前级别已配置的项目ID集合 (用于逻辑判断)
const currentLevelConfigIds = ref([])

// 项目查询参数
const projectQueryParams = reactive({
  name: '',
  pageNum: 1,
  pageSize: 5 // 弹窗内分页较小
})

// --- 方法 ---

// 1. 查询护理级别列表
const handleQuery = () => {
  tableData.value = mockLevels.filter(item => item.status === queryParams.status)
}

// 2. 打开添加
const handleAdd = () => {
  dialogType.value = 'add'
  dialogTitle.value = '添加护理级别'
  formVisible.value = true
}

// 3. 打开修改
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogTitle.value = '修改状态'
  // 填充数据
  formData.id = row.id
  formData.levelName = row.levelName
  formData.status = row.status
  formVisible.value = true
}

// 4. 提交表单 (添加/修改)
const submitForm = () => {
  // 表单组件，当valid值为true时，执行（护理名称必填）
  formRef.value.validate((valid) => {
    if (valid) {
      // 复用组件，通过dialogType判断是添加还是修改，走分支
      if (dialogType.value === 'add') {
        // 添加新数据
        const newId = mockLevels.length > 0 ? Math.max(...mockLevels.map(i => i.id)) + 1 : 1
        mockLevels.push({
          id: newId,
          levelName: formData.levelName,
          status: formData.status
        })
        ElMessage.success('添加成功')
      } else {
        // 修改旧数据
        const item = mockLevels.find(i => i.id === formData.id)
        if (item) {
          item.status = formData.status
          ElMessage.success('修改成功')
        }
      }
      formVisible.value = false
      handleQuery() // 刷新列表
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  formData.id = null
  formData.levelName = ''
}

// --- 护理项目配置逻辑 (同步 llNursingProject.vue) ---

// 获取所有项目列表（左侧表格）
const fetchProjectList = () => {
  projectLoading.value = true
  setTimeout(() => {
    let filtered = allProjectsDB.value.filter(item => {
      const matchName = !projectQueryParams.name || item.name.includes(projectQueryParams.name)
      return matchName
    })
    
    projectTotal.value = filtered.length
    
    // 模拟分页
    allProjectList.value = filtered.slice(
      (projectQueryParams.pageNum - 1) * projectQueryParams.pageSize,
      projectQueryParams.pageNum * projectQueryParams.pageSize
    )
    projectLoading.value = false
  }, 200)
}

// 更新右侧已配置列表
const updateConfiguredList = () => {
  configuredProjectList.value = allProjectsDB.value.filter(item =>
    currentLevelConfigIds.value.includes(item.id)
  )
}

// 5. 打开护理项目配置
const handleConfigProject = (row) => {
  currentLevelId.value = row.id
  currentLevelName.value = row.levelName
  configVisible.value = true
  
  // 重置查询条件
  projectQueryParams.name = ''
  projectQueryParams.pageNum = 1
  
  // 加载左侧所有项目
  fetchProjectList()

  if(row.id === 1) {
    currentLevelConfigIds.value = [1, 2]
  } else if (row.id === 2) {
    currentLevelConfigIds.value = [3]
  } else {
    currentLevelConfigIds.value = []
  }
  
  // 渲染右侧列表
  updateConfiguredList()
  
  // 清空选中状态
  leftSelectedRow.value = null
  rightSelectedRow.value = null
}

// 左侧表格选中变化
const handleLeftSelectChange = (row) => {
  leftSelectedRow.value = row
}

// 右侧表格选中变化
const handleRightSelectChange = (row) => {
  rightSelectedRow.value = row
}

// 添加到右侧
const addToRight = () => {
  if (!leftSelectedRow.value) {
    ElMessage.warning('请先在左侧选择一个项目')
    return
  }

  const projectId = leftSelectedRow.value.id
  if (currentLevelConfigIds.value.includes(projectId)) {
    ElMessage.info('该项目已在配置列表中')
    return
  }

  // 添加到配置ID列表
  currentLevelConfigIds.value.push(projectId)
  updateConfiguredList()
  ElMessage.success('添加成功')
}

// 从右侧移除
const removeFromRight = (row) => {
  // 支持通过行数据调用或按钮调用
  const targetRow = row || rightSelectedRow.value
  if (!targetRow) {
    ElMessage.warning('请选择要移除的项目')
    return
  }

  // 从配置ID列表中移除
  const index = currentLevelConfigIds.value.indexOf(targetRow.id)
  if (index > -1) {
    currentLevelConfigIds.value.splice(index, 1)
    updateConfiguredList()
    ElMessage.success('移除成功')
  }
}

// 6. 保存配置
const saveConfig = () => {
  console.log(`级别ID: ${currentLevelId.value} 保存的项目IDs:`, currentLevelConfigIds.value)
  // 这里调用保存接口，将 currentLevelConfigIds.value 发送给后端
  ElMessage.success('配置已保存')
  configVisible.value = false
}

// 初始化
onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.nursing-level-container {
  padding: 20px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  margin-left: 20px;
}

/* 配置弹窗样式 */
.config-dialog-content {
  min-height: 400px;
}

.config-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.dual-table-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.table-card {
  width: 42%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-header {
  background-color: #f5f7fa;
  color: #303133;
  padding: 10px 15px;
  font-weight: bold;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
}

.search-box {
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

.middle-operators {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 15px;
}

.pagination-container {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

/* 深度选择器调整表格样式 */
:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: bold;
}

:deep(.el-table td) {
  text-align: center;
}
</style>
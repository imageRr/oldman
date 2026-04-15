<template>
  <div class="bed-management-page">
   
    <div class="header-actions">
      <div class="filter-group">
        <el-input 
          v-model="searchForm.name" 
          placeholder="搜索姓名" 
          prefix-icon="Search" 
          clearable 
          style="width: 200px" 
        />
        <el-date-picker
          v-model="searchForm.checkInDate"
          type="date"
          placeholder="入住日期"
          value-format="YYYY-MM-DD"
          style="width: 160px; margin-left: 10px;"
        />
        <el-button type="primary" plain @click="handleSearch">查询</el-button>
      </div>
      <el-button type="success" icon="Plus" @click="openAddDialog">新增入住</el-button>
    </div>

    <!-- 2. 标签页内容 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="demo-tabs">
        
        <!-- 正在使用 (包含在住、外出、维修) -->
        <el-tab-pane label="床位状态管理" name="using">
          <el-table :data="filteredUsingData" border stripe style="width: 100%" class="custom-table">
            <el-table-column prop="id" label="ID" width="60" align="center" />
            <el-table-column prop="elderName" label="姓名/状态" width="120" align="center">
              <template #default="{ row }">
                <span v-if="row.elderName" class="name-text">{{ row.elderName }}</span>
                <span v-else class="status-text">{{ getStatusLabel(row.status) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="gender" label="性别" width="60" align="center">
               <template #default="{ row }">
                 <el-tag v-if="row.gender" :type="row.gender === 'M' ? '' : 'danger'" size="small" effect="plain">
                   {{ row.gender === 'M' ? '男' : '女' }}
                 </el-tag>
                 <span v-else>-</span>
               </template>
            </el-table-column>
            <el-table-column prop="bedInfo" label="床位" width="120" align="center">
              <template #default="{ row }">
                <el-tag type="info" effect="light">{{ row.bedInfo }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startDate" label="开始时间" width="120" align="center" />
            <el-table-column prop="status" label="当前状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑状态</el-button>
                <el-button v-if="row.status !== 'empty' && row.status !== 'maintain'" link type="warning" size="small" @click="openSwapDialog(row)">调换</el-button>
                <el-button v-if="row.status === 'occupied' || row.status === 'out'" link type="danger" size="small" @click="handleCheckOut(row)">退住</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 使用历史 -->
        <el-tab-pane label="历史记录" name="history">
          <el-table :data="bedStore.history" border stripe style="width: 100%" class="custom-table">
            <el-table-column prop="elderName" label="姓名" width="100" align="center" />
            <el-table-column prop="bedInfo" label="曾住房间" width="120" align="center" />
            <el-table-column prop="startDate" label="入住时间" width="120" align="center" />
            <el-table-column prop="endDate" label="退住时间" width="120" align="center" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- --- 弹窗区域 --- -->

    <!-- 1. 新增入住弹窗 -->
    <el-dialog v-model="addDialogVisible" title="办理入住" width="450px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="选择床位" required>
          <el-select v-model="addForm.bedId" placeholder="请选择空闲床位" style="width: 100%">
            <el-option 
              v-for="bed in emptyBeds" 
              :key="bed.id" 
              :label="`${bed.bedInfo} (空闲)`" 
              :value="bed.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="addForm.name" placeholder="请输入老人姓名" />
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="addForm.gender">
            <el-radio label="M">男</el-radio>
            <el-radio label="F">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入住日期">
          <el-date-picker v-model="addForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd" :disabled="!addForm.bedId || !addForm.name">确认入住</el-button>
      </template>
    </el-dialog>

    <!-- 2. 编辑状态弹窗 (支持修改为维修) -->
    <el-dialog v-model="editDialogVisible" title="编辑床位状态" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="床位号">
          <el-input :value="editForm.bedInfo" disabled />
        </el-form-item>
        <el-form-item label="当前姓名">
          <el-input :value="editForm.elderName || '无'" disabled />
        </el-form-item>
        <el-form-item label="设置状态" required>
          <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="空闲" value="empty" />
            <el-option label="在住" value="occupied" />
            <el-option label="外出" value="out" />
            <el-option label="维修" value="maintain" />
          </el-select>
        </el-form-item>
        <div v-if="editForm.status === 'maintain'" class="tip-text">
          <el-icon><Warning /></el-icon> 设置为维修后，该床位将不可入住，示意图显示为灰色。
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存更改</el-button>
      </template>
    </el-dialog>

    <!-- 3. 调换床位弹窗 -->
    <el-dialog v-model="swapDialogVisible" title="床位调换" width="400px">
      <div v-if="currentSwapSource">
        <p class="swap-tip">将 <strong>{{ currentSwapSource.elderName }}</strong> 从 {{ currentSwapSource.bedInfo }} 调换至：</p>
        <el-select v-model="swapTargetId" placeholder="选择目标空闲床位" style="width: 100%">
          <el-option 
            v-for="bed in emptyBeds" 
            :key="bed.id" 
            :label="`${bed.bedInfo}`" 
            :value="bed.id" 
          />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="swapDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSwap" :disabled="!swapTargetId">确认调换</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning } from '@element-plus/icons-vue';
import { bedStore } from '@/store';
import CheckInDialog from '@/components/CheckInDialog.vue';

const activeTab = ref('using');
const searchForm = reactive({ name: '', checkInDate: '' });

// --- 状态控制 ---
const checkInDialogVisible = ref(false);
const editDialogVisible = ref(false);
const swapDialogVisible = ref(false);

// --- 表单数据 ---
const addForm = reactive({ bedId: null, name: '', gender: 'M', startDate: '' });
const editForm = reactive({ id: null, elderName: '', status: '', bedInfo: '' });
const currentSwapSource = ref(null);
const swapTargetId = ref(null);

// --- 计算属性 ---
// 注意：这里我们展示所有非历史的床位，以便管理维修状态
// 如果你只想看“有人”和“外出”，可以保留原来的 getUsingBeds
// 但为了管理维修，通常需要在列表中看到所有非空闲或特定的床位。
// 这里为了简单，我们复用 getUsingBeds，但建议在实际项目中创建一个 getAllBedsExceptEmpty 或者类似的方法
// 暂时我们修改一下 filteredUsingData 的逻辑，让它也能显示维修中的床位（如果 store 支持的话）
// 由于 getUsingBeds 只返回 occupied/out，我们需要扩展一下或者直接在 store 里加个方法
// 为了快速实现，我们假设用户知道维修床位在哪，或者我们在 store 里加一个 getAllActiveBeds (包含 maintain)

const allManagedBeds = computed(() => {
   let list = [];
    bedStore.rooms.forEach(floor => {
      floor.list.forEach(room => {
        room.beds.forEach(bed => {
          // 包含：在住、外出、维修。不包含：空闲（空闲在新增时选）
          if (['occupied', 'out', 'maintain'].includes(bed.status)) {
            list.push({
              ...bed,
              roomNo: room.roomNo,
              bedInfo: `${room.roomNo}-${bed.bedNo}`
            });
          }
        });
      });
    });
    return list;
});

const emptyBeds = computed(() => bedStore.getEmptyBeds());

const filteredUsingData = computed(() => {
  return allManagedBeds.value.filter(item => {
    const matchName = !searchForm.name || (item.elderName && item.elderName.includes(searchForm.name));
    // 维修床位可能没有 startDate，所以做个保护
    const matchDate = !searchForm.checkInDate || (item.startDate && item.startDate === searchForm.checkInDate);
    return matchName && matchDate;
  });
});

// --- 辅助函数 ---
const getStatusLabel = (status) => {
  const map = { 'occupied': '在住', 'out': '外出', 'maintain': '维修', 'empty': '空闲' };
  return map[status] || status;
};

const getStatusType = (status) => {
  const map = { 'occupied': 'success', 'out': 'warning', 'maintain': 'info', 'empty': '' };
  return map[status] || '';
};

// --- 操作方法 ---

// 1. 新增入住
const openAddDialog = () => {
 checkInDialogVisible.value = true;
};

const confirmAdd = () => {
  const success = bedStore.checkInBed(addForm.bedId, {
    name: addForm.name,
    gender: addForm.gender,
    startDate: addForm.startDate
  });
  if (success) {
    ElMessage.success('入住办理成功，示意图已更新');
    addDialogVisible.value = false;
  }
};

// 2. 编辑状态 (支持改为维修)
const openEditDialog = (row) => {
  editForm.id = row.id;
  editForm.elderName = row.elderName;
  editForm.status = row.status;
  editForm.bedInfo = row.bedInfo;
  editDialogVisible.value = true;
};

const saveEdit = () => {
  // 如果改为空闲或维修，且原来有人，可能需要额外逻辑（如自动退住）
  // 这里简单处理：直接更新状态。如果变为 empty/maintain，姓名清空与否取决于业务逻辑
  // 通常设为维修时，如果有人，应该先退住。这里假设管理员会手动处理或系统强制清空
  
  let updateData = {
    id: editForm.id,
    status: editForm.status
  };

  // 如果设置为空闲或维修，且当前有姓名，是否清空姓名？
  // 为了安全，如果变为 non-occupied 状态，我们保留姓名但状态变了，或者清空姓名。
  // 根据需求“只需要更改床位状态”，我们只改状态。
  // 但为了示意图好看，如果变成维修，通常意味着没人。
  if (editForm.status === 'empty' || editForm.status === 'maintain') {
     // 可选：如果变为维修/空闲，是否自动清空老人信息？
     // 这里我们选择不自动清空，除非用户手动去退住。
     // 但如果变为维修，示意图会显示“维修”，名字可能还在那，这有点怪。
     // 让我们做一个优化：如果变为维修，且原来有人，提示用户先退住？
     // 或者简单点：如果变为维修，我们不清空名字，但在示意图上优先显示状态。
  }
  
  bedStore.updateBed(updateData);
  ElMessage.success('状态修改成功，示意图已同步');
  editDialogVisible.value = false;
};

// 3. 调换床位
const openSwapDialog = (row) => {
  currentSwapSource.value = row;
  swapTargetId.value = null;
  swapDialogVisible.value = true;
};

const confirmSwap = () => {
  if (bedStore.swapBeds(currentSwapSource.value.id, swapTargetId.value)) {
    ElMessage.success('调换成功');
    swapDialogVisible.value = false;
  }
};

// 4. 退住/删除
const handleCheckOut = (row) => {
  ElMessageBox.confirm(
    `确定要为 ${row.elderName} 办理退住吗？退住后床位将变为空闲。`,
    '退住确认',
    { confirmButtonText: '确定退住', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    if (bedStore.checkOutBed(row.id)) {
      ElMessage.success('退住成功，历史记录已归档');
    }
  }).catch(() => {});
};

const handleSearch = () => {
  ElMessage.success('筛选完成');
};
const refreshList = () => {
  // 由于使用的是 reactive store，computed 会自动响应，通常不需要手动刷新
  // 如果有其他副作用可以在这里处理
};
</script>

<style scoped>
.bed-management-page {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.tab-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
}

.custom-table {
  --el-table-border-color: #ebeef5;
}

.name-text {
  font-weight: 600;
  color: #303133;
}

.status-text {
  color: #909399;
  font-style: italic;
}

.swap-tip {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.tip-text {
  color: #E6A23C;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
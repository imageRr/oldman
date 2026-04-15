<template>
  <div class="bed-layout-page">
    <!-- 1. 顶部控制栏 -->
    <div class="top-bar">
      <div class="filter-box">
        <span class="label">当前楼层：</span>
        <el-select v-model="currentFloor" placeholder="选择楼层" class="floor-select" size="large">
          <el-option label="一层 (1F)" value="1F" />
          <el-option label="二层 (2F)" value="2F" />
          <el-option label="三层 (3F)" value="3F" />
        </el-select>
        <el-button type="primary" class="search-btn" size="large" @click="handleSearch">
          <el-icon><Search /></el-icon> 查询
        </el-button>
      </div>
      
      <!-- 统计栏 -->
      <div class="stats-box">
         <div class="stat-item">
           <span class="num">{{ stats.total }}</span>
           <span class="txt">总床位</span>
         </div>
         <div class="stat-item green">
           <span class="num">{{ stats.empty }}</span>
           <span class="txt">空闲</span>
         </div>
         <div class="stat-item blue">
           <span class="num">{{ stats.occupied }}</span>
           <span class="txt">入住</span>
         </div>
         <div class="stat-item orange">
           <span class="num">{{ stats.out }}</span>
           <span class="txt">外出</span>
         </div>
      </div>
    </div>

    <!-- 2. 图例说明 -->
    <div class="legend-row">
      <div class="legend"><i class="dot empty"></i>空闲</div>
      <div class="legend"><i class="dot occupied"></i>有人</div>
      <div class="legend"><i class="dot out"></i>外出</div>
      <div class="legend"><i class="dot maintain"></i>维修</div>
    </div>

    <!-- 3. 核心内容区 -->
    <div class="content-wrapper">
      <div class="content-table">
        <!-- 表头 -->
        <div class="table-head">
          <div class="col-room">房间号</div>
          <div class="col-bed">床位 A</div>
          <div class="col-bed">床位 B</div>
        </div>

        <!-- 数据行 -->
        <div class="table-body">
          <div v-for="room in filteredRooms" :key="room.roomNo" class="table-row">
            <!-- 房间号列 -->
            <div class="col-room cell room-cell">
              <span class="room-tag">{{ room.roomNo }}</span>
            </div>
            
            <!-- 床位 A -->
            <div 
              class="col-bed cell bed-card" 
              :class="getStatusClass(room.beds[0]?.status)" 
              @click="openDetail(room.beds[0])"
            >
              <div v-if="room.beds[0]" class="bed-content">
                <span class="status-badge">{{ getStatusText(room.beds[0].status) }}</span>
                <span class="elder-name" v-if="room.beds[0].elderName">{{ room.beds[0].elderName }}</span>
                <span class="empty-hint" v-else>空闲可用</span>
              </div>
              <div v-else class="empty-slot">-</div>
            </div>

            <!-- 床位 B -->
            <div 
              class="col-bed cell bed-card" 
              :class="getStatusClass(room.beds[1]?.status)" 
              @click="openDetail(room.beds[1])"
            >
              <div v-if="room.beds[1]" class="bed-content">
                <span class="status-badge">{{ getStatusText(room.beds[1].status) }}</span>
                <span class="elder-name" v-if="room.beds[1].elderName">{{ room.beds[1].elderName }}</span>
                <span class="empty-hint" v-else>空闲可用</span>
              </div>
              <div v-else class="empty-slot">-</div>
            </div>
          </div>
          
          <!-- 无数据提示 -->
          <div v-if="filteredRooms.length === 0" class="no-data">
            <el-empty description="该楼层暂无房间数据" />
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" title="床位详细信息" width="400px" center>
      
       <div v-if="currentBed" class="detail-box">
          <div class="detail-item">
            <span class="label">房间号码：</span>
            <span class="value">{{ currentBed.roomNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">床位编号：</span>
            <span class="value">{{ currentBed.bedNo }} 号床</span>
          </div>
          <div class="detail-item">
            <span class="label">当前状态：</span>
            <el-tag :type="getTagType(currentBed.status)" effect="dark">{{ getStatusText(currentBed.status) }}</el-tag>
          </div>
          <div class="detail-item">
            <span class="label">入住长者：</span>
            <span class="value highlight" v-if="currentBed.elderName">{{ currentBed.elderName }}</span>
            <span class="value text-gray" v-else>暂无人员</span>
          </div>
       </div>
       <template #footer>
            <el-button @click="dialogVisible = false">关 闭</el-button>
        
       </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { bedStore } from '@/store';
import CheckInDialog from './CheckInDialog.vue';

const currentFloor = ref('1F');
const dialogVisible = ref(false);
const currentBed = ref(null);
const checkInDialogVisible = ref(false);
const currentActionBed = ref(null); // 用于存储当前要办理入住的床位


// 统计数据
const stats = reactive({ total: 0, empty: 0, occupied: 0, out: 0 });

// 计算属性：从 Store 中获取当前楼层数据
const filteredRooms = computed(() => {
  const floorData = bedStore.rooms.find(item => item.floor === currentFloor.value);
  return floorData ? floorData.list : [];
});

// 监听数据变化更新统计
const updateStats = () => {
  let t = 0, e = 0, o = 0, out = 0;
  // 注意：这里统计的是当前楼层的所有床位，包括维修
  filteredRooms.value.forEach(room => {
    room.beds.forEach(bed => {
      t++;
      if (bed.status === 'empty') e++;
      else if (bed.status === 'occupied') o++;
      else if (bed.status === 'out') out++;
    });
  });
  stats.total = t;
  stats.empty = e;
  stats.occupied = o;
  stats.out = out;
};

// 初始加载及监听
updateStats();
watch(filteredRooms, updateStats);

const handleSearch = () => {
  updateStats();
  ElMessage.success(`已刷新 ${currentFloor.value} 数据`);
};

const getStatusClass = (status) => `status-${status || 'empty'}`;

const getStatusText = (status) => {
  const map = { 'empty': '空闲', 'occupied': '有人', 'out': '外出', 'maintain': '维修' };
  return map[status] || '未知';
};

const getTagType = (status) => {
  const map = { 'empty': 'success', 'occupied': 'primary', 'out': 'warning', 'maintain': 'info' };
  return map[status] || 'info';
};

const openDetail = (bed) => {
  if (!bed) return;
  currentBed.value = bed;
  if (bed.status === 'empty') {
    // 如果是空床位，直接打开办理入住弹窗，并传入该床位
    currentActionBed.value = bed;
    checkInDialogVisible.value = true;
  } else {
    // 如果有人，打开原有的详情弹窗
    dialogVisible.value = true;
  }
}
  


const handleBedAction = () => {
  dialogVisible.value = false;
  if (currentBed.value.status === 'empty') {
    ElMessage.info('跳转至入住登记页面...');
  } else {
    ElMessage.info('查看老人详细健康档案...');
  }
};
const refreshStats = () => {
  updateStats();
};
</script>

<style scoped>
/* 页面整体容器 */
.bed-layout-page {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100%;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

/* 1. 顶部栏样式 - 卡片化 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  font-size: 15px;
  color: #303133;
  font-weight: 600;
}

.floor-select {
  width: 160px;
}

.stats-box {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
  cursor: default;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 1px;
  background-color: #e4e7ed;
}

.stat-item .num {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
  font-family: Arial, sans-serif; /* 数字用无衬线字体更清晰 */
}

.stat-item .txt {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
  display: block;
}

/* 统计数字颜色区分 */
.stat-item.green .num { color: #67C23A; }
.stat-item.blue .num { color: #409EFF; }
.stat-item.orange .num { color: #E6A23C; }

/* 2. 图例样式 */
.legend-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding-left: 4px;
}

.legend {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 8px;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.dot.empty { background: #67C23A; }
.dot.occupied { background: #409EFF; }
.dot.out { background: #E6A23C; }
.dot.maintain { background: #909399; }

/* 3. 核心表格区域 - 卡片化 */
.content-wrapper {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  overflow: hidden; /* 保证圆角 */
}

.content-table {
  width: 100%;
}

.table-head {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  height: 50px;
  align-items: center;
}

.table-head > div {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #606266;
}

.table-row {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #fafafa;
}

.cell {
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ebeef5;
  height: 70px; /* 固定高度，保持整齐 */
}

.cell:last-child {
  border-right: none;
}

/* 房间号样式 - 突出显示 */
.room-cell {
  background-color: #fafafa;
}

.room-tag {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  background: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* 床位卡片样式 - 交互核心 */
.bed-card {
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.bed-card:hover {
  background-color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.bed-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 4px;
}

/* 状态标签 */
.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.elder-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.empty-hint {
  font-size: 13px;
  color: #c0c4cc;
}

.empty-slot {
  color: #dcdfe6;
  font-size: 20px;
}

/* --- 状态颜色体系 (左侧边框 + 文字背景) --- */

/* 空闲 */
.status-empty { 
  border-left: 4px solid #67C23A; 
  background-color: #f0f9eb; /* 极淡的绿色背景 */
}
.status-empty .status-badge { color: #67C23A; background: #e1f3d8; }

/* 有人 */
.status-occupied { 
  border-left: 4px solid #409EFF; 
  background-color: #ecf5ff; /* 极淡的蓝色背景 */
}
.status-occupied .status-badge { color: #409EFF; background: #d9ecff; }
.status-occupied .elder-name { color: #409EFF; }

/* 外出 */
.status-out { 
  border-left: 4px solid #E6A23C; 
  background-color: #fdf6ec; /* 极淡的黄色背景 */
}
.status-out .status-badge { color: #E6A23C; background: #faecd8; }
.status-out .elder-name { color: #E6A23C; }

/* 维修 */
.status-maintain { 
  border-left: 4px solid #909399; 
  background-color: #f4f4f5; 
}
.status-maintain .status-badge { color: #909399; background: #e9e9eb; }

.no-data {
  padding: 40px;
}

/* 弹窗细节美化 */
.detail-box {
  padding: 10px 0;
}
.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-size: 15px;
}
.detail-item .label {
  width: 90px;
  text-align: right;
  margin-right: 16px;
  color: #606266;
  font-weight: normal;
}
.detail-item .value {
  color: #303133;
  font-weight: 500;
}
.highlight {
  color: #409EFF;
  font-size: 16px;
}
.text-gray {
  color: #909399;
}
</style>
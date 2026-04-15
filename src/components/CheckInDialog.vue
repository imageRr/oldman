<template>
  <div class="checkin-dialog-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>🏥 新长者入住登记</span>
          <el-tag type="success" effect="plain">实时同步床位状态</el-tag>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="checkin-form">
        <el-row :gutter="20">
          <!-- 左侧：床位选择与示意 -->
          <el-col :span="10">
            <div class="bed-selection-area">
              <h4 class="section-title">1. 选择安置床位</h4>
              
              <el-form-item label="楼层" prop="floor">
                <el-select v-model="form.floor" placeholder="请选择楼层" @change="handleFloorChange" style="width: 100%">
                  <el-option v-for="f in floors" :key="f" :label="f" :value="f" />
                </el-select>
              </el-form-item>

              <el-form-item label="房间" prop="roomNo">
                <el-select v-model="form.roomNo" placeholder="请先选楼层" :disabled="!form.floor" @change="handleRoomChange" style="width: 100%">
                  <el-option v-for="r in currentRooms" :key="r.roomNo" :label="r.roomNo" :value="r.roomNo" />
                </el-select>
              </el-form-item>

              <el-form-item label="床位" prop="bedId">
                <el-select v-model="form.bedId" placeholder="请先选房间" :disabled="!form.roomNo" style="width: 100%">
                  <el-option 
                    v-for="bed in currentBeds" 
                    :key="bed.id" 
                    :label="`${bed.bedNo}床 (${bed.status === 'empty' ? '空闲' : '占用'})`" 
                    :value="bed.id"
                    :disabled="bed.status !== 'empty'"
                  >
                    <span style="float: left">{{ bed.bedNo }}床</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">
                      {{ bed.status === 'empty' ? '✅ 空闲' : '❌ 占用' }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>

              <!-- 模拟草图/床位示意图区域 -->
              <div class="bed-sketch-preview" v-if="selectedBedInfo">
                <div class="sketch-label">床位预览 / 草图位置</div>
                <div class="sketch-box" :class="'status-' + selectedBedInfo.status">
                  <div class="bed-icon">🛏️</div>
                  <div class="bed-info-text">
                    <strong>{{ form.floor }} - {{ form.roomNo }}</strong>
                    <span>{{ selectedBedInfo.bedNo }}号床</span>
                  </div>
                </div>
                <p class="sketch-tip">* 此处模拟显示床位在房间内的具体位置草图</p>
              </div>
              <div class="bed-sketch-preview empty-state" v-else>
                <div class="sketch-label">床位预览</div>
                <div class="sketch-box placeholder">
                  <span>请选择具体床位以查看位置</span>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 右侧：详细信息录入 -->
          <el-col :span="14">
            <div class="info-entry-area">
              <h4 class="section-title">2. 长者基本信息</h4>
              
              <el-row :gutter="15">
                <el-col :span="12">
                  <el-form-item label="姓名" prop="elderName">
                    <el-input v-model="form.elderName" placeholder="输入姓名" prefix-icon="User" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="性别"prop="gender">
                    <el-radio-group v-model="form.gender">
                      <el-radio label="M">男</el-radio>
                      <el-radio label="F">女</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="15">
                <el-col :span="12">
                  <el-form-item label="年龄"prop="age">
                    <el-input-number v-model="form.age" :min="1" :max="120" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="身份证号"prop="idCard">
                    <el-input v-model="form.idCard" placeholder="输入身份证" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="15">
                <el-col :span="12">
                  <el-form-item label="联系电话"prop="phone">
                    <el-input v-model="form.phone" placeholder="本人或家属电话" prefix-icon="Phone" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="紧急联系人"prop="emergencyContact">
                    <el-input v-model="form.emergencyContact" placeholder="家属姓名" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="入住日期"prop="startDate">
                <el-date-picker
                  v-model="form.startDate"
                  type="date"
                  placeholder="选择入住日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>

              <el-form-item label="健康状况备注"prop="healthNote">
                <el-input
                  v-model="form.healthNote"
                  type="textarea"
                  :rows="3"
                  placeholder="例如：高血压、糖尿病、需半护理等"
                />
              </el-form-item>
            </div>
          </el-col>
        </el-row>

        <div class="form-footer">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitCheckIn" :loading="submitting">
            ✅ 确认办理入住
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { bedStore } from '@/store';

const formRef = ref(null);
const submitting = ref(false);

// 表单数据
const form = reactive({
  floor: '',
  roomNo: '',
  bedId: null,
  elderName: '',
  gender: 'M',
  age: 70,
  idCard: '',
  phone: '',
  emergencyContact: '',
  startDate: new Date().toISOString().split('T')[0],
  healthNote: ''
});

// 校验规则
const rules = {
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  roomNo: [{ required: true, message: '请选择房间',trigger: 'change' }],
  bedId: [{ required: true, message: '请选择空闲床位',trigger: 'change' }],
  elderName: [{ required: true, message: '请输入姓名',trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号',trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话',trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择入住日期',trigger: 'change' }]
};

// 计算属性：动态获取楼层、房间、床位
const floors = computed(() => bedStore.rooms.map(r => r.floor));

const currentRooms = computed(() => {
  const floorData = bedStore.rooms.find(r => r.floor === form.floor);
  return floorData ? floorData.list : [];
});

const currentBeds = computed(() => {
  const room = currentRooms.value.find(r => r.roomNo === form.roomNo);
  return room ? room.beds : [];
});

const selectedBedInfo = computed(() => {
  if (!form.bedId) return null;
  // 在所有房间中查找该床位以获取详细信息
  for (const floor of bedStore.rooms) {
    for (const room of floor.list) {
      const bed = room.beds.find(b => b.id === form.bedId);
      if (bed) return { ...bed, roomNo: room.roomNo, floor: floor.floor };
    }
  }
  return null;
});

// 动处理
const handleFloorChange = () => {
  form.roomNo = '';
  form.bedId = null;
};

const handleRoomChange = () => {
  form.bedId = null;
};

// 提交逻辑
const submitCheckIn = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true;
      
      try {
        // 1. 更新床位state (Bed Management Sync)
        const success = bedStore.checkInBed(form.bedId, {
          name: form.elderName,
          gender: form.gender,
          startDate: form.startDate
        });

        if (success) {
          // 2. 保存详细客户档案 (Customer Management Sync)
          const customerProfile = {
            id: Date.now(), // 生成唯一ID
            bedId: form.bedId,
            floor: form.floor,
            roomNo: form.roomNo,
            bedNo: selectedBedInfo.value?.bedNo,
            elderName: form.elderName,
            gender: form.gender,
            age: form.age,
            idCard: form.idCard,
            phone: form.phone,
            emergencyContact: form.emergencyContact,
            startDate: form.startDate,
            healthNote: form.healthNote,
            status: 'occupied'
          };
          
          bedStore.saveCustomerProfile(customerProfile);

          ElMessage.success(`🎉 入住办理成功！\n长者：${form.elderName} 已安置于 ${form.floor}-${form.roomNo}-${selectedBedInfo.value?.bedNo}床`);
          resetForm();
        } else {
          ElMessage.error('办理失败，请检查床位状态');
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('系统错误，请稍后重试');
      } finally {
        submitting.value = false;
      }
    }
  });
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  form.floor = '';
  form.roomNo = '';
  form.bedId = null;
  form.elderName = '';
  form.idCard = '';
  form.phone = '';
  form.emergencyContact = '';
  form.healthNote = '';
};
</script>

<style scoped>
.checkin-dialog-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.box-card {
  max-width: 1000px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
}

.section-title {
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
  font-size: 16px;
}

/* 床位选择区域样式 */
bed-selection-area {
  background: #fff;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  height: 100%;
}

/* 模拟草图/预览区域 */
bed-sketch-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f9fafc;
  border-radius: 6px;
  text-align: center;
  border: 1px dashed #dcdfe6;
}

.sk-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.sketch-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.sk-box.placeholder {
  color: #c0c4cc;
  background: #f5f7fa;
}

.bed-icon {
  font-size: 40px;
  margin-bottom: 5px;
}

.bed-info-text {
  font-size: 14px;
  color: #606266;
}

.sketch-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  margin-bottom: 0;
}

/* 状态颜色模拟 */
.status-empty .bed-icon { color: #67C23A; }
.status-empty { border: 1px solid #e1f3d8; background: #f0f9eb; }

.status-occupied .bed-icon { color: #909399; }
.status-occupied {border: 1px solid #ebeef5; background: #f4f4f5; }

/* 信息录入区域 */
info-entry-area {
  background: #fff;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.form-footer {
  margin-top: 30px;
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
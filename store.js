// src/store.js
import { reactive } from 'vue';

export const bedStore = reactive({
  // ... 原有的 rooms 数据保持不变 ...
  rooms: [
    {
      floor: '1F',
      list: [
        { roomNo: '101', beds: [
            { id: 1, bedNo: 'A', status: 'occupied', elderName: '张建国', startDate: '2023-01-15', endDate: null, gender: 'M' },
            { id: 2, bedNo: 'B', status: 'empty', elderName: '', startDate: null, endDate: null, gender: '' }
          ]
        },
        { roomNo: '102', beds: [
            { id: 3, bedNo: 'A', status: 'out', elderName: '李秀英', startDate: '2023-02-10', endDate: null, gender: 'F' },
            { id: 4, bedNo: 'B', status: 'occupied', elderName: '王得志', startDate: '2023-03-01', endDate: null, gender: 'M' }
          ]
        },
        { roomNo: '103', beds: [
            { id: 5, bedNo: 'A', status: 'maintain', elderName: '', startDate: null, endDate: null, gender: '' },
            { id: 6, bedNo: 'B', status: 'empty', elderName: '', startDate: null, endDate: null, gender: '' }
          ]
        }
      ]
    },
    {
      floor: '2F',
      list: [
        { roomNo: '201', beds: [
            { id: 7, bedNo: 'A', status: 'occupied', elderName: '赵敏', startDate: '2023-04-01', endDate: null, gender: 'F' },
            {id: 8, bedNo: 'B', status: 'occupied', elderName: '孙大', startDate: '2023-04-05', endDate: null, gender: 'F' }
          ]
        }
      ]
    },
    {
      floor: '3F',
      list: [
        { roomNo: '301', beds: [
            { id: 9, bedNo: 'A', status: 'empty', elderName: '', startDate: null, endDate: null,gender: '' },
            {id: 10, bedNo: 'B', status: 'empty', elderName: '', startDate: null, endDate: null,gender: '' }
        ]},
        { roomNo: '302', beds: [
            {id: 11, bedNo: 'A', status: 'empty', elderName: '', startDate: null, endDate: null,gender: '' },
            {id: 12, bedNo: 'B', status: 'empty', elderName: '', startDate: null, endDate: null,gender: '' }
          ]
        },
        { roomNo: '303', beds: [
            {id: 13, bedNo: 'A', status: 'empty', elderName: '', startDate: null, endDate: null,gender: '' },
            {id: 14, bedNo: 'B', status: 'empty', elderName: '', startDate: null, endDate: null,gender: '' }
          ]
        }
      ]
    }
  ],
  
  // 【新增】客户详细档案列表
  customers: [],
  history: [],

  // ... 原有的 getUsingBeds, getEmptyBeds, updateBed, swapBeds, checkOutBed, checkInBed, addHistory 方法保持不变 ...
  getUsingBeds() {
    let list = [];
    this.rooms.forEach(floor => {
      floor.list.forEach(room => {
        room.beds.forEach(bed => {
          if (bed.status === 'occupied' || bed.status === 'out') {
            list.push({ ...bed, roomNo: room.roomNo, bedInfo: `${room.roomNo}-${bed.bedNo}` });
          }
        });
      });
    });
    return list;
  },
  getEmptyBeds() {
    let list = [];
    this.rooms.forEach(floor => {
      floor.list.forEach(room => {
        room.beds.forEach(bed => {
          if (bed.status === 'empty') {
            list.push({ ...bed, roomNo: room.roomNo, bedInfo: `${room.roomNo}-${bed.bedNo}` });
          }
        });
      });
    });
    return list;
  },
  updateBed(updatedBed) {
    for (let floor of this.rooms) {
      for (let room of floor.list) {
        const bedIndex = room.beds.findIndex(b => b.id === updatedBed.id);
        if (bedIndex !== -1) {
          Object.assign(room.beds[bedIndex], updatedBed);
          return true;
        }
      }
    }
    return false;
  },
  swapBeds(sourceBedId, targetBedId) {
    let sourceBed = null, targetBed = null;
    let sourceRoom = null, targetRoom = null;
    for (let floor of this.rooms) {
      for (let room of floor.list) {
        const sIdx = room.beds.findIndex(b => b.id === sourceBedId);
        const tIdx = room.beds.findIndex(b => b.id === targetBedId);
        if (sIdx !== -1) { sourceBed = room.beds[sIdx]; sourceRoom = room; }
        if (tIdx !== -1) { targetBed = room.beds[tIdx]; targetRoom = room; }
      }
    }
    if (!sourceBed || !targetBed) return false;
    this.addHistory({ ...sourceBed, roomNo: sourceRoom.roomNo, bedInfo: `${sourceRoom.roomNo}-${sourceBed.bedNo}`, endDate: new Date().toISOString().split('T')[0] });
    const tempName = sourceBed.elderName; const tempGender = sourceBed.gender; const tempStart = sourceBed.startDate;
    if (targetBed.status === 'empty') {
        sourceBed.status = 'empty'; sourceBed.elderName = ''; sourceBed.gender = ''; sourceBed.startDate = null;
        targetBed.status = 'occupied'; targetBed.elderName = tempName; targetBed.gender = tempGender;targetBed.startDate = new Date().toISOString().split('T')[0];
    } else {
        this.addHistory({ ...targetBed, roomNo: targetRoom.roomNo, bedInfo: `${targetRoom.roomNo}-${targetBed.bedNo}`, endDate: new Date().toISOString().split('T')[0] });
        sourceBed.elderName = targetBed.elderName; sourceBed.gender = targetBed.gender; sourceBed.startDate = targetBed.startDate;
        targetBed.elderName = tempName; targetBed.gender = tempGender;targetBed.startDate = tempStart;
    }
    return true;
  },
  checkOutBed(bedId) {
    for (let floor of this.rooms) {
      for (let room of floor.list) {
        const bedIndex = room.beds.findIndex(b => b.id === bedId);
        if (bedIndex !== -1) {
          const bed = room.beds[bedIndex];
          this.addHistory({ ...bed, roomNo: room.roomNo, bedInfo: `${room.roomNo}-${bed.bedNo}`, endDate: new Date().toISOString().split('T')[0] });
          bed.status = 'empty'; bed.elderName = ''; bed.gender = ''; bed.startDate = null;
          return true;
        }
      }
    }
    return false;
  },
  checkInBed(bedId, elderInfo) {
    for (let floor of this.rooms) {
      for (let room of floor.list) {
        const bedIndex = room.beds.findIndex(b => b.id === bedId);
        if (bedIndex !== -1) {
          const bed = room.beds[bedIndex];
          if (bed.status !== 'empty') {
             alert('该床位非空闲状态，无法入住');
             return false;
          }
          bed.status = 'occupied';
          bed.elderName = elderInfo.name;
          bed.gender = elderInfo.gender;
          bed.startDate = elderInfo.startDate || new Date().toISOString().split('T')[0];
          return true;
        }
      }
    }
    return false;
  },
  addHistory(record) {
    this.history.unshift(record);
  },

  // 【新增】保存客户详细档案
  saveCustomerProfile(profile) {
    // 简单去重：如果身份证号已存在则更新，否则新增
    const existingIndex = this.customers.findIndex(c => c.idCard === profile.idCard);
    if (existingIndex !== -1) {
      this.customers[existingIndex] = { ...this.customers[existingIndex], ...profile };
    } else {
      this.customers.push(profile);
    }
  },
  
  // 【新增】获取所有客户
  getAllCustomers() {
    return this.customers;
  }
});
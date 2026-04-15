<template>
  <!--最外层容器，虽然可能没用但是如果写样式肯定有用-->
  <div class="out">
    <el-card class="box-card">
      
      <!--中间可以看作是一个大的卡片，这里是设计一个好看一些的卡片的头部，底下加个分割线和表格部分分割出去-->
      <template #header>
        <div class="card-header">
          <span>📋 退住登记</span>
          <!-- 标签，放在右边，好看 -->
          <el-tag type="info" effect="plain">申请退住 & 审批管理</el-tag>
        </div>
      </template>

      <!-- 这里放的是查询的输入框和查询按钮，按钮一会加个click事件，用css让他们俩中间有间隙-->
      <div class="searchout">
        <div class="searchform">
          <el-input 
            placeholder="客户姓名" 
            clearable
            style="width: 200px"
          />
          <el-button type="primary">查询</el-button>
        </div>
      </div>

      <!--这就是总体的一个大的表格区域了-->
      <div class="cts">
        <h4 class="ctstitle">🏠 当前入住客户</h4>
        <el-table :data="[]" border>

            <!-- 表格的各列的列表项，这个表格链接的是客户信息 -->
          <el-table-column prop="name" label="姓名" />

          <el-table-column prop="age" label="年龄" />

          <el-table-column prop="gender" label="性别" />

          <el-table-column prop="bedNo" label="床号" />
    
          <el-table-column prop="careLevel" label="护理级别" />
          

          <el-table-column label="操作" fixed="right" width="120">
            <template #default>
              <el-button type="primary" size="small">申请退住</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!--下面的退住申请的表格-->
      <div class="application-table-section">
        <h4 class="section-title">📋 退住申请记录</h4>
        <el-table :data="[]" border>
          
          <el-table-column prop="customerName" label="客户姓名" />
          
          <el-table-column prop="checkInDate" label="入住时间" />
          
          <el-table-column prop="checkOutDate" label="退住时间" />
          
          <el-table-column prop="checkOutType" label="退住类型" />
          
          <el-table-column prop="reason" label="退住原因" />
          
          <el-table-column prop="approvalDate" label="审批时间" />
          
          <el-table-column label="审批状态">
            <template #default>
              <el-tag type="warning">待审批</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="bedNo" label="床位" />


          <!-- 操作按钮 -->
          <el-table-column label="操作" fixed="right" width="150">
            <template #default>
              <el-button type="success" size="small" plain>通过</el-button>
              <el-button type="danger" size="small" plain>驳回</el-button>
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
    import {ref,reactive} from 'vue'
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

/* ========== 1. 卡片头部 ========== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
}

/* 解决标题和标签距离太近的问题 */
.card-header span {
  margin-right: 20px;  /* 让标题和标签之间有空隙 */
}

/* ========== 2. 查询区域 ========== */
.searchout {
  margin-bottom: 20px;
}

.searchform {
  display: flex;
  align-items: center;
  gap: 12px;  /* 输入框和按钮之间的空隙 */
}

/* ========== 3. 表格标题通用样式 ========== */
.ctstitle {
  margin: 16px 0 12px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

/* 第一个表格上方的标题（距离查询区域近一点，可以不加额外 margin-top） */
.cts .ctstitle {
  margin-top: 0;
}

/* ========== 4. 申请记录表格区域 ========== */
.application-table-section {
  margin-top: 30px;  /* 与上一个表格保持 30px 距离 */
}

/* ========== 5. 分页组件 ========== */
.pagination-wrapper {
  margin-top: 30px;  /* 距离表格 30px 空隙 */
  display: flex;
  justify-content: flex-end;
}

/* ========== 6. 表格内部样式优化（可选） ========== */
.el-table {
  border-radius: 4px;
  overflow: hidden;
}

/* 表格操作按钮之间的间距 */
.el-table .el-button + .el-button {
  margin-left: 8px;
}
</style>
<template>
    <div class="bc">
        <div class="card">

            <!-- 左边：图片区域 -->
            <div class="left">
                <div class="title">TCCT</div>
                <div class="wel">Welcome back</div>
                <div class="little">take care center,tcct</div>
                <el-image class="login-image" :src="loginImageUrl" fit="contain" />
            </div>

            <!-- 右边：登录区域 -->
            <div class="right">
                <div class="right-content">  
                <div class="signt">Sign In</div>
                <div class="label">Tel</div>
                <el-input v-model="input" style="height:40px" placeholder="请输入手机号" />
                <div class="passlabel">Password</div>
                <el-input v-model="passput" style="height:40px" type="password" placeholder="请输入密码" show-password>
                    <template #password-icon="{ visible }">
                        <el-icon :size="16">
                            <Unlock v-if="visible" />
                            <Lock v-else />
                        </el-icon>
                    </template>
                </el-input>
                <el-checkbox v-model="checked1" label="我已阅读并同意《东软颐养中心用户协议》" size="large" />
                <p class="forgetpass" @click="showForgpassMsg">忘记密码</p>
                <el-button type="primary" color="#7c3aed" class="login-btn" :disabled="!checked1">Sign in</el-button>
                <el-button type="primary" color="#7c3aed" class="crea-btn" @click="showCreateAccountMsg">create an account</el-button>
                </div>
            </div>
        </div>
    </div>
</template>



<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import loginImg from '@/assets/Login.svg'
import { Lock, Unlock } from '@element-plus/icons-vue'

const input = ref('')
const passput = ref('')
const loginImageUrl = ref(loginImg)
const checked1 = ref(false)

const showCreateAccountMsg = () => {
    ElMessage.warning('暂时不开放账号创建')
}

const showForgpassMsg = () => {
    ElMessage.warning('请联系上级管理员重置密码！')
}

</script>



<style scoped>
/* 背景颜色淡紫色 */
.bc {
    background-color: #e6e6fa;
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.right-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
/* 中间的登录卡片 */
.card {
    background-color: white;
    width: 70%;
    height: 70%;
    border-radius: 16px;
    box-sizing: border-box;
    display: flex;
    overflow: hidden;
}

/* 卡片的左边放图片的区域 */
.left {
    flex: 4;
    background-color: #b8a5d9;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

/* 设置左边的图片 */
.login-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin-top: 180px;
}

/* 右边：登录区域 60% */
.right {
    flex: 6;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 56px;
    position: relative;
}

/* 设置左边左上角的logo文字 */
.title {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-size: 18px;
    font-weight: 500;
    opacity: 0.9;
    z-index: 1;
}

/* Welcome back 文字 */
.wel {
    position: absolute;
    top: 16%;
    left: 0;
    right: 0;
    text-align: center;
    color: white;
    font-size: 28px;
    font-weight: 600;
    opacity: 0.9;
    z-index: 1;
}

/* welcome下面的小字 */
.little {
    position: absolute;
    top: 24%;
    left: 0;
    right: 0;
    text-align: center;
    color: white;
    font-size: 16px;
    font-weight: 400;
    opacity: 0.8;
    z-index: 1;
}

/*sign text 登录的Sing in */
.signt {
    font-size: 40px;
    font-weight: 350;
    font-family: 'SF Pro Rounded', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    color: #1a1a1a;
    position: absolute;
    top: 75px;              
    left: 40px;
}

.label {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    opacity: 0.8;
}

.passlabel {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
    margin-top: 20px;
    opacity: 0.8;
}

/* 登录按钮 */
.login-btn {
    width: 84%;
    position: absolute;
    top: 380px;              /* 离登录按钮 20px（登录按钮高约50px + 20px间距） */
    left: 55px;
}

/* 创建账号按钮 */
.crea-btn {
    position: absolute;
    top: 430px;             
    left: 43px;
    width: 84%;
    background-color: white;
    border: 1.5px solid #7c3aed;  
    color: #7c3aed;                 
    font-weight: 500;
}

.forgetpass {
    position: absolute;
    top: 340px;              
    left: 56px;
    color: #7c3aed;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;        
    transition: color 0.3s; 
}
.forgetpass:hover {
    color: #4a11a6;        
}

</style>
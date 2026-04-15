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

                    <div class="label">Username</div>
                    <!-- 登录编码设置最多八位 -->
                    <el-input v-model="input" style="height:40px" placeholder="请输入登录编码" @input="handlePhoneInput"
                        maxlength="8" />

                    <div class="passlabel">Password</div>
                    <el-input v-model="passput" style="height:40px" type="password" 
                        placeholder="请输入密码,最多16位"
                        @input="handlePasswordInput" maxlength="16" show-password>
                        <template #password-icon="{ visible }">
                            <el-icon :size="16">
                                <Unlock v-if="visible" />
                                <Lock v-else />
                            </el-icon>
                        </template>
                    </el-input>

                    <el-checkbox v-model="checked1" label="我已阅读并同意《东软颐养中心用户协议》" size="large" />

                    <p class="forgetpass" @click="showForgpassMsg">忘记密码</p>

                    <el-button type="primary" color="#7c3aed" class="login-btn" :disabled="!checked1" @click="handleAdminLogin">管理员登录
                        </el-button>
                    <el-button type="primary" color="#7c3aed" class="crea-btn" :disabled="!checked1" @click="handleWorkerLogin">健康管家（护工）登录
                        </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import loginImg from '@/assets/Login.svg'
import { Lock, Unlock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const input = ref('')
const passput = ref('')
const loginImageUrl = ref(loginImg)
const checked1 = ref(false)
const router = useRouter()

// 管理员账号
const adminUsers = [
    { loginCode: 'admin', password: 'admin' },      
    { loginCode: 'admin1', password: 'admin1' },
    { loginCode: 'admin2', password: 'admin2' }
]

// 护工账号（复用相同的账号体系，但角色不同）
const workerUsers = [
    { loginCode: 'admin', password: 'admin' },      
    { loginCode: 'admin1', password: 'admin1' },
    { loginCode: 'admin2', password: 'admin2' }
]

// 通用验证账号密码
const checkUser = (loginCode, password, userList) => {
    return userList.find(user => user.loginCode === loginCode && user.password === password)
}

// 偷懒之不允许忘记密码
const showForgpassMsg = () => {
    ElMessage.warning('请联系上级管理员重置密码！')
}

// 登录编码输入限制：只允许字母和数字，最多8位
const handlePhoneInput = (value) => {
    input.value = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
}

// 密码输入限制：最多16位（不限制字符类型）
const handlePasswordInput = (value) => {
    passput.value = value.slice(0, 16)  // 只限制长度，不限制字符
}

// 通用登录验证
const validateLogin = () => {
    if (!input.value || input.value.length === 0) {
        ElMessage.error('请输入登录编码')
        return false
    }
    
    if (!passput.value || passput.value.length === 0) {
        ElMessage.error('请输入密码')
        return false
    }
    
    return true
}

// 管理员登录
const handleAdminLogin = () => {
    if (!validateLogin()) return

    const user = checkUser(input.value, passput.value, adminUsers)
    if (!user) {
        ElMessage.error('登录编码或密码错误')
        return false
    }

    // 存储登录状态和角色
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('loginCode', input.value)
    localStorage.setItem('userRole', 'admin')

    ElMessage.success('管理员登录成功！')
    router.push('/')
}

// 护工登录
const handleWorkerLogin = () => {
    if (!validateLogin()) return

    const user = checkUser(input.value, passput.value, workerUsers)
    if (!user) {
        ElMessage.error('登录编码或密码错误')
        return false
    }

    // 存储登录状态和角色
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('loginCode', input.value)
    localStorage.setItem('userRole', 'worker')

    ElMessage.success('健康管家登录成功！')
    router.push('/')
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
    top: 380px;
    left: 55px;
}

/* 创建账号按钮（现在是护工登录按钮） */
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
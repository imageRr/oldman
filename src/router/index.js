import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import shouye from '@/components/shouye.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
    path: '/',
    name: 'shouye',
    component: shouye
  }
  ],
})


// 写登录页的路由守卫
router.beforeEach((to, from, next) => {

  // 公开页面（不需要登录就能访问，也就是登录页）
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  
  // 检查是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (authRequired && !isLoggedIn) {
    // 如果未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    // 已登录，跳转到首页（避免重复登录）
    next('/')
  } else {
    next()
  }
})

export default router

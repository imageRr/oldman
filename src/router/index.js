import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import shouye from '@/components/shouye.vue'
import Bedlayout from '@/components/bedlayout.vue'
import Bedmanagement from '@/components/bedmanagement.vue'
import customerlist from '@/components/customerlist.vue'
// 直接引入组件，不需要再包装 CheckInPage
import CheckInDialog from '@/components/CheckInDialog.vue' 

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
      children: [
      {
        path: '/bedlayout',
        name: 'bedlayout',
        component: Bedlayout
      },
      {
        path: '/bedmanagement',
        name: 'bedmanagement',
        component: Bedmanagement
      },
      {
        path: '/customerlist',
        name: 'customerlist',
        component: customerlist
      },
      {
        path: '/CheckInDialog',
        name: 'CheckInDialog',
        component: CheckInDialog // 直接使用组件
      }
    ]
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

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

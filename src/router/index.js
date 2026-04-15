import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import shouye from '@/components/shouye.vue'
import Bedlayout from '@/components/bedlayout.vue'
import Bedmanagement from '@/components/bedmanagement.vue'
import customerlist from '@/components/customerlist.vue'
import CheckInDialog from '@/components/CheckInDialog.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    name: 'shouye',
    component: shouye,
    children: [
      {
        path: 'bedlayout',        // 注意：不要写 /bedlayout，子路由用相对路径
        name: 'bedlayout',
        component: Bedlayout
      },
      {
        path: 'bedmanagement',
        name: 'bedmanagement',
        component: Bedmanagement
      },
      {
        path: 'customerlist',
        name: 'customerlist',
        component: customerlist
      },
      {
        path: 'checkin',
        name: 'CheckInDialog',
        component: CheckInDialog
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  // 统一用 History 模式
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (authRequired && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router

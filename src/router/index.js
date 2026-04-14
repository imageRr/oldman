import { createRouter, createWebHistory } from 'vue-router'
import showye from '@/components/showye.vue'
import ServiceFocus from '@/views/ServiceFocus.vue'
import ServiceTargets from '@/views/ServiceTargets.vue'
import BadLayout from '@/views/BadLayout.vue'
import CareItems from '@/views/CareItems.vue'

const routes = [
  {
    path: '/',
    name:'showye',
    component: showye,
    // children: [
    //   {
    //     path: '/',
    //     component: () => import('@/views/BadLayout.vue')
    //   },
    //   {
    //     path: '/service-targets',
    //     component: () => import('@/views/ServiceTargets.vue')
    //   },
    //   {
    //     path: '/service-focus',
    //     component: () => import('@/views/ServiceFocus.vue')
    //   }
    // ]
  },
  {
    path: '/service-targets',
    name: 'service-targets',
    component: ServiceTargets
  },
  {
    path: '/service-focus',
    name: 'service-focus',
    component: ServiceFocus
  },
  {
    path: '/bad-layout',
    name: 'bad-layout',
    component: BadLayout
  },
  {
    path: '/care-items',
    name: 'care-items',
    component: CareItems
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
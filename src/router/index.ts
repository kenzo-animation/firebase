import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import { isFirebaseConfigured } from '@/firebase';
import { getCurrentUser } from '@/services/firebase-auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/recover',
    name: 'recover',
    component: () => import('@/views/RecoveryPage.vue'),
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('@/views/WelcomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  if (!isFirebaseConfigured) {
    return to.meta.requiresAuth ? '/login' : true;
  }

  const user = await getCurrentUser();

  if (to.meta.requiresAuth && !user) {
    return '/login';
  }

  if (to.name === 'login' && user) {
    return '/welcome';
  }

  return true;
});

export default router;

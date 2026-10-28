<template>
  <ion-page>
    <ion-content class="welcome-page" :fullscreen="true">
      <header class="welcome-header">
        <a class="wordmark" href="/welcome" aria-label="Início">meu espaço<span>.</span></a>
        <div class="header-actions">
          <ion-button fill="clear" router-link="/profile" class="header-link"> Meu perfil </ion-button>
          <ion-button fill="clear" class="header-link" @click="logout">
            <ion-icon slot="start" :icon="logOutOutline" />
            Sair
          </ion-button>
        </div>
      </header>

      <main class="welcome-content">
        <div class="welcome-copy">
          <p class="eyebrow">SEU ESPAÇO PESSOAL</p>
          <h1>Que bom ter<br />você por aqui<span>.</span></h1>
          <p class="welcome-description">Este é o seu espaço. Atualize seu perfil e deixe tudo com a sua cara.</p>
          <ion-button class="primary-button profile-cta" router-link="/profile">
            Completar meu perfil
            <ion-icon slot="end" :icon="arrowForwardOutline" />
          </ion-button>
          <p v-if="errorMessage" class="form-message error-message" role="alert">
            {{ errorMessage }}
          </p>
        </div>
        <div class="welcome-art" aria-hidden="true">
          <div class="art-orbit orbit-one"></div>
          <div class="art-orbit orbit-two"></div>
          <div class="art-card">
            <div class="art-avatar"><ion-icon :icon="personOutline" /></div>
            <div class="art-line art-line-long"></div>
            <div class="art-line art-line-short"></div>
            <div class="art-sparkle sparkle-one">✦</div>
            <div class="art-sparkle sparkle-two">✦</div>
          </div>
        </div>
      </main>
      <footer class="welcome-footer">
        <span>Conectado como</span>
        <strong>{{ displayName }}</strong>
        <span class="footer-dot">·</span>
        <span>Seus dados estão protegidos</span>
      </footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline, logOutOutline, personOutline } from 'ionicons/icons';

import { getAuthErrorMessage, getCurrentUser, signOutUser } from '@/services/firebase-auth';
import { loadUserProfile } from '@/services/user-profile';

const router = useRouter();
const nickname = ref('');
const email = ref('');
const errorMessage = ref('');
const displayName = computed(() => nickname.value || email.value || 'Usuário');

onMounted(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    email.value = user.email ?? '';
    const profile = await loadUserProfile(user.uid);
    nickname.value = profile.nickname;
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  }
});

async function logout() {
  try {
    await signOutUser();
    await router.replace('/login');
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  }
}
</script>

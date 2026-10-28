<template>
  <ion-page>
    <ion-content class="auth-page" :fullscreen="true">
      <main class="auth-layout recovery-layout">
        <section class="auth-intro">
          <div class="brand-mark"><ion-icon :icon="mailOpenOutline" /></div>
          <p class="eyebrow">RECUPERAÇÃO DE ACESSO</p>
          <h1>Vamos ajudar<br />você a voltar.</h1>
          <p class="intro-copy">Enviaremos um link seguro para redefinir sua senha.</p>
        </section>

        <section class="auth-card">
          <div class="card-heading">
            <p class="eyebrow">SENHA ESQUECIDA?</p>
            <h2>Redefinir senha</h2>
            <p class="muted">Digite o e-mail associado à sua conta.</p>
          </div>

          <div v-if="!isFirebaseConfigured" class="setup-notice" role="status">
            <strong>Firebase ainda não configurado</strong>
            <span>Preencha as variáveis do arquivo .env.local para habilitar o acesso.</span>
          </div>

          <form class="auth-form" @submit.prevent="submit">
            <ion-input
              v-model="email"
              class="form-input"
              type="email"
              label="E-mail"
              label-placement="stacked"
              placeholder="voce@exemplo.com"
              autocomplete="email"
              required
            >
              <ion-icon slot="start" :icon="mailOutline" aria-hidden="true" />
            </ion-input>
            <ion-button
              class="primary-button"
              type="submit"
              expand="block"
              :disabled="isSubmitting || !isFirebaseConfigured"
            >
              {{ isSubmitting ? 'Enviando...' : 'Enviar link de recuperação' }}
              <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </form>

          <p v-if="message" class="form-message success-message" role="status">
            {{ message }}
          </p>
          <p v-if="errorMessage" class="form-message error-message" role="alert">
            {{ errorMessage }}
          </p>

          <div class="auth-links">
            <ion-button fill="clear" router-link="/login" class="text-button"> Voltar para o login </ion-button>
          </div>
        </section>
      </main>
      <p class="page-caption">Ionic · Vue · Capacitor · Firebase</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonButton, IonContent, IonIcon, IonInput, IonPage } from '@ionic/vue';
import { arrowForwardOutline, mailOpenOutline, mailOutline } from 'ionicons/icons';

import { isFirebaseConfigured } from '@/firebase';
import { getAuthErrorMessage, sendPasswordRecovery } from '@/services/firebase-auth';

const email = ref('');
const message = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);

async function submit() {
  isSubmitting.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    await sendPasswordRecovery(email.value);
    message.value = 'Se houver uma conta para este e-mail, enviaremos um link de recuperação.';
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

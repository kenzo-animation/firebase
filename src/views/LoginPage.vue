<template>
  <ion-page>
    <ion-content class="auth-page" :fullscreen="true">
      <main class="auth-layout">
        <section class="auth-intro">
          <div class="brand-mark"><ion-icon :icon="sparklesOutline" /></div>
          <p class="eyebrow">SEU ESPAÇO, DO SEU JEITO</p>
          <h1>Um lugar para<br />ser você.</h1>
          <p class="intro-copy">Acesse seu perfil com segurança e mantenha seus dados sempre por perto.</p>
          <div class="intro-note">
            <ion-icon :icon="shieldCheckmarkOutline" />
            <span>Seus dados protegidos pelo Firebase</span>
          </div>
        </section>

        <section class="auth-card">
          <div class="card-heading">
            <p class="eyebrow">{{ isRegistering ? 'COMECE AGORA' : 'BEM-VINDO DE VOLTA' }}</p>
            <h2>{{ isRegistering ? 'Crie sua conta' : 'Entrar na conta' }}</h2>
            <p class="muted">
              {{ isRegistering ? 'Use seu e-mail para criar seu acesso.' : 'Informe seus dados para continuar.' }}
            </p>
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

            <ion-input
              v-model="password"
              class="form-input"
              type="password"
              label="Senha"
              label-placement="stacked"
              placeholder="Mínimo de 6 caracteres"
              :minlength="6"
              :autocomplete="isRegistering ? 'new-password' : 'current-password'"
              required
            >
              <ion-icon slot="start" :icon="lockClosedOutline" aria-hidden="true" />
            </ion-input>

            <ion-button
              class="primary-button"
              type="submit"
              expand="block"
              :disabled="isSubmitting || !isFirebaseConfigured"
            >
              {{ isSubmitting ? 'Aguarde...' : isRegistering ? 'Criar conta' : 'Entrar' }}
              <ion-icon slot="end" :icon="arrowForwardOutline" />
            </ion-button>
          </form>

          <p v-if="errorMessage" class="form-message error-message" role="alert">
            {{ errorMessage }}
          </p>

          <div class="auth-links">
            <ion-button v-if="!isRegistering" fill="clear" router-link="/recover" class="text-button">
              Esqueci minha senha
            </ion-button>
            <p>
              {{ isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?' }}
              <button class="inline-link" type="button" @click="toggleMode">
                {{ isRegistering ? 'Fazer login' : 'Criar conta' }}
              </button>
            </p>
          </div>
        </section>
      </main>
      <p class="page-caption">Ionic · Vue · Capacitor · Firebase</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonIcon, IonInput, IonPage } from '@ionic/vue';
import {
  arrowForwardOutline,
  lockClosedOutline,
  mailOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
} from 'ionicons/icons';

import { isFirebaseConfigured } from '@/firebase';
import { getAuthErrorMessage, register, signIn } from '@/services/firebase-auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const isRegistering = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

async function submit() {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    if (isRegistering.value) {
      await register(email.value, password.value);
      await router.replace('/profile');
    } else {
      await signIn(email.value, password.value);
      await router.replace('/welcome');
    }
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}

function toggleMode() {
  errorMessage.value = '';
  isRegistering.value = !isRegistering.value;
}
</script>

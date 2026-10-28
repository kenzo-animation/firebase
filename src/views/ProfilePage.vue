<template>
  <ion-page>
    <ion-content class="profile-page" :fullscreen="true">
      <header class="welcome-header">
        <a class="wordmark" href="/welcome" aria-label="Início">meu espaço<span>.</span></a>
        <ion-button fill="clear" router-link="/welcome" class="header-link">
          <ion-icon slot="start" :icon="arrowBackOutline" />
          Início
        </ion-button>
      </header>

      <main class="profile-layout">
        <section class="profile-heading">
          <p class="eyebrow">SEU ESPAÇO PESSOAL</p>
          <h1>Seu perfil,<br />do seu jeito<span>.</span></h1>
          <p class="muted">Essas informações ajudam a personalizar sua experiência.</p>
          <div class="profile-security">
            <ion-icon :icon="shieldCheckmarkOutline" />
            <span>Seus dados são privados e protegidos.</span>
          </div>
        </section>

        <form class="profile-card" @submit.prevent="save">
          <div class="avatar-editor">
            <div class="profile-avatar">
              <img
                v-if="photoPreview || profile.photoURL"
                :src="photoPreview || profile.photoURL"
                alt="Prévia da foto do perfil"
              />
              <ion-icon v-else :icon="personOutline" aria-hidden="true" />
            </div>
            <div class="avatar-copy">
              <strong>Foto do perfil</strong>
              <span>JPG, PNG ou WEBP · até 5 MB</span>
              <button class="inline-link" type="button" @click="fileInput?.click()">Escolher foto</button>
              <input
                ref="fileInput"
                class="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Escolher foto do perfil"
                @change="selectPhoto"
              />
            </div>
          </div>

          <ion-input
            v-model="profile.fullName"
            class="form-input"
            label="Nome completo"
            label-placement="stacked"
            placeholder="Como podemos chamar você?"
            autocomplete="name"
            required
          >
            <ion-icon slot="start" :icon="personOutline" aria-hidden="true" />
          </ion-input>

          <ion-input
            v-model="profile.nickname"
            class="form-input"
            label="Apelido"
            label-placement="stacked"
            placeholder="Seu nome de preferência"
            required
          >
            <ion-icon slot="start" :icon="atOutline" aria-hidden="true" />
          </ion-input>

          <ion-input
            v-model="profile.birthDate"
            class="form-input"
            type="date"
            label="Data de nascimento"
            label-placement="stacked"
            :max="today"
            required
          >
            <ion-icon slot="start" :icon="calendarOutline" aria-hidden="true" />
          </ion-input>

          <p v-if="errorMessage" class="form-message error-message" role="alert">
            {{ errorMessage }}
          </p>
          <p v-if="successMessage" class="form-message success-message" role="status">
            {{ successMessage }}
          </p>

          <ion-button class="primary-button save-button" type="submit" expand="block" :disabled="isSaving">
            {{ isSaving ? 'Salvando...' : 'Salvar perfil' }}
            <ion-icon slot="end" :icon="checkmarkOutline" />
          </ion-button>
        </form>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonButton, IonContent, IonIcon, IonInput, IonPage } from '@ionic/vue';
import {
  arrowBackOutline,
  atOutline,
  calendarOutline,
  checkmarkOutline,
  personOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

import { auth } from '@/firebase';
import { getAuthErrorMessage, getCurrentUser } from '@/services/firebase-auth';
import { loadUserProfile, saveUserProfile, type UserProfile } from '@/services/user-profile';

const router = useRouter();
const profile = reactive<UserProfile>({
  fullName: '',
  birthDate: '',
  nickname: '',
  photoURL: '',
  photoPath: '',
});
const fileInput = ref<HTMLInputElement>();
const selectedPhoto = ref<File>();
const photoPreview = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isSaving = ref(false);
const today = computed(() => new Date().toISOString().slice(0, 10));

onMounted(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const savedProfile = await loadUserProfile(user.uid);
    Object.assign(profile, savedProfile);
    profile.fullName ||= user.displayName ?? '';
    profile.nickname ||= user.displayName ?? '';
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  }
});

onBeforeUnmount(() => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
});

function selectPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  errorMessage.value = '';
  successMessage.value = '';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    errorMessage.value = 'Escolha uma imagem JPG, PNG ou WEBP.';
    input.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'A imagem deve ter no máximo 5 MB.';
    input.value = '';
    return;
  }

  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  selectedPhoto.value = file;
  photoPreview.value = URL.createObjectURL(file);
}

async function save() {
  const user = auth?.currentUser;
  if (!user) {
    await router.replace('/login');
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const result = await saveUserProfile(
      user,
      {
        fullName: profile.fullName.trim(),
        birthDate: profile.birthDate,
        nickname: profile.nickname.trim(),
      },
      selectedPhoto.value,
    );
    selectedPhoto.value = undefined;
    profile.photoURL = result.photoURL;
    profile.photoPath = result.photoPath;
    successMessage.value = result.warning ?? 'Perfil atualizado com sucesso.';
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
      photoPreview.value = '';
    }
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error);
  } finally {
    isSaving.value = false;
  }
}
</script>

import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { requireFirebase } from '@/firebase';

export interface UserProfile {
  fullName: string;
  birthDate: string;
  nickname: string;
  photoURL: string;
  photoPath: string;
}

export interface ProfileInput {
  fullName: string;
  birthDate: string;
  nickname: string;
}

export interface SaveProfileResult {
  photoURL: string;
  photoPath: string;
  warning: string | null;
}

const emptyProfile: UserProfile = {
  fullName: '',
  birthDate: '',
  nickname: '',
  photoURL: '',
  photoPath: '',
};

export async function loadUserProfile(uid: string): Promise<UserProfile> {
  const { db } = requireFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));

  return snapshot.exists() ? { ...emptyProfile, ...(snapshot.data() as Partial<UserProfile>) } : { ...emptyProfile };
}

export async function saveUserProfile(user: User, input: ProfileInput, photo?: File): Promise<SaveProfileResult> {
  const { db, storage } = requireFirebase();
  const profileRef = doc(db, 'users', user.uid);
  const previous = await getDoc(profileRef);
  const oldPhotoPath = previous.exists() ? String(previous.data().photoPath ?? '') : '';

  let photoURL = previous.exists() ? String(previous.data().photoURL ?? '') : '';
  let photoPath = oldPhotoPath;

  if (photo) {
    const safeName = photo.name.replace(/[^\w.-]/g, '_');
    photoPath = `users/${user.uid}/profile/${Date.now()}-${safeName}`;
    const photoRef = ref(storage, photoPath);
    await uploadBytes(photoRef, photo, { contentType: photo.type });
    try {
      photoURL = await getDownloadURL(photoRef);
    } catch (error) {
      try {
        await deleteObject(photoRef);
      } catch (cleanupError) {
        throw new Error(
          `Não foi possível obter a URL da foto (${String(error)}) nem remover o arquivo enviado: ${String(cleanupError)}`,
          { cause: cleanupError },
        );
      }

      throw error;
    }
  }

  try {
    await setDoc(
      profileRef,
      {
        ...input,
        photoURL,
        photoPath,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    if (photo && photoPath !== oldPhotoPath) {
      try {
        await deleteObject(ref(storage, photoPath));
      } catch (cleanupError) {
        throw new Error(
          `O perfil não foi salvo (${String(error)}) e o arquivo temporário não pôde ser removido: ${String(cleanupError)}`,
          { cause: cleanupError },
        );
      }
    }

    throw error;
  }

  if (photo && oldPhotoPath && oldPhotoPath !== photoPath) {
    try {
      await deleteObject(ref(storage, oldPhotoPath));
      return { photoURL, photoPath, warning: null };
    } catch {
      return {
        photoURL,
        photoPath,
        warning: 'Perfil atualizado, mas não foi possível remover a foto anterior do armazenamento.',
      };
    }
  }

  return { photoURL, photoPath, warning: null };
}

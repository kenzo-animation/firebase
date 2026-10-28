import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';

import { requireFirebase } from '@/firebase';

export async function signIn(email: string, password: string): Promise<UserCredential> {
  const { auth } = requireFirebase();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function register(email: string, password: string): Promise<UserCredential> {
  const { auth } = requireFirebase();
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function sendPasswordRecovery(email: string): Promise<void> {
  const { auth } = requireFirebase();
  return sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser(): Promise<void> {
  const { auth } = requireFirebase();
  return signOut(auth);
}

export function getCurrentUser(): Promise<User | null> {
  const { auth } = requireFirebase();

  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}

export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Informe um endereço de e-mail válido.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/user-not-found': 'Não existe uma conta com este e-mail.',
    'auth/operation-not-allowed': 'Ative o método de autenticação por e-mail e senha no Firebase.',
  };

  if (code && messages[code]) {
    return messages[code];
  }

  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}

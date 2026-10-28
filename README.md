# Meu Espaço — Ionic, Vue, Capacitor e Firebase

Aplicação móvel híbrida para autenticação por e-mail, perfil pessoal, foto de
perfil e boas-vindas. A mesma interface Vue/Ionic funciona no navegador e pode
ser empacotada para Android e iOS com Capacitor.

## Pesquisa prática: conceitos e arquitetura

- **Ionic Framework** fornece componentes de interface adaptáveis a toque e
  navegação com aparência nativa.
- **Vue 3** organiza a interface em componentes e páginas reativas; o Vue Router
  separa as rotas públicas das páginas autenticadas.
- **Capacitor** executa a aplicação web em uma WebView nativa e permite adicionar
  recursos do dispositivo por plugins. O fluxo deste exemplo usa um seletor de
  imagem compatível com navegador e WebView.
- **Firebase Authentication** autentica contas com e-mail e senha e envia links
  de redefinição de senha.
- **Cloud Firestore** guarda os campos do perfil no documento `users/{uid}`.
- **Firebase Storage** guarda a imagem em `users/{uid}/profile/`; o perfil
  armazena sua URL de download e caminho para facilitar substituição e remoção.

O fluxo é: páginas Ionic → serviços tipados (`src/services`) → SDK Firebase
JavaScript → Authentication, Firestore e Storage. As credenciais de sessão são
consultadas pelo guard do Vue Router antes de abrir `/welcome` ou `/profile`.

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em **Authentication → Sign-in method**, habilite **E-mail/senha**.
3. Crie um banco em **Firestore Database** e habilite **Storage**.
4. Registre um app Web nas configurações do projeto e copie os valores de
   configuração para um arquivo `.env.local` na raiz. Use `.env.example` como
   modelo. Reinicie o servidor depois de alterar variáveis.
5. Publique as regras abaixo no Firestore e no Storage. As regras, e não a
   configuração pública do app web, protegem os dados. Não use regras abertas em
   produção.

### Regras do Cloud Firestore

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.keys().hasOnly([
          'fullName', 'birthDate', 'nickname', 'photoURL', 'photoPath', 'updatedAt'
        ])
        && request.resource.data.fullName is string
        && request.resource.data.birthDate is string
        && request.resource.data.nickname is string
        && request.resource.data.photoURL is string
        && request.resource.data.photoPath is string;
      allow delete: if false;
    }
  }
}
```

### Regras do Firebase Storage

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Executar e testar

```sh
npm install
npm run dev
npm run build
npm run test:unit
```

Para criar e sincronizar uma plataforma nativa, instale o SDK correspondente e
execute:

```sh
npx cap add android
npx cap sync android
npx cap open android
```

Para iOS, use `npx cap add ios`, `npx cap sync ios` e `npx cap open ios` em um
ambiente macOS com Xcode. Depois de alterar o frontend, execute `npm run build`
e `npx cap sync` para atualizar os arquivos nativos.

## Estrutura do perfil

```text
users/{uid}
  fullName: string
  birthDate: string (AAAA-MM-DD)
  nickname: string
  photoURL: string
  photoPath: string
  updatedAt: timestamp
```

O nome e a data são validados na tela; imagens são limitadas a JPG, PNG ou WEBP
com até 5 MB. Configure também os domínios autorizados do Authentication antes
de publicar a aplicação.

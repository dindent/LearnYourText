# PWA de Récitation et d'Apprentissage de Textes

Cette application est une Progressive Web App (PWA) conçue pour aider les utilisateurs à apprendre et à réciter des textes, avec un mode spécial pour les comédiens et les amateurs de théâtre.

## 🚀 Fonctionnalités Principales

- **Gestion de Compte Utilisateur** : Inscription et connexion sécurisées avec authentification par JWT.
- **Importation de Textes Flexible** :
  - **Manuelle** : Saisissez ou collez n'importe quel texte.
  - **PDF** : Uploadez un fichier PDF pour en extraire automatiquement le contenu.
  - **Image (OCR)** : Prenez une photo ou scannez une page, l'application reconnaît et extrait le texte.
- **Mode d'Apprentissage Individuel** :
  - Affichez votre texte et récitez-le.
  - L'application utilise la reconnaissance vocale pour transcrire votre récitation.
  - Recevez un feedback instantané avec un code couleur :
    - ✅ **Vert** : Mot correct.
    - 🟧 **Orange** : Mot manquant.
    - ❌ **Rouge** : Mot incorrect ou ajouté.
  - Obtenez un score de fidélité en pourcentage pour suivre votre progression.
- **Mode Théâtre** :
  - Importez une pièce de théâtre structurée.
  - Choisissez votre rôle parmi les personnages de la pièce.
  - L'application lit les répliques des autres personnages à voix haute (synthèse vocale).
  - Quand vient votre tour, récitez votre tirade et recevez un feedback ligne par ligne.

## 🛠️ Stack Technique

- **Frontend** : React (avec Create React App), React Router, Axios, Tesseract.js.
- **Backend** : Node.js, Express.
- **Base de données** : MongoDB avec Mongoose.
- **Authentification** : JSON Web Tokens (JWT).
- **Analyse de Texte** : `diff-match-patch`.
- **APIs Navigateur** : Web Speech API (SpeechRecognition pour le Speech-to-Text) et (SpeechSynthesis pour le Text-to-Speech).

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (v14 ou supérieure)
- npm (généralement inclus avec Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (ou un compte MongoDB Atlas)

## ⚙️ Installation

1. **Clonez le projet** (ou téléchargez les fichiers) :
   ```bash
   git clone <url_du_repo>
   cd pwa-recitation-app
   ```

2. **Installez les dépendances du backend** :
   ```bash
   cd backend
   npm install
   ```

3. **Installez les dépendances du frontend** :
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configurez les variables d'environnement du backend** :
   - Allez dans le dossier `backend`.
   - Copiez le fichier `.env.example` et renommez-le en `.env`.
   - Ouvrez `.env` et remplissez les variables :
     ```
     # Votre chaîne de connexion MongoDB
     MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

     # Une clé secrète longue et aléatoire pour les JWT
     JWT_SECRET=votre_super_secret_jwt
     ```

## ▶️ Exécution

Vous devez lancer le backend et le frontend dans deux terminaux séparés.

1. **Lancez le serveur backend** :
   - Depuis le dossier `pwa-recitation-app/backend` :
     ```bash
     npm run dev
     ```
   - Le serveur devrait démarrer sur `http://localhost:5000`.

2. **Lancez l'application frontend** :
   - Depuis le dossier `pwa-recitation-app/frontend` :
     ```bash
     npm start
     ```
   - L'application devrait s'ouvrir dans votre navigateur sur `http://localhost:3000`.

## 🎭 Exemple d'Utilisation (Mode Théâtre)

1. Créez un compte et connectez-vous.
2. Allez sur la page "Importer".
3. Copiez le texte ci-dessous dans la zone "Contenu", donnez-lui le titre "Balcon de Roméo", et **cochez la case "Il s'agit d'une pièce de théâtre"**.

   ```
   ROMÉO:
   Il se rit des plaies, celui qui n’a jamais reçu de blessures. Mais doucement ! Quelle lumière jaillit par cette fenêtre ? Là-bas, c’est l’Orient, et Juliette est le soleil !

   JULIETTE:
   Hélas !

   ROMÉO:
   Elle parle ! Oh ! parle encore, ange resplendissant !

   JULIETTE:
   Ô Roméo ! Roméo ! pourquoi es-tu Roméo ? Renie ton père et abdique ton nom ; ou, si tu ne le veux pas, jure de m’aimer, et je ne serai plus une Capulet.
   ```
4. Cliquez sur "Importer". Vous serez redirigé vers le tableau de bord.
5. Cliquez sur "Répéter la pièce" sur la carte "Balcon de Roméo".
6. Choisissez votre rôle (par exemple, "JULIETTE").
7. La pièce commence ! Écoutez Roméo, et quand vient votre tour, cliquez sur "Réciter la réplique" et parlez !

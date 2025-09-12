# 📚 LearnYourText - Application d'Apprentissage de Textes et Théâtre

Une application moderne et professionnelle conçue pour aider les comédiens, étudiants en art dramatique et passionnés de littérature à maîtriser leurs textes et scènes de théâtre.

## ✨ Fonctionnalités Principales

### 🎯 **Mode Récitation Individuelle**
- Affichage côte-à-côte du texte original et de votre récitation
- Reconnaissance vocale avancée en français
- Analyse en temps réel avec feedback visuel coloré
- Score de précision détaillé avec conseils d'amélioration
- Interface épurée et focus sur l'entraînement

### 🎭 **Mode Théâtre Interactif**
- Sélection de rôle parmi tous les personnages de la pièce
- Lecture automatique des autres personnages par synthèse vocale
- Mode automatique ou manuel pour contrôler le rythme
- Analyse ligne par ligne de vos répliques
- Statistiques de performance en temps réel
- Progression visuelle dans la pièce

### 📝 **Gestion Avancée des Textes**
- **Import manuel** : Interface moderne avec prévisualisation
- **Import PDF** : Extraction automatique du contenu
- **OCR intelligent** : Reconnaissance de texte à partir d'images avec barre de progression
- Support des formats théâtre avec détection automatique des personnages
- Organisation et recherche dans votre bibliothèque

### 🚀 **Interface Moderne**
- Design professionnel et ergonomique
- Thème moderne avec palette de couleurs cohérente
- Navigation intuitive avec icônes expressives
- Adaptation responsive (mobile, tablette, desktop)
- Accessibilité améliorée

## 🛠️ Stack Technique

### Frontend
- **React 18** avec hooks modernes
- **React Router v6** pour la navigation
- **Design System** personnalisé avec CSS variables
- **Reconnaissance vocale** (Web Speech API)
- **Synthèse vocale** (Web Speech Synthesis API)
- **OCR** avec Tesseract.js
- **Axios** pour les appels API

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **PDF parsing** et traitement de texte

## 🎨 Améliorations de l'Interface

### Design Professionnel
- **Palette de couleurs** moderne et accessible
- **Typographie** soignée avec Google Fonts (Inter)
- **Composants réutilisables** avec animations subtiles
- **États de chargement** informatifs
- **Messages d'erreur** clairs et utiles

### Expérience Utilisateur
- **Navigation simplifiée** sans authentification obligatoire
- **Feedback visuel** immédiat sur toutes les actions
- **Conseils contextuels** pour optimiser l'utilisation
- **Raccourcis clavier** et navigation au clavier
- **Indicateurs de progression** pour les tâches longues
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

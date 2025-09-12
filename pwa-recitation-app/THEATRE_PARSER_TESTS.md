# Tests du Système de Détection de Personnages

Le nouveau système de détection de personnages supporte plusieurs formats de pièces de théâtre et choisit automatiquement la meilleure méthode d'analyse.

## Formats Supportés

### 1. Format Standard avec Deux-Points (Méthode recommandée)
```
HAMLET: Être ou ne pas être, telle est la question.
OPHÉLIE: Mon seigneur, comment allez-vous ?
HAMLET: Je vous remercie humblement, bien, bien, bien.
```

### 2. Format Majuscules (Script traditionnel)
```
ROMÉO
Mais doucement ! Quelle lumière perce à cette fenêtre ?

JULIETTE  
Roméo, Roméo ! Pourquoi es-tu Roméo ?

ROMÉO
Faut-il que je l'entende encore, ou dois-je parler ?
```

### 3. Format avec Tiret/Trait d'Union
```
MARIE - Bonjour Pierre, comment vas-tu ?
PIERRE - Très bien Marie, et toi ?
MARIE - Ça va, merci de demander.
```

### 4. Format avec Parenthèses
```
(HAMLET) Être ou ne pas être, telle est la question.
(CLAUDIUS) Mon neveu Hamlet, et mon fils...
(HAMLET) Un peu plus que parent, et moins qu'un ami !
```

## Exemples de Tests

### Test 1: Script de Molière (Format standard)
```
ORGON: Que dit-il ?

DORINE: Que votre fille est bien malade, qu'elle a eu la fièvre, et qu'elle a passé une fort mauvaise nuit.

ORGON: Et Tartuffe ?

DORINE: Tartuffe ? Il se porte à merveille, gros et gras, le teint frais, et la bouche vermeille.
```
**Résultat attendu**: 2 personnages (ORGON, DORINE), 4 répliques

### Test 2: Script moderne (Format majuscules)
```
ALICE
Je ne comprends pas pourquoi tu dis ça.

BOB
Parce que c'est la vérité, Alice.

CHARLIE
Arrêtez de vous disputer, tous les deux !

ALICE
Charlie a raison, nous devons rester unis.
```
**Résultat attendu**: 3 personnages (ALICE, BOB, CHARLIE), 4 répliques

### Test 3: Script avec didascalies mélangées
```
HAMLET: (seul) Être ou ne pas être, telle est la question.

(Entre Ophélie)

OPHÉLIE: Mon seigneur...

HAMLET: (se tournant vers elle) Ma belle Ophélie ! 
Comment vous portez-vous ?
```
**Résultat attendu**: 2 personnages (HAMLET, OPHÉLIE), 3 répliques

### Test 4: Format avec traits d'union
```
JEAN-LUC - Capitaine, nous avons un problème.
PICARD - Que se passe-t-il, numéro un ?
JEAN-LUC - Les Borgs approchent de la Terre.
DATA - Capitaine, puis-je suggérer une stratégie ?
```
**Résultat attendu**: 3 personnages (JEAN-LUC, PICARD, DATA), 4 répliques

## Fonctionnalités Avancées

### Scoring Automatique
Le système évalue chaque méthode de détection et choisit celle qui donne les meilleurs résultats selon ces critères :
- Nombre de personnages détectés
- Nombre de lignes de dialogue
- Cohérence des noms de personnages
- Longueur raisonnable des répliques

### Post-traitement
- Nettoyage des noms de personnages (suppression des caractères spéciaux)
- Normalisation des espaces
- Validation de la longueur des noms (2-30 caractères)
- Standardisation en majuscules

### Statistiques
Pour chaque script analysé, le système fournit :
- Nombre total de personnages
- Nombre de répliques par personnage
- Nombre de mots par personnage
- Longueur moyenne des répliques par personnage

## Comment Tester

1. Ouvrez la page d'import (`/import`)
2. Sélectionnez "Pièce de théâtre" comme type
3. Collez un de vos scripts dans la zone de texte
4. Cliquez sur "🎭 Tester l'analyse du script"
5. Observez les résultats de détection et statistiques

## Résolution de Problèmes

### Si aucun personnage n'est détecté :
- Vérifiez le format de votre script
- Assurez-vous que les noms de personnages sont bien séparés du dialogue
- Essayez d'ajouter des deux-points après les noms de personnages

### Si des personnages sont mal détectés :
- Vérifiez l'orthographe et la cohérence des noms
- Évitez les caractères spéciaux dans les noms de personnages
- Séparez clairement les didascalies du dialogue

### Si le parsing échoue :
- Vérifiez que votre texte contient bien du dialogue
- Essayez de simplifier le format
- Contactez le support avec votre script pour analyse
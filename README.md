# 🚀 Create Your SaaS - Générateur d'Opportunités Micro-SaaS

Une application Next.js qui utilise l'IA pour découvrir des opportunités de micro-SaaS rentables aux États-Unis et analyser leur potentiel de réplication en France.

## ✨ Fonctionnalités

### 🔍 **Recherche Web Intelligente**
- **Scraping temps réel** : Reddit, Product Hunt, Indie Hackers, Hacker News
- **Revenus documentés** : Seules les opportunités avec preuves de revenus
- **Analyse personnalisée** : Selon votre niveau, temps disponible et domaines d'intérêt
- **Validation marché français** : Analyse concurrentielle et potentiel de réplication

### 📊 **Analyse Complète (CDC)**
- **Preuves marché US** : Revenus, traction, profils fondateurs avec liens cliquables
- **Marché français** : Taille, concurrents, adaptations RGPD, score sur 10
- **Architecture technique** : Stack recommandée, roadmap 3 phases
- **Modèle économique** : Pricing, projections, seuil de rentabilité
- **Go-to-market** : Stratégie de lancement adaptée à la France

### 🤖 **Coach de Développement Proactif**
- **Accompagnement personnalisé** : Adapté à votre niveau technique
- **Prompts Cursor optimisés** : Instructions ultra-précises, jamais de code direct
- **Écoute active** : Pose des questions pour comprendre vos besoins
- **4 modes contextuels** : Début, problème, guidance, validation

### 💰 **Système de Paiement Intégré**
- **4 messages gratuits** pour tester le service
- **15€ pour accès illimité** au coaching d'un projet
- **Paiement sécurisé Stripe** avec codes de session persistants
- **Multi-appareils** : Retrouvez votre session avec votre code

## 🛠️ Installation

### Prérequis
- Node.js 18+
- npm ou pnpm
- Clé API Grok (X.AI)
- Compte Stripe (optionnel pour les paiements)

### Configuration

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/create-your-saas.git
cd create-your-saas
```

2. **Installer les dépendances**
```bash
npm install
# ou
pnpm install
```

3. **Configuration des variables d'environnement**
```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos clés :
```env
# OBLIGATOIRE - Clé API xAI (Grok 4) pour la recherche web
XAI_API_KEY=your_xai_api_key_here
# Fallback pour compatibilité
GROK_API_KEY=your_xai_api_key_here

# OPTIONNEL - Stripe pour les paiements
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# URL de base
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Obtenir une clé API xAI (Grok 4)**
- Rendez-vous sur [x.ai](https://x.ai)
- Créez un compte développeur
- Générez une clé API
- Ajoutez-la dans `.env.local` comme `XAI_API_KEY`

5. **Lancer l'application**
```bash
npm run dev
# ou
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🎯 Utilisation

### 1. **Découverte d'Opportunités**
- Sélectionnez votre niveau technique (Facile/Intermédiaire/Complexe)
- Choisissez le temps disponible (1 semaine/1 mois/3+ mois)
- Optionnel : Sélectionnez vos domaines d'intérêt
- Cliquez sur "Découvrir les opportunités"

### 2. **Analyse Détaillée**
- Consultez les opportunités trouvées
- Cliquez sur "Voir le CDC" pour l'analyse complète
- Étudiez les preuves US, le marché français, et la stratégie

### 3. **Développement Assisté**
- Cliquez sur "Commencer le développement"
- Échangez avec le coach IA (4 messages gratuits)
- Recevez des prompts optimisés pour Cursor
- Payez 15€ pour un accès illimité au projet

## 🔧 Architecture Technique

### Stack
- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **IA** : Grok (X.AI) pour la recherche web temps réel
- **Paiements** : Stripe Checkout
- **Styling** : shadcn/ui components

### Structure du Projet
```
├── app/                    # Pages et API routes Next.js
│   ├── api/               # API endpoints
│   │   ├── search-opportunities/  # Recherche Grok
│   │   ├── stripe/        # Paiements Stripe
│   │   └── development-guide/     # Coach IA
│   ├── project/           # Pages de projet
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
├── lib/                   # Services et utilitaires
│   ├── grok-service.ts    # Service Grok
│   └── codes.json         # Codes de session
└── public/               # Assets statiques
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement dans Vercel
3. Déployez automatiquement

### Variables d'environnement de production
```env
XAI_API_KEY=your_production_xai_key
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com
```

## 🔍 Comment ça marche

### Recherche Web Intelligente
1. **Prompt modulaire** : Construit selon le profil utilisateur
2. **Scraping temps réel** : Grok recherche sur Reddit, Product Hunt, etc.
3. **Validation des données** : Seules les opportunités avec revenus documentés
4. **Parser robuste** : Extraction et validation du JSON retourné

### Coach de Développement
1. **Analyse du contexte** : Comprend où vous en êtes
2. **Questions ciblées** : Pose les bonnes questions
3. **Prompts Cursor** : Génère des instructions ultra-précises
4. **Suivi personnalisé** : S'adapte à vos réponses

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : contact@votre-domaine.com

---

**⚠️ Note importante** : Sans clé API Grok, l'application affichera une erreur lors de la recherche. La clé API est obligatoire pour la recherche web temps réel.

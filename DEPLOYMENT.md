# 🚀 Guide de Déploiement - Create Your SaaS

## ✅ Statut de Préparation

L'application est **100% prête** pour le déploiement GitHub → Vercel !

### Vérifications Effectuées ✅
- ✅ Build Next.js réussi sans erreurs
- ✅ Variables d'environnement sécurisées (`.env.local` dans `.gitignore`)
- ✅ Configuration Vercel optimisée (`vercel.json`)
- ✅ Documentation mise à jour (`README.md`)
- ✅ Cohérence des variables API (`XAI_API_KEY`)
- ✅ Types TypeScript corrects
- ✅ Sécurité : Aucune clé API hardcodée

## 🔧 Variables d'Environnement Requises

### Variables Obligatoires
```env
# API xAI (Grok 4) - OBLIGATOIRE pour la recherche web
XAI_API_KEY=your_xai_api_key_here

# Fallback pour compatibilité (optionnel)
GROK_API_KEY=your_xai_api_key_here
```

### Variables Optionnelles (Stripe)
```env
# Paiements Stripe - Optionnel
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# URL de base
NEXT_PUBLIC_BASE_URL=https://votre-domaine.vercel.app
```

## 📋 Étapes de Déploiement Vercel

### 1. Préparation GitHub
```bash
# Vérifier que tout est committé
git status

# Si nécessaire, committer les derniers changements
git add .
git commit -m "Préparation déploiement - Variables API corrigées"
git push origin main
```

### 2. Configuration Vercel

#### A. Connecter le Repository
1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer depuis GitHub : `Adrien1111131/Createyoursaas1`
4. Configurer les paramètres :
   - **Framework Preset** : Next.js
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

#### B. Variables d'Environnement
Dans les paramètres Vercel, ajouter :

**Variables Obligatoires :**
- `XAI_API_KEY` = `your_xai_api_key_here`

**Variables Optionnelles :**
- `STRIPE_SECRET_KEY` = `sk_live_your_live_stripe_key`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_your_live_stripe_key`
- `STRIPE_WEBHOOK_SECRET` = `whsec_your_webhook_secret`
- `NEXT_PUBLIC_BASE_URL` = `https://votre-domaine.vercel.app`

### 3. Déploiement
1. Cliquer sur "Deploy"
2. Attendre la fin du build (2-3 minutes)
3. Tester l'application déployée

## 🔍 Tests Post-Déploiement

### Tests Essentiels
1. **Page d'accueil** : Interface de recherche s'affiche
2. **Recherche d'opportunités** : Fonctionne avec l'API xAI
3. **Génération CDC** : Analyse complète des projets
4. **Coach de développement** : Chat IA fonctionnel
5. **Paiements Stripe** : Liens de paiement générés (si configuré)

### Tests de Sécurité
- ✅ Aucune clé API visible dans le code source
- ✅ Variables d'environnement protégées
- ✅ En-têtes de sécurité configurés

## 🛠️ Configuration Avancée

### Domaine Personnalisé
1. Dans Vercel → Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions
4. Mettre à jour `NEXT_PUBLIC_BASE_URL`

### Monitoring
- **Vercel Analytics** : Activé automatiquement
- **Error Tracking** : Logs disponibles dans Vercel Dashboard
- **Performance** : Core Web Vitals trackés

### Webhooks Stripe (si utilisé)
1. Dans Stripe Dashboard → Webhooks
2. Ajouter endpoint : `https://votre-domaine.vercel.app/api/stripe/webhook`
3. Sélectionner les événements : `checkout.session.completed`
4. Copier le secret webhook dans `STRIPE_WEBHOOK_SECRET`

## 🚨 Dépannage

### Erreurs Communes

#### "Configuration API manquante"
- **Cause** : Variable `XAI_API_KEY` manquante
- **Solution** : Ajouter la variable dans Vercel Settings

#### "Build Failed"
- **Cause** : Erreur TypeScript ou dépendance manquante
- **Solution** : Vérifier les logs Vercel, corriger et redéployer

#### "500 Internal Server Error"
- **Cause** : Erreur dans les API routes
- **Solution** : Vérifier les logs Vercel Functions

### Logs et Debug
```bash
# Logs en temps réel
vercel logs

# Logs d'une fonction spécifique
vercel logs --function=api/search-opportunities
```

## 📊 Performance

### Métriques Actuelles
- **Build Time** : ~2-3 minutes
- **Bundle Size** : 152 kB (page d'accueil)
- **API Routes** : 10 endpoints optimisés
- **Static Pages** : 2 pages pré-générées

### Optimisations Appliquées
- ✅ Code splitting automatique
- ✅ Images optimisées
- ✅ Compression gzip/brotli
- ✅ Cache headers configurés
- ✅ Bundle analysis intégré

## 🔄 Déploiement Continu

### Workflow Automatique
1. **Push sur `main`** → Déploiement automatique
2. **Pull Request** → Preview deployment
3. **Merge** → Production deployment

### Branches
- `main` → Production
- `develop` → Preview (optionnel)
- Feature branches → Preview deployments

## 📞 Support

### En cas de problème
1. **Vérifier les logs Vercel**
2. **Tester en local** : `npm run build && npm start`
3. **Variables d'environnement** : Vérifier la configuration
4. **GitHub Issues** : Reporter les bugs

---

## ✅ Checklist Finale

- [ ] Repository GitHub à jour
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Déploiement Vercel réussi
- [ ] Tests post-déploiement effectués
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Monitoring activé
- [ ] Documentation mise à jour

**🎉 Votre application Create Your SaaS est maintenant déployée et prête à l'emploi !**

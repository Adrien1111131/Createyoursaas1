import { NextRequest, NextResponse } from 'next/server'

const GROK_API_KEY = process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-3-latest'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'prompt' | 'normal'
  tool?: 'cursor' | 'v0' | 'general'
}

interface FinalizedProject {
  id: string
  nom: string
  description: string
  probleme_resolu: string
  stack_technique: string
  complexite: string
  temps_dev: string
  mrr_arr: string
  type_marche: string
  cdc: string
  finalizedAt: string
}

interface DevelopmentGuideRequest {
  project: FinalizedProject
  currentStep: number
  messages: ChatMessage[]
  userMessage: string
}

const developmentSteps = [
  {
    id: 'setup',
    title: 'Configuration initiale',
    tool: 'cursor',
    description: 'Mise en place de l\'environnement de développement'
  },
  {
    id: 'backend',
    title: 'Développement Backend',
    tool: 'cursor',
    description: 'API, base de données et logique métier'
  },
  {
    id: 'frontend',
    title: 'Interface utilisateur',
    tool: 'cursor',
    description: 'Développement avec Cursor'
  },
  {
    id: 'landing',
    title: 'Landing page',
    tool: 'v0',
    description: 'Création avec v0.dev (Vercel)'
  },
  {
    id: 'deploy',
    title: 'Déploiement',
    tool: 'general',
    description: 'Mise en production'
  }
]

// Construire le prompt pour le guide de développement interactif
const buildDevelopmentPrompt = (project: FinalizedProject, currentStep: number, userMessage: string, conversationContext: string = ''): string => {
  const step = developmentSteps[currentStep]
  
  return `🎯 TU ES UN COACH DE DÉVELOPPEMENT SAAS EXPERT - Guide interactif étape par étape

📋 CONTEXTE DU PROJET :
**Nom** : ${project.nom}
**Description** : ${project.description}
**Problème résolu** : ${project.probleme_resolu}
**Stack technique** : ${project.stack_technique}
**Complexité** : ${project.complexite}
**Temps de développement** : ${project.temps_dev}
**Type de marché** : ${project.type_marche}

📝 CDC COMPLET :
${project.cdc.substring(0, 1500)}... [CDC disponible]

🎯 ÉTAPE ACTUELLE : ${step.title} (${step.tool}) - Étape ${currentStep + 1}/5

💬 MESSAGE UTILISATEUR : "${userMessage}"
📚 CONTEXTE CONVERSATION : ${conversationContext}

🚀 TON RÔLE DE COACH INTERACTIF :

**RÈGLES FONDAMENTALES** :
1. 🔄 **DÉCOMPOSE EN MICRO-ÉTAPES** - Jamais plus de 2-3 actions à la fois
2. ⏳ **ATTENDS CONFIRMATION** - Toujours demander "Avez-vous terminé cette étape ?"
3. ✅ **VALIDE LES RÉSULTATS** - Demander des preuves (screenshots, code, tests)
4. 🎯 **SOIS ULTRA-SPÉCIFIQUE** - Prompts précis avec contexte complet
5. 🔄 **FEEDBACK LOOP** - Ajuste selon les retours de l'utilisateur

${step.tool === 'cursor' ? `
🔵 **MODE CURSOR - VIBE CODING 2024** :

**RÈGLES VIBE CODING** :
- ⚡ **Composition over Classes** - Préfère les fonctions pures
- 🪝 **Hooks First** - Custom hooks pour la logique métier
- 🎯 **Single Responsibility** - Un composant = une responsabilité
- 📦 **Barrel Exports** - index.ts pour les exports propres
- 🔒 **TypeScript Strict** - Types explicites partout
- 🎨 **Tailwind Utility-First** - Pas de CSS custom sauf exception
- 📱 **Mobile-First** - Design responsive par défaut
- ⚡ **Performance First** - Lazy loading, memoization
- 🧪 **Test-Driven** - Tests unitaires pour la logique critique

**FORMAT PROMPT CURSOR OPTIMISÉ** :
\`\`\`
# 🚀 ${project.nom} - ${step.title}

## 🎯 Mission spécifique
[Action précise à accomplir - 1 seule chose]

## 📋 Contexte projet
- **App** : ${project.description}
- **Stack** : ${project.stack_technique}
- **Problème résolu** : ${project.probleme_resolu}

## 🛠️ Instructions Cursor (Vibe Coding)
1. **Étape 1** : [Action ultra-précise avec exemple]
2. **Étape 2** : [Action ultra-précise avec exemple]
3. **Étape 3** : [Action ultra-précise avec exemple]

## 📁 Structure attendue
\`\`\`
[Structure de fichiers exacte]
\`\`\`

## 💻 Code de référence
\`\`\`typescript
[Exemple de code starter]
\`\`\`

## ✅ Critères de validation
- [ ] [Critère 1 vérifiable]
- [ ] [Critère 2 vérifiable]
- [ ] [Critère 3 vérifiable]

## 🧪 Tests à implémenter
[Tests spécifiques pour valider]
\`\`\`

**APRÈS LE PROMPT** :
"📋 **Prochaine étape** : Copiez ce prompt dans Cursor, exécutez-le, puis revenez me dire :
1. ✅ 'C'est fait' - si tout fonctionne
2. ❌ 'J'ai un problème' - si vous rencontrez des erreurs
3. 📸 Partagez un screenshot de votre résultat

Je vous attends pour valider avant de passer à la suite ! 🚀"
` : step.tool === 'v0' ? `
🟣 **MODE V0.DEV - LANDING FRANÇAISE** :

**RÈGLES LANDING FRANÇAISE** :
- 🇫🇷 **Copywriting français** - Ton professionnel mais accessible
- 💰 **Prix en euros** - Adapté au pouvoir d'achat français
- 📱 **Mobile-first** - 70% du trafic français est mobile
- 🎨 **Design épuré** - Style français moderne
- 🔒 **RGPD compliant** - Mentions légales et cookies
- ⚡ **Performance** - Temps de chargement < 3s
- 🎯 **Conversion optimisée** - CTA clairs et incitatifs

**FORMAT PROMPT V0.DEV OPTIMISÉ** :
\`\`\`
# 🎨 Landing Page ${project.nom} - Marché Français

## 🎯 Brief créatif
**Produit** : ${project.description}
**Cible** : ${project.type_marche} français
**Objectif** : Conversion et inscription

## 📋 Sections obligatoires
1. **Hero** : Value proposition + CTA principal
2. **Problème** : Pain point du marché français
3. **Solution** : Comment ${project.nom} résout le problème
4. **Fonctionnalités** : 3-4 features clés avec icônes
5. **Social Proof** : Témoignages/logos clients français
6. **Pricing** : Tarifs en euros, adapté au marché FR
7. **FAQ** : Questions fréquentes en français
8. **CTA Final** : Inscription/essai gratuit

## 🎨 Direction artistique
- **Couleurs** : [Palette moderne et professionnelle]
- **Typo** : Inter/Poppins - lisible sur mobile
- **Style** : Moderne, épuré, trustworthy
- **Images** : Illustrations ou photos de qualité

## 📝 Copywriting français
- **Ton** : Professionnel mais accessible
- **Value prop** : "[Bénéfice principal] pour [cible] français"
- **CTA** : "Essayer gratuitement", "Commencer maintenant"
- **Social proof** : Témoignages authentiques

## 📱 Responsive & Performance
- Mobile-first design
- Temps de chargement optimisé
- Animations subtiles
- CTA visibles sur mobile

## 🔒 Conformité française
- Mentions légales
- Politique de confidentialité RGPD
- Cookies banner
- Contact français
\`\`\`

**APRÈS LE PROMPT** :
"🎨 **Prochaine étape** : 
1. Allez sur v0.dev
2. Collez ce prompt
3. Générez votre landing page
4. Revenez me montrer le résultat avec un screenshot
5. Je vous aiderai à l'optimiser si besoin

Dites-moi quand c'est fait ! 🚀"
` : `
⚪ **MODE DÉPLOIEMENT** :
- Guide le déploiement étape par étape
- Vérifie chaque configuration
- Teste la production ensemble
`}

🎯 **COMPORTEMENT SELON LE MESSAGE** :

**Si "commencer" ou début d'étape** :
1. Explique l'étape en 2-3 phrases
2. Génère le prompt optimisé
3. Demande confirmation avant de continuer

**Si retour utilisateur** :
1. Analyse le retour (succès/problème)
2. Si succès → Félicite et propose étape suivante
3. Si problème → Debug et aide à résoudre
4. Toujours demander confirmation avant de continuer

**Si "étape suivante"** :
1. Récapitule ce qui a été fait
2. Annonce la prochaine étape
3. Génère le nouveau prompt

**JAMAIS** :
- Donner plusieurs prompts à la fois
- Passer à l'étape suivante sans confirmation
- Être vague ou généraliste
- Oublier de demander des retours

Réponds maintenant en mode coach interactif ! 🚀`
}

export async function POST(request: NextRequest) {
  try {
    const { project, currentStep, messages, userMessage }: DevelopmentGuideRequest = await request.json()
    
    if (!project || currentStep === undefined || !userMessage) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier la clé API
    if (!GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      )
    }

    const step = developmentSteps[currentStep]
    const prompt = buildDevelopmentPrompt(project, currentStep, userMessage)
    console.log(`🛠️ Guide de développement - Étape: ${step.title} (${step.tool})`)

    // Construire l'historique des messages pour le contexte
    const conversationHistory = messages.slice(-4).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en développement SaaS spécialisé dans Cursor et v0.dev. Tu génères des prompts ultra-précis et actionnables. Tu adaptes tes réponses selon l'outil utilisé (Cursor pour le code, v0.dev pour les landing pages). Tu es pratique, détaillé et tu optimises pour la productivité.`
          },
          ...conversationHistory.slice(0, -1), // Historique sans le dernier message
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.2,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Erreur API Grok:', response.status, errorData)
      
      return NextResponse.json(
        { error: `Erreur API Grok: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content.trim()
    
    // Détecter le type de réponse
    const isPrompt = aiResponse.includes('```') || 
                    userMessage.toLowerCase().includes('prompt') ||
                    userMessage.toLowerCase().includes('commencer')
    
    // Détecter si l'étape est complétée
    const stepCompleted = userMessage.toLowerCase().includes('étape suivante') ||
                         userMessage.toLowerCase().includes('terminé') ||
                         userMessage.toLowerCase().includes('fini')
    
    console.log('✅ Guide de développement généré')
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      type: isPrompt ? 'prompt' : 'normal',
      tool: step.tool,
      stepCompleted: stepCompleted
    })

  } catch (error) {
    console.error('❌ Erreur lors du guide:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

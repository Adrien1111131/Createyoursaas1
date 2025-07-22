import { NextRequest, NextResponse } from 'next/server'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-4-0709'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'prompt' | 'normal' | 'coaching'
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

// Micro-étapes intelligentes adaptées au projet
const generateMicroSteps = (project: FinalizedProject) => {
  const baseSteps = [
    { id: 'setup', title: 'Setup Initial', tool: 'cursor', duration: '5 min' },
    { id: 'structure', title: 'Structure Projet', tool: 'cursor', duration: '10 min' }
  ]

  // Adapter selon le type de projet
  const projectType = analyzeProjectType(project)
  
  if (projectType.needsLanding) {
    baseSteps.push(
      { id: 'landing-design', title: 'Design Landing', tool: 'v0', duration: '15 min' },
      { id: 'landing-integration', title: 'Intégration Landing', tool: 'cursor', duration: '20 min' }
    )
  }

  if (projectType.needsAuth) {
    baseSteps.push(
      { id: 'auth-setup', title: 'Authentification', tool: 'cursor', duration: '25 min' }
    )
  }

  if (projectType.needsDatabase) {
    baseSteps.push(
      { id: 'database-schema', title: 'Schéma Base', tool: 'cursor', duration: '15 min' },
      { id: 'database-connection', title: 'Connexion DB', tool: 'cursor', duration: '20 min' }
    )
  }

  // Fonctionnalités spécifiques au projet
  baseSteps.push(
    { id: 'core-feature', title: `Fonctionnalité ${project.nom}`, tool: 'cursor', duration: '30 min' },
    { id: 'ui-components', title: 'Composants UI', tool: 'cursor', duration: '25 min' },
    { id: 'api-routes', title: 'Routes API', tool: 'cursor', duration: '20 min' },
    { id: 'testing', title: 'Tests & Debug', tool: 'cursor', duration: '15 min' },
    { id: 'deploy', title: 'Déploiement', tool: 'cursor', duration: '20 min' }
  )

  return baseSteps
}

// Analyser le type de projet pour adapter les étapes
const analyzeProjectType = (project: FinalizedProject) => {
  const description = project.description.toLowerCase()
  const problem = project.probleme_resolu.toLowerCase()
  const name = project.nom.toLowerCase()
  
  return {
    needsLanding: project.type_marche === 'b2c' || description.includes('landing') || description.includes('site'),
    needsAuth: description.includes('utilisateur') || description.includes('compte') || description.includes('connexion'),
    needsDatabase: description.includes('données') || description.includes('base') || description.includes('stockage'),
    needsPayment: description.includes('paiement') || description.includes('abonnement') || project.mrr_arr !== 'Gratuit',
    isEcommerce: description.includes('commerce') || description.includes('vente') || description.includes('boutique'),
    isProductivity: description.includes('productivité') || description.includes('tâche') || description.includes('organisation'),
    isAnalytics: description.includes('analytics') || description.includes('statistique') || description.includes('données'),
    complexity: project.complexite
  }
}

// Système de coaching intelligent et conversationnel
const buildIntelligentCoachingPrompt = (
  project: FinalizedProject, 
  currentStep: number, 
  userMessage: string, 
  messages: ChatMessage[]
): string => {
  const projectType = analyzeProjectType(project)
  const microSteps = generateMicroSteps(project)
  const currentMicroStep = microSteps[currentStep] || microSteps[0]
  
  // Analyser le contexte de la conversation
  const conversationContext = analyzeConversationContext(messages, userMessage)
  
  return `Tu es un coach dev senior qui accompagne le développement de ${project.nom} avec Cursor. Sois proactif et à l'écoute.

🎯 PROJET : ${project.nom}
📝 DESCRIPTION : ${project.description}
🔧 STACK : ${project.stack_technique}
⚡ COMPLEXITÉ : ${project.complexite}

🎯 ÉTAPE ACTUELLE : ${currentMicroStep.title} (${currentMicroStep.duration})
💬 MESSAGE UTILISATEUR : "${userMessage}"

📊 ANALYSE PROJET :
- Type : ${projectType.isEcommerce ? 'E-commerce' : projectType.isProductivity ? 'Productivité' : projectType.isAnalytics ? 'Analytics' : 'Autre'}
- Besoin landing : ${projectType.needsLanding ? 'Oui' : 'Non'}
- Besoin auth : ${projectType.needsAuth ? 'Oui' : 'Non'}
- Besoin DB : ${projectType.needsDatabase ? 'Oui' : 'Non'}

🎯 CONTEXTE CONVERSATION :
- Phase : ${conversationContext.phase}
- Problème détecté : ${conversationContext.hasError ? 'Oui' : 'Non'}
- Besoin d'aide : ${conversationContext.needsHelp ? 'Oui' : 'Non'}
- Prêt pour suite : ${conversationContext.readyForNext ? 'Oui' : 'Non'}

MÉTHODOLOGIE DE COACHING PROACTIF :

1. 🎧 ÉCOUTE ET QUESTIONS STRATÉGIQUES :
   - Pose TOUJOURS des questions pour comprendre le niveau
   - Identifie les blocages avant qu'ils arrivent
   - Adapte ton approche selon les réponses
   - Questions types : "As-tu déjà utilisé Cursor ?", "Quel est ton niveau avec ${project.stack_technique} ?", "Préfères-tu des explications détaillées ?"

2. 🎯 PROMPTS CURSOR OPTIMISÉS :
   - JAMAIS de code direct - TOUJOURS des prompts Cursor
   - Contexte complet du projet ${project.nom}
   - Instructions étape par étape ultra-précises
   - Résultat attendu clairement défini

3. 🤝 ACCOMPAGNEMENT HUMAIN :
   - Explique POURQUOI chaque étape est importante
   - Rassure en cas de problème
   - Valide à chaque étape avant de continuer
   - Célèbre chaque petite victoire

STRUCTURE DE RÉPONSE SELON LE CONTEXTE :

SI DÉBUT/DÉCOUVERTE (${conversationContext.phase === 'start' ? 'ACTUEL' : 'non'}) :
- Salue chaleureusement
- Pose 2-3 questions pour comprendre le niveau
- Explique l'objectif de l'étape ${currentMicroStep.title}
- Attends les réponses avant de donner le prompt Cursor

SI PROBLÈME/ERREUR (${conversationContext.hasError ? 'ACTUEL' : 'non'}) :
- Rassure immédiatement
- Pose des questions précises sur l'erreur
- Donne une solution étape par étape
- Propose un nouveau prompt Cursor adapté

SI GUIDANCE ÉTAPE (${conversationContext.phase === 'progress' ? 'ACTUEL' : 'non'}) :
- Explique pourquoi cette étape est importante pour ${project.nom}
- Donne un prompt Cursor ultra-détaillé
- Demande confirmation de compréhension
- Précise le résultat attendu

SI VALIDATION/SUITE (${conversationContext.readyForNext ? 'ACTUEL' : 'non'}) :
- Félicite le progrès
- Pose des questions de validation
- Explique la prochaine étape
- Vérifie si prêt à continuer

EXEMPLE DE PROMPT CURSOR POUR ${project.nom} :
Crée un projet ${project.stack_technique} pour ${project.nom} - ${project.description}

Contexte : ${project.probleme_resolu}
Stack : ${project.stack_technique}
Objectif : [objectif précis de l'étape ${currentMicroStep.title}]

Instructions :
1. [instruction 1 ultra-précise]
2. [instruction 2 ultra-précise]
3. [instruction 3 ultra-précise]

Structure attendue :
- [fichier 1] : [rôle spécifique]
- [fichier 2] : [rôle spécifique]

Résultat attendu : [description précise du résultat]

RÉPONDS MAINTENANT en tant que coach proactif qui ÉCOUTE et GUIDE avec des questions et des prompts Cursor !`
}

// Analyser le contexte de la conversation
const analyzeConversationContext = (messages: ChatMessage[], userMessage: string) => {
  const lastMessages = messages.slice(-3).map(m => m.content.toLowerCase()).join(' ')
  const currentMessage = userMessage.toLowerCase()
  
  return {
    phase: currentMessage.includes('commencer') || messages.length <= 1 ? 'start' :
           currentMessage.includes('fait') || currentMessage.includes('terminé') ? 'completed' :
           currentMessage.includes('erreur') || currentMessage.includes('problème') ? 'error' :
           'progress',
    hasError: currentMessage.includes('erreur') || currentMessage.includes('problème') || 
              currentMessage.includes('marche pas') || currentMessage.includes('bug'),
    needsHelp: currentMessage.includes('aide') || currentMessage.includes('comment') ||
               currentMessage.includes('comprends pas'),
    readyForNext: currentMessage.includes('fait') || currentMessage.includes('terminé') ||
                  currentMessage.includes('suivant') || currentMessage.includes('ok'),
    isFirstTime: messages.length <= 1
  }
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
    if (!XAI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      )
    }

    // Générer les micro-étapes intelligentes
    const microSteps = generateMicroSteps(project)
    const currentMicroStep = microSteps[currentStep] || microSteps[0]
    
    // Construire le prompt intelligent
    const prompt = buildIntelligentCoachingPrompt(project, currentStep, userMessage, messages)
    
    console.log(`🤖 Coaching intelligent - ${project.nom} - Étape: ${currentMicroStep.title}`)

    // Construire l'historique des messages pour le contexte
    const conversationHistory = messages.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un coach dev senior expérimenté qui accompagne les développeurs avec Cursor. Tu es proactif, à l'écoute et tu guides intelligemment.

🎯 TON RÔLE : COACH PROACTIF AVEC CURSOR

JAMAIS de code direct - TOUJOURS des prompts Cursor optimisés !

📋 MÉTHODOLOGIE DE COACHING :

1. 🎧 ÉCOUTE ACTIVE :
   - Pose des questions pour comprendre le niveau
   - Identifie les blocages et difficultés
   - Adapte ton approche selon les réponses

2. 🤔 QUESTIONS STRATÉGIQUES :
   - As-tu déjà utilisé Cursor ?
   - Quel est ton niveau avec cette stack ?
   - Préfères-tu partir de zéro ou d'un template ?
   - Veux-tu que je t'explique cette étape avant ?

3. 🎯 PROMPTS CURSOR OPTIMISÉS :
   - Prompts clairs et spécifiques pour Cursor
   - Contexte complet du projet
   - Instructions étape par étape
   - Résultat attendu précis

STRUCTURE DE RÉPONSE SELON LE CONTEXTE :

🟢 DÉBUT/DÉCOUVERTE :
Salut ! 👋 Super de développer ce projet !

Avant qu'on commence, j'aimerais mieux te connaître :
- As-tu déjà utilisé Cursor ?
- Quel est ton niveau avec cette stack ?
- Préfères-tu des explications détaillées ou aller direct au but ?

Ça m'aide à t'accompagner au mieux ! 😊

🔴 PROBLÈME/BLOCAGE :
Je vois que tu rencontres un souci ! 🤔

Peux-tu me dire :
- À quelle étape exactement ça bloque ?
- Quel message d'erreur tu vois ?
- As-tu suivi le prompt Cursor que je t'ai donné ?

Avec ces infos, je vais t'aider à débloquer ça ! 💪

🟡 GUIDANCE ÉTAPE :
Parfait ! 👍 On va maintenant passer à l'étape suivante.

Voici pourquoi cette étape est importante : [explication]

Es-tu prêt ? Je vais te donner un prompt optimisé pour Cursor.

📋 PROMPT CURSOR :
[Prompt ultra-détaillé et spécifique]

Copie-colle ça dans Cursor et dis-moi ce que ça donne ! 🚀

✅ VALIDATION/SUITE :
Excellent ! 🎉 Le projet avance bien !

Avant de passer à la suite :
- Est-ce que le résultat correspond à ce qu'on voulait ?
- As-tu des questions sur cette étape ?
- Te sens-tu à l'aise pour continuer ?

Prêt pour l'étape suivante ? 😊

🆘 AIDE/EXPLICATION :
Bien sûr, je vais t'expliquer ! 📚

[Explication pédagogique claire]

Maintenant que c'est plus clair :
- Veux-tu que je te redonne le prompt Cursor ?
- As-tu besoin d'autres précisions ?
- On peut y aller ? 🚀

RÈGLES ABSOLUES :
1. 🚫 JAMAIS de code direct - TOUJOURS des prompts Cursor
2. 🎧 TOUJOURS poser des questions pour comprendre
3. 📋 Prompts Cursor ultra-détaillés avec contexte complet
4. 🤝 Accompagnement humain et bienveillant
5. 🎯 Adaptation selon le niveau et les réponses
6. ✅ Validation à chaque étape avant de continuer
7. 📚 Explications pédagogiques quand nécessaire

EXEMPLE DE PROMPT CURSOR OPTIMISÉ :
Crée un projet Next.js 14 pour [nom projet] - [description courte]

Contexte : [problème résolu]
Stack : [stack technique]
Objectif : [objectif précis de l'étape]

Instructions :
1. [instruction 1 précise]
2. [instruction 2 précise]
3. [instruction 3 précise]

Structure attendue :
- [fichier 1] : [rôle]
- [fichier 2] : [rôle]

Résultat attendu : [description du résultat]

TON STYLE : Humain, encourageant, proactif, à l'écoute, pédagogue`
          },
          ...conversationHistory,
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 1500
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
    
    // Analyser la réponse pour détecter le type et l'outil
    const conversationContext = analyzeConversationContext(messages, userMessage)
    const isPrompt = aiResponse.includes('Copie ça dans') || 
                    aiResponse.includes('```') ||
                    conversationContext.phase === 'start'
    
    // Détecter si l'étape est complétée
    const stepCompleted = conversationContext.readyForNext ||
                         userMessage.toLowerCase().includes('étape suivante') ||
                         userMessage.toLowerCase().includes('suivant')
    
    console.log('✅ Coaching intelligent généré')
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      type: isPrompt ? 'prompt' : 'coaching',
      tool: currentMicroStep.tool,
      stepCompleted: stepCompleted,
      currentMicroStep: currentMicroStep,
      totalSteps: microSteps.length
    })

  } catch (error) {
    console.error('❌ Erreur lors du coaching:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

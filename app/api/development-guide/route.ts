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
    title: 'Setup du projet',
    tool: 'cursor',
    description: 'Installation des dépendances et configuration'
  },
  {
    id: 'structure',
    title: 'Structure de base',
    tool: 'cursor',
    description: 'Organisation des dossiers et composants'
  },
  {
    id: 'landing',
    title: 'Landing page',
    tool: 'v0',
    description: 'Design de la landing page avec v0.dev'
  },
  {
    id: 'features',
    title: 'Fonctionnalités',
    tool: 'cursor',
    description: 'Développement des features principales'
  },
  {
    id: 'auth',
    title: 'Authentification',
    tool: 'cursor',
    description: 'Système de connexion'
  },
  {
    id: 'api',
    title: 'Intégration API',
    tool: 'cursor',
    description: 'Connexion avec le backend'
  },
  {
    id: 'deploy',
    title: 'Déploiement',
    tool: 'cursor',
    description: 'Mise en production sur Vercel'
  }
]

// Construire le prompt pour le guide de développement interactif
const buildDevelopmentPrompt = (project: FinalizedProject, currentStep: number, userMessage: string, conversationContext: string = ''): string => {
  const step = developmentSteps[currentStep]
  
return `Tu es un expert en vibe coding qui guide le développement de ${project.nom}.

CONTEXTE :
- App : ${project.description}
- Stack : ${project.stack_technique}
- Étape : ${step.title} (${currentStep + 1}/7)

MESSAGE : "${userMessage}"
HISTORIQUE : ${conversationContext}

RÈGLES :
1. Prompts courts (max 200 mots)
2. Instructions claires et directes
3. Une tâche à la fois
4. Demander confirmation
5. Adapter selon feedback

${step.tool === 'cursor' ? `
FORMAT PROMPT CURSOR :
\`\`\`
# ${project.nom} - ${step.title}

TÂCHE :
[Action précise et unique à accomplir]

CONTEXTE :
- App : ${project.description}
- Stack : ${project.stack_technique}

INSTRUCTIONS :
1. [Action spécifique]
2. [Action spécifique]
3. [Action spécifique]

CODE :
\`\`\`typescript
[Code de référence]
\`\`\`

Dites "C'est fait" quand terminé ou "J'ai un problème" si besoin d'aide.
\`\`\`
` : step.tool === 'v0' ? `
FORMAT PROMPT V0.DEV :
\`\`\`
# Landing Page ${project.nom}

DESCRIPTION :
${project.description}
Type : ${project.type_marche}

SECTIONS :
1. Hero avec value proposition
2. Features principales
3. Pricing adapté au marché
4. Call-to-action
5. Footer avec liens

STYLE :
- Design moderne et professionnel
- Responsive mobile-first
- Palette de couleurs cohérente
- Typographie lisible

CONTENU :
- CTA : "Commencer maintenant", "Essai gratuit"
- Images : Illustrations modernes
- Icônes : Set cohérent

Une fois la landing générée, on l'intégrera dans le projet.
\`\`\`
` : `
FORMAT PROMPT CURSOR :
\`\`\`
# ${project.nom} - ${step.title}

TÂCHE :
[Action précise et unique à accomplir]

CONTEXTE :
- App : ${project.description}
- Stack : ${project.stack_technique}

INSTRUCTIONS :
1. [Action spécifique]
2. [Action spécifique]
3. [Action spécifique]

CODE :
\`\`\`typescript
[Code de référence]
\`\`\`

Dites "C'est fait" quand terminé ou "J'ai un problème" si besoin d'aide.
\`\`\`
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
            content: `Tu es un expert en vibe coding qui guide le développement étape par étape.

RÈGLES :
1. Prompts courts (max 200 mots)
2. Une seule tâche à la fois
3. Instructions claires et directes
4. Code de référence pour chaque tâche
5. Demander confirmation avant de continuer

STYLE :
- Ton amical mais professionnel
- Phrases courtes et directes
- Exemples de code concrets
- Feedback rapide et constructif

OUTILS :
- Suggérer v0.dev pour les landing pages (design rapide et pro)
- Utiliser Cursor pour le développement spécifique
- Adapter les suggestions selon le projet

Ne jamais :
- Donner des explications longues
- Être rigide dans la méthodologie
- Passer à l'étape suivante sans confirmation
- Utiliser du jargon complexe`
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

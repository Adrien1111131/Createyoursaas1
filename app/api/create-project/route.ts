import { NextRequest, NextResponse } from 'next/server'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-4-0709'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ProjectDefinition {
  nom?: string
  description?: string
  probleme_resolu?: string
  utilisateurs_cibles?: string
  fonctionnalites_cles?: string[]
  stack_preferee?: string
  niveau_technique?: string
  contraintes?: string
  temps_disponible?: string
}

interface CreateProjectRequest {
  messages?: ChatMessage[]
  userMessage?: string
  currentDefinition?: ProjectDefinition
  action?: 'finalize'
  projectDefinition?: ProjectDefinition
}

// Construire le prompt pour comprendre et définir le projet
const buildProjectDefinitionPrompt = (
  userMessage: string, 
  currentDefinition: ProjectDefinition,
  messages: ChatMessage[]
): string => {
  const missingFields = []
  if (!currentDefinition.nom) missingFields.push('nom')
  if (!currentDefinition.description) missingFields.push('description')
  if (!currentDefinition.probleme_resolu) missingFields.push('problème résolu')
  if (!currentDefinition.utilisateurs_cibles) missingFields.push('utilisateurs cibles')
  if (!currentDefinition.stack_preferee) missingFields.push('stack technique')
  if (!currentDefinition.niveau_technique) missingFields.push('niveau technique')
  if (!currentDefinition.temps_disponible) missingFields.push('temps disponible')
  
  const nextField = missingFields[0]
  const progress = `${7 - missingFields.length}/7 informations collectées`
  
  return `🎯 TU ES UNE IA SPÉCIALISÉE DANS LA DÉFINITION DE PROJETS SaaS

💬 MESSAGE UTILISATEUR : "${userMessage}"

📊 PROGRESSION : ${progress}
📋 PROCHAINE INFO À COLLECTER : ${nextField || 'PROJET COMPLET !'}

📋 DÉFINITION ACTUELLE DU PROJET :
${JSON.stringify(currentDefinition, null, 2)}

🎯 TON RÔLE DE DÉFINITION DE PROJET :

🚨 **RÈGLE ABSOLUE** : Tu DOIS progresser à chaque échange !
- Si l'utilisateur a répondu à ta question, ACCEPTE sa réponse et passe à la suivante
- Ne repose JAMAIS la même question deux fois
- Sois EFFICACE et va à l'essentiel

📋 **INFORMATIONS À COLLECTER DANS L'ORDRE** :
1. ✅ **Nom du projet** ${currentDefinition.nom ? '✓ FAIT' : '← PROCHAINE QUESTION'}
2. ✅ **Description/Idée** ${currentDefinition.description ? '✓ FAIT' : '← PROCHAINE QUESTION'}
3. ✅ **Problème résolu** ${currentDefinition.probleme_resolu ? '✓ FAIT' : '← PROCHAINE QUESTION'}
4. ✅ **Utilisateurs cibles** ${currentDefinition.utilisateurs_cibles ? '✓ FAIT' : '← PROCHAINE QUESTION'}
5. ✅ **Stack technique** ${currentDefinition.stack_preferee ? '✓ FAIT' : '← PROCHAINE QUESTION'}
6. ✅ **Niveau technique** ${currentDefinition.niveau_technique ? '✓ FAIT' : '← PROCHAINE QUESTION'}
7. ✅ **Temps disponible** ${currentDefinition.temps_disponible ? '✓ FAIT' : '← PROCHAINE QUESTION'}

🎯 **INSTRUCTIONS SELON LA SITUATION** :

${nextField === 'nom' ? `
🔥 DEMANDE LE NOM DU PROJET :
"Super ! J'ai bien compris ton idée. Comment veux-tu appeler ton projet ?"
` : ''}

${nextField === 'description' ? `
🔥 DEMANDE LA DESCRIPTION :
"Parfait ! Maintenant, peux-tu me décrire ton idée de projet en quelques phrases ?"
` : ''}

${nextField === 'problème résolu' ? `
🔥 DEMANDE LE PROBLÈME RÉSOLU :
"Excellent ! Quel problème concret ton projet va-t-il résoudre ?"
` : ''}

${nextField === 'utilisateurs cibles' ? `
🔥 DEMANDE LES UTILISATEURS CIBLES :
"Parfait ! Qui sont tes utilisateurs idéaux ? (particuliers, entreprises, freelances...)"
` : ''}

${nextField === 'stack technique' ? `
🔥 DEMANDE LA STACK TECHNIQUE :
"Super ! As-tu une préférence pour la technologie ? (React, Vue, Python, PHP... ou 'pas de préférence')"
` : ''}

${nextField === 'niveau technique' ? `
🔥 DEMANDE LE NIVEAU TECHNIQUE :
"Parfait ! Quel est ton niveau en développement ? (débutant, intermédiaire, expert)"
` : ''}

${nextField === 'temps disponible' ? `
🔥 DEMANDE LE TEMPS DISPONIBLE :
"Excellent ! Combien de temps peux-tu consacrer au développement ? (quelques heures/semaine, temps plein...)"
` : ''}

${!nextField ? `
🎉 PROJET COMPLET ! FÉLICITE L'UTILISATEUR :
"Parfait ! J'ai toutes les informations nécessaires pour créer ton guide de développement personnalisé ! 🎉

Récapitulatif de ton projet :
- **Nom** : ${currentDefinition.nom}
- **Description** : ${currentDefinition.description}
- **Problème résolu** : ${currentDefinition.probleme_resolu}
- **Utilisateurs** : ${currentDefinition.utilisateurs_cibles}
- **Stack** : ${currentDefinition.stack_preferee}
- **Niveau** : ${currentDefinition.niveau_technique}
- **Temps** : ${currentDefinition.temps_disponible}

Tu peux maintenant cliquer sur 'Créer mon guide de développement' ! 🚀"
` : ''}

🚨 **RÈGLES STRICTES** :
1. Une seule question à la fois
2. Accepte toute réponse raisonnable (ne sois pas perfectionniste)
3. Progresse TOUJOURS vers la prochaine info
4. Sois encourageant et positif
5. Si toutes les infos sont collectées, félicite et récapitule

RÉPONDS MAINTENANT selon les instructions ci-dessus !`
}

// Analyser si le projet est complet
const isProjectComplete = (definition: ProjectDefinition): boolean => {
  const requiredFields = [
    'nom', 'description', 'probleme_resolu', 'utilisateurs_cibles',
    'stack_preferee', 'niveau_technique', 'temps_disponible'
  ]
  
  return requiredFields.every(field => {
    const value = definition[field as keyof ProjectDefinition]
    return value && value.toString().trim().length > 0
  })
}

// Extraire les informations du message utilisateur de manière plus intelligente
const extractProjectInfo = (userMessage: string, currentDefinition: ProjectDefinition, messages: ChatMessage[]): ProjectDefinition => {
  const updated = { ...currentDefinition }
  const message = userMessage.toLowerCase()
  
  // Analyser le contexte de la dernière question de l'IA
  const lastAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant')?.content.toLowerCase() || ''
  
  // Si l'IA demandait le nom du projet
  if (lastAssistantMessage.includes('nom') || lastAssistantMessage.includes('appelle') || lastAssistantMessage.includes('s\'appelle')) {
    if (!updated.nom && userMessage.trim().length > 0) {
      updated.nom = userMessage.trim()
    }
  }
  
  // Si l'IA demandait la description ou l'idée
  if (lastAssistantMessage.includes('idée') || lastAssistantMessage.includes('description') || lastAssistantMessage.includes('projet')) {
    if (!updated.description && userMessage.length > 10) {
      updated.description = userMessage.trim()
    }
  }
  
  // Si l'IA demandait le problème résolu
  if (lastAssistantMessage.includes('problème') || lastAssistantMessage.includes('résou')) {
    if (!updated.probleme_resolu && userMessage.length > 10) {
      updated.probleme_resolu = userMessage.trim()
    }
  }
  
  // Si l'IA demandait les utilisateurs cibles
  if (lastAssistantMessage.includes('utilisateur') || lastAssistantMessage.includes('client') || lastAssistantMessage.includes('cible')) {
    if (!updated.utilisateurs_cibles && userMessage.length > 5) {
      updated.utilisateurs_cibles = userMessage.trim()
    }
  }
  
  // Si l'IA demandait le niveau technique
  if (lastAssistantMessage.includes('niveau') || lastAssistantMessage.includes('expérience') || lastAssistantMessage.includes('développement')) {
    if (message.includes('débutant') || message.includes('novice') || message.includes('jamais')) {
      updated.niveau_technique = 'Débutant'
    } else if (message.includes('intermédiaire') || message.includes('confirmé') || message.includes('quelques')) {
      updated.niveau_technique = 'Intermédiaire'
    } else if (message.includes('expert') || message.includes('avancé') || message.includes('expérimenté')) {
      updated.niveau_technique = 'Expert'
    } else if (!updated.niveau_technique) {
      // Si pas de mot-clé spécifique, essayer de deviner
      updated.niveau_technique = userMessage.trim()
    }
  }
  
  // Si l'IA demandait la stack technique
  if (lastAssistantMessage.includes('stack') || lastAssistantMessage.includes('technologie') || lastAssistantMessage.includes('technique')) {
    if (message.includes('react') || message.includes('next')) {
      updated.stack_preferee = 'React/Next.js'
    } else if (message.includes('vue')) {
      updated.stack_preferee = 'Vue.js'
    } else if (message.includes('python')) {
      updated.stack_preferee = 'Python'
    } else if (message.includes('php')) {
      updated.stack_preferee = 'PHP'
    } else if (message.includes('node')) {
      updated.stack_preferee = 'Node.js'
    } else if (!updated.stack_preferee && userMessage.length > 3) {
      updated.stack_preferee = userMessage.trim()
    }
  }
  
  // Si l'IA demandait le temps disponible
  if (lastAssistantMessage.includes('temps') || lastAssistantMessage.includes('durée') || lastAssistantMessage.includes('consacrer')) {
    if (!updated.temps_disponible && userMessage.length > 3) {
      updated.temps_disponible = userMessage.trim()
    }
  }
  
  // Si c'est le premier message et qu'il est long, c'est probablement la description
  if (messages.length <= 2 && !updated.description && userMessage.length > 20) {
    updated.description = userMessage.trim()
  }
  
  return updated
}

// Générer un projet finalisé compatible avec le système existant
const generateFinalizedProject = (definition: ProjectDefinition) => {
  const projectId = `custom-${Date.now()}`
  
  return {
    id: projectId,
    nom: definition.nom || 'Mon Projet SaaS',
    description: definition.description || 'Projet SaaS personnalisé',
    probleme_resolu: definition.probleme_resolu || 'Résout un problème spécifique',
    stack_technique: definition.stack_preferee || 'React/Next.js',
    complexite: definition.niveau_technique === 'Débutant' ? 'simple' : 
                definition.niveau_technique === 'Expert' ? 'advanced' : 'medium',
    temps_dev: definition.temps_disponible || '4-6 semaines',
    mrr_arr: 'À définir',
    type_marche: definition.utilisateurs_cibles?.toLowerCase().includes('entreprise') ? 'b2b' : 'b2c',
    cdc: `Projet personnalisé : ${definition.nom}\n\nDescription : ${definition.description}\n\nProblème résolu : ${definition.probleme_resolu}`,
    finalizedAt: new Date().toISOString(),
    // Champs additionnels pour compatibilité
    domaine: 'Projet personnalisé',
    potentiel: '🔥🔥',
    tags: ['projet-personnel', 'custom'],
    date_ajout: new Date().toISOString().split('T')[0],
    validee_par: 'Utilisateur',
    score: 85,
    why_replicable: 'Projet défini par l\'utilisateur selon ses besoins spécifiques',
    est_vibe_coding: true
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userMessage, currentDefinition, action, projectDefinition }: CreateProjectRequest = await request.json()
    
    // Si c'est une action de finalisation
    if (action === 'finalize' && projectDefinition) {
      const finalizedProject = generateFinalizedProject(projectDefinition)
      
      return NextResponse.json({
        success: true,
        finalizedProject: finalizedProject
      })
    }
    
    if (!messages || !userMessage || !currentDefinition) {
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

    // Extraire les informations du message utilisateur
    const updatedDefinition = extractProjectInfo(userMessage, currentDefinition, messages)
    
    // Construire le prompt
    const prompt = buildProjectDefinitionPrompt(userMessage, updatedDefinition, messages)
    
    console.log('🤖 Définition de projet avec Grok...')

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
            content: `Tu es une IA spécialisée dans la définition de projets SaaS. Tu poses des questions précises pour comprendre parfaitement le projet de l'utilisateur.

🎯 TON RÔLE : COMPRENDRE LE PROJET

MÉTHODOLOGIE :
1. 🎧 ÉCOUTE ACTIVE - Analyse chaque réponse attentivement
2. 🤔 QUESTIONS CIBLÉES - Pose UNE question précise à la fois
3. ✅ VALIDATION - Reformule pour confirmer ta compréhension
4. 🎯 PROGRESSION - Avance étape par étape vers la définition complète

INFORMATIONS À COLLECTER :
- Nom du projet
- Description détaillée
- Problème résolu
- Utilisateurs cibles
- Fonctionnalités principales
- Stack technique préférée
- Niveau de développement
- Contraintes (temps, budget)

STYLE :
- Bienveillant et encourageant
- Questions simples et claires
- Une question à la fois
- Valide la compréhension
- Reste focus sur l'essentiel

ÉVITE :
- Questions multiples en une fois
- Jargon technique complexe
- Suppositions sur les besoins
- Réponses trop longues`
          },
          ...conversationHistory.slice(0, -1),
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 800
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
    
    // Vérifier si le projet est complet
    const projectComplete = isProjectComplete(updatedDefinition)
    
    console.log('✅ Réponse de définition générée')
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      updatedDefinition: updatedDefinition,
      isProjectComplete: projectComplete
    })

  } catch (error) {
    console.error('❌ Erreur lors de la définition:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

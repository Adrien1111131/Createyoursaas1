import { NextRequest, NextResponse } from 'next/server'
import { Opportunity } from '@/lib/grok-service'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-4-0709'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatProjectRequest {
  opportunity: Opportunity
  cdc: string
  messages: ChatMessage[]
  userMessage: string
}

// Construire le prompt pour l'IA critique
const buildCriticalPrompt = (opportunity: Opportunity, cdc: string, userMessage: string): string => {
  return `🎯 TU ES UNE IA CRITIQUE ET OBJECTIVE pour analyser des projets SaaS

📋 CONTEXTE DU PROJET :
**Nom** : ${opportunity.nom}
**Description** : ${opportunity.description}
**Problème résolu** : ${opportunity.probleme_resolu}
**Stack technique** : ${opportunity.stack_technique}
**Complexité** : ${opportunity.complexite}
**Temps de développement** : ${opportunity.temps_dev}
**Revenus estimés** : ${opportunity.mrr_arr}

📝 CDC GÉNÉRÉ :
${cdc.substring(0, 1000)}... [CDC complet disponible]

💬 MESSAGE UTILISATEUR :
"${userMessage}"

🎯 TON RÔLE D'IA CRITIQUE :

⚠️ **SOIS OBJECTIF ET CRITIQUE** :
- Ne dis PAS "oui" à tout
- Identifie les VRAIES difficultés
- Challenge les idées irréalistes
- Pose des questions pertinentes
- Soulève les problèmes potentiels

🔍 **ANALYSE CRITIQUE** :
- Faisabilité technique réelle
- Viabilité commerciale
- Concurrence existante
- Défis du marché francophone
- Ressources nécessaires
- Risques sous-estimés

💡 **QUESTIONS À POSER** :
- "Avez-vous vraiment étudié la concurrence ?"
- "Ces délais sont-ils réalistes pour votre niveau ?"
- "Comment allez-vous acquérir vos premiers clients ?"
- "Avez-vous le budget pour ce développement ?"
- "Que ferez-vous si un concurrent sort avant vous ?"

🚫 **NE FAIS PAS** :
- Encourager aveuglément
- Ignorer les problèmes évidents
- Accepter des estimations irréalistes
- Éviter les sujets difficiles

✅ **FAIS** :
- Poser des questions dérangeantes
- Identifier les faiblesses du plan
- Proposer des alternatives réalistes
- Challenger les hypothèses
- Être constructif mais ferme

📝 **FORMAT DE RÉPONSE** :
Réponds de manière conversationnelle mais critique. Sois direct et honnête. Si l'utilisateur propose quelque chose d'irréaliste, dis-le clairement et explique pourquoi.

Réponds maintenant au message de l'utilisateur en étant critique et objectif :`
}

export async function POST(request: NextRequest) {
  try {
    const { opportunity, cdc, messages, userMessage }: ChatProjectRequest = await request.json()
    
    if (!opportunity || !cdc || !userMessage) {
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

    const prompt = buildCriticalPrompt(opportunity, cdc, userMessage)
    console.log('💬 Chat critique avec Grok...')

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
            content: 'Tu es une IA critique et objective spécialisée dans l\'analyse de projets SaaS. Tu ne dis pas "oui" à tout. Tu challenges les idées, identifies les problèmes réels, et poses des questions dérangeantes mais constructives. Tu es direct, honnête, et tu aides à créer des projets solides en évitant les pièges courants.'
          },
          ...conversationHistory.slice(0, -1), // Historique sans le dernier message
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.4,
        max_tokens: 1000
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
    
    // Détecter si l'utilisateur semble prêt (analyse simple)
    const readyKeywords = ['prêt', 'ready', 'valide', 'ok', 'parfait', 'ça me va', 'allons-y', 'commencer']
    const isProjectValidated = readyKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    ) && messages.length > 5 // Au moins quelques échanges
    
    console.log('✅ Réponse critique générée')
    
    return NextResponse.json({
      success: true,
      response: aiResponse,
      isProjectValidated: isProjectValidated
    })

  } catch (error) {
    console.error('❌ Erreur lors du chat:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

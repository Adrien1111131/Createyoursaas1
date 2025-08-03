import { NextRequest, NextResponse } from 'next/server'
import { Opportunity } from '@/lib/grok-service'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-4-0709'

interface AnalyzeProjectRequest {
  opportunity: Opportunity
}

// Construire le prompt optimisé pour un CDC concis et actionnable
const buildAnalysisPrompt = (opportunity: Opportunity): string => {
  return `Génère un guide de développement concis pour ce projet SaaS :

PROJET : ${opportunity.nom}
Description : ${opportunity.description}
Problème : ${opportunity.probleme_resolu}
Stack : ${opportunity.stack_technique}
Complexité : ${opportunity.complexite}
Temps : ${opportunity.temps_dev}
Type marché : ${opportunity.type_marche}

CONSIGNES STRICTES :
1. DESCRIPTION DU PROJET (2-3 phrases max)
   - Que fait exactement le produit
   - Adaptations spécifiques pour le marché français si pertinentes

2. ÉTAPES DE DÉVELOPPEMENT (liste numérotée claire)
   - Étapes concrètes et actionables
   - Ordre logique de développement
   - 6-8 étapes maximum

3. STACK TECHNIQUE PRÉCISE
   - Frontend : [technologie exacte]
   - Backend : [technologie exacte] 
   - Base de données : [choix précis]
   - APIs externes : [liste des APIs nécessaires]
   - Authentification : [solution]
   - Paiements : [si applicable]
   - Hébergement : [recommandation]

INTERDICTIONS :
- Pas de blabla marketing
- Pas de répétition des informations déjà connues
- Pas d'analyse de marché (déjà fournie)
- Pas de recommandations business
- Seulement les infos techniques et étapes pratiques

FORMAT : Texte structuré, direct, actionnable.`
}

export async function POST(request: NextRequest) {
  try {
    const { opportunity }: AnalyzeProjectRequest = await request.json()
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunité manquante' },
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

    const prompt = buildAnalysisPrompt(opportunity)
    console.log('🔍 Analyse du projet avec Grok...')

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
            content: `Tu es un développeur senior qui rédige des guides techniques concis et actionables.

OBJECTIF : Fournir uniquement les informations pratiques pour développer le projet.

STRUCTURE OBLIGATOIRE :
1. DESCRIPTION DU PROJET (2-3 phrases maximum)
2. ÉTAPES DE DÉVELOPPEMENT (liste numérotée, 6-8 étapes max)
3. STACK TECHNIQUE (format structuré avec technologies précises)

STYLE REQUIS :
- Direct et technique, sans fioritures
- Comme un README de projet GitHub
- Pas de marketing ou de blabla
- Informations concrètes et actionables uniquement

INTERDICTIONS STRICTES :
- Pas d'introduction longue
- Pas d'analyse de marché
- Pas de recommandations business
- Pas de répétitions
- Pas de paragraphes verbeux

FORMAT : Texte structuré, concis, technique.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.1,
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
    const cdc = data.choices[0].message.content.trim()
    
    console.log('✅ CDC généré avec succès')
    
    return NextResponse.json({
      success: true,
      cdc: cdc,
      projectId: opportunity.id
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

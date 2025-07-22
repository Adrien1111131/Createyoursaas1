import { NextRequest, NextResponse } from 'next/server'
import { Opportunity } from '@/lib/grok-service'

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-4-0709'

interface AnalyzeProjectRequest {
  opportunity: Opportunity
}

// Construire le prompt pour l'analyse approfondie du projet
const buildAnalysisPrompt = (opportunity: Opportunity): string => {
  return `Analyse ce projet SaaS pour créer un cahier des charges clair et naturel :

PROJET : ${opportunity.nom}
Description : ${opportunity.description}
Problème résolu : ${opportunity.probleme_resolu}
Marché cible : ${opportunity.type_marche}
Revenus estimés : ${opportunity.mrr_arr}
Stack technique : ${opportunity.stack_technique}
Complexité : ${opportunity.complexite}
Temps de développement : ${opportunity.temps_dev}

CONTEXTE FRANÇAIS :
Ce projet vise spécifiquement le marché francophone. Il doit respecter les réglementations françaises (RGPD, CNIL) et s'adapter aux habitudes des utilisateurs français.

OBJECTIF :
Créer un document de travail pratique qui guide le développement étape par étape, avec un langage naturel et accessible.`
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
            content: `Tu es un chef de projet expérimenté qui rédige des cahiers des charges clairs et naturels.

STYLE D'ÉCRITURE :
- Langage naturel et fluide, comme si tu expliquais le projet à un collègue
- Paragraphes bien structurés avec des transitions logiques
- Éviter le jargon technique excessif
- Ton professionnel mais accessible

STRUCTURE ATTENDUE :

1. RÉSUMÉ DU PROJET
Présente le projet de manière claire et engageante. Explique pourquoi ce projet est important et comment il va aider les utilisateurs. Utilise un langage accessible qui permet à n'importe qui de comprendre l'enjeu.

2. CAHIER DES CHARGES TECHNIQUE
Détaille les aspects techniques de manière organisée :
- Architecture et technologies choisies (avec justifications)
- Fonctionnalités principales expliquées simplement
- Contraintes techniques et solutions envisagées
- Planning de développement réaliste

3. OPPORTUNITÉ FRANCOPHONE
Explique spécifiquement pourquoi ce projet a du sens sur le marché français :
- Besoins spécifiques des utilisateurs français
- Avantages concurrentiels sur ce marché
- Réglementations françaises à respecter (RGPD, etc.)
- Stratégie de lancement adaptée au contexte français

IMPORTANT : Écris de manière fluide et naturelle, comme si tu présentais le projet lors d'une réunion. Évite les listes à puces excessives et privilégie des paragraphes bien rédigés.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 4000
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

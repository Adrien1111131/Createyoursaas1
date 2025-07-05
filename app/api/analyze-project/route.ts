import { NextRequest, NextResponse } from 'next/server'
import { GrokOpportunity } from '@/lib/grok-service'

const GROK_API_KEY = process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-3-latest'

interface AnalyzeProjectRequest {
  opportunity: GrokOpportunity
}

// Construire le prompt pour l'analyse approfondie du projet
const buildAnalysisPrompt = (opportunity: GrokOpportunity): string => {
  return `🎯 MISSION : Analyse approfondie et génération d'un CDC détaillé pour ce projet SaaS francophone

📋 PROJET À ANALYSER :
**Nom** : ${opportunity.nom}
**Description** : ${opportunity.description}
**Problème résolu** : ${opportunity.probleme_resolu}
**Stack technique** : ${opportunity.stack_technique}
**Complexité** : ${opportunity.complexite}
**Temps de développement** : ${opportunity.temps_dev}
**Revenus estimés** : ${opportunity.mrr_arr}
**Marché cible** : ${opportunity.type_marche}
**Opportunité francophone** : ${opportunity.opportunite}

🔍 ANALYSE REQUISE :

Génère un **Cahier des Charges (CDC) complet et professionnel** qui inclut :

## 1. CONTEXTE ET OBJECTIFS
- Analyse du marché francophone
- Positionnement concurrentiel
- Objectifs business clairs et mesurables

## 2. FONCTIONNALITÉS DÉTAILLÉES
- Fonctionnalités core (MVP)
- Fonctionnalités avancées (V2)
- User stories détaillées
- Wireframes conceptuels (description textuelle)

## 3. SPÉCIFICATIONS TECHNIQUES
- Architecture recommandée
- Stack technique justifiée
- Base de données et modèles
- APIs et intégrations nécessaires
- Sécurité et conformité RGPD

## 4. ADAPTATION FRANCOPHONE
- Spécificités réglementaires (RGPD, CNIL, etc.)
- Intégrations locales (Sage, URSSAF, banques françaises)
- Localisation (langue, devises, formats)
- Avantages concurrentiels vs solutions anglaises

## 5. PLAN DE DÉVELOPPEMENT
- Phases de développement
- Estimation des tâches
- Technologies et outils recommandés
- Ressources nécessaires

## 6. STRATÉGIE DE LANCEMENT
- Plan de validation (MVP)
- Stratégie pricing pour le marché francophone
- Canaux d'acquisition
- Métriques de succès

## 7. RISQUES ET MITIGATION
- Risques techniques identifiés
- Risques business
- Plans de mitigation

⚠️ EXIGENCES :
- Sois **critique et objectif**
- Identifie les **vraies difficultés**
- Propose des **solutions concrètes**
- Adapte spécifiquement au **marché francophone**
- Reste **réaliste** sur les délais et coûts

📝 FORMAT : Rédige un CDC professionnel, structuré et actionnable.`
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
    if (!GROK_API_KEY) {
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
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en développement SaaS et en analyse de marché francophone. Tu génères des cahiers des charges détaillés, critiques et réalistes. Tu es objectif et identifies les vraies difficultés sans édulcorer.'
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

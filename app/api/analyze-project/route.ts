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
  return `🚀 PROJET SAAS : ${opportunity.nom}

💡 CONCEPT
- Description : ${opportunity.description}
- Problème résolu : ${opportunity.probleme_resolu}
- Marché : ${opportunity.type_marche}
- Revenus estimés : ${opportunity.mrr_arr}

⚡ WORKFLOW VIBE CODING
- Commencer TOUJOURS en PLAN MODE
- Discuter la stratégie avec l'IA
- Valider l'approche avant de passer en ACT MODE
- Faire des points de contrôle réguliers

🛠️ STACK TECHNIQUE
- Technologies : ${opportunity.stack_technique}
- Complexité : ${opportunity.complexite}
- Temps estimé : ${opportunity.temps_dev}

📋 BONNES PRATIQUES
- Sauvegardes régulières du projet
- Créer des branches pour les features importantes
- Commits fréquents et bien nommés
- Revenir à la dernière version stable si besoin

🎯 FEATURES MVP
- Liste courte et précise des fonctionnalités essentielles
- Priorités claires
- Estimations réalistes
- Points de validation

⚙️ ARCHITECTURE
- Structure du projet claire et modulaire
- Composants réutilisables
- API endpoints bien définis
- Base de données optimisée

🔒 SÉCURITÉ & CONFORMITÉ
- RGPD et CNIL
- Authentification sécurisée
- Protection des données
- Backups automatisés

🚀 DÉPLOIEMENT
- Environnements (dev, staging, prod)
- CI/CD pipeline
- Monitoring
- Scalabilité

⚠️ POINTS D'ATTENTION :
- Toujours commencer par planifier (PLAN MODE)
- Sauvegarder régulièrement
- Tester chaque feature
- Valider avant de passer aux étapes suivantes

📝 FORMAT : CDC adapté au vibe coding, clair et actionnable.`
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
            content: `Tu es un expert en vibe coding et développement SaaS. 

STYLE :
- Ton direct et concis
- Instructions claires et actionnables
- Focus sur les bonnes pratiques
- Approche étape par étape

POINTS CLÉS :
- Importance du PLAN MODE avant l'action
- Sauvegardes régulières du code
- Tests et validations fréquents
- Documentation claire et concise

Génère un CDC adapté aux développeurs qui utilisent le vibe coding, en mettant l'accent sur la planification, les sauvegardes et la validation progressive.`
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

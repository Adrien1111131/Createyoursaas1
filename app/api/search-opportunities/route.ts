import { NextRequest, NextResponse } from 'next/server'

interface SearchCriteria {
  timeRange: number[]
  difficulty: string
  selectedDomains: string[]
  productType: string
  targetClient: string
  mrrRange: number[]
  barriers: string
}

interface GrokOpportunity {
  id: string
  nom: string
  description: string
  probleme_resolu: string
  domaine: string
  type_marche: 'b2b' | 'b2c' | 'both'
  type_produit: 'micro-saas' | 'extension' | 'application' | 'api' | 'autre'
  mrr_arr: string
  source_revenus: string
  stack_technique: string
  temps_dev: string
  complexite: 'simple' | 'medium' | 'advanced'
  opportunite: string
  potentiel: '🔥' | '🔥🔥' | '🔥🔥🔥'
  lien?: string
  lien_product_hunt?: string
  lien_indie_hackers?: string
  tags: string[]
  date_ajout: string
  validee_par: string
}

const GROK_API_KEY = process.env.GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-3-latest'

// Construire le prompt pour Grok
const buildGrokPrompt = (criteria: SearchCriteria): string => {
  const {
    timeRange,
    difficulty,
    selectedDomains,
    productType,
    targetClient,
    mrrRange,
    barriers
  } = criteria

  const timeText = timeRange[0] <= 1 ? '1 jour' : 
                   timeRange[0] <= 7 ? '1 semaine' : 
                   timeRange[0] <= 30 ? '1 mois' : '3+ mois'

  const difficultyText = difficulty === 'Facile' ? 'simple (HTML/CSS/JS)' :
                        difficulty === 'Intermédiaire' ? 'medium (React/Vue)' :
                        'advanced (Full-stack)'

  const domainsText = selectedDomains.length > 0 ? selectedDomains.join(', ') : 'tous domaines'

  return `🎯 MISSION : Trouve 5 SaaS ANGLAIS à SUCCÈS à copier/adapter pour le marché FRANCOPHONE

📊 MÉTHODOLOGIE EN 3 ÉTAPES :

1️⃣ **DÉTECTION** : Trouve des SaaS anglais rentables
2️⃣ **ANALYSE** : Vérifie le gap francophone  
3️⃣ **STRATÉGIE** : Propose l'adaptation française

⚠️ CRITÈRES DE RECHERCHE :
- Temps dev : ${timeText} | Complexité : ${difficultyText} | Domaines : ${domainsText}
- SaaS avec revenus documentés ${mrrRange[0]}$+/mois
- EXCLURE les géants : Calendly, Notion, Slack, Zoom, Stripe, etc.
- FOCUS sur micro-SaaS et niches spécialisées

🔍 SOURCES À EXPLORER (recherche web obligatoire) :
- **Product Hunt** : SaaS populaires avec métriques
- **Indie Hackers** : revenus documentés + témoignages
- **MicroConf** : success stories de micro-SaaS
- **Reddit r/SaaS** : discussions sur les revenus
- **Chrome Web Store** : extensions rentables
- **GitHub** : projets open source populaires

📋 POUR CHAQUE SAAS TROUVÉ, ANALYSE :

🔎 **Étape 1 - Le SaaS original** :
- Nom exact et URL
- Revenus documentés (source précise)
- Fonctionnalités principales
- Stack technique observée

🔎 **Étape 2 - Gap francophone** :
- Existe-t-il un équivalent français de qualité ?
- Quelles faiblesses dans les solutions françaises existantes ?
- Besoins spécifiques FR/BE/CH/CA non couverts ?

🔎 **Étape 3 - Stratégie d'adaptation** :
- Fonctionnalités à ajouter pour le marché francophone
- Conformité RGPD/réglementations locales
- Intégrations spécifiques (Sage, URSSAF, etc.)
- Avantages concurrentiels possibles

📋 FORMAT JSON STRICT :
[{
  "nom": "Nom du SaaS français à créer (inspiré de [SaaS original])",
  "saas_original": {
    "nom": "Nom exact du SaaS anglais",
    "url": "URL officielle",
    "date_creation": "Date de lancement/création du SaaS original",
    "revenus": "Revenus documentés avec source précise",
    "fonctionnalites": "Fonctionnalités principales détaillées",
    "concurrents_actuels": "Liste des principaux concurrents du SaaS original"
  },
  "description": "Description de votre version française améliorée",
  "probleme_resolu": "Problème spécifique du marché francophone",
  "domaine": "${domainsText}",
  "type_marche": "b2b/b2c/both",
  "type_produit": "micro-saas/extension/application/api",
  "mrr_arr": "Potentiel estimé pour le marché francophone",
  "source_revenus": "Source des données du SaaS original",
  "stack_technique": "Technologies recommandées",
  "temps_dev": "${timeText}",
  "complexite": "${difficultyText.split(' ')[0].toLowerCase()}",
  "opportunite_francophone": {
    "situation_actuelle": "Explication claire : que se passe-t-il actuellement sur le marché francophone pour ce type d'outil ?",
    "probleme_identifie": "Quel est le problème concret que rencontrent les utilisateurs francophones ?",
    "concurrents_francais": "Quels sont les concurrents français existants et leurs faiblesses ?",
    "opportunite_claire": "Pourquoi c'est le bon moment pour créer cette alternative française ? Explication naturelle et convaincante.",
    "avantages_specifiques": "Quels avantages concrets votre version française apportera-t-elle ?",
    "potentiel_marche": "Estimation du potentiel sur le marché francophone avec justification"
  },
  "potentiel": "🔥/🔥🔥/🔥🔥🔥",
  "lien_inspiration": "URL du SaaS original à copier",
  "tags": ["copie", "adaptation", "francophone"]
}]

🚀 RECHERCHE MAINTENANT des SaaS anglais rentables à adapter !`
}

// Parser la réponse de Grok
const parseGrokResponse = (content: string): GrokOpportunity[] => {
  try {
    console.log('Parsing du contenu Grok:', content.substring(0, 500) + '...')
    
    // Nettoyer le contenu pour extraire le JSON
    let jsonContent = content.trim()
    
    // Supprimer les balises markdown si présentes
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.split('```json')[1].split('```')[0].trim()
    } else if (jsonContent.includes('```')) {
      jsonContent = jsonContent.split('```')[1].split('```')[0].trim()
    }
    
    // Supprimer tout texte avant le premier [
    const jsonStart = jsonContent.indexOf('[')
    if (jsonStart > 0) {
      jsonContent = jsonContent.substring(jsonStart)
    }
    
    // Supprimer tout texte après le dernier ]
    const jsonEnd = jsonContent.lastIndexOf(']')
    if (jsonEnd > 0) {
      jsonContent = jsonContent.substring(0, jsonEnd + 1)
    }

    const parsedResults = JSON.parse(jsonContent)
    const opportunities = Array.isArray(parsedResults) ? parsedResults : [parsedResults]
    
    return opportunities.map((opp, index) => {
      // Construire l'analyse d'opportunité francophone avec le nouveau format amélioré
      let opportuniteText = 'Opportunité de copie/adaptation à analyser'
      
      if (opp.opportunite_francophone) {
        const opFr = opp.opportunite_francophone
        opportuniteText = `🎯 OPPORTUNITÉ FRANCOPHONE :

📍 Situation actuelle : ${opFr.situation_actuelle || 'Non analysée'}

❗ Problème identifié : ${opFr.probleme_identifie || 'Non spécifié'}

🇫🇷 Concurrents français : ${opFr.concurrents_francais || 'Non évalués'}

💡 Opportunité claire : ${opFr.opportunite_claire || 'Non définie'}

✨ Avantages spécifiques : ${opFr.avantages_specifiques || 'Non identifiés'}

📊 Potentiel marché : ${opFr.potentiel_marche || 'Non estimé'}`
      } else if (opp.opportunite) {
        opportuniteText = opp.opportunite
      }

      // Construire la description enrichie avec le SaaS original et les nouvelles données
      let descriptionEnrichie = opp.description || 'Description manquante'
      if (opp.saas_original) {
        const saasOrig = opp.saas_original
        descriptionEnrichie = `📋 SAAS ORIGINAL : ${saasOrig.nom || 'Non spécifié'}
📅 Date de création : ${saasOrig.date_creation || 'Non documentée'}
💰 Revenus : ${saasOrig.revenus || 'Non documentés'}
🔗 URL : ${saasOrig.url || 'Non fournie'}
⚙️ Fonctionnalités : ${saasOrig.fonctionnalites || 'Non détaillées'}
🏆 Concurrents actuels : ${saasOrig.concurrents_actuels || 'Non listés'}

🇫🇷 VERSION FRANCOPHONE PROPOSÉE :
${opp.description || 'Description de l\'adaptation francophone'}`
      }

      return {
        id: `grok-copy-${Date.now()}-${index}`,
        nom: opp.nom || 'SaaS français à créer',
        description: descriptionEnrichie,
        probleme_resolu: opp.probleme_resolu || 'Problème du marché francophone',
        domaine: opp.domaine || 'Domaine non spécifié',
        type_marche: opp.type_marche || 'both',
        type_produit: opp.type_produit || 'micro-saas',
        mrr_arr: opp.mrr_arr || 'Potentiel non estimé',
        source_revenus: opp.source_revenus || 'Analyse Grok',
        stack_technique: opp.stack_technique || 'Stack non spécifiée',
        temps_dev: opp.temps_dev || '2-4 semaines',
        complexite: opp.complexite || 'medium',
        opportunite: opportuniteText,
        potentiel: opp.potentiel || '🔥🔥',
        lien: opp.lien_inspiration || (opp.saas_original?.url) || undefined,
        lien_product_hunt: opp.lien_product_hunt || undefined,
        lien_indie_hackers: opp.lien_indie_hackers || undefined,
        tags: Array.isArray(opp.tags) ? opp.tags : ['copie', 'adaptation'],
        date_ajout: new Date().toISOString().split('T')[0],
        validee_par: 'Grok Copy Analysis'
      }
    })
    
  } catch (error) {
    console.error('Erreur lors du parsing Grok:', error)
    console.error('Contenu reçu:', content)
    throw new Error(`Erreur de parsing: ${error}`)
  }
}

// Données de démonstration pour le fallback
const getDemoOpportunities = (): GrokOpportunity[] => {
  return [
    {
      id: `demo-${Date.now()}-1`,
      nom: "PDF Toolkit Pro",
      description: "Outil en ligne pour manipuler, compresser et convertir des PDF",
      probleme_resolu: "Les outils PDF existants sont complexes ou chers",
      domaine: "Productivité",
      type_marche: "b2b",
      type_produit: "micro-saas",
      mrr_arr: "2,400€/mois",
      source_revenus: "Indie Hackers - décembre 2024",
      stack_technique: "React, Node.js, PDF-lib",
      temps_dev: "3-4 semaines",
      complexite: "medium",
      opportunite: "Version française avec RGPD et support français",
      potentiel: "🔥🔥",
      tags: ["pdf", "productivité", "b2b"],
      date_ajout: new Date().toISOString().split('T')[0],
      validee_par: "Demo Mode"
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const criteria: SearchCriteria = await request.json()
    
    // Vérifier la clé API
    if (!GROK_API_KEY) {
      console.warn('Clé API Grok manquante - utilisation du mode démonstration')
      return NextResponse.json({
        success: true,
        data: getDemoOpportunities(),
        source: 'demo'
      })
    }

    const prompt = buildGrokPrompt(criteria)
    console.log('🔍 Recherche Grok avec web search activée...')

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
            content: 'Tu es Grok avec accès à la recherche web temps réel. Utilise tes capacités de recherche pour trouver de vraies opportunités SaaS avec des données vérifiables depuis Product Hunt, Indie Hackers, Reddit, etc. Réponds uniquement en JSON valide.'
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
      
      // Fallback vers les données de démonstration
      return NextResponse.json({
        success: true,
        data: getDemoOpportunities(),
        source: 'demo',
        error: `API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`
      })
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    
    console.log('✅ Réponse Grok reçue, parsing...')
    
    try {
      const results = parseGrokResponse(content)
      console.log(`🎯 ${results.length} opportunités trouvées via recherche web`)
      
      return NextResponse.json({
        success: true,
        data: results,
        source: 'grok-web-search'
      })
    } catch (parseError) {
      console.error('❌ Erreur de parsing, fallback vers demo:', parseError)
      return NextResponse.json({
        success: true,
        data: getDemoOpportunities(),
        source: 'demo',
        error: `Parse error: ${parseError}`
      })
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return NextResponse.json({
      success: true,
      data: getDemoOpportunities(),
      source: 'demo',
      error: `General error: ${error}`
    })
  }
}

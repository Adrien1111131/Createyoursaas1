// Service Grok pour Next.js avec TypeScript
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

interface SearchCriteria {
  timeRange: number[]
  difficulty: string
  selectedDomains: string[]
  productType: string
  targetClient: string
  mrrRange: number[]
  barriers: string
}

const GROK_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-beta'

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

  return `Recherche web temps réel : 5 micro-SaaS réplicables pour la France.

Critères : ${timeText}, ${difficultyText}, ${domainsText}, ${mrrRange[0]}€+/mois.

Explore Product Hunt, Indie Hackers, Reddit r/SideProject, Chrome Store. Trouve vraies opportunités avec revenus documentés.

Réponds en JSON :
[{
  "nom": "Nom exact",
  "description": "Description courte", 
  "probleme_resolu": "Problème résolu",
  "domaine": "Catégorie",
  "type_marche": "b2b/b2c/both",
  "type_produit": "micro-saas/extension/application/api",
  "mrr_arr": "Revenus réels + source",
  "source_revenus": "Source exacte",
  "stack_technique": "Technologies observées",
  "temps_dev": "Estimation réaliste",
  "complexite": "simple/medium/advanced",
  "opportunite": "Adaptation française spécifique",
  "potentiel": "🔥/🔥🔥/🔥🔥🔥",
  "lien": "URL officielle",
  "lien_product_hunt": "URL PH",
  "lien_indie_hackers": "URL IH",
  "tags": ["mots-clés"]
}]

Utilise ta recherche web pour données vérifiables uniquement.`
}

// Parser la réponse de Grok
const parseGrokResponse = (content: string): GrokOpportunity[] => {
  try {
    console.log('Parsing du contenu Grok:', content)
    
    // Essayer de parser du JSON d'abord
    let jsonContent = content
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim()
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].trim()
    }

    const parsedResults = JSON.parse(jsonContent)
    const opportunities = Array.isArray(parsedResults) ? parsedResults : [parsedResults]
    
    return opportunities.map((opp, index) => ({
      id: `grok-${Date.now()}-${index}`,
      nom: opp.nom || 'Nom manquant',
      description: opp.description || 'Description manquante',
      probleme_resolu: opp.probleme_resolu || 'Problème non spécifié',
      domaine: opp.domaine || 'Domaine non spécifié',
      type_marche: opp.type_marche || 'both',
      type_produit: opp.type_produit || 'micro-saas',
      mrr_arr: opp.mrr_arr || 'Revenus non spécifiés',
      source_revenus: opp.source_revenus || 'Recherche Grok temps réel',
      stack_technique: opp.stack_technique || 'Stack non spécifiée',
      temps_dev: opp.temps_dev || '2-4 semaines',
      complexite: opp.complexite || 'medium',
      opportunite: opp.opportunite || 'Opportunité à analyser',
      potentiel: opp.potentiel || '🔥🔥',
      lien: opp.lien || undefined,
      lien_product_hunt: opp.lien_product_hunt || undefined,
      lien_indie_hackers: opp.lien_indie_hackers || undefined,
      tags: opp.tags || [],
      date_ajout: new Date().toISOString().split('T')[0],
      validee_par: 'Grok'
    }))
    
  } catch (error) {
    console.error('Erreur lors du parsing Grok:', error)
    return [{
      id: `error-${Date.now()}`,
      nom: 'Erreur de parsing',
      description: 'Impossible de parser la réponse de Grok',
      probleme_resolu: 'Erreur technique',
      domaine: 'Erreur',
      type_marche: 'both' as const,
      type_produit: 'micro-saas' as const,
      mrr_arr: 'N/A',
      source_revenus: 'Erreur',
      stack_technique: 'N/A',
      temps_dev: 'N/A',
      complexite: 'medium' as const,
      opportunite: 'Vérifiez les logs de la console pour plus de détails',
      potentiel: '🔥' as const,
      tags: ['erreur'],
      date_ajout: new Date().toISOString().split('T')[0],
      validee_par: 'Erreur'
    }]
  }
}

// Fonction de retry avec backoff exponentiel
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error
      }
      
      // Retry sur les erreurs 429 (rate limit) et 500+ (erreurs serveur)
      const shouldRetry = error.message.includes('429') || 
                         error.message.includes('500') || 
                         error.message.includes('502') || 
                         error.message.includes('503')
      
      if (!shouldRetry) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`Tentative ${attempt}/${maxRetries} échouée, retry dans ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Toutes les tentatives ont échoué')
}

// Données de démonstration pour le fallback
const getDemoOpportunities = (criteria: SearchCriteria): GrokOpportunity[] => {
  const baseOpportunities: Omit<GrokOpportunity, 'id' | 'date_ajout'>[] = [
    {
      nom: "PDF Toolkit Pro",
      description: "Outil en ligne pour manipuler, compresser et convertir des PDF avec une interface simple",
      probleme_resolu: "Les outils PDF existants sont complexes, chers ou peu fiables pour les petites entreprises",
      domaine: "Productivité",
      type_marche: "b2b",
      type_produit: "micro-saas",
      mrr_arr: "2,400€/mois (source: Indie Hackers)",
      source_revenus: "Indie Hackers - décembre 2024",
      stack_technique: "React, Node.js, PDF-lib",
      temps_dev: "3-4 semaines",
      complexite: "medium",
      opportunite: "Adaptation française avec intégration RGPD, support français et tarification en euros",
      potentiel: "🔥🔥",
      lien: "https://pdftoolkit.example.com",
      lien_product_hunt: "https://producthunt.com/posts/pdf-toolkit-pro",
      lien_indie_hackers: "https://indiehackers.com/product/pdf-toolkit-pro",
      tags: ["pdf", "productivité", "b2b", "saas"],
      validee_par: "Grok"
    },
    {
      nom: "Social Media Scheduler",
      description: "Planificateur de contenu pour réseaux sociaux avec analytics intégrés",
      probleme_resolu: "Gestion manuelle chronophage des publications sur multiple plateformes",
      domaine: "Marketing",
      type_marche: "both",
      type_produit: "micro-saas",
      mrr_arr: "1,800€/mois (source: Product Hunt)",
      source_revenus: "Product Hunt - janvier 2025",
      stack_technique: "Vue.js, Python, APIs sociales",
      temps_dev: "4-6 semaines",
      complexite: "medium",
      opportunite: "Version française avec support des réseaux locaux et conformité CNIL",
      potentiel: "🔥🔥🔥",
      lien: "https://socialscheduler.example.com",
      lien_product_hunt: "https://producthunt.com/posts/social-scheduler",
      tags: ["marketing", "réseaux sociaux", "automation"],
      validee_par: "Grok"
    },
    {
      nom: "Invoice Generator",
      description: "Générateur de factures simple avec suivi des paiements",
      probleme_resolu: "Facturation complexe pour freelances et petites entreprises",
      domaine: "E-commerce",
      type_marche: "b2b",
      type_produit: "micro-saas",
      mrr_arr: "3,200€/mois (source: Reddit)",
      source_revenus: "Reddit r/entrepreneur - novembre 2024",
      stack_technique: "HTML, CSS, JavaScript",
      temps_dev: "1-2 semaines",
      complexite: "simple",
      opportunite: "Version française avec TVA automatique et intégration comptables français",
      potentiel: "🔥🔥",
      lien: "https://invoicegen.example.com",
      tags: ["facturation", "freelance", "simple"],
      validee_par: "Grok"
    },
    {
      nom: "AI Content Optimizer",
      description: "Optimisation SEO de contenu avec IA pour améliorer le ranking",
      probleme_resolu: "Optimisation SEO manuelle et chronophage pour les créateurs de contenu",
      domaine: "SEO",
      type_marche: "b2b",
      type_produit: "micro-saas",
      mrr_arr: "4,500€/mois (source: Indie Hackers)",
      source_revenus: "Indie Hackers - décembre 2024",
      stack_technique: "React, OpenAI API, Node.js",
      temps_dev: "6-8 semaines",
      complexite: "advanced",
      opportunite: "Version française avec optimisation pour Google.fr et mots-clés français",
      potentiel: "🔥🔥🔥",
      lien: "https://aicontentopt.example.com",
      lien_indie_hackers: "https://indiehackers.com/product/ai-content-optimizer",
      tags: ["seo", "ia", "contenu", "marketing"],
      validee_par: "Grok"
    },
    {
      nom: "Team Mood Tracker",
      description: "Suivi du moral d'équipe avec analytics et recommandations",
      probleme_resolu: "Difficulté à mesurer et améliorer le bien-être des équipes en télétravail",
      domaine: "Analytics",
      type_marche: "b2b",
      type_produit: "micro-saas",
      mrr_arr: "2,100€/mois (source: Product Hunt)",
      source_revenus: "Product Hunt - janvier 2025",
      stack_technique: "Vue.js, Chart.js, Firebase",
      temps_dev: "3-5 semaines",
      complexite: "medium",
      opportunite: "Adaptation française avec conformité RGPD et culture d'entreprise française",
      potentiel: "🔥🔥",
      lien: "https://teammood.example.com",
      lien_product_hunt: "https://producthunt.com/posts/team-mood-tracker",
      tags: ["rh", "analytics", "équipe", "bien-être"],
      validee_par: "Grok"
    }
  ]

  // Filtrer selon les critères
  let filtered = baseOpportunities.filter(opp => {
    // Filtrer par domaine si spécifié
    if (criteria.selectedDomains.length > 0) {
      return criteria.selectedDomains.some(domain => 
        opp.domaine.toLowerCase().includes(domain.toLowerCase()) ||
        opp.tags.some(tag => tag.toLowerCase().includes(domain.toLowerCase()))
      )
    }
    return true
  })

  // Filtrer par complexité
  if (criteria.difficulty) {
    const complexityMap: Record<string, string> = {
      'Facile': 'simple',
      'Intermédiaire': 'medium',
      'Complexe': 'advanced'
    }
    const targetComplexity = complexityMap[criteria.difficulty]
    if (targetComplexity) {
      filtered = filtered.filter(opp => opp.complexite === targetComplexity)
    }
  }

  // Filtrer par revenus
  if (criteria.mrrRange[0] > 1000) {
    filtered = filtered.filter(opp => {
      const revenue = parseInt(opp.mrr_arr.replace(/[^\d]/g, ''))
      return revenue >= criteria.mrrRange[0]
    })
  }

  // Ajouter les IDs et dates
  return filtered.slice(0, 5).map((opp, index) => ({
    ...opp,
    id: `demo-${Date.now()}-${index}`,
    date_ajout: new Date().toISOString().split('T')[0]
  }))
}

// Service principal pour rechercher les opportunités avec Grok
export const searchOpportunities = async (criteria: SearchCriteria): Promise<GrokOpportunity[]> => {
  console.log('🔍 Recherche d\'opportunités avec Grok Web Search...')

  try {
    const response = await fetch('/api/search-opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(criteria)
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.source === 'grok-web-search') {
      console.log('✅ Opportunités trouvées via recherche web Grok')
    } else if (result.source === 'demo') {
      console.log('⚠️ Mode démonstration activé:', result.error || 'Pas de clé API')
    }

    return result.data || getDemoOpportunities(criteria)
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error)
    // Fallback vers les données de démonstration
    return getDemoOpportunities(criteria)
  }
}

export type { GrokOpportunity, SearchCriteria }

// Utilisation directe de l'API xAI via fetch (plus stable)

// Interfaces TypeScript strictes
export interface Opportunity {
  id: string;
  nom: string;
  description: string;
  probleme_resolu: string;
  probleme_us_court?: string;
  opportunite_fr_courte?: string;
  domaine: string;
  type_marche: 'b2b' | 'b2c' | 'both';
  type_produit: 'micro-saas' | 'extension' | 'application' | 'api' | 'autre';
  mrr_arr: string;
  source_revenus: string;
  stack_technique: string;
  temps_dev: string;
  complexite: 'simple' | 'medium' | 'advanced';
  opportunite: string;
  potentiel: '🔥' | '🔥🔥' | '🔥🔥🔥';
  lien?: string;
  lien_product_hunt?: string;
  lien_indie_hackers?: string;
  tags: string[];
  date_ajout: string;
  validee_par: string;
  score: number; // 0-100
  why_replicable: string;
  est_vibe_coding: boolean;
  analyse_detaillee?: {
    preuves_us: {
      revenus_source: string;
      revenus_source_url?: string;
      utilisateurs_count: string;
      traction_details: string;
      traction_urls: string[];
      fondateur_histoire: string;
      fondateur_profils: {
        linkedin?: string;
        twitter?: string;
        github?: string;
      };
    };
    marche_francais: {
      taille_marche: string;
      taille_marche_chiffres: string;
      concurrents_fr: string[];
      concurrents_analysis: string;
      adaptations_necessaires: string[];
      reglementation: string;
      saisonnalite: string;
      barriere_entree: 'faible' | 'moyenne' | 'forte';
    };
    strategie_replication: {
      etapes_concretes: string[];
      investissement_estime: string;
      timeline_detaillee: string;
      risques_identifies: string[];
      architecture_technique: {
        frontend: string;
        backend: string;
        database: string;
        auth: string;
        payments: string;
        hosting: string;
      };
      roadmap_phases: {
        phase1_mvp: string;
        phase2_features: string;
        phase3_scale: string;
      };
    };
    validation_marche: {
      tests_recommandes: string[];
      metriques_validation: string[];
      methodes_validation: string[];
    };
    modele_economique: {
      pricing_recommande: string;
      cout_acquisition: string;
      projections_financieres: string;
      seuil_rentabilite: string;
    };
    go_to_market: {
      strategie_lancement: string[];
      canaux_marketing: string[];
      partenariats_potentiels: string[];
      communaute_cible: string;
    };
    avis_marche_francais: {
      potentiel_global: 'faible' | 'moyen' | 'fort' | 'excellent';
      score_opportunite: number;
      analyse_detaillee: string;
      avantages_specifiques: string[];
      defis_majeurs: string[];
      recommandation_finale: string;
    };
  };
}

export interface SearchCriteria {
  timeRange: number[];
  difficulty: string;
  selectedDomains: string[];
  productType: string;
  targetClient: string;
  mrrRange: number[];
  barriers: string;
}

export interface GrokResponse {
  opportunities: Opportunity[];
  citations?: any[];
  sources_used?: number;
  search_cost?: number;
}

// Configuration
const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
const GROK_MODEL = 'grok-4-0709'; // Modèle Grok 4 officiel
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

// Debug de la configuration
console.log('🔧 Configuration Grok:');
console.log('- XAI_API_KEY présente:', !!XAI_API_KEY);
console.log('- Modèle:', GROK_MODEL);
console.log('- URL API:', XAI_API_URL);

// Analyser le profil utilisateur pour personnaliser la recherche
const analyzeUserProfile = (criteria: SearchCriteria) => {
  const {
    timeRange,
    difficulty,
    selectedDomains,
    productType,
    targetClient,
    mrrRange,
    barriers
  } = criteria;

  const timeText = timeRange[0] <= 7 ? '1 semaine' : 
                   timeRange[0] <= 30 ? '1 mois' : '3+ mois';

  const difficultyText = difficulty === 'Facile' ? 'débutant' :
                        difficulty === 'Intermédiaire' ? 'confirmé' :
                        difficulty === 'Complexe' ? 'expert' : 'tous niveaux';

  const domainsText = selectedDomains.length > 0 ? selectedDomains.join(', ') : 'tous domaines';

  // Adapter la stack selon le niveau
  const recommendedStack = difficulty === 'Facile' ? 'HTML/CSS/JS, No-code (Bubble, Webflow)' :
                          difficulty === 'Intermédiaire' ? 'React/Vue, Node.js, bases simples' :
                          difficulty === 'Complexe' ? 'Full-stack, microservices, IA/ML' :
                          'Stack adaptée au projet';

  // Adapter la complexité max selon le temps
  const maxComplexity = timeRange[0] <= 7 ? 'MVP simple, 1 fonctionnalité core' :
                       timeRange[0] <= 30 ? 'Produit structuré, 3-5 fonctionnalités' :
                       'Plateforme complète, architecture avancée';

  return {
    timeText,
    difficultyText,
    domainsText,
    recommendedStack,
    maxComplexity,
    mrrTarget: mrrRange[0]
  };
};

// Construire le prompt intelligent pour Grok 4
const buildIntelligentPrompt = (criteria: SearchCriteria): string => {
  const profile = analyzeUserProfile(criteria);

  return `RECHERCHE WEB TEMPS RÉEL - MICRO-SAAS US RENTABLES

🎯 PROFIL UTILISATEUR :
- Niveau : ${profile.difficultyText}
- Temps disponible : ${profile.timeText}
- Domaines : ${profile.domainsText}
- Stack recommandée : ${profile.recommendedStack}
- Complexité max : ${profile.maxComplexity}
- Objectif revenus : ${profile.mrrTarget}€+/mois

🔍 MISSION RECHERCHE WEB :
Utilise ta capacité de recherche web en temps réel pour trouver 5 micro-SaaS US rentables récents :

SOURCES À CONSULTER :
1. **Product Hunt** - Lancements populaires 2024-2025
2. **Indie Hackers** - Posts avec revenus documentés
3. **Reddit r/SideProject** - Projets récents avec traction
4. **Hacker News Show HN** - Projets avec engagement
5. **Twitter/X** - Threads de fondateurs avec métriques

CRITÈRES DE SÉLECTION :
- Revenus DOCUMENTÉS (captures Stripe, posts revenus)
- Compatible profil utilisateur (${profile.difficultyText}, ${profile.timeText})
- Marché français sous-exploité
- Concurrence faible en France
- Réplication faisable

RETOURNE UNIQUEMENT UN OBJET JSON VALIDE avec cette structure exacte :

{
  "opportunities": [
    {
      "nom": "Nom exact du SaaS",
      "description": "Description en 1 ligne claire",
      "probleme_resolu": "Problème résolu en 1 phrase",
      "probleme_us_court": "Pourquoi ça marche aux US (1 phrase)",
      "opportunite_fr_courte": "Opportunité française (1 phrase)",
      "domaine": "Catégorie principale",
      "type_marche": "b2b/b2c/both",
      "type_produit": "micro-saas/extension/application/api",
      "mrr_arr": "Revenus réels (ex: $12K MRR)",
      "source_revenus": "Source vérifiable (ex: IndieHackers post)",
      "stack_technique": "Stack observée",
      "temps_dev": "Temps réaliste pour ce profil",
      "complexite": "simple/medium/advanced",
      "opportunite": "Analyse française détaillée",
      "potentiel": "🔥/🔥🔥/🔥🔥🔥",
      "lien": "URL officielle",
      "lien_product_hunt": "URL Product Hunt",
      "lien_indie_hackers": "URL Indie Hackers",
      "tags": ["mots-clés"],
      "score": 85,
      "why_replicable": "Pourquoi réplicable en France",
      "est_vibe_coding": true
    }
  ]
}

CRITÈRES OBLIGATOIRES :
- Revenus documentés et vérifiables
- Compatible avec profil utilisateur (${profile.difficultyText}, ${profile.timeText})
- Réplicable en France
- Données récentes (2024-2025)
- JSON valide uniquement, aucun texte en dehors`;
};

// Service principal avec Grok 4 Live Search via fetch
export const grokLiveSearch = async (criteria: SearchCriteria): Promise<GrokResponse> => {
  console.log('🔍 Recherche avec Grok 4 Live Search...');
  
  if (!XAI_API_KEY) {
    throw new Error('Clé API xAI manquante. Configurez XAI_API_KEY dans .env.local');
  }

  const prompt = buildIntelligentPrompt(criteria);
  const profile = analyzeUserProfile(criteria);
  
  console.log(`🔍 Profil: ${profile.difficultyText}, ${profile.timeText}, ${profile.domainsText}`);

  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          {
            role: "system",
            content: `Tu es un expert en recherche de micro-SaaS rentables. Tu utilises ta capacité de recherche web en temps réel pour trouver des opportunités vérifiables et documentées.

MISSION : Trouve des micro-SaaS US rentables adaptés au profil utilisateur.

SOURCES PRIORITAIRES :
- Product Hunt (nouveaux lancements)
- Indie Hackers (revenus documentés)
- Reddit r/SideProject (projets en croissance)
- Hacker News Show HN (projets avec engagement)
- Twitter/X (threads de fondateurs)

CRITÈRES DE QUALITÉ :
1. Revenus DOCUMENTÉS (pas d'estimations)
2. Traction PROUVÉE (utilisateurs, téléchargements)
3. Problème CLAIR et spécifique
4. Réplication FAISABLE en France

FORMAT DE RÉPONSE :
- JSON valide uniquement
- Données vérifiables
- Sources citées
- Analyse française pertinente

ÉVITER :
- Estimations non documentées
- SaaS trop complexes pour le profil
- Marchés non transposables en France
- Données obsolètes`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API xAI: ${response.status} ${response.statusText}`);
    }

    const completion = await response.json();
    console.log('📥 Réponse Grok 4 reçue');
    
    const rawContent = completion.choices[0].message.content.trim();
    console.log('🔍 Contenu brut (premiers 200 chars):', rawContent.substring(0, 200));
    
    // ✅ PARSING SÉCURISÉ avec JSON strict
    let data: { opportunities?: Opportunity[] };
    try {
      data = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      throw new Error(`Réponse non-JSON : ${rawContent.slice(0, 120)}`);
    }

    if (!data.opportunities?.length) {
      console.error('❌ Aucune opportunité dans la réponse:', data);
      throw new Error("Aucune opportunité trouvée dans la réponse");
    }

    // ✅ ENRICHISSEMENT DES DONNÉES
    const enrichedOpportunities = data.opportunities.map((opp, index) => ({
      id: `grok4-${Date.now()}-${index}`,
      nom: opp.nom || 'SaaS sans nom',
      description: opp.description || 'Description à compléter',
      probleme_resolu: opp.probleme_resolu || 'Problème à identifier',
      probleme_us_court: opp.probleme_us_court,
      opportunite_fr_courte: opp.opportunite_fr_courte,
      domaine: opp.domaine || 'Divers',
      type_marche: opp.type_marche || 'both',
      type_produit: opp.type_produit || 'micro-saas',
      mrr_arr: opp.mrr_arr || 'Revenus à vérifier',
      source_revenus: opp.source_revenus || 'Recherche Grok 4',
      stack_technique: opp.stack_technique || 'Stack à définir',
      temps_dev: opp.temps_dev || '4-8 semaines',
      complexite: opp.complexite || 'medium',
      opportunite: opp.opportunite || 'Opportunité française à analyser',
      potentiel: opp.potentiel || '🔥🔥',
      lien: opp.lien,
      lien_product_hunt: opp.lien_product_hunt,
      lien_indie_hackers: opp.lien_indie_hackers,
      tags: opp.tags || ['grok4-search'],
      date_ajout: new Date().toISOString().split('T')[0],
      validee_par: 'Grok 4 Live Search',
      score: opp.score || 75,
      why_replicable: opp.why_replicable || 'Analyse de réplicabilité à compléter',
      est_vibe_coding: opp.est_vibe_coding ?? true,
      analyse_detaillee: opp.analyse_detaillee
    }));

    console.log(`✅ ${enrichedOpportunities.length} opportunités trouvées et enrichies`);

    return {
      opportunities: enrichedOpportunities,
      citations: [],
      sources_used: 0,
      search_cost: 0
    };

  } catch (error) {
    console.error('❌ Erreur Grok 4 Live Search:', error);
    throw error;
  }
};

// ✅ FALLBACK avec données mockées pour le développement
const getMockOpportunities = (criteria: SearchCriteria): GrokResponse => {
  const profile = analyzeUserProfile(criteria);
  
  const mockOpportunities: Opportunity[] = [
    {
      id: 'mock-1',
      nom: 'EmailValidator Pro',
      description: 'Validation d\'emails en temps réel avec API simple',
      probleme_resolu: 'Éviter les bounces d\'emails dans les campagnes marketing',
      probleme_us_court: 'Coût élevé des bounces pour les marketeurs US',
      opportunite_fr_courte: 'Marché français sous-équipé en solutions abordables',
      domaine: 'Marketing Digital',
      type_marche: 'b2b',
      type_produit: 'api',
      mrr_arr: '$8K MRR',
      source_revenus: 'IndieHackers post vérifié',
      stack_technique: 'Node.js + Redis + API REST',
      temps_dev: profile.timeText,
      complexite: 'simple',
      opportunite: 'Marché français de l\'email marketing en croissance, peu de concurrents locaux',
      potentiel: '🔥🔥',
      lien: 'https://emailvalidator.example.com',
      tags: ['email', 'validation', 'api', 'marketing'],
      date_ajout: new Date().toISOString().split('T')[0],
      validee_par: 'Mode Démo',
      score: 82,
      why_replicable: 'API simple à développer, marché français demandeur',
      est_vibe_coding: true
    },
    {
      id: 'mock-2',
      nom: 'QuickPDF Tools',
      description: 'Outils PDF en ligne : fusion, compression, conversion',
      probleme_resolu: 'Manipulation de PDF sans installer de logiciel',
      probleme_us_court: 'Besoin de solutions rapides pour le télétravail',
      opportunite_fr_courte: 'RGPD-friendly, hébergement français',
      domaine: 'Productivité & Workflow',
      type_marche: 'both',
      type_produit: 'application',
      mrr_arr: '$15K MRR',
      source_revenus: 'Product Hunt + revenus publics',
      stack_technique: 'React + PDF-lib + Stripe',
      temps_dev: profile.timeText,
      complexite: criteria.difficulty === 'Facile' ? 'simple' : 'medium',
      opportunite: 'Marché français sensible à la confidentialité des données',
      potentiel: '🔥🔥🔥',
      lien: 'https://quickpdf.example.com',
      tags: ['pdf', 'outils', 'productivité', 'rgpd'],
      date_ajout: new Date().toISOString().split('T')[0],
      validee_par: 'Mode Démo',
      score: 88,
      why_replicable: 'Stack simple, forte demande locale pour solutions RGPD',
      est_vibe_coding: true
    }
  ];

  return {
    opportunities: mockOpportunities,
    citations: [],
    sources_used: 0,
    search_cost: 0
  };
};

// ✅ SERVICE PRINCIPAL avec fallback robuste
export const searchOpportunities = async (criteria: SearchCriteria): Promise<Opportunity[]> => {
  console.log('🔍 Recherche d\'opportunités...');

  try {
    // Tentative avec Grok 4 Live Search
    const result = await grokLiveSearch(criteria);
    console.log('✅ Recherche Grok 4 réussie');
    return result.opportunities;
    
  } catch (error) {
    console.error('❌ Erreur Grok 4, fallback vers mode démo:', error);
    
    // ✅ FALLBACK : Mode démo seulement si pas de clé API
    if (!XAI_API_KEY) {
      console.log('🎭 Mode démo activé (pas de clé API)');
      const mockResult = getMockOpportunities(criteria);
      return mockResult.opportunities;
    }
    
    // Si on a une clé API mais une erreur, on propage l'erreur pour débugger
    console.error('🔥 Erreur avec clé API présente:', error);
    throw new Error(`Erreur de recherche Grok 4: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

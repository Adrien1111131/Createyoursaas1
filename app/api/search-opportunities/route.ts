import { NextRequest, NextResponse } from 'next/server'
import { searchOpportunities, SearchCriteria } from '@/lib/grok-service'

export async function POST(request: NextRequest) {
  console.log('🚀 API /search-opportunities appelée (Grok 4)')
  
  try {
    const criteria: SearchCriteria = await request.json()
    console.log('📋 Critères reçus:', criteria)
    
    if (!criteria) {
      console.error('❌ Critères manquants')
      return NextResponse.json(
        { error: 'Critères de recherche manquants' },
        { status: 400 }
      )
    }

    console.log('🔍 Lancement de la recherche Grok 4...')
    
    // ✅ UTILISATION DU NOUVEAU SERVICE GROK 4
    const opportunities = await searchOpportunities(criteria)
    
    console.log(`✅ ${opportunities.length} opportunités trouvées`)
    
    return NextResponse.json({
      success: true,
      data: opportunities,
      search_metadata: {
        model: 'grok-4-0709',
        timestamp: new Date().toISOString(),
        count: opportunities.length,
        mode: opportunities[0]?.validee_par === 'Mode Démo' ? 'demo' : 'live'
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error)
    console.error('📊 Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace')
    
    // ✅ GESTION D'ERREUR AMÉLIORÉE
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    
    // Différencier les types d'erreurs
    if (errorMessage.includes('Clé API xAI manquante')) {
      return NextResponse.json(
        { 
          error: 'Configuration API manquante', 
          details: 'Veuillez configurer XAI_API_KEY dans .env.local',
          type: 'config_error'
        },
        { status: 500 }
      )
    }
    
    if (errorMessage.includes('Réponse non-JSON')) {
      return NextResponse.json(
        { 
          error: 'Erreur de parsing', 
          details: 'La réponse de Grok 4 n\'est pas au format JSON attendu',
          type: 'parsing_error'
        },
        { status: 502 }
      )
    }
    
    if (errorMessage.includes('Aucune opportunité trouvée')) {
      return NextResponse.json(
        { 
          error: 'Aucun résultat', 
          details: 'Grok 4 n\'a trouvé aucune opportunité correspondant aux critères',
          type: 'no_results'
        },
        { status: 404 }
      )
    }
    
    // Erreur générique
    return NextResponse.json(
      { 
        error: 'Erreur de recherche', 
        details: errorMessage,
        type: 'search_error'
      },
      { status: 500 }
    )
  }
}

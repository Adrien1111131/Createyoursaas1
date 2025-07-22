"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, DollarSign, Target, Zap, TrendingUp, Rocket } from "lucide-react"
import { Opportunity } from "@/lib/grok-service"
import { useRouter } from "next/navigation"

interface OpportunityResultsProps {
  opportunities: Opportunity[]
  isLoading: boolean
  error: string | null
}

export function OpportunityResults({ opportunities, isLoading, error }: OpportunityResultsProps) {
  const router = useRouter()

  // Debug: Log des données reçues
  console.log('🔍 OpportunityResults - Props reçues:', { 
    opportunities: opportunities?.length, 
    isLoading, 
    error,
    firstOpportunity: opportunities?.[0] 
  })
  
  // Debug plus détaillé
  if (opportunities && opportunities.length > 0) {
    console.log('📋 Première opportunité détaillée:', opportunities[0])
    console.log('📋 Nom:', opportunities[0]?.nom)
    console.log('📋 Description:', opportunities[0]?.description)
  }

  const handleStartDevelopment = (opportunity: Opportunity) => {
    console.log('🚀 Démarrage développement pour:', opportunity.nom)
    // Sauvegarder l'opportunité dans le localStorage pour la récupérer sur la page suivante
    localStorage.setItem('selectedOpportunity', JSON.stringify(opportunity))
    // Naviguer vers la page d'analyse du projet
    router.push(`/project/${opportunity.id}`)
  }
  if (isLoading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-lg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center animate-pulse">
            <Target className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Recherche en cours...</h3>
            <p className="text-sm text-gray-600">Analyse en cours pour trouver les meilleures opportunités</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 bg-gradient-to-br from-red-50 to-red-100/30 border-red-200 shadow-lg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-900">Erreur de recherche</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
            Réessayer
          </Button>
        </div>
      </Card>
    )
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-lg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Prêt à découvrir ?</h3>
            <p className="text-sm text-gray-600">
              Configurez vos critères et lancez la recherche pour découvrir des opportunités personnalisées
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header des résultats */}
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {opportunities.length} opportunité{opportunities.length > 1 ? 's' : ''} découverte{opportunities.length > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-gray-600">Trouvées avec recherche web temps réel</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            Validé
          </Badge>
        </div>
      </Card>

      {/* Liste des opportunités - Affichage épuré */}
      <div className="grid gap-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleStartDevelopment(opportunity)}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {/* Header épuré */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{opportunity.nom}</h3>
                  <span className="text-xl">{opportunity.potentiel}</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs">
                    {opportunity.domaine}
                  </Badge>
                </div>
                
                {/* Description courte */}
                <p className="text-gray-600 text-sm mb-3">{opportunity.description}</p>
                
                {/* Métriques en ligne */}
                <div className="flex gap-4 text-sm mb-3">
                  <span className="text-green-600 font-medium">💰 {opportunity.mrr_arr}</span>
                  <span className="text-orange-600 font-medium">⏱️ {opportunity.temps_dev}</span>
                  <span className="text-blue-600 font-medium">🎯 {opportunity.type_marche.toUpperCase()}</span>
                </div>
                
                {/* Problème US et opportunité FR */}
                <div className="space-y-1 text-sm">
                  {opportunity.probleme_us_court && (
                    <p className="text-gray-700">🇺🇸 {opportunity.probleme_us_court}</p>
                  )}
                  {opportunity.opportunite_fr_courte && (
                    <p className="text-blue-700">🇫🇷 {opportunity.opportunite_fr_courte}</p>
                  )}
                </div>

                {/* Sources cliquables */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">📚 Sources :</p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.lien && (
                      <a
                        href={opportunity.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs hover:bg-blue-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Site officiel
                      </a>
                    )}
                    
                    {opportunity.lien_product_hunt && (
                      <a
                        href={opportunity.lien_product_hunt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs hover:bg-orange-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🚀 Product Hunt
                      </a>
                    )}
                    
                    {opportunity.lien_indie_hackers && (
                      <a
                        href={opportunity.lien_indie_hackers}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs hover:bg-green-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        💡 Indie Hackers
                      </a>
                    )}
                    
                    {opportunity.source_revenus && opportunity.source_revenus !== 'Recherche Grok 4' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs">
                        📊 {opportunity.source_revenus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bouton d'action */}
              <div className="flex flex-col gap-2 items-end">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartDevelopment(opportunity)
                  }}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Voir le CDC
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

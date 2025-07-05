"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, DollarSign, Target, Zap, TrendingUp, Rocket } from "lucide-react"
import { GrokOpportunity } from "@/lib/grok-service"
import { useRouter } from "next/navigation"

interface OpportunityResultsProps {
  opportunities: GrokOpportunity[]
  isLoading: boolean
  error: string | null
}

export function OpportunityResults({ opportunities, isLoading, error }: OpportunityResultsProps) {
  const router = useRouter()

  const handleStartDevelopment = (opportunity: GrokOpportunity) => {
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
            <p className="text-sm text-gray-600">Grok analyse le web pour trouver les meilleures opportunités</p>
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

  if (opportunities.length === 0) {
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
              <p className="text-sm text-gray-600">Trouvées par Grok avec recherche web temps réel</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            Validé par Grok
          </Badge>
        </div>
      </Card>

      {/* Liste des opportunités */}
      <div className="grid gap-6">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="p-6 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-4">
              {/* Header de l'opportunité */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{opportunity.nom}</h3>
                    <span className="text-2xl">{opportunity.potentiel}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{opportunity.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                    {opportunity.domaine}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {opportunity.type_produit}
                  </Badge>
                </div>
              </div>

              {/* Problème résolu */}
              {opportunity.probleme_resolu && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Problème résolu</h4>
                      <p className="text-blue-800 text-sm">{opportunity.probleme_resolu}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Métriques clés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Revenus</p>
                    <p className="text-sm font-semibold text-green-800">{opportunity.mrr_arr}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Temps dev</p>
                    <p className="text-sm font-semibold text-orange-800">{opportunity.temps_dev}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Complexité</p>
                    <p className="text-sm font-semibold text-purple-800 capitalize">{opportunity.complexite}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                  <div>
                    <p className="text-xs text-cyan-600 font-medium">Marché</p>
                    <p className="text-sm font-semibold text-cyan-800 uppercase">{opportunity.type_marche}</p>
                  </div>
                </div>
              </div>

              {/* Opportunité française */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-l-4 border-amber-400">
                <h4 className="font-semibold text-amber-900 mb-2">🇫🇷 Opportunité française</h4>
                <p className="text-amber-800 text-sm">{opportunity.opportunite}</p>
              </div>

              {/* Stack technique */}
              {opportunity.stack_technique && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Stack technique :</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {opportunity.stack_technique}
                  </Badge>
                </div>
              )}

              {/* Tags */}
              {opportunity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {/* Bouton principal pour commencer le développement */}
                <Button 
                  onClick={() => handleStartDevelopment(opportunity)}
                  size="sm" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Commencer à développer le projet
                </Button>

                {opportunity.lien && (
                  <Button asChild size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                    <a href={opportunity.lien} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Site officiel
                    </a>
                  </Button>
                )}
                
                {opportunity.lien_product_hunt && (
                  <Button asChild variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <a href={opportunity.lien_product_hunt} target="_blank" rel="noopener noreferrer">
                      🚀 Product Hunt
                    </a>
                  </Button>
                )}
                
                {opportunity.lien_indie_hackers && (
                  <Button asChild variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <a href={opportunity.lien_indie_hackers} target="_blank" rel="noopener noreferrer">
                      👨‍💻 Indie Hackers
                    </a>
                  </Button>
                )}
              </div>

              {/* Source et date */}
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>Source : {opportunity.source_revenus}</span>
                <span>Ajouté le {opportunity.date_ajout}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

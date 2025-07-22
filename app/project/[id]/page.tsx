"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Rocket } from "lucide-react"
import { Opportunity } from "@/lib/grok-service"
import { CDCFormatter } from "@/components/cdc-formatter"
import { formatOpportunity } from "@/lib/content-formatter"

interface ProjectAnalysis {
  cdc: string
  isLoading: boolean
  error: string | null
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [analysis, setAnalysis] = useState<ProjectAnalysis>({
    cdc: '',
    isLoading: true,
    error: null
  })
  const [isProjectReady, setIsProjectReady] = useState(false)

  useEffect(() => {
    // Récupérer l'opportunité depuis le localStorage
    const savedOpportunity = localStorage.getItem('selectedOpportunity')
    if (savedOpportunity) {
      const parsedOpportunity = JSON.parse(savedOpportunity)
      // Formater l'opportunité pour améliorer la lisibilité
      const formattedOpportunity = formatOpportunity(parsedOpportunity)
      setOpportunity(formattedOpportunity)
      
      // Lancer l'analyse du projet
      analyzeProject(formattedOpportunity)
    } else {
      // Rediriger vers la page d'accueil si pas d'opportunité
      router.push('/')
    }
  }, [params.id, router])

  const analyzeProject = async (opp: Opportunity) => {
    try {
      setAnalysis(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ opportunity: opp })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse du projet')
      }

      const data = await response.json()
      setAnalysis({
        cdc: data.cdc,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setAnalysis({
        cdc: '',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    }
  }


  const handleBackToHome = () => {
    router.push('/')
  }

  // Vérifier s'il y a des résultats sauvegardés pour adapter le texte du bouton
  const hasSavedResults = () => {
    try {
      const savedSearchData = localStorage.getItem('searchResults')
      if (savedSearchData) {
        const searchData = JSON.parse(savedSearchData)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures
        const isRecent = Date.now() - searchData.timestamp < maxAge
        return isRecent && searchData.results && searchData.results.length > 0
      }
    } catch (error) {
      console.log('Erreur vérification résultats sauvés:', error)
    }
    return false
  }

  const handleProjectReady = () => {
    setIsProjectReady(true)
    // Sauvegarder le projet finalisé
    if (opportunity) {
      const finalizedProject = {
        ...opportunity,
        cdc: analysis.cdc,
        finalizedAt: new Date().toISOString()
      }
      localStorage.setItem('finalizedProject', JSON.stringify(finalizedProject))
      // Naviguer vers le guide de développement
      router.push(`/project/${opportunity.id}/development`)
    }
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Chargement du projet...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {hasSavedResults() ? "Retour aux résultats" : "Retour aux opportunités"}
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{opportunity.nom}</h1>
            <p className="text-gray-600 mt-1">Analyse et développement du projet</p>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
            {opportunity.potentiel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale - Analyse détaillée */}
          <div className="lg:col-span-2 space-y-6">
            {/* Résumé du projet */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                {opportunity.nom}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{opportunity.description}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Problème résolu</h3>
                  <p className="text-gray-600 text-sm">{opportunity.probleme_resolu}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Revenus documentés</h3>
                    <p className="text-green-600 font-semibold">{opportunity.mrr_arr}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Temps de développement</h3>
                    <p className="text-orange-600 font-semibold">{opportunity.temps_dev}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Analyse complète du projet (CDC) */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Analyse du projet
              </h2>
              
              {analysis.isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Génération de l'analyse complète du projet...</span>
                </div>
              )}

              {analysis.error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">
                    ❌ Erreur lors de l'analyse : {analysis.error}
                  </p>
                </div>
              )}

              {analysis.cdc && !analysis.isLoading && (
                <div className="prose prose-sm max-w-none">
                  <CDCFormatter content={analysis.cdc} />
                </div>
              )}

              {!analysis.cdc && !analysis.isLoading && !analysis.error && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm">
                    💡 L'analyse complète du projet sera générée automatiquement...
                  </p>
                </div>
              )}
            </Card>

            {/* Analyse du marché US */}
            {opportunity.analyse_detaillee?.preuves_us && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🇺🇸 <span>Preuves du marché US</span>
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-900 mb-2">💰 Revenus documentés</h3>
                      <p className="text-green-800 text-sm mb-2">{opportunity.analyse_detaillee.preuves_us.revenus_source}</p>
                      {opportunity.analyse_detaillee.preuves_us.revenus_source_url && (
                        <a 
                          href={opportunity.analyse_detaillee.preuves_us.revenus_source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 text-xs hover:underline flex items-center gap-1"
                        >
                          🔗 Voir la source
                        </a>
                      )}
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">👥 Base utilisateurs</h3>
                      <p className="text-blue-800 text-sm">{opportunity.analyse_detaillee.preuves_us.utilisateurs_count}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">📈 Traction prouvée</h3>
                    <p className="text-purple-800 text-sm mb-2">{opportunity.analyse_detaillee.preuves_us.traction_details}</p>
                    {opportunity.analyse_detaillee.preuves_us.traction_urls && opportunity.analyse_detaillee.preuves_us.traction_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {opportunity.analyse_detaillee.preuves_us.traction_urls.map((url, index) => (
                          <a 
                            key={index}
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 text-xs hover:underline flex items-center gap-1"
                          >
                            🔗 Source {index + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">👨‍💼 Fondateur & Histoire</h3>
                    <p className="text-gray-800 text-sm mb-2">{opportunity.analyse_detaillee.preuves_us.fondateur_histoire}</p>
                    {opportunity.analyse_detaillee.preuves_us.fondateur_profils && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {opportunity.analyse_detaillee.preuves_us.fondateur_profils.linkedin && (
                          <a 
                            href={opportunity.analyse_detaillee.preuves_us.fondateur_profils.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                          >
                            💼 LinkedIn
                          </a>
                        )}
                        {opportunity.analyse_detaillee.preuves_us.fondateur_profils.twitter && (
                          <a 
                            href={opportunity.analyse_detaillee.preuves_us.fondateur_profils.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-600 text-xs hover:underline flex items-center gap-1"
                          >
                            🐦 Twitter
                          </a>
                        )}
                        {opportunity.analyse_detaillee.preuves_us.fondateur_profils.github && (
                          <a 
                            href={opportunity.analyse_detaillee.preuves_us.fondateur_profils.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 text-xs hover:underline flex items-center gap-1"
                          >
                            💻 GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Analyse du marché français */}
            {opportunity.analyse_detaillee?.marche_francais && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🇫🇷 <span>Marché français</span>
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">📊 Taille du marché</h3>
                    <p className="text-blue-800 text-sm">{opportunity.analyse_detaillee.marche_francais.taille_marche}</p>
                  </div>
                  
                  {opportunity.analyse_detaillee.marche_francais.concurrents_fr.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-medium text-orange-900 mb-2">🏢 Concurrents français</h3>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.analyse_detaillee.marche_francais.concurrents_fr.map((concurrent, index) => (
                          <Badge key={index} variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            {concurrent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {opportunity.analyse_detaillee.marche_francais.adaptations_necessaires.length > 0 && (
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h3 className="font-medium text-amber-900 mb-2">🔧 Adaptations nécessaires</h3>
                      <ul className="text-amber-800 text-sm space-y-1">
                        {opportunity.analyse_detaillee.marche_francais.adaptations_necessaires.map((adaptation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            {adaptation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-medium text-red-900 mb-2">⚖️ Aspects réglementaires</h3>
                    <p className="text-red-800 text-sm">{opportunity.analyse_detaillee.marche_francais.reglementation}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Stratégie de réplication */}
            {opportunity.analyse_detaillee?.strategie_replication && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🚀 <span>Stratégie de réplication</span>
                </h2>
                <div className="space-y-4">
                  {opportunity.analyse_detaillee.strategie_replication.etapes_concretes.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-900 mb-3">📋 Étapes concrètes</h3>
                      <ol className="text-green-800 text-sm space-y-2">
                        {opportunity.analyse_detaillee.strategie_replication.etapes_concretes.map((etape, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            {etape}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-medium text-purple-900 mb-2">💰 Investissement estimé</h3>
                      <p className="text-purple-800 text-sm font-semibold">{opportunity.analyse_detaillee.strategie_replication.investissement_estime}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">⏱️ Timeline détaillée</h3>
                      <p className="text-blue-800 text-sm">{opportunity.analyse_detaillee.strategie_replication.timeline_detaillee}</p>
                    </div>
                  </div>

                  {/* Architecture technique */}
                  {opportunity.analyse_detaillee.strategie_replication.architecture_technique && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium text-slate-900 mb-3">🏗️ Architecture technique recommandée</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Frontend:</span>
                          <Badge variant="outline" className="text-xs">{opportunity.analyse_detaillee.strategie_replication.architecture_technique.frontend}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Backend:</span>
                          <Badge variant="outline" className="text-xs">{opportunity.analyse_detaillee.strategie_replication.architecture_technique.backend}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Database:</span>
                          <Badge variant="outline" className="text-xs">{opportunity.analyse_detaillee.strategie_replication.architecture_technique.database}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Auth:</span>
                          <Badge variant="outline" className="text-xs">{opportunity.analyse_detaillee.strategie_replication.architecture_technique.auth}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Payments:</span>
                          <Badge variant="outline" className="text-xs">{opportunity.analyse_detaillee.strategie_replication.architecture_technique.payments}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Hosting:</span>
                          <Badge variant="outline" className="text-xs">{opportunity.analyse_detaillee.strategie_replication.architecture_technique.hosting}</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Roadmap par phases */}
                  {opportunity.analyse_detaillee.strategie_replication.roadmap_phases && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h3 className="font-medium text-indigo-900 mb-3">🗓️ Roadmap de développement</h3>
                      <div className="space-y-3">
                        <div className="border-l-4 border-green-400 pl-3">
                          <h4 className="font-medium text-green-800 text-sm">Phase 1 - MVP</h4>
                          <p className="text-green-700 text-xs">{opportunity.analyse_detaillee.strategie_replication.roadmap_phases.phase1_mvp}</p>
                        </div>
                        <div className="border-l-4 border-blue-400 pl-3">
                          <h4 className="font-medium text-blue-800 text-sm">Phase 2 - Fonctionnalités</h4>
                          <p className="text-blue-700 text-xs">{opportunity.analyse_detaillee.strategie_replication.roadmap_phases.phase2_features}</p>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-3">
                          <h4 className="font-medium text-purple-800 text-sm">Phase 3 - Scale</h4>
                          <p className="text-purple-700 text-xs">{opportunity.analyse_detaillee.strategie_replication.roadmap_phases.phase3_scale}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {opportunity.analyse_detaillee.strategie_replication.risques_identifies.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-medium text-red-900 mb-3">⚠️ Risques identifiés</h3>
                      <ul className="text-red-800 text-sm space-y-1">
                        {opportunity.analyse_detaillee.strategie_replication.risques_identifies.map((risque, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600">⚠️</span>
                            {risque}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Validation marché */}
            {opportunity.analyse_detaillee?.validation_marche && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🎯 <span>Validation du marché</span>
                </h2>
                <div className="space-y-4">
                  {opportunity.analyse_detaillee.validation_marche.tests_recommandes.length > 0 && (
                    <div className="p-4 bg-cyan-50 rounded-lg">
                      <h3 className="font-medium text-cyan-900 mb-2">🧪 Tests recommandés</h3>
                      <ul className="text-cyan-800 text-sm space-y-1">
                        {opportunity.analyse_detaillee.validation_marche.tests_recommandes.map((test, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-cyan-600">•</span>
                            {test}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {opportunity.analyse_detaillee.validation_marche.metriques_validation.length > 0 && (
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <h3 className="font-medium text-emerald-900 mb-2">📊 Métriques de validation</h3>
                        <ul className="text-emerald-800 text-sm space-y-1">
                          {opportunity.analyse_detaillee.validation_marche.metriques_validation.map((metrique, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-emerald-600">📈</span>
                              {metrique}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opportunity.analyse_detaillee.validation_marche.methodes_validation.length > 0 && (
                      <div className="p-4 bg-teal-50 rounded-lg">
                        <h3 className="font-medium text-teal-900 mb-2">🔍 Méthodes de validation</h3>
                        <ul className="text-teal-800 text-sm space-y-1">
                          {opportunity.analyse_detaillee.validation_marche.methodes_validation.map((methode, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-teal-600">✓</span>
                              {methode}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Modèle économique */}
            {opportunity.analyse_detaillee?.modele_economique && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  💰 <span>Modèle économique</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">💵 Pricing recommandé</h3>
                    <p className="text-green-800 text-sm">{opportunity.analyse_detaillee.modele_economique.pricing_recommande}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-orange-900 mb-2">📈 Coût d'acquisition</h3>
                    <p className="text-orange-800 text-sm">{opportunity.analyse_detaillee.modele_economique.cout_acquisition}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">📊 Projections financières</h3>
                    <p className="text-blue-800 text-sm">{opportunity.analyse_detaillee.modele_economique.projections_financieres}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">⚖️ Seuil de rentabilité</h3>
                    <p className="text-purple-800 text-sm">{opportunity.analyse_detaillee.modele_economique.seuil_rentabilite}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Go-to-market */}
            {opportunity.analyse_detaillee?.go_to_market && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🚀 <span>Stratégie Go-to-Market</span>
                </h2>
                <div className="space-y-4">
                  {opportunity.analyse_detaillee.go_to_market.strategie_lancement.length > 0 && (
                    <div className="p-4 bg-rose-50 rounded-lg">
                      <h3 className="font-medium text-rose-900 mb-2">🎯 Stratégie de lancement</h3>
                      <ul className="text-rose-800 text-sm space-y-1">
                        {opportunity.analyse_detaillee.go_to_market.strategie_lancement.map((strategie, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-rose-600">🚀</span>
                            {strategie}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {opportunity.analyse_detaillee.go_to_market.canaux_marketing.length > 0 && (
                      <div className="p-4 bg-violet-50 rounded-lg">
                        <h3 className="font-medium text-violet-900 mb-2">📢 Canaux marketing</h3>
                        <div className="flex flex-wrap gap-1">
                          {opportunity.analyse_detaillee.go_to_market.canaux_marketing.map((canal, index) => (
                            <Badge key={index} variant="outline" className="bg-violet-100 text-violet-800 border-violet-300 text-xs">
                              {canal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {opportunity.analyse_detaillee.go_to_market.partenariats_potentiels.length > 0 && (
                      <div className="p-4 bg-sky-50 rounded-lg">
                        <h3 className="font-medium text-sky-900 mb-2">🤝 Partenariats potentiels</h3>
                        <div className="flex flex-wrap gap-1">
                          {opportunity.analyse_detaillee.go_to_market.partenariats_potentiels.map((partenaire, index) => (
                            <Badge key={index} variant="outline" className="bg-sky-100 text-sky-800 border-sky-300 text-xs">
                              {partenaire}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-medium text-amber-900 mb-2">👥 Communauté cible</h3>
                    <p className="text-amber-800 text-sm">{opportunity.analyse_detaillee.go_to_market.communaute_cible}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Avis marché français */}
            {opportunity.analyse_detaillee?.avis_marche_francais && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🇫🇷 <span>Avis sur le marché français</span>
                </h2>
                <div className="space-y-4">
                  {/* Score et potentiel */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-blue-900">📊 Évaluation globale</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${
                            opportunity.analyse_detaillee.avis_marche_francais.potentiel_global === 'excellent' ? 'bg-green-100 text-green-800 border-green-300' :
                            opportunity.analyse_detaillee.avis_marche_francais.potentiel_global === 'fort' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            opportunity.analyse_detaillee.avis_marche_francais.potentiel_global === 'moyen' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {opportunity.analyse_detaillee.avis_marche_francais.potentiel_global}
                        </Badge>
                        <div className="text-2xl font-bold text-blue-600">
                          {opportunity.analyse_detaillee.avis_marche_francais.score_opportunite}/10
                        </div>
                      </div>
                    </div>
                    <p className="text-blue-800 text-sm">{opportunity.analyse_detaillee.avis_marche_francais.analyse_detaillee}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {opportunity.analyse_detaillee.avis_marche_francais.avantages_specifiques.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-2">✅ Avantages spécifiques</h3>
                        <ul className="text-green-800 text-sm space-y-1">
                          {opportunity.analyse_detaillee.avis_marche_francais.avantages_specifiques.map((avantage, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-600">+</span>
                              {avantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opportunity.analyse_detaillee.avis_marche_francais.defis_majeurs.length > 0 && (
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h3 className="font-medium text-red-900 mb-2">⚠️ Défis majeurs</h3>
                        <ul className="text-red-800 text-sm space-y-1">
                          {opportunity.analyse_detaillee.avis_marche_francais.defis_majeurs.map((defi, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-600">-</span>
                              {defi}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h3 className="font-medium text-purple-900 mb-2">💡 Recommandation finale</h3>
                    <p className="text-purple-800 text-sm font-medium">{opportunity.analyse_detaillee.avis_marche_francais.recommandation_finale}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Fallback si pas d'analyse détaillée */}
            {!opportunity.analyse_detaillee && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Analyse du projet
                </h2>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-sm">
                    💡 Cette opportunité nécessite une analyse plus approfondie. 
                    Les données détaillées seront disponibles avec la prochaine recherche améliorée.
                  </p>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">🇫🇷 Opportunité française</h3>
                  <p className="text-blue-800 text-sm">{opportunity.opportunite}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Colonne latérale - Chat et actions */}
          <div className="space-y-6">
            {/* Informations techniques */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Informations techniques</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Stack technique :</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {opportunity.stack_technique}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Complexité :</span>
                  <Badge variant="outline" className="ml-2 text-xs capitalize">
                    {opportunity.complexite}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type de marché :</span>
                  <Badge variant="outline" className="ml-2 text-xs uppercase">
                    {opportunity.type_marche}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleProjectReady}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Commencer le développement
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Accès au chat de développement avec coaching IA personnalisé
                </p>
              </div>
            </Card>

            {/* Opportunité francophone */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">🌍 Opportunité francophone</h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                {opportunity.opportunite}
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}

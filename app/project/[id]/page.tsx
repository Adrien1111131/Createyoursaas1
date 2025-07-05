"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, MessageCircle, CheckCircle, Rocket } from "lucide-react"
import { GrokOpportunity } from "@/lib/grok-service"
import { ProjectChat } from "@/components/project-chat"
import { CDCFormatter } from "@/components/cdc-formatter"

interface ProjectAnalysis {
  cdc: string
  isLoading: boolean
  error: string | null
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<GrokOpportunity | null>(null)
  const [analysis, setAnalysis] = useState<ProjectAnalysis>({
    cdc: '',
    isLoading: true,
    error: null
  })
  const [showChat, setShowChat] = useState(false)
  const [isProjectReady, setIsProjectReady] = useState(false)

  useEffect(() => {
    // Récupérer l'opportunité depuis le localStorage
    const savedOpportunity = localStorage.getItem('selectedOpportunity')
    if (savedOpportunity) {
      const parsedOpportunity = JSON.parse(savedOpportunity)
      setOpportunity(parsedOpportunity)
      
      // Lancer l'analyse du projet
      analyzeProject(parsedOpportunity)
    } else {
      // Rediriger vers la page d'accueil si pas d'opportunité
      router.push('/')
    }
  }, [params.id, router])

  const analyzeProject = async (opp: GrokOpportunity) => {
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

  const handleStartChat = () => {
    setShowChat(true)
  }

  const handleBackToHome = () => {
    router.push('/')
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
            Retour aux opportunités
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
          {/* Colonne principale - CDC */}
          <div className="lg:col-span-2 space-y-6">
            {/* Résumé du projet */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Résumé du projet
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
                    <h3 className="font-medium text-gray-900 mb-2">Revenus estimés</h3>
                    <p className="text-green-600 font-semibold">{opportunity.mrr_arr}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Temps de développement</h3>
                    <p className="text-orange-600 font-semibold">{opportunity.temps_dev}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cahier des charges */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Cahier des Charges (CDC)
              </h2>
              
              {analysis.isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération du CDC en cours...</p>
                </div>
              )}

              {analysis.error && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{analysis.error}</p>
                  <Button onClick={() => analyzeProject(opportunity)} variant="outline">
                    Réessayer
                  </Button>
                </div>
              )}

              {analysis.cdc && (
                <CDCFormatter content={analysis.cdc} />
              )}
            </Card>
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
                {!showChat && analysis.cdc && (
                  <Button 
                    onClick={handleStartChat}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Donner mon avis
                  </Button>
                )}
                
                {showChat && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Chat activé</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleProjectReady}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Je suis prêt à développer
                    </Button>
                  </div>
                )}
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

        {/* Chat interface (si activé) */}
        {showChat && opportunity && analysis.cdc && (
          <div className="mt-8">
            <ProjectChat 
              opportunity={opportunity}
              cdc={analysis.cdc}
              onProjectReady={handleProjectReady}
            />
          </div>
        )}
      </div>
    </div>
  )
}

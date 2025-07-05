"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Code, Palette, Rocket, CheckCircle, ExternalLink } from "lucide-react"
import { DevelopmentChat } from "@/components/development-chat"

interface FinalizedProject {
  id: string
  nom: string
  description: string
  probleme_resolu: string
  stack_technique: string
  complexite: string
  temps_dev: string
  mrr_arr: string
  type_marche: string
  cdc: string
  finalizedAt: string
}

export default function DevelopmentPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<FinalizedProject | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const developmentSteps = [
    {
      id: 'setup',
      title: 'Configuration initiale',
      description: 'Mise en place de l\'environnement de développement',
      icon: Code,
      status: 'current'
    },
    {
      id: 'backend',
      title: 'Développement Backend',
      description: 'API, base de données et logique métier',
      icon: Code,
      status: 'pending'
    },
    {
      id: 'frontend',
      title: 'Interface utilisateur',
      description: 'Développement avec Cursor',
      icon: Code,
      status: 'pending'
    },
    {
      id: 'landing',
      title: 'Landing page',
      description: 'Création avec v0.dev (Vercel)',
      icon: Palette,
      status: 'pending'
    },
    {
      id: 'deploy',
      title: 'Déploiement',
      description: 'Mise en production',
      icon: Rocket,
      status: 'pending'
    }
  ]

  useEffect(() => {
    // Récupérer le projet finalisé depuis le localStorage
    const savedProject = localStorage.getItem('finalizedProject')
    if (savedProject) {
      const parsedProject = JSON.parse(savedProject)
      setProject(parsedProject)
    } else {
      // Rediriger vers la page d'accueil si pas de projet
      router.push('/')
    }
  }, [params.id, router])

  const handleBackToProject = () => {
    router.push(`/project/${params.id}`)
  }

  const handleStepComplete = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1)
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Chargement du guide de développement...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={handleBackToProject}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au projet
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Guide de développement</h1>
            <p className="text-gray-600 mt-1">{project.nom} - Développement étape par étape</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            Cursor + v0.dev
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Étapes */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="font-semibold mb-4">Étapes de développement</h3>
              <div className="space-y-4">
                {developmentSteps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index < currentStep
                  const isCurrent = index === currentStep
                  const isPending = index > currentStep

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : isCurrent
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm ${
                            isCompleted
                              ? 'text-green-900'
                              : isCurrent
                              ? 'text-blue-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            isCompleted
                              ? 'text-green-700'
                              : isCurrent
                              ? 'text-blue-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Informations du projet */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                Projet à développer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Stack technique</h3>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {project.stack_technique}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Complexité</h3>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 capitalize">
                    {project.complexite}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Temps estimé</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {project.temps_dev}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{project.description}</p>
              </div>
            </Card>

            {/* Outils recommandés */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">🛠️ Outils recommandés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Cursor</h3>
                  </div>
                  <p className="text-blue-800 text-sm mb-3">
                    IDE avec IA intégrée pour un développement ultra-rapide
                  </p>
                  <Button asChild size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Télécharger Cursor
                    </a>
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Palette className="h-6 w-6 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">v0.dev</h3>
                  </div>
                  <p className="text-purple-800 text-sm mb-3">
                    Générateur de landing pages par Vercel avec IA
                  </p>
                  <Button asChild size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    <a href="https://v0.dev" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir v0.dev
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Chat de développement */}
            <DevelopmentChat 
              project={project}
              currentStep={currentStep}
              onStepComplete={handleStepComplete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

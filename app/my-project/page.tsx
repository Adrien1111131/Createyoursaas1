"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, Lightbulb, Rocket } from "lucide-react"
import { ProjectCreatorChat } from "@/components/project-creator-chat"

export default function MyProjectPage() {
  const router = useRouter()
  const [isProjectDefined, setIsProjectDefined] = useState(false)

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleProjectDefined = (projectData: any) => {
    console.log('🎉 Projet défini:', projectData)
    setIsProjectDefined(true)
    
    // Sauvegarder le projet finalisé dans localStorage
    localStorage.setItem('finalizedProject', JSON.stringify(projectData))
    
    // Rediriger vers la page de développement
    router.push(`/project/${projectData.id}/development`)
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
            Retour à l'accueil
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Créer mon projet</h1>
            <p className="text-gray-600 mt-1">Décrivez votre idée et nous vous aiderons à la développer</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat IA
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Informations */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Comment ça marche
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-blue-600">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Décrivez votre idée</h4>
                    <p className="text-gray-600 text-xs">Expliquez votre projet en quelques mots</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-purple-600">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Questions ciblées</h4>
                    <p className="text-gray-600 text-xs">L'IA vous pose des questions pour bien comprendre</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-green-600">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Guide personnalisé</h4>
                    <p className="text-gray-600 text-xs">Recevez un plan de développement sur mesure</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <strong>Conseil :</strong> Soyez précis dans vos réponses. Plus vous donnez de détails, plus le guide sera adapté à vos besoins.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contenu principal - Chat */}
          <div className="lg:col-span-3">
            <ProjectCreatorChat onProjectDefined={handleProjectDefined} />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, CheckCircle, Rocket } from "lucide-react"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ProjectDefinition {
  nom: string
  description: string
  probleme_resolu: string
  utilisateurs_cibles: string
  fonctionnalites_cles: string[]
  stack_preferee: string
  niveau_technique: string
  contraintes: string
  temps_disponible: string
}

interface ProjectCreatorChatProps {
  onProjectDefined: (projectData: any) => void
}

export function ProjectCreatorChat({ onProjectDefined }: ProjectCreatorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Salut ! 👋 Je suis là pour t'aider à définir ton projet SaaS !

🎯 **Mon objectif** : Comprendre parfaitement ton idée pour créer un guide de développement personnalisé.

💡 **Comment ça marche** :
- Je vais te poser des questions précises
- Tu réponds naturellement, comme dans une conversation
- Une fois que j'ai toutes les infos, je génère ton plan de développement

🚀 **Pour commencer, dis-moi :**
Quelle est ton idée de projet ? Décris-la moi en quelques phrases simples !

(Pas besoin d'être parfait, on va affiner ensemble 😊)`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projectDefinition, setProjectDefinition] = useState<Partial<ProjectDefinition>>({})
  const [isProjectComplete, setIsProjectComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userMessage: inputMessage.trim(),
          currentDefinition: projectDefinition
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'IA')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Mettre à jour la définition du projet
      if (data.updatedDefinition) {
        setProjectDefinition(data.updatedDefinition)
      }

      // Vérifier si le projet est complet
      if (data.isProjectComplete) {
        setIsProjectComplete(true)
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Peux-tu reformuler ta réponse ?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleCreateProject = async () => {
    try {
      setIsLoading(true)
      
      // Générer le projet finalisé
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'finalize',
          projectDefinition: projectDefinition
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation du projet')
      }

      const data = await response.json()
      
      // Appeler le callback avec le projet finalisé
      onProjectDefined(data.finalizedProject)

    } catch (error) {
      console.error('Erreur lors de la création du projet:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite lors de la finalisation. Peux-tu réessayer ?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Assistant de création de projet
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            IA Spécialisée
          </Badge>
          {isProjectComplete && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Projet défini
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">L'IA analyse votre réponse...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Décrivez votre projet ou répondez aux questions..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Bouton de finalisation */}
        {isProjectComplete && (
          <div className="pt-3 border-t border-gray-200">
            <Button 
              onClick={handleCreateProject}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {isLoading ? "Création en cours..." : "Créer mon guide de développement"}
            </Button>
          </div>
        )}

        {/* Informations sur le projet collectées */}
        {Object.keys(projectDefinition).length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Informations collectées :</h4>
              <div className="text-xs text-blue-800 space-y-1">
                {projectDefinition.nom && (
                  <div><strong>Nom :</strong> {projectDefinition.nom}</div>
                )}
                {projectDefinition.description && (
                  <div><strong>Description :</strong> {projectDefinition.description.substring(0, 100)}...</div>
                )}
                {projectDefinition.stack_preferee && (
                  <div><strong>Stack :</strong> {projectDefinition.stack_preferee}</div>
                )}
                {projectDefinition.niveau_technique && (
                  <div><strong>Niveau :</strong> {projectDefinition.niveau_technique}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

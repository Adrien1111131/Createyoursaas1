"use client"

import { useState, useRef, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, CheckCircle, Copy, ExternalLink, Code, Palette } from "lucide-react"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'prompt' | 'normal'
  tool?: 'cursor' | 'v0' | 'general'
}

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

interface DevelopmentChatProps {
  project: FinalizedProject
  currentStep: number
  onStepComplete: (stepIndex: number) => void
}

const developmentSteps = [
  {
    id: 'setup',
    title: 'Setup du projet',
    tool: 'cursor',
    description: 'Installation des dépendances et configuration'
  },
  {
    id: 'structure',
    title: 'Structure de base',
    tool: 'cursor',
    description: 'Organisation des dossiers et composants'
  },
  {
    id: 'landing',
    title: 'Landing page',
    tool: 'cursor',
    description: 'Page d\'accueil et UI de base'
  },
  {
    id: 'features',
    title: 'Fonctionnalités',
    tool: 'cursor',
    description: 'Développement des features principales'
  },
  {
    id: 'auth',
    title: 'Authentification',
    tool: 'cursor',
    description: 'Système de connexion'
  },
  {
    id: 'api',
    title: 'Intégration API',
    tool: 'cursor',
    description: 'Connexion avec le backend'
  },
  {
    id: 'deploy',
    title: 'Déploiement',
    tool: 'cursor',
    description: 'Mise en production sur Vercel'
  }
]

export function DevelopmentChat({ project, currentStep, onStepComplete }: DevelopmentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialiser le chat avec le message de bienvenue interactif
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `🚀 Let's code **${project.nom}** !

Stack : ${project.stack_technique}
Temps : ${project.temps_dev}

Je vais te donner les meilleurs prompts pour Cursor à chaque étape.
Chaque prompt sera clair et direct, max 200 mots.

On est à l'étape : ${developmentSteps[currentStep]?.title} (${currentStep + 1}/7)

👉 Tape "commencer" pour le premier prompt !`,
        timestamp: new Date(),
        type: 'normal'
      }
      setMessages([welcomeMessage])
    }
  }, [project, currentStep, messages.length])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Vous pourriez ajouter une notification ici
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

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
      const response = await fetch('/api/development-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project,
          currentStep,
          messages: [...messages, userMessage],
          userMessage: inputMessage.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'assistant')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        type: data.type || 'normal',
        tool: data.tool
      }

      setMessages(prev => [...prev, assistantMessage])

      // Vérifier si l'étape est complétée
      if (data.stepCompleted) {
        onStepComplete(currentStep)
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Pouvez-vous reformuler votre demande ?',
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

  const currentStepInfo = developmentSteps[currentStep]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Assistant de développement
        </h3>
        <div className="flex items-center gap-2">
          {currentStepInfo && (
            <Badge 
              variant="outline" 
              className={`${
                currentStepInfo.tool === 'cursor' 
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : currentStepInfo.tool === 'v0'
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              {currentStepInfo.tool === 'cursor' && <Code className="h-3 w-3 mr-1" />}
              {currentStepInfo.tool === 'v0' && <Palette className="h-3 w-3 mr-1" />}
              {currentStepInfo.title}
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
                  : message.type === 'prompt'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Boutons d'action pour les prompts */}
              {message.type === 'prompt' && message.role === 'assistant' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-green-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(message.content)}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copier
                  </Button>
                  
                  {message.tool === 'cursor' && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ouvrir Cursor
                      </a>
                    </Button>
                  )}
                  
                  {message.tool === 'v0' && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <a href="https://v0.dev" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ouvrir v0.dev
                      </a>
                    </Button>
                  )}
                </div>
              )}
              
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
                <span className="text-sm text-gray-600">Génération du guide...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Demandez votre prompt ou posez une question..."
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

      {/* Boutons de validation rapide */}
      <div className="mt-4 space-y-3">
        {/* Boutons de retour rapide */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={async () => {
              const message = '✅ C\'est fait ! Tout fonctionne parfaitement.'
              setInputMessage(message)
              
              // Envoyer automatiquement le message
              const userMessage = {
                id: Date.now().toString(),
                role: 'user' as const,
                content: message,
                timestamp: new Date()
              }
              
              setMessages(prev => [...prev, userMessage])
              setInputMessage('')
              setIsLoading(true)

              try {
                const response = await fetch('/api/development-guide', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    project,
                    currentStep,
                    messages: [...messages, userMessage],
                    userMessage: message
                  })
                })

                if (response.ok) {
                  const data = await response.json()
                  const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: data.response,
                    timestamp: new Date(),
                    type: data.type || 'normal',
                    tool: data.tool
                  }
                  setMessages(prev => [...prev, assistantMessage])
                  
                  if (data.stepCompleted) {
                    onStepComplete(currentStep)
                  }
                }
              } catch (error) {
                console.error('Erreur:', error)
              } finally {
                setIsLoading(false)
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
            disabled={isLoading}
          >
            ✅ C'est fait !
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              const message = '❌ J\'ai un problème, j\'ai besoin d\'aide'
              setInputMessage(message)
              
              // Envoyer automatiquement le message
              const userMessage = {
                id: Date.now().toString(),
                role: 'user' as const,
                content: message,
                timestamp: new Date()
              }
              
              setMessages(prev => [...prev, userMessage])
              setInputMessage('')
              setIsLoading(true)

              try {
                const response = await fetch('/api/development-guide', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    project,
                    currentStep,
                    messages: [...messages, userMessage],
                    userMessage: message
                  })
                })

                if (response.ok) {
                  const data = await response.json()
                  const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: data.response,
                    timestamp: new Date(),
                    type: data.type || 'normal',
                    tool: data.tool
                  }
                  setMessages(prev => [...prev, assistantMessage])
                  
                  if (data.stepCompleted) {
                    onStepComplete(currentStep)
                  }
                }
              } catch (error) {
                console.error('Erreur:', error)
              } finally {
                setIsLoading(false)
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
            disabled={isLoading}
          >
            ❌ J'ai un problème
          </Button>
        </div>

        {/* Aide rapide */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Commandes rapides :</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInputMessage('commencer')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
              disabled={isLoading}
            >
              🚀 commencer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInputMessage('prompt cursor')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
              disabled={isLoading}
            >
              💻 prompt cursor
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInputMessage('prompt v0')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
              disabled={isLoading}
            >
              🎨 prompt v0
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInputMessage('étape suivante')}
              className="border-green-300 text-green-700 hover:bg-green-50 text-xs"
              disabled={isLoading}
            >
              ➡️ étape suivante
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInputMessage('📸 Voici mon screenshot')}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs"
              disabled={isLoading}
            >
              📸 screenshot
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

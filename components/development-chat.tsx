"use client"

import { useState, useRef, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, CheckCircle, Copy, ExternalLink, Code, Palette, Upload } from "lucide-react"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'prompt' | 'normal' | 'payment'
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

// Les étapes sont maintenant générées dynamiquement par l'API
// selon le type de projet sélectionné

export function DevelopmentChat({ project, currentStep, onStepComplete }: DevelopmentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isPaid, setIsPaid] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialiser le compteur de messages depuis localStorage
    const messageKey = `messages_${project.id}`
    const savedCount = localStorage.getItem(messageKey)
    const savedPaidStatus = localStorage.getItem(`paid_${project.id}`)
    
    if (savedCount) {
      setMessageCount(parseInt(savedCount))
    }
    if (savedPaidStatus === 'true') {
      setIsPaid(true)
    }

    // Initialiser le chat avec le message de bienvenue interactif
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `🚀 Salut ! On va créer **${project.nom}** ensemble ! 👋

📝 **Projet** : ${project.description}
🔧 **Stack** : ${project.stack_technique}
⏱️ **Temps estimé** : ${project.temps_dev}

Je suis ton coach dev personnel ! Je vais te guider étape par étape avec des instructions ultra-précises pour Cursor et v0.dev.

🎯 **Mon approche** :
- Instructions courtes et claires
- Adaptation selon ton projet
- Support en cas de problème
- Encouragements à chaque étape !

👉 **Tape "commencer" pour démarrer !** 🚀`,
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

  const handleCreatePayment = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.nom
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement')
      }

      const data = await response.json()
      
      // Afficher le message de paiement avec le vrai lien Stripe
      const paymentMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🚀 **Débloquez la suite du développement de ${project.nom}**

Vous avez utilisé vos 4 messages gratuits ! Pour continuer à recevoir des guides personnalisés et développer votre projet jusqu'au bout :

💰 **15€ seulement** pour un accès illimité à ce projet

✅ Instructions détaillées pour chaque étape
✅ Prompts optimisés pour Cursor et v0.dev  
✅ Support technique personnalisé
✅ Suivi jusqu'au déploiement final

👇 **Cliquez pour payer de manière sécurisée avec Stripe**`,
        timestamp: new Date(),
        type: 'payment'
      }
      
      setMessages(prev => [...prev, paymentMessage])

      // Rediriger vers Stripe Checkout
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank')
      }

    } catch (error) {
      console.error('Erreur création paiement:', error)
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite lors de la création du lien de paiement. Veuillez réessayer.',
        timestamp: new Date(),
        type: 'normal'
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Vérifier la limite de messages
    if (messageCount >= 4 && !isPaid) {
      // Créer le lien de paiement
      handleCreatePayment()
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Incrémenter le compteur de messages
    const newCount = messageCount + 1
    setMessageCount(newCount)
    localStorage.setItem(`messages_${project.id}`, newCount.toString())

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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Coach de développement
        </h3>
        <div className="flex items-center gap-2">
          {/* Indicateur de messages restants */}
          {!isPaid && (
            <Badge 
              variant="outline" 
              className={`${
                messageCount >= 3 
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : messageCount >= 2
                  ? 'bg-orange-50 text-orange-700 border-orange-300'
                  : 'bg-green-50 text-green-700 border-green-300'
              }`}
            >
              {4 - messageCount} messages restants
            </Badge>
          )}
          {isPaid && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
              ✅ Accès illimité
            </Badge>
          )}
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Code className="h-3 w-3 mr-1" />
            {project.nom}
          </Badge>
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

      {/* Zone de capture d'écran */}
      <div className="mt-4">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-600">💡 Astuce :</span>
          <span className="text-sm text-gray-700">Glissez une capture d'écran ici ou tapez "screenshot" pour partager votre avancement</span>
        </div>
      </div>
    </Card>
  )
}

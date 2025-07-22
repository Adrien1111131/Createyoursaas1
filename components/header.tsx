"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, User, LogOut } from "lucide-react"
import { LoginModal } from "./login-modal"

interface SessionData {
  code: string
  hasProject: boolean
  projectData?: any
  projectName?: string
  chatHistory?: any[]
  currentStep?: number
}

interface HeaderProps {
  onSessionChange?: (sessionData: SessionData | null) => void
}

export function Header({ onSessionChange }: HeaderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    // Vérifier s'il y a une session sauvegardée
    const savedCode = localStorage.getItem('userSessionCode')
    if (savedCode) {
      // Valider le code sauvegardé
      validateSavedCode(savedCode)
    }
  }, [])

  const validateSavedCode = async (code: string) => {
    try {
      const response = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        const sessionData: SessionData = {
          code,
          hasProject: data.hasProject,
          projectData: data.projectData,
          projectName: data.projectName,
          chatHistory: data.chatHistory,
          currentStep: data.currentStep
        }
        
        setSessionData(sessionData)
        onSessionChange?.(sessionData)
      } else {
        // Code invalide, le supprimer
        localStorage.removeItem('userSessionCode')
      }
    } catch (error) {
      console.error('Erreur validation code sauvegardé:', error)
      localStorage.removeItem('userSessionCode')
    }
  }

  const handleLoginSuccess = (data: SessionData) => {
    setSessionData(data)
    onSessionChange?.(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('userSessionCode')
    setSessionData(null)
    onSessionChange?.(null)
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Create Your SaaS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {sessionData ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <User className="h-3 w-3 mr-1" />
                    {sessionData.code}
                  </Badge>
                  {sessionData.hasProject && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      {sessionData.projectName}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}

"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Key, CheckCircle } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (sessionData: any) => void
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setError('Veuillez saisir votre code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de validation')
      }

      if (!data.valid) {
        setError('Code invalide')
        return
      }

      // Sauvegarder le code dans localStorage pour auto-connexion
      localStorage.setItem('userSessionCode', code.trim().toUpperCase())

      if (data.hasProject) {
        // Code avec projet existant
        onSuccess({
          code: code.trim().toUpperCase(),
          hasProject: true,
          projectData: data.projectData,
          projectName: data.projectName,
          chatHistory: data.chatHistory,
          currentStep: data.currentStep
        })
      } else {
        // Code valide mais sans projet
        onSuccess({
          code: code.trim().toUpperCase(),
          hasProject: false
        })
      }

      onClose()
      setCode('')

    } catch (error) {
      console.error('Erreur validation:', error)
      setError(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCode('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Connexion avec votre code
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code de session</Label>
            <Input
              id="code"
              type="text"
              placeholder="Ex: DEV-A7K9"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg tracking-wider"
              maxLength={8}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 text-center">
              Saisissez le code reçu après votre paiement
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">💡 Comment obtenir un code ?</h4>
          <p className="text-sm text-blue-800">
            Après avoir payé 15€ pour débloquer un projet, vous recevez un code unique. 
            Ce code vous permet de retrouver votre session sur n'importe quel appareil.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

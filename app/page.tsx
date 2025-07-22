"use client"

import { useState, useEffect } from "react"
import {
  Filter,
  X,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  Sparkles,
  ChevronRight,
  Rocket,
  MessageCircle,
  Code,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { searchOpportunities, Opportunity, SearchCriteria } from "@/lib/grok-service"
import { OpportunityResults } from "@/components/opportunity-results"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

interface SessionData {
  code: string
  hasProject: boolean
  projectData?: any
  projectName?: string
  chatHistory?: any[]
  currentStep?: number
}

const domains = [
  { name: "IA & Automation", icon: "🤖", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Productivité & Workflow", icon: "⚡", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "E-commerce & Ventes", icon: "🛒", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Marketing Digital", icon: "📈", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "Finance & Comptabilité", icon: "💰", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { name: "Analytics & Data", icon: "📊", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { name: "Cybersécurité", icon: "🔒", color: "bg-red-100 text-red-700 border-red-200" },
  { name: "HR & Recrutement", icon: "👥", color: "bg-green-100 text-green-700 border-green-200" },
]

const timeOptions = [
  { label: "1 semaine", value: 7, icon: "🚀", description: "Rapide" },
  { label: "1 mois", value: 30, icon: "🏗️", description: "Structuré" },
  { label: "3+ mois", value: 90, icon: "🏛️", description: "Complexe" },
]

const difficultyLevels = [
  {
    label: "Facile",
    icon: "🟢",
    description: "Débutant",
    color: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100",
  },
  {
    label: "Intermédiaire",
    icon: "🟡",
    description: "Confirmé",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100",
  },
  {
    label: "Complexe",
    icon: "🔴",
    description: "Expert",
    color: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [activeTab, setActiveTab] = useState("discover")
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)
  
  // États pour la recherche
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [customDomain, setCustomDomain] = useState("")
  const [timeRange, setTimeRange] = useState([7])
  const [difficulty, setDifficulty] = useState("")
  const [productType, setProductType] = useState("")
  const [targetClient, setTargetClient] = useState("")
  const [mrrRange, setMrrRange] = useState([1000])
  const [barriers, setBarriers] = useState("")
  
  // États pour la recherche Grok
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    // Vérifier les paramètres URL pour le retour de paiement
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    const code = urlParams.get('code')
    
    if (paymentStatus === 'success' && code) {
      setPaymentSuccess(code)
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname)
    }

    // 🔄 Restaurer les résultats de recherche sauvegardés
    try {
      const savedSearchData = localStorage.getItem('searchResults')
      if (savedSearchData) {
        const searchData = JSON.parse(savedSearchData)
        
        // Vérifier que les données ne sont pas trop anciennes (24h max)
        const maxAge = 24 * 60 * 60 * 1000 // 24 heures en millisecondes
        const isRecent = Date.now() - searchData.timestamp < maxAge
        
        if (isRecent && searchData.results && searchData.criteria) {
          console.log('🔄 Restauration des résultats sauvegardés')
          
          // Restaurer les résultats
          setOpportunities(searchData.results)
          setHasSearched(searchData.hasSearched)
          
          // Restaurer les critères de recherche
          const criteria = searchData.criteria
          setTimeRange(criteria.timeRange || [7])
          setDifficulty(criteria.difficulty || "")
          setSelectedDomains(criteria.selectedDomains || [])
          setProductType(criteria.productType || "")
          setTargetClient(criteria.targetClient || "")
          setMrrRange(criteria.mrrRange || [1000])
          setBarriers(criteria.barriers || "")
          
          console.log('✅ Résultats et critères restaurés avec succès')
        } else {
          // Nettoyer les données expirées
          localStorage.removeItem('searchResults')
          console.log('🧹 Données expirées supprimées')
        }
      }
    } catch (error) {
      console.log('⚠️ Erreur lors de la restauration:', error)
      // En cas d'erreur, nettoyer le localStorage
      localStorage.removeItem('searchResults')
    }

    // Si l'utilisateur a une session avec projet, basculer sur l'onglet "Mon Projet"
    if (sessionData?.hasProject) {
      setActiveTab("my-project")
    }
  }, [sessionData])

  const handleSessionChange = (data: SessionData | null) => {
    setSessionData(data)
    if (data?.hasProject) {
      setActiveTab("my-project")
    }
  }

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]))
  }

  const handleSearch = async () => {
    console.log('🔍 Début de la recherche...')
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    
    try {
      // Combiner les domaines sélectionnés avec le domaine personnalisé
      const allDomains = [...selectedDomains]
      if (customDomain.trim()) {
        allDomains.push(customDomain.trim())
      }
      
      const criteria: SearchCriteria = {
        timeRange,
        difficulty,
        selectedDomains: allDomains,
        productType,
        targetClient,
        mrrRange,
        barriers
      }
      
      console.log('📊 Critères de recherche:', criteria)
      
      // Appel à l'API route au lieu du service direct
      const response = await fetch('/api/search-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Erreur de recherche')
      }

      const data = await response.json()
      console.log('✅ Résultats reçus:', data.data)
      
      setOpportunities(data.data)
      
      // 💾 Sauvegarder les résultats et critères dans localStorage
      try {
        const searchData = {
          results: data.data,
          criteria: criteria,
          timestamp: Date.now(),
          hasSearched: true
        }
        localStorage.setItem('searchResults', JSON.stringify(searchData))
        console.log('💾 Résultats sauvegardés dans localStorage')
      } catch (error) {
        console.log('⚠️ Impossible de sauvegarder dans localStorage:', error)
      }
    } catch (err) {
      console.error('❌ Erreur lors de la recherche:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la recherche')
      setOpportunities([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToDevelopment = () => {
    if (sessionData?.projectData) {
      // Sauvegarder le projet dans localStorage pour la page de développement
      localStorage.setItem('finalizedProject', JSON.stringify(sessionData.projectData))
      router.push(`/project/${sessionData.projectData.id}/development`)
    }
  }

  const DiscoverTab = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 rounded-full text-xs font-medium text-emerald-800">
          <Sparkles className="h-3 w-3" />
          Trouvez votre prochaine opportunité
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
          Découvrez des idées de micro-SaaS
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Des idées SaaS rentables, testées sur le marché américain et prêtes à conquérir la francophonie
        </p>
      </div>

      <div className={`grid gap-4 ${isAdvancedMode ? "lg:grid-cols-5" : "grid-cols-1"} transition-all duration-700 ease-in-out`}>
        {/* Sidebar avancée */}
        {isAdvancedMode && (
          <div className="lg:col-span-1 space-y-4 animate-in slide-in-from-left duration-700">
            <Card className="p-4 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md">
                  <Filter className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Filtres avancés</h3>
              </div>

              <div className="space-y-4">
                {/* Type de produit */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <Target className="h-3 w-3 text-emerald-600" />
                    Type de produit
                  </Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger className="h-8 text-xs bg-white border-gray-200 hover:border-emerald-300">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro-saas">🚀 Micro-SaaS</SelectItem>
                      <SelectItem value="extension">🧩 Extension</SelectItem>
                      <SelectItem value="application">📱 Application</SelectItem>
                      <SelectItem value="api">⚙️ API</SelectItem>
                      <SelectItem value="autre">✨ Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Client cible */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <Users className="h-3 w-3 text-emerald-600" />
                    Client cible
                  </Label>
                  <Select value={targetClient} onValueChange={setTargetClient}>
                    <SelectTrigger className="h-8 text-xs bg-white border-gray-200 hover:border-emerald-300">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2c">👥 B2C</SelectItem>
                      <SelectItem value="b2b">🏢 B2B</SelectItem>
                      <SelectItem value="mixte">🔄 Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-gray-200" />

                {/* MRR estimé */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <DollarSign className="h-3 w-3 text-emerald-600" />
                    Revenus mensuels
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={mrrRange}
                      onValueChange={setMrrRange}
                      max={10000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>100€</span>
                      <span className="font-semibold text-emerald-600">{mrrRange[0]}€</span>
                      <span>10k€</span>
                    </div>
                  </div>
                </div>

                {/* Barrières à l'entrée */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <Shield className="h-3 w-3 text-emerald-600" />
                    Barrières
                  </Label>
                  <div className="space-y-1">
                    {[
                      { label: "Faible", color: "text-green-700" },
                      { label: "Moyenne", color: "text-yellow-700" },
                      { label: "Forte", color: "text-red-700" },
                    ].map((level) => (
                      <Button
                        key={level.label}
                        variant={barriers === level.label ? "default" : "outline"}
                        onClick={() => setBarriers(barriers === level.label ? "" : level.label)}
                        className="w-full h-7 text-xs bg-white hover:bg-gray-50 border-gray-200"
                        size="sm"
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Zone principale */}
        <div className={`${isAdvancedMode ? "lg:col-span-4" : "col-span-1"} space-y-4 transition-all duration-700`}>
          <Card className="p-5 bg-gradient-to-br from-white via-white to-gray-50/30 border-0 shadow-lg">
            <div className="space-y-6">
              {/* Temps de développement */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Temps de développement</Label>
                    <p className="text-xs text-gray-600">Combien de temps pouvez-vous consacrer ?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {timeOptions.map((time) => (
                    <Button
                      key={time.value}
                      variant={timeRange[0] === time.value ? "default" : "outline"}
                      onClick={() => setTimeRange([time.value])}
                      className={`p-3 h-auto flex-col gap-1.5 transition-all duration-300 ${
                        timeRange[0] === time.value
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                          : "bg-white hover:bg-gray-50 hover:border-emerald-300"
                      }`}
                    >
                      <span className="text-lg">{time.icon}</span>
                      <div className="text-center">
                        <div className="text-xs font-semibold">{time.label}</div>
                        <div className={`text-xs ${timeRange[0] === time.value ? "text-emerald-100" : "text-gray-500"}`}>
                          {time.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Niveau de difficulté */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-md">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Niveau de difficulté</Label>
                    <p className="text-xs text-gray-600">Quel niveau vous correspond ?</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {difficultyLevels.map((level) => (
                    <Button
                      key={level.label}
                      variant={difficulty === level.label ? "default" : "outline"}
                      onClick={() => setDifficulty(difficulty === level.label ? "" : level.label)}
                      className={`p-3 h-auto flex-col gap-1.5 transition-all duration-300 ${
                        difficulty === level.label
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                          : `${level.color} border-2`
                      }`}
                    >
                      <span className="text-lg">{level.icon}</span>
                      <div className="text-center">
                        <div className="text-xs font-semibold">{level.label}</div>
                        <div className={`text-xs ${difficulty === level.label ? "text-orange-100" : "text-gray-600"}`}>
                          {level.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Domaines d'intérêt */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Domaines d'intérêt</Label>
                    <p className="text-xs text-gray-600">Secteurs qui vous passionnent (optionnel)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {domains.map((domain) => (
                      <Badge
                        key={domain.name}
                        variant={selectedDomains.includes(domain.name) ? "default" : "outline"}
                        className={`px-2.5 py-1.5 text-xs cursor-pointer transition-all duration-300 ${
                          selectedDomains.includes(domain.name)
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                            : `${domain.color} hover:shadow-sm border`
                        }`}
                        onClick={() => toggleDomain(domain.name)}
                      >
                        <span className="mr-1">{domain.icon}</span>
                        {domain.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Champ personnalisé */}
                  <div className="max-w-md">
                    <Input
                      placeholder="Autre domaine (ex: EdTech, HealthTech, PropTech...)"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                    />
                    {customDomain && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Votre domaine personnalisé sera inclus dans la recherche
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  size="lg"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full py-4 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <span className="mr-2">{isLoading ? "⏳" : "🚀"}</span>
                  {isLoading ? "Recherche en cours..." : "Découvrir les opportunités"}
                  {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Affichage des résultats */}
      {hasSearched && (
        <div className="animate-in fade-in duration-500">
          {/* Indicateur de restauration */}
          {opportunities.length > 0 && !isLoading && (
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="text-sm">💾</span>
                  <span className="text-sm font-medium">
                    Résultats restaurés depuis votre dernière recherche
                  </span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('searchResults')
                    setOpportunities([])
                    setHasSearched(false)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Nouvelle recherche
                </button>
              </div>
            </div>
          )}
          
          <OpportunityResults 
            opportunities={opportunities}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}
    </div>
  )

  const MyProjectTab = () => (
    <div className="max-w-4xl mx-auto">
      {sessionData?.hasProject ? (
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {sessionData.projectName}
              </h2>
              <p className="text-gray-600">
                Votre projet est prêt ! Continuez le développement avec notre assistant IA.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                ✅ Accès illimité
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                Code: {sessionData.code}
              </Badge>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleGoToDevelopment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Continuer le développement
              </Button>
              
              <div className="text-sm text-gray-500">
                Étape actuelle : {sessionData.currentStep || 0}/5
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Code className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun projet associé
              </h2>
              <p className="text-gray-600">
                Ce code est valide mais aucun projet n'y est encore associé. 
                Découvrez des opportunités et développez votre premier projet !
              </p>
            </div>

            <Button
              onClick={() => setActiveTab("discover")}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Découvrir des opportunités
            </Button>
          </div>
        </Card>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header onSessionChange={handleSessionChange} />
      
      {/* Modal de succès de paiement */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Paiement réussi !
                </h2>
                <p className="text-gray-600">
                  Votre code de session a été généré. Gardez-le précieusement !
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Votre code de session :
                </Label>
                <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                  {paymentSuccess}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Utilisez ce code pour retrouver votre session sur n'importe quel appareil
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentSuccess)
                    // Vous pourriez ajouter une notification ici
                  }}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  📋 Copier le code
                </Button>
                
                <Button
                  onClick={() => setPaymentSuccess(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continuer
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                💡 Astuce : Utilisez le bouton "Connexion" en haut à droite pour saisir votre code
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Découvrir
              </TabsTrigger>
              <TabsTrigger 
                value="my-project" 
                className="flex items-center gap-2"
                disabled={!sessionData}
              >
                <Rocket className="h-4 w-4" />
                Mon Projet
              </TabsTrigger>
            </TabsList>

            {/* Toggle mode avancé */}
            {activeTab === "discover" && (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-0.5">
                <Label
                  htmlFor="mode-toggle"
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    !isAdvancedMode ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
                  }`}
                >
                  Simple
                </Label>
                <Switch
                  id="mode-toggle"
                  checked={isAdvancedMode}
                  onCheckedChange={setIsAdvancedMode}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <Label
                  htmlFor="mode-toggle"
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    isAdvancedMode ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
                  }`}
                >
                  Avancé
                </Label>
              </div>
            )}
          </div>

          <TabsContent value="discover" className="mt-0">
            <DiscoverTab />
          </TabsContent>

          <TabsContent value="my-project" className="mt-0">
            <MyProjectTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

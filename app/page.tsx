"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { searchOpportunities, GrokOpportunity, SearchCriteria } from "@/lib/grok-service"
import { OpportunityResults } from "@/components/opportunity-results"

const domains = [
  { name: "SEO", icon: "🔍", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { name: "IA", icon: "🤖", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Productivité", icon: "⚡", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "E-commerce", icon: "🛒", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Marketing", icon: "📈", color: "bg-pink-100 text-pink-700 border-pink-200" },
  { name: "Design", icon: "🎨", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { name: "Analytics", icon: "📊", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { name: "Communication", icon: "💬", color: "bg-green-100 text-green-700 border-green-200" },
]

const timeOptions = [
  { label: "1 jour", value: 1, icon: "⚡", description: "Express" },
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

export default function OpportunitiesSearch() {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState([7])
  const [difficulty, setDifficulty] = useState("")
  const [productType, setProductType] = useState("")
  const [targetClient, setTargetClient] = useState("")
  const [mrrRange, setMrrRange] = useState([1000])
  const [barriers, setBarriers] = useState("")
  
  // États pour la recherche Grok
  const [opportunities, setOpportunities] = useState<GrokOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]))
  }

  // Fonction pour lancer la recherche avec Grok
  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    
    try {
      const criteria: SearchCriteria = {
        timeRange,
        difficulty,
        selectedDomains,
        productType,
        targetClient,
        mrrRange,
        barriers
      }
      
      const results = await searchOpportunities(criteria)
      setOpportunities(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la recherche')
      setOpportunities([])
    } finally {
      setIsLoading(false)
    }
  }

  const MainInterface = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section - Compacte */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 rounded-full text-xs font-medium text-emerald-800">
          <Sparkles className="h-3 w-3" />
          Trouvez votre prochaine opportunité
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
          Découvrez des idées de micro-SaaS
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Des opportunités adaptées à vos compétences, votre temps et vos objectifs de revenus
        </p>
      </div>

      <div
        className={`grid gap-4 ${isAdvancedMode ? "lg:grid-cols-5" : "grid-cols-1"} transition-all duration-700 ease-in-out`}
      >
        {/* Sidebar avancée - Plus compacte */}
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

        {/* Zone principale - Plus compacte */}
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

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
                        <div
                          className={`text-xs ${timeRange[0] === time.value ? "text-emerald-100" : "text-gray-500"}`}
                        >
                          {time.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Slider détaillé en mode avancé */}
                {isAdvancedMode && (
                  <div className="p-3 bg-gray-50 rounded-lg animate-in fade-in duration-500">
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">Précisez en jours</Label>
                    <Slider
                      value={timeRange}
                      onValueChange={setTimeRange}
                      max={90}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1j</span>
                      <span className="font-semibold text-emerald-600">{timeRange[0]}j</span>
                      <span>90j</span>
                    </div>
                  </div>
                )}
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

          {/* Zone de résultats - Plus compacte */}
          {isAdvancedMode && (
            <div className="animate-in fade-in duration-1000">
              <Card className="p-5 bg-gradient-to-br from-white to-gray-50/30 border-0 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Opportunités découvertes</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden bg-white hover:bg-gray-50 border-gray-200"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </div>

                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Prêt à découvrir ?</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    Configurez vos critères et lancez la recherche pour découvrir des opportunités personnalisées
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des résultats */}
      {hasSearched && (
        <div className="animate-in fade-in duration-500">
          <OpportunityResults 
            opportunities={opportunities}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && isAdvancedMode && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white w-72 h-full p-4 overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Filtres avancés</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header fixe - Plus compact */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  CreateYourSaas
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal - Padding réduit */}
      <main className="container mx-auto px-4 py-6">
        <MainInterface />
      </main>
    </div>
  )
}

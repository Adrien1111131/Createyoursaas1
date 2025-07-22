"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Target, 
  Cog, 
  Users, 
  Calendar, 
  CheckCircle,
  Lightbulb,
  Zap,
  Settings
} from "lucide-react"

interface CDCFormatterProps {
  content: string
}

export function CDCFormatter({ content }: CDCFormatterProps) {
  // Fonction pour parser et formater le contenu du CDC
  const parseContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '')
    const sections: Array<{
      type: 'title' | 'subtitle' | 'content' | 'list' | 'important'
      content: string
      icon?: React.ReactNode
    }> = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Détecter les titres principaux (tout en majuscules ou commençant par un numéro)
      if (line.match(/^[A-Z\s]+$/) || line.match(/^\d+\.\s*[A-Z]/) || line.includes('CAHIER DES CHARGES') || line.includes('OBJECTIFS') || line.includes('FONCTIONNALITÉS')) {
        sections.push({
          type: 'title',
          content: line,
          icon: getTitleIcon(line)
        })
      }
      // Détecter les sous-titres (commencent par - ou • ou contiennent des mots-clés)
      else if (line.match(/^[-•]\s/) || isSubtitle(line)) {
        sections.push({
          type: 'subtitle',
          content: line.replace(/^[-•]\s*/, ''),
          icon: <CheckCircle className="h-4 w-4 text-emerald-600" />
        })
      }
      // Détecter les éléments de liste
      else if (line.match(/^\s*[-•*]\s/) || line.match(/^\s*\d+\.\s/)) {
        sections.push({
          type: 'list',
          content: line.replace(/^\s*[-•*]\s*/, '').replace(/^\s*\d+\.\s*/, '')
        })
      }
      // Détecter les éléments importants (contiennent des mots-clés)
      else if (isImportant(line)) {
        sections.push({
          type: 'important',
          content: line
        })
      }
      // Contenu normal
      else if (line.length > 0) {
        sections.push({
          type: 'content',
          content: line
        })
      }
    }

    return sections
  }

  // Fonction pour obtenir l'icône appropriée selon le titre
  const getTitleIcon = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('concept') || titleLower.includes('projet')) {
      return <Lightbulb className="h-5 w-5 text-yellow-600" />
    }
    if (titleLower.includes('workflow') || titleLower.includes('plan')) {
      return <Target className="h-5 w-5 text-blue-600" />
    }
    if (titleLower.includes('stack') || titleLower.includes('tech')) {
      return <Cog className="h-5 w-5 text-orange-600" />
    }
    if (titleLower.includes('pratique') || titleLower.includes('sauvegarde')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (titleLower.includes('feature') || titleLower.includes('mvp')) {
      return <Zap className="h-5 w-5 text-purple-600" />
    }
    if (titleLower.includes('planning') || titleLower.includes('délai')) {
      return <Calendar className="h-5 w-5 text-red-600" />
    }
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  // Fonction pour détecter les sous-titres
  const isSubtitle = (line: string) => {
    const keywords = [
      'résumé', 'cahier des charges', 'opportunité', 'architecture', 
      'fonctionnalités', 'technologies', 'planning', 'sécurité',
      'déploiement', 'marché français', 'réglementations', 'stratégie'
    ]
    return keywords.some(keyword => 
      line.toLowerCase().includes(keyword) && line.length < 150
    )
  }

  // Fonction pour détecter les éléments importants
  const isImportant = (line: string) => {
    const importantKeywords = [
      'important', 'attention', 'rgpd', 'cnil', 'sécurité',
      'conformité', 'obligatoire', 'essentiel', 'critique',
      'validation', 'test', 'sauvegarde'
    ]
    return importantKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  }

  // Fonction pour mettre en gras les mots-clés dans le texte
  const highlightKeywords = (text: string) => {
    const keywords = [
      'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'MongoDB', 'PostgreSQL',
      'API', 'REST', 'GraphQL', 'JWT', 'OAuth', 'HTTPS', 'SSL',
      'responsive', 'mobile', 'desktop', 'SEO', 'performance',
      'RGPD', 'CNIL', 'français', 'francophone', 'France',
      'sécurité', 'conformité', 'réglementation', 'MVP'
    ]
    
    let highlightedText = text
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      highlightedText = highlightedText.replace(regex, `**${keyword}**`)
    })
    
    return highlightedText
  }

  const sections = parseContent(content)

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'title':
            return (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-r-lg">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    {section.content}
                  </h2>
                </div>
              </div>
            )
          
          case 'subtitle':
            return (
              <div key={index} className="flex items-start gap-3 py-2">
                {section.icon}
                <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                  {section.content}
                </h3>
              </div>
            )
          
          case 'list':
            return (
              <div key={index} className="flex items-start gap-3 pl-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0"></div>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            )
          
          case 'important':
            return (
              <Card key={index} className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-900 font-semibold leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </Card>
            )
          
          case 'content':
          default:
            return (
              <p key={index} className="text-gray-800 leading-relaxed text-base font-normal pl-2">
                {highlightKeywords(section.content).split('**').map((part, i) => 
                  i % 2 === 1 ? (
                    <span key={i} className="font-bold text-gray-900 bg-gray-100 px-1 rounded">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </p>
            )
        }
      })}
      
      {/* Footer avec badges de qualité */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Cahier des charges structuré et clair</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              📋 Prêt pour le développement
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Document de travail pratique et actionnable</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Adapté au marché français et aux réglementations</span>
          </div>
        </div>
      </div>
    </div>
  )
}

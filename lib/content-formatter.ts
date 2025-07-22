// Utilitaires pour formater et humaniser le contenu

export const formatDescription = (description: string): string => {
  // Si la description est déjà bien formatée, la retourner telle quelle
  if (description.length > 50 && !description.includes('SAAS ORIGINAL') && !description.includes('🔍')) {
    return description
  }
  
  // Sinon, essayer d'extraire et reformater
  const cleanDescription = description
    .replace(/🔍.*?-/g, '') // Supprimer les préfixes techniques
    .replace(/SAAS ORIGINAL.*?-/g, '')
    .replace(/📋.*?-/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  return cleanDescription || description
}

export const formatProblemeResolu = (probleme: string): string => {
  // Ajouter du contexte si le problème est trop court
  if (probleme.length < 50) {
    return `${probleme}. Cette solution répond à un besoin concret du marché.`
  }
  
  return probleme
}

export const formatOpportuniteFrancophone = (opportunite: string): string => {
  // Si l'opportunité est déjà bien détaillée, la retourner
  if (opportunite.length > 100 && opportunite.includes('français')) {
    return opportunite
  }
  
  // Sinon, ajouter du contexte français
  const baseText = opportunite.replace(/^VERSION FRANCOPHONE PROPOSÉE\s*:\s*/i, '').trim()
  
  return `Le marché français présente une opportunité intéressante pour ce type de solution. ${baseText} Une adaptation française avec support client en français, conformité RGPD et tarification en euros pourrait rapidement conquérir ce marché.`
}

export const formatStackTechnique = (stack: string): string => {
  // Nettoyer et formater la stack technique
  return stack
    .split(',')
    .map(tech => tech.trim())
    .filter(tech => tech.length > 0)
    .join(', ')
}

export const formatComplexite = (complexite: string): string => {
  const mapping: Record<string, string> = {
    'simple': 'Simple',
    'medium': 'Intermédiaire', 
    'advanced': 'Avancé',
    'facile': 'Simple',
    'moyen': 'Intermédiaire',
    'complexe': 'Avancé'
  }
  
  return mapping[complexite.toLowerCase()] || complexite
}

export const formatTypeMarche = (type: string): string => {
  const mapping: Record<string, string> = {
    'b2b': 'Entreprises (B2B)',
    'b2c': 'Particuliers (B2C)',
    'both': 'Mixte (B2B + B2C)'
  }
  
  return mapping[type.toLowerCase()] || type
}

export const formatTypeProduit = (type: string): string => {
  const mapping: Record<string, string> = {
    'micro-saas': 'Micro-SaaS',
    'extension': 'Extension navigateur',
    'application': 'Application web',
    'api': 'Service API',
    'autre': 'Autre'
  }
  
  return mapping[type.toLowerCase()] || type
}

// Fonction principale pour formater une opportunité complète
export const formatOpportunity = (opportunity: any) => {
  return {
    ...opportunity,
    description: formatDescription(opportunity.description),
    probleme_resolu: formatProblemeResolu(opportunity.probleme_resolu),
    opportunite: formatOpportuniteFrancophone(opportunity.opportunite),
    stack_technique: formatStackTechnique(opportunity.stack_technique),
    complexite_formatted: formatComplexite(opportunity.complexite),
    type_marche_formatted: formatTypeMarche(opportunity.type_marche),
    type_produit_formatted: formatTypeProduit(opportunity.type_produit)
  }
}

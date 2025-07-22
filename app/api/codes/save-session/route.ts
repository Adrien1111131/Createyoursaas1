import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface CodeData {
  used: boolean
  projectId: string | null
  projectName: string | null
  projectData: any
  chatHistory: any[]
  currentStep: number
  createdAt: string | null
  activatedAt: string | null
}

interface CodesDatabase {
  [key: string]: CodeData
}

const CODES_FILE_PATH = path.join(process.cwd(), 'lib', 'codes.json')

async function readCodesFile(): Promise<CodesDatabase> {
  try {
    const fileContent = await fs.readFile(CODES_FILE_PATH, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Erreur lecture codes.json:', error)
    return {}
  }
}

async function writeCodesFile(codes: CodesDatabase): Promise<void> {
  try {
    await fs.writeFile(CODES_FILE_PATH, JSON.stringify(codes, null, 2))
  } catch (error) {
    console.error('Erreur écriture codes.json:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      projectData, 
      projectName, 
      chatHistory, 
      currentStep 
    } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code manquant ou invalide' },
        { status: 400 }
      )
    }

    const normalizedCode = code.toUpperCase().trim()
    const codes = await readCodesFile()
    
    if (!codes[normalizedCode]) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 404 }
      )
    }

    // Mettre à jour les données du code
    codes[normalizedCode] = {
      ...codes[normalizedCode],
      used: true,
      projectId: projectData?.id || null,
      projectName: projectName || null,
      projectData: projectData || null,
      chatHistory: chatHistory || [],
      currentStep: currentStep || 0,
      activatedAt: codes[normalizedCode].activatedAt || new Date().toISOString(),
      createdAt: codes[normalizedCode].createdAt || new Date().toISOString()
    }

    await writeCodesFile(codes)
    
    console.log(`💾 Session sauvegardée pour le code ${normalizedCode} - Projet: ${projectName}`)
    
    return NextResponse.json({
      success: true,
      message: 'Session sauvegardée avec succès',
      code: normalizedCode
    })

  } catch (error) {
    console.error('Erreur sauvegarde session:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

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
    const codes = await readCodesFile()
    
    // Trouver le premier code disponible
    const availableCode = Object.keys(codes).find(code => !codes[code].used)
    
    if (!availableCode) {
      return NextResponse.json(
        { error: 'Aucun code disponible' },
        { status: 404 }
      )
    }

    // Marquer le code comme réservé (mais pas encore utilisé)
    codes[availableCode] = {
      ...codes[availableCode],
      createdAt: new Date().toISOString()
    }

    await writeCodesFile(codes)
    
    console.log(`🎫 Code ${availableCode} réservé pour un nouveau paiement`)
    
    return NextResponse.json({
      success: true,
      code: availableCode,
      message: 'Code réservé avec succès'
    })

  } catch (error) {
    console.error('Erreur obtention code:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

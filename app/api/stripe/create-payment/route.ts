import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Fonction pour obtenir un code disponible
async function getAvailableCode(): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/codes/get-available`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Aucun code disponible')
    }

    const data = await response.json()
    return data.code
  } catch (error) {
    console.error('Erreur obtention code:', error)
    return null
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

interface CreatePaymentRequest {
  projectId: string
  projectName: string
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectName }: CreatePaymentRequest = await request.json()
    
    if (!projectId || !projectName) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Obtenir un code disponible
    const availableCode = await getAvailableCode()
    
    if (!availableCode) {
      return NextResponse.json(
        { error: 'Aucun code de session disponible' },
        { status: 503 }
      )
    }

    // Créer une vraie session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Accès illimité - ${projectName}`,
              description: `Débloquez le développement complet de votre projet ${projectName} avec des guides personnalisés étape par étape.`,
            },
            unit_amount: 1500, // 15€ en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/?payment=success&code=${availableCode}`,
      cancel_url: `${request.nextUrl.origin}/project/${projectId}/development?payment=cancelled`,
      metadata: {
        projectId,
        projectName,
        sessionCode: availableCode,
      },
    })
    
    console.log(`💰 Session Stripe créée pour ${projectName} (${projectId}) avec code ${availableCode}: ${session.id}`)
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      paymentUrl: session.url,
      amount: 1500,
      currency: 'eur',
      code: availableCode
    })

  } catch (error) {
    console.error('❌ Erreur création paiement Stripe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}

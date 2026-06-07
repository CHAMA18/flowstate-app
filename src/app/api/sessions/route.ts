import { NextResponse } from 'next/server'

// Sessions are now managed client-side via Firestore
export async function GET() {
  return NextResponse.json({ message: 'Sessions are managed via Firestore', source: 'client-side' })
}

export async function POST() {
  return NextResponse.json({ message: 'Use client-side Firestore for session operations' })
}

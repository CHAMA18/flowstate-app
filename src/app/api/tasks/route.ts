import { NextResponse } from 'next/server'

// Tasks are now managed client-side via Firestore
// This route is kept for compatibility but data lives in Firestore
export async function GET() {
  return NextResponse.json({ message: 'Tasks are managed via Firestore', source: 'client-side' })
}

export async function POST() {
  return NextResponse.json({ message: 'Use client-side Firestore for task operations' })
}

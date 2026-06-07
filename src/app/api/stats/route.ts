import { NextResponse } from 'next/server'

// Stats are now computed client-side from Firestore data
export async function GET() {
  return NextResponse.json({ message: 'Stats are computed from Firestore data', source: 'client-side' })
}

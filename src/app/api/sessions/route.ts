import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await db.pomodoroSession.create({
      data: {
        type: body.type || 'work',
        duration: body.duration || 25,
        completed: body.completed ?? true,
        taskId: body.taskId || null,
      },
    })

    if (body.completed && body.type === 'work') {
      const today = new Date().toISOString().split('T')[0]
      await db.dailyStats.upsert({
        where: { date: today },
        update: {
          pomodorosCompleted: { increment: 1 },
          focusMinutes: { increment: body.duration || 25 },
        },
        create: {
          date: today,
          pomodorosCompleted: 1,
          focusMinutes: body.duration || 25,
        },
      })
    }

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sessions = await db.pomodoroSession.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

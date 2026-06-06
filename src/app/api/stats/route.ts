import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [todayStats, totalTasks, completedTasks, totalSessions] = await Promise.all([
      db.dailyStats.findUnique({ where: { date: today } }),
      db.task.count(),
      db.task.count({ where: { completed: true } }),
      db.pomodoroSession.count({ where: { completed: true, type: 'work' } }),
    ])

    const last7Days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days.push(d.toISOString().split('T')[0])
    }

    const weeklyStats = await db.dailyStats.findMany({
      where: { date: { in: last7Days } },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      today: todayStats || { pomodorosCompleted: 0, focusMinutes: 0, tasksCompleted: 0, tasksCreated: 0 },
      totalTasks,
      completedTasks,
      totalSessions,
      weekly: weeklyStats,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

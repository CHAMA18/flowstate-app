import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tasks = await db.task.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const task = await db.task.create({
      data: {
        title: body.title,
        category: body.category || 'general',
        priority: body.priority || 'medium',
        pomodorosEstimated: body.pomodorosEstimated || 1,
      },
    })

    const today = new Date().toISOString().split('T')[0]
    await db.dailyStats.upsert({
      where: { date: today },
      update: { tasksCreated: { increment: 1 } },
      create: { date: today, tasksCreated: 1 },
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { ...data }
    if (data.completed === true) {
      updateData.completedAt = new Date()
      const today = new Date().toISOString().split('T')[0]
      await db.dailyStats.upsert({
        where: { date: today },
        update: { tasksCompleted: { increment: 1 } },
        create: { date: today, tasksCompleted: 1 },
      })
    } else if (data.completed === false) {
      updateData.completedAt = null
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }
    await db.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

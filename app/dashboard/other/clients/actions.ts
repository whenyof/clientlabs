"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

/* ==================== CLIENT ACTIONS ==================== */

// Update client info
export async function updateClientInfo(
    clientId: string,
    data: {
        name?: string
        email?: string
        phone?: string
        estimatedValue?: number
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) throw new Error("Client not found")

    await prisma.client.update({
        where: { id: clientId },
        data: {
            name: data.name?.trim() || client.name,
            email: data.email?.trim() || client.email,
            phone: data.phone?.trim() || client.phone,
            estimatedValue: data.estimatedValue ?? client.estimatedValue,
            updatedAt: new Date(),
        },
    })

    revalidatePath("/dashboard/other/clients")
    return { success: true }
}

// Update client status
export async function updateClientStatus(
    clientId: string,
    status: "ACTIVE" | "INACTIVE"
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) throw new Error("Client not found")

    await prisma.client.update({
        where: { id: clientId },
        data: {
            status,
            updatedAt: new Date(),
        },
    })

    revalidatePath("/dashboard/other/clients")
    return { success: true }
}

// Add note to client
export async function addClientNote(clientId: string, text: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) throw new Error("Client not found")

    await prisma.activity.create({
        data: {
            userId: session.user.id,
            clientId,
            type: "NOTE",
            title: "Nota añadida",
            description: text,
        },
    })

    await prisma.client.update({
        where: { id: clientId },
        data: { updatedAt: new Date() },
    })

    revalidatePath("/dashboard/other/clients")
    return { success: true }
}

// Register client interaction
export async function registerClientInteraction(
    clientId: string,
    type: "CALL" | "MEETING" | "EMAIL",
    notes: string
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) throw new Error("Client not found")

    const titles = {
        CALL: "Llamada realizada",
        MEETING: "Reunión realizada",
        EMAIL: "Email enviado",
    }

    await prisma.activity.create({
        data: {
            userId: session.user.id,
            clientId,
            type,
            title: titles[type],
            description: notes,
        },
    })

    await prisma.client.update({
        where: { id: clientId },
        data: { updatedAt: new Date() },
    })

    revalidatePath("/dashboard/other/clients")
    return { success: true }
}

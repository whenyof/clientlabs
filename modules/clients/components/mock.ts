"use client"

export type ClientStatus = "active" | "vip" | "risk" | "churn"

export interface ClientItem {
 id: string
 name: string
 company: string
 email: string
 phone: string
 status: ClientStatus
 mrr: number
 lastContact: string
 owner: string
 createdAt: string
}

export interface ClientTimelineItem {
 id: string
 title: string
 detail: string
 time: string
}

"use client"

import { useParams } from "next/navigation"
import AutomationForm from "../../components/AutomationForm"

export default function EditAutomationPage() {
    const params = useParams()
    const id = params.id as string
    return <AutomationForm ruleId={id} />
}

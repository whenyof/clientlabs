// Income module inside Finance: reuses existing Sales page implementation.
import SalesPage from "@/app/dashboard/sales/page"
import { FinanceHubTabs } from "../components/FinanceNavTabs"

export default function FinanceIncomePage(props: any) {
    return (
        <div className="space-y-8">
            <div>
                <FinanceHubTabs />
            </div>
            <div>
                <SalesPage {...props} />
            </div>
        </div>
    )
}


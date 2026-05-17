'use client'

import { ClientInsight } from "@/lib/api/clients";
import { AnalyticsIcon } from "@/components/icons/uil-analytics";

interface Props {
    insights: ClientInsight;
}

export default function InsightsWidget ({ insights }: Props) {
    const riskColor = {
        high: 'text-red-600 bg-red-100',
        medium: 'text-yellow-600 bg-yellow-100',
        low: 'text-green-600 bg-green-100',
    }[insights.riskLevel]

    return (
        <div className={'border rounded-lg p-4 bg-gray-50'}>
            <h3 className={'text-lg font-semibold mb-3'}><AnalyticsIcon />Financial Insights </h3>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <p className={'text-sm text-gray-500'}>Total Earned</p>
                    <p className={'text-xl font-bold'}>${insights.totalEarned.toLocaleString()}</p>
                </div>
                <div>
                    <p className={'text-sm text-gray-500'}>Unpaid Amount</p>
                    <p className={'text-xl font-bold'}>{insights.unpaidAmount.toLocaleString()}</p>
                </div>
                <div>
                    <p className={'text-sm text-gray-500'}>Avg Payment Delay</p>
                    <p className={'text-xl font-bold'}>{insights.avgPaymentDelayDays}days</p>
                </div>
                <div>
                    <p className={'text-sm text-gray-500'}>Risk Level</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${riskColor}`}>
                        {insights.riskLevel.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    )
}
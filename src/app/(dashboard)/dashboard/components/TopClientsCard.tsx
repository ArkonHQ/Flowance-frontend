import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface TopClient {
  name: string
  revenue: number
  percent: number
  color: string 
}

interface TopClientsCardProps {
  clients: TopClient[]
}

export function TopClientsCard({ clients }: TopClientsCardProps) {
  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between pt-5">
        <div>
          <CardTitle className="text-base font-bold">Top Clients by Revenue</CardTitle>
          <p className="text-xs text-muted-foreground">Key account performance</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 rounded-lg">
          This Week <ChevronDown className="h-2.5 w-2.5 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {clients.map((client, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{i + 1}. {client.name}</span>
              <div className="flex items-center gap-2">
                <span>${client.revenue.toLocaleString()}</span>
                <span className="text-muted-foreground text-[10px]">{client.percent}%</span>
              </div>
            </div>
            <Progress value={client.percent} className={`h-1.5`} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
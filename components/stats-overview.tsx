import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderOpen, CheckCircle } from "lucide-react"

interface StatsOverviewProps {
  totalClients: number
  activeProjects: number
  completedProjects: number
  totalAssets: number
}

export function StatsOverview({ totalClients, activeProjects, completedProjects }: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      description: "All registered clients",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      description: "Currently in progress",
      icon: FolderOpen,
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: completedProjects,
      description: "Successfully delivered",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

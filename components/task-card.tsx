import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, Calendar, FileText, ExternalLink, Users, Upload, UserCheck, Truck } from "lucide-react"
import type { Client } from "@/lib/types"

interface TaskCardProps {
  client: Client
}

export function TaskCard({ client }: TaskCardProps) {
  const getStageIcon = (stageId: number) => {
    switch (stageId) {
      case 1:
        return <Users className="h-4 w-4" />
      case 2:
        return <Upload className="h-4 w-4" />
      case 3:
        return <FileText className="h-4 w-4" />
      case 4:
        return <UserCheck className="h-4 w-4" />
      case 5:
        return <Truck className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStageColor = (stageId: number) => {
    switch (stageId) {
      case 1:
        return "bg-blue-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-purple-500"
      case 4:
        return "bg-green-500"
      case 5:
        return "bg-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  const progressPercentage = (client.stage.id / 5) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {client.company}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStageColor(client.stage.id)}`} />
          <span className="text-sm font-medium">{client.stage.name}</span>
          {getStageIcon(client.stage.id)}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{client.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{client.assets.length} assets</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{client.stage.description}</p>

          {client.assets.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Available Assets:</p>
              {client.assets.slice(0, 2).map((asset) => (
                <div key={asset.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span className="truncate">{asset.name}</span>
                </div>
              ))}
              {client.assets.length > 2 && (
                <p className="text-xs text-muted-foreground">+{client.assets.length - 2} more files</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {client.msaCompleted && (
            <Badge variant="secondary" className="text-xs">
              MSA Complete
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Assigned to you
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

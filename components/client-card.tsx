import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Calendar,
  User,
  FileText,
  MoreHorizontal,
  Users,
  Upload,
  UserCheck,
  Truck,
  Play,
  Pause,
  CheckCircle,
} from "lucide-react"
import type { Client } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ClientCardProps {
  client: Client
  showEmployeeProgress?: boolean
}

export function ClientCard({ client, showEmployeeProgress = false }: ClientCardProps) {
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

  const getEmployeeStageIcon = (stage: string) => {
    switch (stage) {
      case "asset-review":
        return <FileText className="h-4 w-4" />
      case "script":
        return <FileText className="h-4 w-4" />
      case "images":
        return <Upload className="h-4 w-4" />
      case "motion":
        return <Play className="h-4 w-4" />
      case "voice":
        return <Users className="h-4 w-4" />
      case "edit":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Pause className="h-4 w-4" />
    }
  }

  const getEmployeeStageColor = (stage: string) => {
    switch (stage) {
      case "asset-review":
        return "bg-blue-500"
      case "script":
        return "bg-purple-500"
      case "images":
        return "bg-yellow-500"
      case "motion":
        return "bg-green-500"
      case "voice":
        return "bg-orange-500"
      case "edit":
        return "bg-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  const progressPercentage = (client.stage.id / 5) * 100

  const employeeProgress = {
    currentStage: "script",
    stagesCompleted: ["asset-review"],
    totalStages: 6,
  }

  const employeeProgressPercentage = (employeeProgress.stagesCompleted.length / employeeProgress.totalStages) * 100

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Client</DropdownMenuItem>
              <DropdownMenuItem>Assign Employee</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showEmployeeProgress && client.assignedEmployees && client.assignedEmployees.length > 0 ? (
          <>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getEmployeeStageColor(employeeProgress.currentStage)}`} />
              <span className="text-sm font-medium">
                Employee: {employeeProgress.currentStage.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              {getEmployeeStageIcon(employeeProgress.currentStage)}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Video Production Progress</span>
                <span className="font-medium">{Math.round(employeeProgressPercentage)}%</span>
              </div>
              <Progress value={employeeProgressPercentage} className="h-2" />
            </div>

            <div className="text-xs text-muted-foreground">
              Stages: Asset Review → Script → Images → Motion → Voice → Edit
            </div>
          </>
        ) : (
          <>
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
          </>
        )}

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

        {client.assignedEmployees && client.assignedEmployees.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Assigned to {client.assignedEmployees.length} employee{client.assignedEmployees.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {client.msaCompleted && (
            <Badge variant="secondary" className="text-xs">
              MSA Complete
            </Badge>
          )}
          {client.projectCompleted && (
            <Badge variant="default" className="text-xs">
              Delivered
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

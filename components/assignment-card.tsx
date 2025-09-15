import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Calendar,
  User,
  MessageSquare,
  ExternalLink,
  Users,
  Upload,
  FileText,
  UserCheck,
  Truck,
} from "lucide-react"
import type { Client } from "@/lib/types"
import { mockEmployees } from "@/lib/mock-data"

interface AssignmentCardProps {
  client: Client
}

export function AssignmentCard({ client }: AssignmentCardProps) {
  const assignedEmployees = mockEmployees.filter((emp) => client.assignedEmployees && client.assignedEmployees.includes(emp.id))
  const progressPercentage = (client.stage.id / 5) * 100

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
        {/* Assigned Employee */}
        {assignedEmployees.length > 0 && (
          <div className="space-y-2">
            {assignedEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Stage */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStageColor(client.stage.id)}`} />
          <span className="text-sm font-medium">{client.stage.name}</span>
          {getStageIcon(client.stage.id)}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Details */}
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

        {/* Status Badges */}
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

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
            <MessageSquare className="h-3 w-3 mr-1" />
            Message
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
            <User className="h-3 w-3 mr-1" />
            Reassign
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

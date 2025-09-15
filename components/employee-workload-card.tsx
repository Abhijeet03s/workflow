import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import type { Employee } from "@/lib/types"
import { mockClients } from "@/lib/mock-data"

interface EmployeeWorkloadCardProps {
  employee: Employee
}

export function EmployeeWorkloadCard({ employee }: EmployeeWorkloadCardProps) {
  const assignedClients = mockClients.filter((client) => client.assignedEmployees && client.assignedEmployees.includes(employee.id))
  const activeProjects = assignedClients.filter((client) => !client.projectCompleted)
  const completedProjects = assignedClients.filter((client) => client.projectCompleted)

  // Calculate workload percentage (assuming max 5 clients per employee)
  const maxCapacity = 5
  const workloadPercentage = (assignedClients.length / maxCapacity) * 100

  const getWorkloadStatus = () => {
    if (workloadPercentage >= 80) return { status: "high", color: "text-red-600", icon: AlertTriangle }
    if (workloadPercentage >= 60) return { status: "medium", color: "text-yellow-600", icon: Clock }
    return { status: "low", color: "text-green-600", icon: CheckCircle }
  }

  const workloadStatus = getWorkloadStatus()
  const StatusIcon = workloadStatus.icon

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{employee.name}</CardTitle>
              <CardDescription>{employee.role}</CardDescription>
            </div>
          </div>
          <StatusIcon className={`h-5 w-5 ${workloadStatus.color}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workload Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Workload</span>
            <span className="font-medium">
              {assignedClients.length}/{maxCapacity}
            </span>
          </div>
          <Progress value={workloadPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground capitalize">{workloadStatus.status} capacity</p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Active</span>
            </div>
            <p className="font-medium">{activeProjects.length} projects</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <p className="font-medium">{completedProjects.length} projects</p>
          </div>
        </div>

        {/* Recent Assignments */}
        {assignedClients.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recent Assignments</p>
            <div className="space-y-1">
              {assignedClients.slice(0, 2).map((client) => (
                <div key={client.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{client.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Stage {client.stage.id}
                  </Badge>
                </div>
              ))}
              {assignedClients.length > 2 && (
                <p className="text-xs text-muted-foreground">+{assignedClients.length - 2} more</p>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{employee.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

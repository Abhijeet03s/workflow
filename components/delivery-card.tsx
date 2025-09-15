"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Calendar, FileText, Download, Send, CheckCircle, Clock, Package, ExternalLink } from "lucide-react"
import type { Client } from "@/lib/types"

interface DeliveryCardProps {
  client: Client
  status: "ready" | "delivered" | "progress"
}

export function DeliveryCard({ client, status }: DeliveryCardProps) {
  const progressPercentage = (client.stage.id / 5) * 100

  const getStatusConfig = () => {
    switch (status) {
      case "ready":
        return {
          icon: Package,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          badge: "Ready for Delivery",
          badgeVariant: "default" as const,
        }
      case "delivered":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          badge: "Delivered",
          badgeVariant: "default" as const,
        }
      case "progress":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          badge: `Stage ${client.stage.id}`,
          badgeVariant: "secondary" as const,
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const handleDelivery = () => {
    console.log(`Delivering project for client ${client.id}`)
  }

  const handleDownload = () => {
    console.log(`Downloading deliverables for client ${client.id}`)
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              {client.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {client.company}
            </CardDescription>
          </div>
          <Badge variant={statusConfig.badgeVariant} className="text-xs">
            {statusConfig.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Project Details */}
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

        {/* Current Stage */}
        <div className="text-sm">
          <span className="text-muted-foreground">Current Stage: </span>
          <span className="font-medium">{client.stage.name}</span>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2">
          {client.msaCompleted && (
            <Badge variant="secondary" className="text-xs">
              MSA Complete
            </Badge>
          )}
          {client.assignedEmployees && client.assignedEmployees.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {client.assignedEmployees.length} Assigned
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {status === "ready" && (
            <>
              <Button size="sm" onClick={handleDelivery} className="flex-1 text-xs">
                <Send className="h-3 w-3 mr-1" />
                Deliver
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 text-xs bg-transparent">
                <Download className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </>
          )}
          {status === "delivered" && (
            <>
              <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 text-xs bg-transparent">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
            </>
          )}
          {status === "progress" && (
            <>
              <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                <Clock className="h-3 w-3 mr-1" />
                Track
              </Button>
            </>
          )}
        </div>

        {/* Delivery Information for delivered projects */}
        {status === "delivered" && (
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p>Delivered: {client.createdAt.toLocaleDateString()}</p>
            <p>Method: Email with download links</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

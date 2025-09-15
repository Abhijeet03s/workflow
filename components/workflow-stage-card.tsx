"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, FileText, ArrowRight, User } from "lucide-react"
import type { Client } from "@/lib/types"

interface WorkflowStageCardProps {
  client: Client
}

export function WorkflowStageCard({ client }: WorkflowStageCardProps) {
  const handleAdvanceStage = () => {
    console.log(`Advancing client ${client.id} to next stage`)
    // Mock stage advancement
  }

  const handleViewDetails = () => {
    console.log(`Viewing details for client ${client.id}`)
    // Navigate to client details
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{client.name}</CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {client.company}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{client.createdAt.toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{client.assets.length} assets</span>
        </div>

        {client.assignedEmployee && (
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned</span>
          </div>
        )}

        <div className="flex gap-1">
          {client.msaCompleted && (
            <Badge variant="secondary" className="text-xs">
              MSA
            </Badge>
          )}
          {client.projectCompleted && (
            <Badge variant="default" className="text-xs">
              Done
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={handleViewDetails} className="flex-1 text-xs bg-transparent">
            View
          </Button>
          {client.stage.id < 5 && (
            <Button size="sm" onClick={handleAdvanceStage} className="flex-1 text-xs">
              <ArrowRight className="h-3 w-3 mr-1" />
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

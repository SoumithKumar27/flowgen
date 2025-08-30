"use client"

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Users, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Key,
  Lock
} from "lucide-react"
import { FlowNodeData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AuthNodeProps extends NodeProps {
  data: FlowNodeData
  selected: boolean
}

export function AuthNode({ data, selected }: AuthNodeProps) {
  const getStatusIcon = () => {
    if (data.isGenerating) {
      return <Loader2 className="w-4 h-4 animate-spin text-green-500" />
    }
    if (data.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (data.generatedCode) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Shield className="w-4 h-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (data.isGenerating) return "Configuring..."
    if (data.error) return "Error"
    if (data.generatedCode) return "Configured"
    return "Ready"
  }

  const getStatusColor = () => {
    if (data.isGenerating) return "text-green-500"
    if (data.error) return "text-red-500"
    if (data.generatedCode) return "text-green-500"
    return "text-muted-foreground"
  }

  return (
    <div className={cn("flow-node", selected && "flow-node-selected")}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !border-green-600"
      />
      
      <Card className="w-64 border-0 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{data.label}</h3>
                <Badge variant="outline" className="text-xs">Auth</Badge>
              </div>
            </div>
            {getStatusIcon()}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            {data.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {data.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center space-x-1 text-xs", getStatusColor())}>
                <span>{getStatusText()}</span>
              </div>
              
              {data.generatedCode && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Supabase Auth</span>
                </div>
              )}
            </div>
            
            {data.error && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                {data.error}
              </div>
            )}

            {data.generatedCode && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 p-2 rounded">
                  <Lock className="w-3 h-3" />
                  <span>Authentication configured</span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center space-x-1">
                    <Key className="w-3 h-3" />
                    <span>Sign-up/Login ready</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Session management</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-600"
      />
    </div>
  )
}

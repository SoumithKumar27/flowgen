"use client"

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Eye, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Code
} from "lucide-react"
import { FlowNodeData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PageNodeProps extends NodeProps {
  data: FlowNodeData
  selected?: boolean
}

export function PageNode({ data, selected }: PageNodeProps) {
  const getStatusIcon = () => {
    if (data.isGenerating) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    }
    if (data.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (data.generatedCode) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <FileText className="w-4 h-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (data.isGenerating) return "Generating..."
    if (data.error) return "Error"
    if (data.generatedCode) return "Generated"
    return "Ready"
  }

  const getStatusColor = () => {
    if (data.isGenerating) return "text-blue-500"
    if (data.error) return "text-red-500"
    if (data.generatedCode) return "text-green-500"
    return "text-muted-foreground"
  }

  return (
    <div className={cn("flow-node", selected && "flow-node-selected")}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-blue-600"
      />
      
      <Card className="w-64 border-0 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{data.label}</h3>
                <Badge variant="outline" className="text-xs">Page</Badge>
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
                  <Eye className="w-3 h-3" />
                  <span>Preview ready</span>
                </div>
              )}
            </div>
            
            {data.error && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                {data.error}
              </div>
            )}

            {data.generatedCode && (
              <div className="flex items-center space-x-1 text-xs bg-green-50 text-green-700 p-2 rounded">
                <Code className="w-3 h-3" />
                <span>Component ready for deployment</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-blue-600"
      />
    </div>
  )
}

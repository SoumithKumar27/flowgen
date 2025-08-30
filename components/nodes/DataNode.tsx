"use client"

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Table, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Columns,
  Key
} from "lucide-react"
import { FlowNodeData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DataNodeProps extends NodeProps {
  data: FlowNodeData
  selected?: boolean
}

export function DataNode({ data, selected }: DataNodeProps) {
  const getStatusIcon = () => {
    if (data.isGenerating) {
      return <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
    }
    if (data.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (data.schema) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Database className="w-4 h-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (data.isGenerating) return "Generating..."
    if (data.error) return "Error"
    if (data.schema) return "Schema ready"
    return "Ready"
  }

  const getStatusColor = () => {
    if (data.isGenerating) return "text-amber-500"
    if (data.error) return "text-red-500"
    if (data.schema) return "text-green-500"
    return "text-muted-foreground"
  }

  return (
    <div className={cn("flow-node", selected && "flow-node-selected")}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !border-amber-600"
      />
      
      <Card className="w-64 border-0 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{data.label}</h3>
                <Badge variant="outline" className="text-xs">Data</Badge>
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
              
              {data.schema && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Table className="w-3 h-3" />
                  <span>{data.schema.tableName}</span>
                </div>
              )}
            </div>
            
            {data.error && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                {data.error}
              </div>
            )}

            {/* Schema Visualization */}
            {data.schema && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1 text-xs bg-amber-50 text-amber-700 p-2 rounded">
                  <Columns className="w-3 h-3" />
                  <span>Schema generated</span>
                </div>
                
                <div className="bg-muted/50 rounded p-2 space-y-1">
                  <div className="font-medium text-xs text-amber-700">
                    {data.schema.tableName}
                  </div>
                  <div className="space-y-0.5">
                    {data.schema.fields.slice(0, 3).map((field, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          {field.primary && <Key className="w-2 h-2 text-amber-600" />}
                          <span className="text-muted-foreground">
                            {field.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs py-0 px-1 h-4">
                          {field.type}
                        </Badge>
                      </div>
                    ))}
                    {data.schema.fields.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{data.schema.fields.length - 3} more fields
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!data.schema && !data.isGenerating && !data.error && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Add a description and generate to create your database schema
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-500 !border-amber-600"
      />
    </div>
  )
}

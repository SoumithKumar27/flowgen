"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Shield, 
  Database, 
  Trash2, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useFlowStore, useSelectedNode } from "@/hooks/useFlowStore"
import { NodeType } from "@/lib/types"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/useToast"

export function SidePanel() {
  const { addNode, updateNode, deleteNode } = useFlowStore()
  const selectedNode = useSelectedNode()
  const [localDescription, setLocalDescription] = useState("")
  const [localLabel, setLocalLabel] = useState("")

  // Update local state when node selection changes
  useEffect(() => {
    if (selectedNode) {
      setLocalDescription(selectedNode.data.description || "")
      setLocalLabel(selectedNode.data.label || "")
    } else {
      setLocalDescription("")
      setLocalLabel("")
    }
  }, [selectedNode])

  const handleAddNode = (type: NodeType) => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    }
    addNode(type, position)
  }

  const handleUpdateNode = () => {
    if (!selectedNode) return
    
    updateNode(selectedNode.id, {
      label: localLabel,
      description: localDescription,
    })
    
    toast({
      title: "Node Updated",
      description: "Node details have been saved successfully.",
    })
  }

  const handleGenerateNode = async () => {
    if (!selectedNode) return
    
    try {
      updateNode(selectedNode.id, { isGenerating: true, error: undefined })
      
      if (selectedNode.data.type === 'page') {
        // Generate UI component
        const response = await fetch('/api/generate-ui', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: localDescription,
            type: 'component',
          }),
        })
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        updateNode(selectedNode.id, {
          generatedCode: result.code,
          prompt: localDescription,
          isGenerating: false,
        })
        
        toast({
          title: "Component Generated",
          description: "UI component has been generated successfully!",
        })
      } else if (selectedNode.data.type === 'data') {
        // Generate database schema
        const response = await fetch('/api/create-schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: localDescription,
          }),
        })
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        updateNode(selectedNode.id, {
          schema: result.schema,
          prompt: localDescription,
          isGenerating: false,
        })
        
        toast({
          title: "Schema Generated",
          description: "Database schema has been created successfully!",
        })
      } else if (selectedNode.data.type === 'auth') {
        // Auth nodes use Supabase built-in auth
        updateNode(selectedNode.id, {
          generatedCode: "// Supabase Auth integration will be handled automatically",
          prompt: localDescription,
          isGenerating: false,
        })
        
        toast({
          title: "Auth Configured",
          description: "Authentication flow has been configured with Supabase.",
        })
      }
    } catch (error) {
      updateNode(selectedNode.id, {
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      })
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'An error occurred during generation.',
        variant: "destructive",
      })
    }
  }

  const handleDeleteNode = () => {
    if (!selectedNode) return
    
    deleteNode(selectedNode.id)
    toast({
      title: "Node Deleted",
      description: "Node has been removed from the canvas.",
    })
  }

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'page':
        return <FileText className="w-4 h-4" />
      case 'auth':
        return <Shield className="w-4 h-4" />
      case 'data':
        return <Database className="w-4 h-4" />
    }
  }

  const getNodeDescription = (type: NodeType) => {
    switch (type) {
      case 'page':
        return "Create a web page with AI-generated UI components"
      case 'auth':
        return "Add user authentication and sign-up flow"
      case 'data':
        return "Define database tables and schema"
    }
  }

  const getGenerationStatus = () => {
    if (!selectedNode) return null
    
    if (selectedNode.data.isGenerating) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating...</span>
        </div>
      )
    }
    
    if (selectedNode.data.error) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Error: {selectedNode.data.error}</span>
        </div>
      )
    }
    
    if (selectedNode.data.generatedCode || selectedNode.data.schema) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Generated successfully</span>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="w-80 border-l bg-background p-4 space-y-4 overflow-y-auto">
      {/* Add Node Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Components</CardTitle>
          <CardDescription>
            Drag and drop nodes to build your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(['page', 'auth', 'data'] as NodeType[]).map((type) => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddNode(type)}
            >
              {getNodeIcon(type)}
              <span className="ml-2 capitalize">{type}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Node Details Section */}
      {selectedNode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getNodeIcon(selectedNode.data.type)}
              <span>Node Details</span>
              <Badge variant="secondary">{selectedNode.data.type}</Badge>
            </CardTitle>
            <CardDescription>
              {getNodeDescription(selectedNode.data.type)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Label</label>
              <Input
                value={localLabel}
                onChange={(e) => setLocalLabel(e.target.value)}
                placeholder="Enter node label..."
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder={`Describe what this ${selectedNode.data.type} should do...`}
                rows={4}
              />
            </div>

            {getGenerationStatus()}

            <div className="flex space-x-2">
              <Button
                onClick={handleUpdateNode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Save
              </Button>
              <Button
                onClick={handleGenerateNode}
                disabled={!localDescription || selectedNode.data.isGenerating}
                size="sm"
                className="flex-1"
              >
                {selectedNode.data.isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
            
            <Button
              onClick={handleDeleteNode}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>

            {/* Display generated schema for data nodes */}
            {selectedNode.data.type === 'data' && selectedNode.data.schema && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Generated Schema</h4>
                <div className="text-sm space-y-1">
                  <div className="font-medium">{selectedNode.data.schema.tableName}</div>
                  {selectedNode.data.schema.fields.map((field, index) => (
                    <div key={index} className="ml-2 text-muted-foreground">
                      {field.name}: {field.type} {field.nullable ? '(nullable)' : '(required)'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a node to view and edit its details</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Eye, 
  Code, 
  Monitor, 
  Smartphone, 
  Tablet,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { useSelectedNode } from "@/hooks/useFlowStore"
import { useState } from "react"

export function PreviewPanel() {
  const selectedNode = useSelectedNode()
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [refreshKey, setRefreshKey] = useState(0)

  const hasGeneratedContent = selectedNode?.data.generatedCode || selectedNode?.data.schema

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const getPreviewContent = () => {
    if (!selectedNode) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
            <p className="text-sm">Select a node and generate content to see a preview</p>
          </div>
        </div>
      )
    }

    if (!hasGeneratedContent) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Generate Content First</h3>
            <p className="text-sm">Click &quot;Generate&quot; in the side panel to create content for this node</p>
          </div>
        </div>
      )
    }

    return (
      <Tabs defaultValue="preview" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="flex-1 mt-4">
          <div className="h-full space-y-4">
            {/* Viewport Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Preview Container */}
            <div className="flex-1 border rounded-lg overflow-hidden bg-white">
              <div 
                className={`mx-auto transition-all duration-300 ${
                  viewMode === 'mobile' 
                    ? 'w-80 h-[600px]' 
                    : viewMode === 'tablet' 
                    ? 'w-[768px] h-[600px]' 
                    : 'w-full h-full'
                }`}
              >
                {selectedNode.data.type === 'page' && selectedNode.data.generatedCode ? (
                  <iframe
                    key={refreshKey}
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1">
                          <script src="https://cdn.tailwindcss.com"></script>
                          <title>Preview</title>
                        </head>
                        <body class="bg-gray-50 p-4">
                          ${selectedNode.data.generatedCode}
                        </body>
                      </html>
                    `}
                    className="w-full h-full border-0"
                    title="Component Preview"
                  />
                ) : selectedNode.data.type === 'data' && selectedNode.data.schema ? (
                  <div className="p-6 h-full">
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-lg font-semibold mb-4">Database Schema Preview</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-primary">Table: {selectedNode.data.schema.tableName}</h4>
                        </div>
                        <div className="space-y-2">
                          {selectedNode.data.schema.fields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{field.name}</span>
                                <Badge variant="outline">{field.type}</Badge>
                                {field.primary && <Badge variant="default">Primary</Badge>}
                                {!field.nullable && <Badge variant="secondary">Required</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedNode.data.schema.sql && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Generated SQL</h5>
                            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                              {selectedNode.data.schema.sql}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedNode.data.type === 'auth' ? (
                  <div className="p-6 h-full">
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="text-lg font-semibold mb-4">Authentication Preview</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Supabase Auth Integration</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• User sign-up and login</li>
                            <li>• Email verification</li>
                            <li>• Password reset</li>
                            <li>• Session management</li>
                            <li>• Social login providers (optional)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-sm">No content to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 mt-4">
          <ScrollArea className="h-full">
            {selectedNode?.data.generatedCode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Generated Code</h3>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Editor
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {selectedNode.data.generatedCode}
                </pre>
              </div>
            ) : selectedNode?.data.schema?.sql ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Generated SQL</h3>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {selectedNode.data.schema.sql}
                </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No code generated yet</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Preview</span>
          {selectedNode && (
            <Badge variant="outline">{selectedNode.data.type}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {selectedNode 
            ? `Preview for ${selectedNode.data.label}`
            : "Select a node to see its preview"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {getPreviewContent()}
      </CardContent>
    </Card>
  )
}

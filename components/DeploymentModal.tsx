"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Rocket, 
  Github, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Copy
} from "lucide-react"
import { useFlowStore, useFlowNodes } from "@/hooks/useFlowStore"
import { DeploymentResult } from "@/lib/types"
import { toast } from "@/hooks/useToast"
import { sanitizeFileName } from "@/lib/utils"

interface DeploymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeploymentModal({ open, onOpenChange }: DeploymentModalProps) {
  const { setDeploymentStatus } = useFlowStore()
  const nodes = useFlowNodes()
  
  const [projectName, setProjectName] = useState("my-flowgen-app")
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null)
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
  const [isDeploying, setIsDeploying] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setDeploymentResult(null)
      setDeploymentLogs([])
      setIsDeploying(false)
    }
  }, [open])

  const pageNodes = nodes.filter(node => 
    node.data.type === 'page' && node.data.generatedCode
  )
  
  const dataNodes = nodes.filter(node => 
    node.data.type === 'data' && node.data.schema
  )
  
  const authNodes = nodes.filter(node => 
    node.data.type === 'auth'
  )

  const canDeploy = pageNodes.length > 0 && !isDeploying

  const addLog = (message: string) => {
    setDeploymentLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleDeploy = async () => {
    if (!canDeploy) return

    setIsDeploying(true)
    setDeploymentStatus('deploying')
    setDeploymentLogs([])
    
    addLog("Starting deployment process...")

    try {
      addLog("Validating project configuration...")
      
      const sanitizedProjectName = sanitizeFileName(projectName)
      if (sanitizedProjectName !== projectName) {
        setProjectName(sanitizedProjectName)
        addLog(`Project name sanitized to: ${sanitizedProjectName}`)
      }

      addLog("Preparing deployment package...")

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes,
          projectName: sanitizedProjectName,
        }),
      })

      if (!response.ok) {
        throw new Error(`Deployment failed: ${response.statusText}`)
      }

      const result: DeploymentResult = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.logs) {
        result.logs.forEach(log => addLog(log))
      }

      setDeploymentResult(result)
      setDeploymentStatus('success')
      
      addLog("Deployment completed successfully!")

      toast({
        title: "Deployment Successful!",
        description: "Your application has been deployed and is live.",
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed'
      addLog(`Error: ${errorMessage}`)
      
      setDeploymentResult({
        success: false,
        error: errorMessage,
      })
      
      setDeploymentStatus('error')

      toast({
        title: "Deployment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "URL copied to clipboard.",
      })
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Rocket className="w-5 h-5" />
            <span>Deploy Your Application</span>
          </DialogTitle>
          <DialogDescription>
            Deploy your FlowGen application to production with GitHub and Vercel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Project Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pageNodes.length}</div>
                <div className="text-sm text-muted-foreground">Pages</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{dataNodes.length}</div>
                <div className="text-sm text-muted-foreground">Tables</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{authNodes.length}</div>
                <div className="text-sm text-muted-foreground">Auth</div>
              </div>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-app"
              disabled={isDeploying}
            />
            <p className="text-xs text-muted-foreground">
              This will be used for your GitHub repository and Vercel project
            </p>
          </div>

          {/* Deployment Status */}
          {(isDeploying || deploymentResult) && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {isDeploying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="font-medium">Deploying...</span>
                  </>
                ) : deploymentResult?.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Deployment Successful!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Deployment Failed</span>
                  </>
                )}
              </div>

              {/* Deployment Results */}
              {deploymentResult?.success && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Live URL:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={deploymentResult.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {deploymentResult.url}
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(deploymentResult.url!)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={deploymentResult.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  {deploymentResult.repoUrl && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Github className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">Repository:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={deploymentResult.repoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View on GitHub
                        </a>
                        <Button variant="outline" size="sm" asChild>
                          <a href={deploymentResult.repoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deployment Logs */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Deployment Logs</h4>
                <ScrollArea className="h-32 border rounded-lg p-3 bg-muted/50">
                  <div className="space-y-1">
                    {deploymentLogs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!deploymentResult?.success && (
            <Button
              onClick={handleDeploy}
              disabled={!canDeploy}
              className="flex items-center space-x-2"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Deploy Now</span>
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            {deploymentResult?.success ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

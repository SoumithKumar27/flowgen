"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Github, Zap } from "lucide-react"
import { useDeploymentStatus, useFlowNodes } from "@/hooks/useFlowStore"

interface HeaderProps {
  onDeploy: () => void
}

export function Header({ onDeploy }: HeaderProps) {
  const deploymentStatus = useDeploymentStatus()
  const nodes = useFlowNodes()
  
  const hasPageNodes = nodes.some(node => node.data.type === 'page' && node.data.generatedCode)
  const canDeploy = hasPageNodes && deploymentStatus !== 'deploying'
  
  const getDeployButtonText = () => {
    switch (deploymentStatus) {
      case 'deploying':
        return 'Deploying...'
      case 'success':
        return 'Deploy Again'
      case 'error':
        return 'Retry Deployment'
      default:
        return 'Generate & Deploy'
    }
  }

  const getDeployButtonIcon = () => {
    switch (deploymentStatus) {
      case 'deploying':
        return <Zap className="w-4 h-4 animate-pulse" />
      case 'success':
        return <Rocket className="w-4 h-4" />
      case 'error':
        return <Rocket className="w-4 h-4" />
      default:
        return <Rocket className="w-4 h-4" />
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FlowGen</h1>
              <Badge variant="secondary" className="text-xs">v2.0</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Visual App Builder</span>
            <Badge variant="outline">AI-Powered</Badge>
          </div>
          
          <Button
            onClick={onDeploy}
            disabled={!canDeploy}
            variant={deploymentStatus === 'success' ? 'secondary' : 'default'}
            className="flex items-center space-x-2"
          >
            {getDeployButtonIcon()}
            <span>{getDeployButtonText()}</span>
          </Button>
          
          <Button variant="outline" size="icon" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

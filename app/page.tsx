"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { FlowCanvas } from "@/components/FlowCanvas"
import { SidePanel } from "@/components/SidePanel"
import { AiChatAssistant } from "@/components/AiChatAssistant"
import { PreviewPanel } from "@/components/PreviewPanel"
import { DeploymentModal } from "@/components/DeploymentModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Palette, 
  MessageSquare, 
  Eye,
  Layers,
  Globe
} from "lucide-react"

export default function HomePage() {
  const [showDeploymentModal, setShowDeploymentModal] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState("preview")

  const handleDeploy = () => {
    setShowDeploymentModal(true)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Header onDeploy={handleDeploy} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Node Controls */}
        <div className="w-80 border-r bg-background">
          <SidePanel />
        </div>
        
        {/* Center Panel - Flow Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-muted/30 px-4 py-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Visual Canvas</span>
            </div>
          </div>
          <div className="flex-1">
            <FlowCanvas />
          </div>
        </div>
        
        {/* Right Panel - Preview & Chat */}
        <div className="w-96 border-l bg-background flex flex-col">
          <Tabs 
            value={rightPanelTab} 
            onValueChange={setRightPanelTab}
            className="flex-1 flex flex-col"
          >
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Chat</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="preview" className="flex-1 p-4 mt-0">
              <PreviewPanel />
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 p-4 mt-0">
              <AiChatAssistant />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Deployment Modal */}
      <DeploymentModal 
        open={showDeploymentModal}
        onOpenChange={setShowDeploymentModal}
      />

      {/* Welcome Message for First-time Users */}
      <WelcomeOverlay />
    </div>
  )
}

function WelcomeOverlay() {
  const [showWelcome, setShowWelcome] = useState(true)

  if (!showWelcome) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Palette className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to FlowGen v2.0</h1>
            <p className="text-muted-foreground text-lg">
              Build full-stack web applications visually with AI-powered code generation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold">1. Design Visually</h3>
            <p className="text-sm text-muted-foreground">
              Add Page, Auth, and Data nodes to your canvas
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold">2. Generate with AI</h3>
            <p className="text-sm text-muted-foreground">
              Describe your components and let AI generate the code
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold">3. Deploy Instantly</h3>
            <p className="text-sm text-muted-foreground">
              One-click deployment to GitHub and Vercel
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-left space-y-2">
            <h4 className="font-semibold">Quick Start:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click &quot;Page&quot; in the left panel to add a page component</li>
              <li>Describe what you want (e.g., &quot;A landing page for a SaaS product&quot;)</li>
              <li>Click &quot;Generate&quot; to create the component with AI</li>
              <li>Use the AI Chat to refine your design</li>
              <li>Click &quot;Generate &amp; Deploy&quot; when ready to go live</li>
            </ol>
          </div>
          
          <Button 
            onClick={() => setShowWelcome(false)}
            className="w-full"
            size="lg"
          >
            Get Started Building
          </Button>
        </div>
      </Card>
    </div>
  )
}

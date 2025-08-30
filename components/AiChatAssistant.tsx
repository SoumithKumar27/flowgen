"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  MessageSquare,
  Trash2,
  Sparkles
} from "lucide-react"
import { useFlowStore, useSelectedNode, useChatMessages } from "@/hooks/useFlowStore"
import { toast } from "@/hooks/useToast"

export function AiChatAssistant() {
  const {
    addChatMessage,
    clearChat,
    updateNode,
  } = useFlowStore()
  
  const selectedNode = useSelectedNode()
  const chatMessages = useChatMessages()
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedNode) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    
    // Add user message to chat
    addChatMessage({
      role: 'user',
      content: userMessage,
    })

    setIsProcessing(true)

    try {
      // Call the refine-prompt API to update the component based on chat input
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: selectedNode.id,
          originalPrompt: selectedNode.data.prompt || selectedNode.data.description,
          refinementRequest: userMessage,
          nodeType: selectedNode.data.type,
        }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Add assistant response to chat
      addChatMessage({
        role: 'assistant',
        content: result.response || "I've updated the component based on your request.",
      })

      // Update the node with the refined prompt and regenerated code
      if (result.updatedCode || result.updatedSchema) {
        updateNode(selectedNode.id, {
          prompt: result.updatedPrompt,
          generatedCode: result.updatedCode,
          schema: result.updatedSchema,
        })

        toast({
          title: "Component Updated",
          description: "Your component has been refined based on your request!",
        })
      }

    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })

      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span>AI Assistant</span>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            GPT-4o
          </Badge>
        </CardTitle>
        <CardDescription>
          {selectedNode 
            ? `Chat about your ${selectedNode.data.type} component`
            : "Select a node to start chatting about it"
          }
        </CardDescription>
        {chatMessages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="w-fit"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {selectedNode 
                    ? "Start a conversation to refine your component with AI assistance"
                    : "Select a node first, then ask me to make changes like 'Make the button green' or 'Add a loading state'"
                  }
                </p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex space-x-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="flex space-x-3 justify-start">
                <div className="flex space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedNode
                  ? "Ask me to refine your component..."
                  : "Select a node first to start chatting"
              }
              disabled={!selectedNode || isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !selectedNode || isProcessing}
              size="icon"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {selectedNode && (
            <p className="text-xs text-muted-foreground mt-2">
              Currently editing: <span className="font-medium">{selectedNode.data.label}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

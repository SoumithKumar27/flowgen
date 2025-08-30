"use client"

import { create } from 'zustand'
import { FlowNode, FlowEdge, FlowState, ChatMessage, NodeType } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface FlowActions {
  // Node management
  addNode: (type: NodeType, position: { x: number; y: number }) => void
  updateNode: (nodeId: string, updates: Partial<FlowNode['data']>) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  
  // Edge management
  addEdge: (edge: FlowEdge) => void
  deleteEdge: (edgeId: string) => void
  
  // Generation status
  setGenerating: (isGenerating: boolean) => void
  
  // Deployment status
  setDeploymentStatus: (status: FlowState['deploymentStatus']) => void
  
  // Chat management
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChat: () => void
  
  // Flow management
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  
  // Reset
  reset: () => void
}

const initialState: FlowState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isGenerating: false,
  deploymentStatus: 'idle',
  chatMessages: [],
}

export const useFlowStore = create<FlowState & FlowActions>((set, get) => ({
  ...initialState,
  
  addNode: (type: NodeType, position: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: generateId(),
      type: 'custom',
      position,
      data: {
        id: generateId(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        description: '',
      },
    }
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    }))
  },
  
  updateNode: (nodeId: string, updates: Partial<FlowNode['data']>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      ),
    }))
  },
  
  deleteNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }))
  },
  
  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId })
  },
  
  addEdge: (edge: FlowEdge) => {
    set((state) => ({
      edges: [...state.edges, { ...edge, id: generateId() }],
    }))
  },
  
  deleteEdge: (edgeId: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    }))
  },
  
  setGenerating: (isGenerating: boolean) => {
    set({ isGenerating })
  },
  
  setDeploymentStatus: (deploymentStatus: FlowState['deploymentStatus']) => {
    set({ deploymentStatus })
  },
  
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    }
    
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
    }))
  },
  
  clearChat: () => {
    set({ chatMessages: [] })
  },
  
  setNodes: (nodes: FlowNode[]) => {
    set({ nodes })
  },
  
  setEdges: (edges: FlowEdge[]) => {
    set({ edges })
  },
  
  reset: () => {
    set(initialState)
  },
}))

// Selector hooks for better performance
export const useFlowNodes = () => useFlowStore((state) => state.nodes)
export const useFlowEdges = () => useFlowStore((state) => state.edges)
export const useSelectedNode = () => {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId)
  const nodes = useFlowStore((state) => state.nodes)
  return nodes.find((node) => node.id === selectedNodeId) || null
}
export const useIsGenerating = () => useFlowStore((state) => state.isGenerating)
export const useDeploymentStatus = () => useFlowStore((state) => state.deploymentStatus)
export const useChatMessages = () => useFlowStore((state) => state.chatMessages)

import { Node, Edge } from 'reactflow'

export type NodeType = 'page' | 'auth' | 'data'

export interface FlowNodeData {
  id: string
  type: NodeType
  label: string
  description: string
  prompt?: string
  generatedCode?: string
  schema?: DatabaseSchema
  isGenerating?: boolean
  error?: string
}

export interface FlowNode extends Node {
  data: FlowNodeData
}

export type FlowEdge = Edge

export interface DatabaseField {
  name: string
  type: string
  nullable: boolean
  primary?: boolean
  references?: string
}

export interface DatabaseSchema {
  tableName: string
  fields: DatabaseField[]
  sql?: string
}

export interface GeneratedComponent {
  code: string
  preview: string
  error?: string
}

export interface DeploymentResult {
  success: boolean
  url?: string
  repoUrl?: string
  error?: string
  logs?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface FlowState {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNodeId: string | null
  isGenerating: boolean
  deploymentStatus: 'idle' | 'deploying' | 'success' | 'error'
  chatMessages: ChatMessage[]
}

export interface V0GenerationRequest {
  prompt: string
  type?: 'component' | 'page'
}

export interface V0GenerationResponse {
  code: string
  preview?: string
  error?: string
}

export interface OpenAISchemaRequest {
  description: string
}

export interface OpenAISchemaResponse {
  schema: DatabaseSchema
  error?: string
}

export interface DeploymentRequest {
  nodes: FlowNode[]
  projectName: string
}

export interface GitHubRepo {
  name: string
  full_name: string
  clone_url: string
  html_url: string
}

export interface VercelDeployment {
  url: string
  deploymentUrl: string
  readyState: string
}

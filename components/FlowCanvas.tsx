"use client"

import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { PageNode } from '@/components/nodes/PageNode'
import { AuthNode } from '@/components/nodes/AuthNode'
import { DataNode } from '@/components/nodes/DataNode'
import { useFlowStore } from '@/hooks/useFlowStore'
import { FlowNode, FlowEdge } from '@/lib/types'


export function FlowCanvas() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectNode,
    selectedNodeId,
  } = useFlowStore()

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(nodes)
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(edges)

  // Sync React Flow state with Zustand store
  React.useEffect(() => {
    setReactFlowNodes(nodes)
  }, [nodes, setReactFlowNodes])

  React.useEffect(() => {
    setReactFlowEdges(edges)
  }, [edges, setReactFlowEdges])

  React.useEffect(() => {
    setNodes(reactFlowNodes as FlowNode[])
  }, [reactFlowNodes, setNodes])

  React.useEffect(() => {
    setEdges(reactFlowEdges as FlowEdge[])
  }, [reactFlowEdges, setEdges])

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      }
      setReactFlowEdges((edges) => addEdge(newEdge, edges))
    },
    [setReactFlowEdges]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      selectNode(node.id)
    },
    [selectNode]
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  // Custom node components mapped by type
  const customNodeTypes = useMemo(() => {
    return {
      custom: (props: React.ComponentProps<typeof PageNode>) => {
        const nodeType = props.data?.type
        if (nodeType === 'page') {
          return <PageNode {...props} selected={props.id === selectedNodeId} />
        } else if (nodeType === 'auth') {
          return <AuthNode {...props} selected={props.id === selectedNodeId} />
        } else if (nodeType === 'data') {
          return <DataNode {...props} selected={props.id === selectedNodeId} />
        }
        return <PageNode {...props} selected={props.id === selectedNodeId} />
      }
    }
  }, [selectedNodeId])

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={customNodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-muted/50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
        <Controls 
          className="bg-background border border-border rounded-lg shadow-sm"
          showInteractive={false}
        />
        <MiniMap
          className="bg-background border border-border rounded-lg shadow-sm"
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'page':
                return '#3b82f6'
              case 'auth':
                return '#10b981'
              case 'data':
                return '#f59e0b'
              default:
                return '#6b7280'
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}

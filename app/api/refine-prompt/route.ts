import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface RefinePromptRequest {
  nodeId: string
  originalPrompt: string
  refinementRequest: string
  nodeType: 'page' | 'auth' | 'data'
}

export async function POST(request: NextRequest) {
  try {
    const body: RefinePromptRequest = await request.json()
    const { originalPrompt, refinementRequest, nodeType } = body

    if (!originalPrompt || !refinementRequest) {
      return NextResponse.json(
        { error: 'Original prompt and refinement request are required' },
        { status: 400 }
      )
    }

    let response: string | null = null
    
    try {
      // Try OpenAI first
      const systemPrompt = getSystemPrompt(nodeType)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Original prompt: "${originalPrompt}"
            
User refinement request: "${refinementRequest}"

Please provide:
1. An updated prompt that incorporates the user's refinement request
2. A brief explanation of what you changed`
          }
        ],
        temperature: 0.7,
      })

      response = completion.choices[0]?.message?.content
    } catch (openaiError) {
      console.log('OpenAI API failed, using fallback refinement:', openaiError)
      // Fallback: Simple prompt refinement
      response = refinePromptFallback(originalPrompt, refinementRequest)
    }

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the response to extract updated prompt
    let updatedPrompt = originalPrompt
    const assistantResponse = "I've updated your component based on your request."

    // Look for updated prompt in the response
    const promptMatch = response.match(/Updated prompt:?\s*["']?([^"'\n]+)["']?/i)
    if (promptMatch) {
      updatedPrompt = promptMatch[1].trim()
    } else {
      // If no clear format, use the whole response as the updated prompt
      updatedPrompt = response.trim()
    }

    // Generate new code/schema based on updated prompt
    let updatedCode = null
    let updatedSchema = null

    if (nodeType === 'page') {
      // Regenerate UI component
      const uiResponse = await fetch(`${request.nextUrl.origin}/api/generate-ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: updatedPrompt,
          type: 'component',
        }),
      })
      
      const uiResult = await uiResponse.json()
      if (uiResult.code) {
        updatedCode = uiResult.code
      }
    } else if (nodeType === 'data') {
      // Regenerate schema
      const schemaResponse = await fetch(`${request.nextUrl.origin}/api/create-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: updatedPrompt,
        }),
      })
      
      const schemaResult = await schemaResponse.json()
      if (schemaResult.schema) {
        updatedSchema = schemaResult.schema
      }
    }

    return NextResponse.json({
      updatedPrompt,
      updatedCode,
      updatedSchema,
      response: assistantResponse,
    })
    
  } catch (error) {
    console.error('Prompt refinement error:', error)
    return NextResponse.json(
      { error: 'Failed to refine prompt' },
      { status: 500 }
    )
  }
}

function getSystemPrompt(nodeType: string): string {
  const basePrompt = `You are an AI assistant helping users refine their component descriptions for a visual app builder called FlowGen.`
  
  switch (nodeType) {
    case 'page':
      return `${basePrompt} 
      
You are specifically helping with UI page components. When users ask for refinements like "make the button green" or "add a loading state", you should update the original prompt to include these visual and functional requirements.

Focus on:
- Visual styling (colors, layout, typography)
- UI components (buttons, forms, cards, etc.)
- User interactions (hover states, animations, etc.)
- Content structure and hierarchy

Provide an updated prompt that a UI generation tool can understand and implement.`

    case 'data':
      return `${basePrompt}

You are specifically helping with database schema definitions. When users ask for refinements like "add a timestamp field" or "make email unique", you should update the original prompt to include these database requirements.

Focus on:
- Table structure and relationships
- Field types and constraints
- Indexes and keys
- Data validation requirements

Provide an updated prompt that clearly describes the database schema requirements.`

    case 'auth':
      return `${basePrompt}

You are specifically helping with authentication flow definitions. When users ask for refinements like "add social login" or "require email verification", you should update the original prompt to include these auth requirements.

Focus on:
- Authentication methods (email/password, social, etc.)
- User registration flow
- Security requirements
- Session management

Provide an updated prompt that clearly describes the authentication requirements.`

    default:
      return basePrompt
  }
}

// Fallback prompt refinement when OpenAI API is unavailable
function refinePromptFallback(originalPrompt: string, refinementRequest: string): string {
  // Simple keyword-based refinement
  let updatedPrompt = originalPrompt
  const refinement = refinementRequest.toLowerCase()
  
  // Color changes
  if (refinement.includes('green')) {
    updatedPrompt += ' with green color scheme'
  } else if (refinement.includes('blue')) {
    updatedPrompt += ' with blue color scheme'
  } else if (refinement.includes('red')) {
    updatedPrompt += ' with red color scheme'
  }
  
  // Layout changes
  if (refinement.includes('two column') || refinement.includes('2 column')) {
    updatedPrompt += ' in a two-column layout'
  } else if (refinement.includes('mobile')) {
    updatedPrompt += ' optimized for mobile devices'
  }
  
  // UI elements
  if (refinement.includes('loading')) {
    updatedPrompt += ' with loading states'
  } else if (refinement.includes('animation')) {
    updatedPrompt += ' with smooth animations'
  }
  
  // Database modifications
  if (refinement.includes('add field') || refinement.includes('add column')) {
    updatedPrompt += ' with additional fields as requested'
  }
  
  // If no specific pattern matched, append the refinement
  if (updatedPrompt === originalPrompt) {
    updatedPrompt += ` (${refinementRequest})`
  }
  
  return updatedPrompt
}

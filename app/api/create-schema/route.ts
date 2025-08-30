import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { OpenAISchemaRequest, DatabaseSchema } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body: OpenAISchemaRequest = await request.json()
    const { description } = body

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    let response: string | null = null
    
    try {
      // Try OpenAI first
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a database schema expert. Given a description of data requirements, generate a PostgreSQL database schema.

Return ONLY a valid JSON object with the following structure:
{
  "tableName": "table_name",
  "fields": [
    {
      "name": "field_name",
      "type": "PostgreSQL_type",
      "nullable": boolean,
      "primary": boolean,
      "references": "table.field or null"
    }
  ],
  "sql": "CREATE TABLE statement"
}

Rules:
- Use snake_case for table and field names
- Include appropriate PostgreSQL data types (TEXT, INTEGER, BOOLEAN, TIMESTAMP, UUID, etc.)
- Always include an 'id' field as UUID primary key
- Include created_at and updated_at timestamp fields
- Make the SQL compatible with Supabase/PostgreSQL
- Ensure the JSON is valid and parseable`
          },
          {
            role: "user",
            content: description
          }
        ],
        temperature: 0.3,
      })
      
      response = completion.choices[0]?.message?.content
    } catch (openaiError) {
      console.log('OpenAI API failed, using fallback schema generation:', openaiError)
      // Fallback: Generate schema locally based on description
      response = generateSchemaFallback(description)
    }

    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let schemaData
    try {
      schemaData = JSON.parse(response)
    } catch {
      console.error('Failed to parse OpenAI response:', response)
      throw new Error('Invalid schema format returned by AI')
    }

    // Validate schema structure
    if (!schemaData.tableName || !Array.isArray(schemaData.fields)) {
      throw new Error('Invalid schema structure')
    }

    const schema: DatabaseSchema = {
      tableName: schemaData.tableName,
      fields: schemaData.fields.map((field: Record<string, unknown>) => ({
        name: field.name,
        type: field.type,
        nullable: field.nullable || false,
        primary: field.primary || false,
        references: field.references || undefined,
      })),
      sql: schemaData.sql,
    }

    // For hackathon demo, we'll skip actual SQL execution
    // In production, you would set up proper Supabase functions or use the SQL editor
    console.log('Schema generated successfully (SQL execution skipped for demo):', schema.sql)

    return NextResponse.json({
      schema,
    })
    
  } catch (error) {
    console.error('Schema creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schema' },
      { status: 500 }
    )
  }
}

// Fallback schema generation when OpenAI API is unavailable
function generateSchemaFallback(description: string): string {
  const lowercaseDesc = description.toLowerCase()
  
  // Analyze description and generate appropriate schema
  let tableName = 'items'
  let fields = []
  
  if (lowercaseDesc.includes('user') || lowercaseDesc.includes('account')) {
    tableName = 'users'
    fields = [
      { name: 'id', type: 'UUID', nullable: false, primary: true },
      { name: 'email', type: 'TEXT', nullable: false },
      { name: 'name', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  } else if (lowercaseDesc.includes('post') || lowercaseDesc.includes('article') || lowercaseDesc.includes('blog')) {
    tableName = 'posts'
    fields = [
      { name: 'id', type: 'UUID', nullable: false, primary: true },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'content', type: 'TEXT', nullable: true },
      { name: 'author_id', type: 'UUID', nullable: true },
      { name: 'published', type: 'BOOLEAN', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  } else if (lowercaseDesc.includes('product') || lowercaseDesc.includes('item')) {
    tableName = 'products'
    fields = [
      { name: 'id', type: 'UUID', nullable: false, primary: true },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'price', type: 'DECIMAL', nullable: true },
      { name: 'category', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  } else {
    // Generic table based on description
    const words = description.split(' ')
    tableName = words[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'items'
    fields = [
      { name: 'id', type: 'UUID', nullable: false, primary: true },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT', nullable: true },
      { name: 'status', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  }
  
  const sql = `CREATE TABLE ${tableName} (
${fields.map(field => 
  `  ${field.name} ${field.type}${field.primary ? ' PRIMARY KEY' : ''}${field.nullable ? '' : ' NOT NULL'}${field.name.includes('_at') ? ' DEFAULT NOW()' : ''}`
).join(',\n')}
);`
  
  return JSON.stringify({
    tableName,
    fields,
    sql
  })
}

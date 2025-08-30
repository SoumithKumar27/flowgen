import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Helper function to execute SQL queries
export async function executeSQL(query: string) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query })
    
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('SQL execution error:', error)
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper function to get table schema
export async function getTableSchema(tableName: string) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', tableName)
    
    if (error) {
      throw new Error(`Failed to get schema: ${error.message}`)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Schema fetch error:', error)
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

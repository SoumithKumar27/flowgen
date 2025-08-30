import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { DeploymentRequest, DeploymentResult, FlowNode } from '@/lib/types'

const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

async function deployToVercel(projectFiles: any[], projectName: string) {
  const filesPayload: { [key: string]: any } = {};
  projectFiles.forEach(file => {
    filesPayload[file.path] = file.content;
  });
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: filesPayload,
      projectSettings: {
        framework: 'nextjs',
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`Vercel deployment failed: ${await response.text()}`);
  }
  const result = await response.json();
  return result.url; // This is the live deployment URL
}

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentRequest = await request.json()
    const { nodes, projectName } = body

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const pageNodes = nodes.filter(node => 
      node.data.type === 'page' && node.data.generatedCode
    )

    if (pageNodes.length === 0) {
      return NextResponse.json(
        { error: 'At least one page component is required for deployment' },
        { status: 400 }
      )
    }

    const logs: string[] = []
    
    logs.push("Starting deployment process...")

    // Step 1: Create GitHub repository
    logs.push("Creating GitHub repository...")
    
    // Add timestamp to ensure unique repository name
    const uniqueProjectName = `${projectName}-${Date.now()}`
    
    const repoResponse = await github.rest.repos.createForAuthenticatedUser({
      name: uniqueProjectName,
      description: `FlowGen v2.0 generated application: ${projectName}`,
      private: false,
      auto_init: true,
    })

    const repoUrl = repoResponse.data.html_url
    
    logs.push(`Repository created: ${repoUrl}`)

    // Step 2: Generate complete Next.js project structure
    logs.push("Generating project files...")
    
    const projectFiles = generateProjectFiles(nodes, projectName)
    
    // Step 3: Commit files to repository
    logs.push("Committing files to repository...")
    
    for (const file of projectFiles) {
      await github.rest.repos.createOrUpdateFileContents({
        owner: repoResponse.data.owner.login,
        repo: uniqueProjectName,
        path: file.path,
        message: `Add ${file.path}`,
        content: Buffer.from(file.content).toString('base64'),
      })
    }
    
    logs.push("All files committed successfully")

    // Step 4: Deploy to Vercel (real API call)
    logs.push("Deploying to Vercel...")
    let deploymentUrl = ""
    try {
      deploymentUrl = await deployToVercel(projectFiles, uniqueProjectName)
      logs.push(`Deployment created: ${deploymentUrl}`)
    } catch (err) {
      logs.push("Vercel deployment failed: " + (err instanceof Error ? err.message : String(err)))
      throw err
    }
  logs.push("Deployment completed successfully!");
  logs.push("✅ Deployment step complete!");
  logs.push("To view your app live, connect the generated GitHub repository to Vercel (https://vercel.com/new) and import your repo. Vercel will build and deploy automatically.");
  logs.push(`GitHub repo: ${repoUrl}`);

    const result: DeploymentResult = {
      success: true,
      url: deploymentUrl,
      repoUrl: repoUrl,
      logs: logs,
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Deployment error:', error)
    
    const result: DeploymentResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
      logs: ['Deployment failed with error: ' + (error instanceof Error ? error.message : 'Unknown error')],
    }
    
    return NextResponse.json(result, { status: 500 })
  }
}

function generateProjectFiles(nodes: FlowNode[], projectName: string) {
  const files = []
  
  // Package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: projectName,
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: {
        "next": "14.2.5",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "typescript": "^5.5.4",
        "@types/node": "^20.14.12",
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "tailwindcss": "^3.4.7",
        "autoprefixer": "^10.4.19",
        "postcss": "^8.4.40",
        "@supabase/supabase-js": "^2.44.4"
      },
      devDependencies: {
        "eslint": "^8.57.0",
        "eslint-config-next": "14.2.5"
      }
    }, null, 2)
  })

  // Next.js config
  files.push({
    path: 'next.config.js',
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`
  })

  // Tailwind config
  files.push({
    path: 'tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
  })

  // PostCSS config
  files.push({
    path: 'postcss.config.js',
    content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
  })

  // TypeScript config
  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        baseUrl: ".",
        paths: { "@/*": ["./*"] }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    }, null, 2)
  })

  // Global CSS
  files.push({
    path: 'app/globals.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
  })

  // Layout
  files.push({
    path: 'app/layout.tsx',
    content: `import './globals.css'

export const metadata = {
  title: '${projectName}',
  description: 'Generated by FlowGen v2.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
  })

  // Generate pages from nodes
  const pageNodes = nodes.filter(node => node.data.type === 'page' && node.data.generatedCode)
  
  if (pageNodes.length > 0) {
    // Main page from first page node
    const mainPage = pageNodes[0]
    files.push({
      path: 'app/page.tsx',
      content: `export default function HomePage() {
  return (
    <div>
      ${mainPage.data.generatedCode}
    </div>
  )
}`
    })

    // Additional pages
    pageNodes.slice(1).forEach((node) => {
      const pageName = node.data.label.toLowerCase().replace(/\s+/g, '-')
      files.push({
        path: `app/${pageName}/page.tsx`,
        content: `export default function ${node.data.label.replace(/\s+/g, '')}Page() {
  return (
    <div>
      ${node.data.generatedCode}
    </div>
  )
}`
      })
    })
  }

  // Add Supabase client if there are data nodes
  const dataNodes = nodes.filter(node => node.data.type === 'data' && node.data.schema)
  if (dataNodes.length > 0) {
    files.push({
      path: 'lib/supabase.ts',
      content: `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)`
    })
  }

  return files
}

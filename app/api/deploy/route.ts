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

// Ensure a Vercel project exists and is linked to the GitHub repo.
async function ensureVercelProject(projectName: string, fullRepoName: string, logs: string[]) {
  const teamId = process.env.VERCEL_TEAM_ID;
  const base = teamId ? `https://api.vercel.com/v9/projects/${projectName}?teamId=${teamId}` : `https://api.vercel.com/v9/projects/${projectName}`;
  const headers = { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`, 'Content-Type': 'application/json' } as const;
  // Check if exists
  const getRes = await fetch(base, { headers });
  if (getRes.status === 200) {
    logs.push('Vercel project already exists.');
    return true;
  }
  if (getRes.status !== 404) {
    logs.push(`Unexpected Vercel project lookup status: ${getRes.status}`);
  }
  logs.push('Creating Vercel project (linking GitHub repo)...');
  const createUrl = teamId ? `https://api.vercel.com/v9/projects?teamId=${teamId}` : 'https://api.vercel.com/v9/projects';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: projectName,
      framework: 'nextjs',
      gitRepository: { type: 'github', repo: fullRepoName },
      buildCommand: null,
      devCommand: null,
      rootDirectory: null,
    })
  });
  if (!createRes.ok) {
    const txt = await createRes.text();
    logs.push(`Failed to create Vercel project: ${txt}`);
    return false;
  }
  logs.push('Vercel project created & linked.');
  // Small delay to allow Git linkage to propagate
  await new Promise(r => setTimeout(r, 2000));
  return true;
}

async function triggerGitDeployment(projectName: string, repoId: string | number, commitSha: string, logs: string[]) {
  const teamId = process.env.VERCEL_TEAM_ID;
  const url = teamId ? `https://api.vercel.com/v13/deployments?teamId=${teamId}` : 'https://api.vercel.com/v13/deployments';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName,
      project: projectName,
      gitSource: {
        type: 'github',
        repoId: repoId.toString(),
        ref: 'main',
        sha: commitSha
      }
    })
  });
  if (!res.ok) {
  const txt = await res.text();
  logs.push(`Git-based deployment trigger failed (status ${res.status}): ${txt.substring(0,400)}`);
    return null;
  }
  const data = await res.json();
  logs.push('Git deployment triggered. Deployment id: ' + data.id);
  return data;
}

async function pollDeploymentUntilReady(id: string, logs: string[], projectName: string): Promise<string | null> {
  const teamId = process.env.VERCEL_TEAM_ID;
  for (let i = 0; i < 40; i++) { // ~2m max (40 * 3s)
    await new Promise(r => setTimeout(r, 3000));
    const url = teamId ? `https://api.vercel.com/v13/deployments/${id}?teamId=${teamId}` : `https://api.vercel.com/v13/deployments/${id}`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` } });
    if (!res.ok) {
      logs.push(`Poll failed status ${res.status}`);
      continue;
    }
    const data = await res.json();
    const state = data.readyState;
    logs.push(`Deployment state: ${state}`);
    if (state === 'READY') return data.url || data.alias?.[0] || null;
    if (['ERROR', 'CANCELED'].includes(state)) {
      logs.push('Deployment ended in state ' + state);
      return null;
    }
  }
  logs.push('Deployment polling timed out. Visit Vercel dashboard to inspect.');
  return null;
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

    // Step 2: Ensure Vercel project exists BEFORE committing (so first push triggers build)
    logs.push('Ensuring Vercel project exists & is linked...')
    await ensureVercelProject(uniqueProjectName, repoResponse.data.full_name, logs)

    // Step 3: Generate complete Next.js project structure
    logs.push("Generating project files...")
    const projectFiles = generateProjectFiles(nodes, projectName)
    const rootPage = projectFiles.find(f => f.path === 'app/page.tsx')
    logs.push(`Generated files: ${projectFiles.map(f=>f.path).join(', ')}`)
    if (rootPage) {
      const preview = rootPage.content.split('\n').slice(0,15).join('\n')
      logs.push('Root page preview:\n' + preview)
    } else {
      logs.push('WARNING: app/page.tsx not generated!')
    }

    // Commit files (initial push)
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
    logs.push("All files committed successfully (initial push)")

    // Get latest commit sha for main branch
    let commitSha = ''
    try {
      const branch = await github.rest.repos.getBranch({ owner: repoResponse.data.owner.login, repo: uniqueProjectName, branch: 'main' })
      commitSha = branch.data.commit.sha
      logs.push('Latest commit sha: ' + commitSha.substring(0,7))
    } catch (err) {
      logs.push('Could not fetch commit sha: ' + (err as any).message)
    }

    // Step 4: Deploy to Vercel (optional direct deploy). Can be disabled with env DIRECT_VERCEL_DEPLOY=false
  // Default now 'false' to prefer reliable git-based deployment unless explicitly enabled
  const directDeployEnabled = (process.env.DIRECT_VERCEL_DEPLOY || 'false').toLowerCase() !== 'false'
  logs.push(`Direct deploy enabled: ${directDeployEnabled}`)
    let deploymentUrl = ""
    if (directDeployEnabled) {
      logs.push("Attempting direct Vercel deployment via API...")
      try {
        deploymentUrl = await deployToVercel(projectFiles, uniqueProjectName)
        logs.push(`✅ Direct deployment created: ${deploymentUrl}`)
      } catch (err) {
        logs.push("⚠️ Direct Vercel deployment failed (continuing): " + (err instanceof Error ? err.message : String(err)))
        logs.push("Proceeding with GitHub repo only. You can still deploy by importing the repo in Vercel UI.")
      }
    } else {
      logs.push("Skipping direct Vercel deployment (DIRECT_VERCEL_DEPLOY disabled).")
    }

    // Step 5: Trigger git-based deployment (more reliable) if we have commit sha & project
    if (commitSha) {
      logs.push('Triggering git-based deployment...')
      const gitDep = await triggerGitDeployment(uniqueProjectName, repoResponse.data.id, commitSha, logs)
      if (gitDep?.id) {
        const polled = await pollDeploymentUntilReady(gitDep.id, logs, uniqueProjectName)
        if (polled) {
          logs.push('Git deployment ready: ' + polled)
          // Prefer git deployment URL if direct deploy absent
          if (!deploymentUrl) deploymentUrl = polled
        } else {
          logs.push('Git deployment did not become READY during polling window.')
        }
      }
    } else {
      logs.push('No commit SHA available; skipping git-based deployment trigger.')
    }

    // Fallback: if still no URL, attempt a direct file deploy regardless of flag (last resort)
    if (!deploymentUrl) {
      logs.push('No deployment URL resolved yet. Attempting fallback direct file deployment...')
      try {
        deploymentUrl = await deployToVercel(projectFiles, uniqueProjectName)
        logs.push('Fallback direct deployment succeeded: ' + deploymentUrl)
      } catch (e:any) {
        logs.push('Fallback direct deployment failed: ' + (e?.message || String(e)))
      }
    }

    if (!deploymentUrl) {
      logs.push('FINAL WARNING: Deployment produced no live URL. Check Vercel dashboard for project/build errors.')
    }
    logs.push("Deployment process finished.")
    logs.push("Next step: Import the GitHub repo into Vercel (https://vercel.com/new) for automated builds, or enable direct deployment.")
    logs.push(`GitHub repo: ${repoUrl}`)
    if (!deploymentUrl) {
      logs.push("No live URL from direct deploy. After importing to Vercel you'll get a domain like https://<project>.vercel.app")
    }

    const result: DeploymentResult = {
      success: true,
      url: deploymentUrl || undefined,
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
const nextConfig = {}
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

  // Generate pages from nodes (always ensure at least a safe root page exists)
  const pageNodes = nodes.filter(node => node.data.type === 'page')

  // Utility: sanitize arbitrary HTML/code into safe JSX fragment content
  const sanitizeHtmlToJsx = (raw: string) => {
    if (!raw) return '';
    let cleaned = raw
      .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/class="/g, 'className="');
    // Extract body inner if present
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) cleaned = bodyMatch[1];
    // Remove wrapping html/body tags if any remain
    cleaned = cleaned.replace(/<\/?(html|body)[^>]*>/gi, '');
    // Remove stray script/style tags for safety in generated static content (leave placeholders)
    cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '<!-- script removed -->');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
    return cleaned.trim();
  };

  const wrapPage = (label: string, rawCode: string, root = false) => {
    const sanitized = sanitizeHtmlToJsx(rawCode || '');
    const componentName = root ? 'HomePage' : `${(label || 'Page').replace(/[^a-zA-Z0-9]/g, '')}Page`;
    const base = sanitized || '<div />';
    // Always wrap to guarantee a valid default export React component
    return `// @ts-nocheck\n// Auto-generated by FlowGen\nimport React from 'react';\nexport default function ${componentName}() {\n  return (\n    <div className=\"flowgen-page\">\n      ${base}\n    </div>\n  );\n}\n`;
  };

  if (pageNodes.length === 0) {
    // Fallback root page
    files.push({
      path: 'app/page.tsx',
      content: `export default function HomePage() {\n  return <div>FlowGen app scaffold created. Add a Page node to populate content.</div>;\n}`
    });
    files.push({
      path: 'pages/index.tsx',
      content: `export default function Index() {\n  return <div>FlowGen pages router fallback. Add a Page node.</div>;\n}`
    });
  } else {
    // Main page from first page node
    const mainPage = pageNodes[0];
    const mainPageWrapped = wrapPage(mainPage.data.label || 'Home', (mainPage.data.generatedCode as string) || '', true);
  files.push({ path: 'app/page.tsx', content: mainPageWrapped });
  files.push({ path: 'pages/index.tsx', content: `export { default } from '../app/page'` });

    // Additional pages
    pageNodes.slice(1).forEach(node => {
      const pageName = (node.data.label || 'page').toLowerCase().replace(/\s+/g, '-');
      const wrapped = wrapPage(node.data.label, (node.data.generatedCode as string) || '');
      files.push({ path: `app/${pageName}/page.tsx`, content: wrapped });
    });
  }

  // Add Supabase client if there are data nodes
  const dataNodes = nodes.filter(node => node.data.type === 'data' && (node.data as any).schema);
  if (dataNodes.length > 0) {
    files.push({
      path: 'lib/supabase.ts',
      content: `import { createClient, SupabaseClient } from '@supabase/supabase-js'\n\nconst supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\nconst supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;\n\nlet supabase: SupabaseClient | null = null;\nif (supabaseUrl && supabaseAnonKey) {\n  try {\n    supabase = createClient(supabaseUrl, supabaseAnonKey);\n  } catch (e) {\n    console.warn('Failed to init Supabase client', e);\n  }\n} else {\n  console.warn('Supabase env vars missing; data features disabled.');\n}\n\nexport { supabase };\n`
    });
  }

  return files
}

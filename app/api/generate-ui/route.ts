import { NextRequest, NextResponse } from 'next/server'
import { V0GenerationRequest, V0GenerationResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: V0GenerationRequest = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // For the hackathon MVP, we'll simulate v0.dev API call
    // In a real implementation, you would integrate with the actual v0.dev API
    
    // Simulate v0.dev API call
    const v0Response = await simulateV0Generation(prompt)
    
    if (v0Response.error) {
      return NextResponse.json(
        { error: v0Response.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      code: v0Response.code,
      preview: v0Response.preview,
    })
    
  } catch (error) {
    console.error('UI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate UI component' },
      { status: 500 }
    )
  }
}

// Simulate v0.dev API for hackathon demo
async function simulateV0Generation(prompt: string): Promise<V0GenerationResponse> {
  // This is a simulation - in reality you'd call the v0.dev API
  // For the hackathon, we'll generate a basic React component based on the prompt
  
  try {
    const component = generateBasicComponent(prompt)
    
    return {
      code: component,
      preview: component,
    }
  } catch {
    return {
      code: '',
      error: 'Failed to generate component',
    }
  }
}

function generateBasicComponent(prompt: string): string {
  // Analyze the prompt and generate appropriate component
  const lowercasePrompt = prompt.toLowerCase()
  
  if (lowercasePrompt.includes('landing') || lowercasePrompt.includes('hero')) {
    return `
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  <div class="max-w-4xl mx-auto text-center px-4">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">
      Welcome to Your App
    </h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      ${prompt}
    </p>
    <div class="space-x-4">
      <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Get Started
      </button>
      <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors">
        Learn More
      </button>
    </div>
  </div>
</div>`
  } else if (lowercasePrompt.includes('dashboard') || lowercasePrompt.includes('admin')) {
    return `
<div class="min-h-screen bg-gray-100">
  <div class="max-w-7xl mx-auto py-6 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">${prompt}</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900">Total Users</h3>
        <p class="text-3xl font-bold text-blue-600">1,234</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900">Revenue</h3>
        <p class="text-3xl font-bold text-green-600">$12,345</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900">Orders</h3>
        <p class="text-3xl font-bold text-orange-600">567</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900">Growth</h3>
        <p class="text-3xl font-bold text-purple-600">+23%</p>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <span class="text-gray-700">New user registered</span>
          <span class="text-gray-500 text-sm">2 minutes ago</span>
        </div>
        <div class="flex items-center justify-between border-b pb-2">
          <span class="text-gray-700">Order completed</span>
          <span class="text-gray-500 text-sm">5 minutes ago</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-700">Payment received</span>
          <span class="text-gray-500 text-sm">10 minutes ago</span>
        </div>
      </div>
    </div>
  </div>
</div>`
  } else if (lowercasePrompt.includes('form') || lowercasePrompt.includes('contact')) {
    return `
<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Contact Us</h2>
      <p class="text-gray-600 mt-2">${prompt}</p>
    </div>
    
    <form class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your name" />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your message..."></textarea>
      </div>
      
      <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
        Send Message
      </button>
    </form>
  </div>
</div>`
  } else if (lowercasePrompt.includes('blog') || lowercasePrompt.includes('article')) {
    return `
<div class="min-h-screen bg-white">
  <article class="max-w-4xl mx-auto py-12 px-4">
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Article Title
      </h1>
      <div class="flex items-center space-x-4 text-gray-600">
        <span>By Author Name</span>
        <span>•</span>
        <time>March 15, 2024</time>
        <span>•</span>
        <span>5 min read</span>
      </div>
    </header>
    
    <div class="prose prose-lg max-w-none">
      <p class="text-xl text-gray-700 mb-6">
        ${prompt}
      </p>
      
      <p class="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </p>
      
      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Features</h2>
      
      <ul class="space-y-2 mb-6">
        <li class="flex items-start space-x-2">
          <span class="text-blue-600">•</span>
          <span>Feature one description</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="text-blue-600">•</span>
          <span>Feature two description</span>
        </li>
        <li class="flex items-start space-x-2">
          <span class="text-blue-600">•</span>
          <span>Feature three description</span>
        </li>
      </ul>
      
      <p class="mb-4">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  </article>
</div>`
  } else {
    // Generic component based on prompt
    return `
<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
  <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Your Component
      </h1>
      <p class="text-gray-600">
        ${prompt}
      </p>
    </div>
    
    <div class="space-y-4">
      <div class="p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold text-blue-900 mb-2">Feature 1</h3>
        <p class="text-blue-700 text-sm">Generated based on your description</p>
      </div>
      
      <div class="p-4 bg-green-50 rounded-lg">
        <h3 class="font-semibold text-green-900 mb-2">Feature 2</h3>
        <p class="text-green-700 text-sm">Automatically created with AI</p>
      </div>
      
      <div class="p-4 bg-purple-50 rounded-lg">
        <h3 class="font-semibold text-purple-900 mb-2">Feature 3</h3>
        <p class="text-purple-700 text-sm">Ready for customization</p>
      </div>
    </div>
    
    <div class="mt-6 flex justify-center">
      <button class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Get Started
      </button>
    </div>
  </div>
</div>`
  }
}

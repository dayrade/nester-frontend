import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const response = await fetch(`${backendUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    // Return the response from the backend with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Auth API proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
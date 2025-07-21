import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    // Forward authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward cookies if present
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }
    
    const response = await fetch(`${backendUrl}/api/properties`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    // Return the response from the backend with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error forwarding request to backend:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const url = `${backendUrl}/api/properties${queryString ? `?${queryString}` : ''}`
    
    // Forward authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward cookies if present
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })
    
    const data = await response.json()
    
    // Return the response from the backend with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error forwarding request to backend:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const url = `${backendUrl}/api/properties${queryString ? `?${queryString}` : ''}`
    
    // Forward authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward cookies if present
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    // Return the response from the backend with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error forwarding request to backend:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const url = `${backendUrl}/api/properties${queryString ? `?${queryString}` : ''}`
    
    // Forward authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward cookies if present
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })
    
    const data = await response.json()
    
    // Return the response from the backend with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error forwarding request to backend:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
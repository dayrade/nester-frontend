import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
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
    
    const response = await fetch(`${backendUrl}/api/properties/${propertyId}/images`, {
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const formData = await request.formData()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    // Forward authentication headers
    const headers: Record<string, string> = {}
    
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
    
    const response = await fetch(`${backendUrl}/api/properties/${propertyId}/images`, {
      method: 'POST',
      headers,
      body: formData, // Forward the FormData directly
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
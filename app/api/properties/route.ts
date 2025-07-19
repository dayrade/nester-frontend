import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const response = await fetch(`${backendUrl}/api/properties`, {
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
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const url = `${backendUrl}/api/properties${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const url = `${backendUrl}/api/properties${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const url = `${backendUrl}/api/properties${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
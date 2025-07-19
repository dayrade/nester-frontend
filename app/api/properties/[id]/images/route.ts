import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const response = await fetch(`${backendUrl}/api/properties/${propertyId}/images`, {
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const formData = await request.formData()
    
    // Forward the request to the Express backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002'
    const response = await fetch(`${backendUrl}/api/properties/${propertyId}/images`, {
      method: 'POST',
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
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id: propertyId, imageId } = params
    
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
    
    const response = await fetch(`${backendUrl}/api/properties/${propertyId}/images/${imageId}`, {
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
'use client'

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
        <p>This is a simple test page to check if the frontend is working.</p>
        <div className="mt-4 p-4 bg-white rounded shadow">
          <p>If you can see this, the frontend is working correctly.</p>
        </div>
      </div>
    </div>
  )
}
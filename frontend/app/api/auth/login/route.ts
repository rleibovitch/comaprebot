import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { client_id, password } = await request.json()
    
    // For MVP, accept any client_id with password "demo123"
    if (password !== 'demo123') {
      return NextResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { client_id, exp: Math.floor(Date.now() / 1000) + 86400 },
      JWT_SECRET
    )
    
    return NextResponse.json({
      token,
      client_id
    })
    
  } catch (error) {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

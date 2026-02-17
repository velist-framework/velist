import { Google } from 'arctic'

const clientId = process.env.GOOGLE_CLIENT_ID || ''
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

// Determine redirect URI based on environment
const getRedirectUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.GOOGLE_REDIRECT_URI || ''
  }
  return 'http://localhost:3000/auth/google/callback'
}

export const google = new Google(clientId, clientSecret, getRedirectUri())

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
  email_verified: boolean
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google')
  }
  
  return response.json()
}

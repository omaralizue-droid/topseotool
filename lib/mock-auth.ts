/**
 * Mock auth helper — used when BYPASS_AUTH=true (testing only).
 * Returns a fake session so all app pages render without a real login.
 * Set BYPASS_AUTH=true in Vercel environment variables to enable.
 * NEVER enable this in production with real user data.
 */
export const BYPASS_AUTH = process.env.BYPASS_AUTH === "true"

export const MOCK_SESSION = {
  user: {
    id: "mock-user-id-for-testing",
    name: "Test User",
    email: "test@topseotool.dev",
    image: null,
    role: "USER",
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
}

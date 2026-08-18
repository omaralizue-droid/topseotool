/**
 * Mock auth helper — always enabled for open testing without login barriers.
 */
export const BYPASS_AUTH = true

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

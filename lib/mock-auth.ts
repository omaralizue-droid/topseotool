/**
 * Mock auth helper — always enabled for open testing without login barriers.
 */
export const BYPASS_AUTH = true

export const MOCK_SESSION = {
  user: {
    id: "mock-user-id-for-testing",
    name: "Admin Operator",
    email: "admin@topseotool.net",
    image: null,
    role: "SUPER_ADMIN",
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
}

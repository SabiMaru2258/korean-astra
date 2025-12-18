// Edge-compatible auth functions
// Uses simple encoding for Edge Runtime compatibility

const SECRET = process.env.AUTH_SECRET || "dev-secret";

export type SessionPayload = {
  username: string;
  role: "admin" | "user";
};

// Simple hash function for Edge Runtime
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Sign token - works in both Node.js and Edge Runtime
export function signToken(payload: SessionPayload): string {
  // Use Buffer in Node.js, btoa in browser/Edge
  let encoded: string;
  if (typeof Buffer !== 'undefined') {
    encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  } else {
    encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
  
  // Simple signature using secret + encoded payload
  const signature = simpleHash(SECRET + encoded);
  
  return `${encoded}.${signature}`;
}

// Verify token - Edge Runtime compatible (synchronous)
export function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    // Verify signature
    const expectedSignature = simpleHash(SECRET + encoded);
    if (signature !== expectedSignature) return null;

    // Decode and parse payload
    const decoded = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// hashPassword is only used in Node.js runtime (API routes), so we can use Node.js crypto
// Import dynamically to avoid Edge Runtime issues
export function hashPassword(password: string): string {
  // This function is only called in API routes (Node.js runtime), not in middleware
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(password).digest("hex");
}

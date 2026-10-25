import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
const jwtSecret = "super-secret-jwt-token-with-at-least-32-characters-long";
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(jwtSecret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);
const jwt = await create({ alg: "HS256", typ: "JWT" }, { role: "anon", iss: "supabase", exp: 1999999999 }, key);
console.log(jwt);

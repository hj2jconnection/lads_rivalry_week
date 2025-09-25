import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client without authentication for public betting app
export const base44 = createClient({
  appId: "689022e68a5a93d8d86ceb66", 
  requiresAuth: false // Allow public access for betting functionality
});

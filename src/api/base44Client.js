import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "689022e68a5a93d8d86ceb66", 
  requiresAuth: true // Ensure authentication is required for all operations
});

import { createAuth0Client } from "@auth0/auth0-spa-js";

let client;

export async function getAuth0Client() {
  if (client) return client;

  client = await createAuth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    },
    cacheLocation: "localstorage", // damit Refresh nach Reload klappt
    useRefreshTokens: true,
  });

  return client;
}

const DISCORD_API_URL = "https://discord.com/api";
const DISCORD_SCOPE = "identify";
const DISCORD_STATE_COOKIE = "discord_oauth_state";

type DiscordTokenResponse = {
  access_token: string;
};

type DiscordUser = {
  id: string;
  username: string;
  avatar: string | null;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getDiscordStateCookieName(): string {
  return DISCORD_STATE_COOKIE;
}

export function buildDiscordAuthorizeUrl(
  state: string,
  redirectUri: string,
): string {
  const clientId = getRequiredEnv("DISCORD_CLIENT_ID");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: DISCORD_SCOPE,
    state,
    redirect_uri: redirectUri,
  });

  return `${DISCORD_API_URL}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const clientId = getRequiredEnv("DISCORD_CLIENT_ID");
  const clientSecret = getRequiredEnv("DISCORD_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Could not exchange authorization code for token");
  }

  const tokenResponse = (await response.json()) as DiscordTokenResponse;

  return tokenResponse.access_token;
}

export async function fetchDiscordUser(
  accessToken: string,
): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not fetch Discord user");
  }

  return (await response.json()) as DiscordUser;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  let url = base64.replace(/\+/g, "-").replace(/\//g, "_");
  while (url.endsWith("=")) {
    url = url.slice(0, -1);
  }
  return url;
}

export function createInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return bytesToBase64Url(bytes);
}

export function inviteExpiresAt(days = 14): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires;
}

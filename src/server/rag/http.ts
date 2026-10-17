export class ExternalServiceError extends Error {
  constructor(public readonly status: number, public readonly retryAfterSeconds?: number) {
    super("Servicio externo: HTTP " + status);
    this.name = "ExternalServiceError";
  }
}

export async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<unknown> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    if (response.ok) return response.json();
    const retryAfter = response.headers.get("retry-after");
    const delay = retryAfter === null ? NaN : Number(retryAfter);
    if (![502, 503, 504].includes(response.status) || attempt === 3) throw new ExternalServiceError(response.status, Number.isFinite(delay) && delay >= 0 ? Math.ceil(delay) : undefined);
    await new Promise(resolve => setTimeout(resolve, Math.min(10000, delay > 0 ? delay * 1000 : 1000 * 2 ** attempt)));
  }
  throw new Error("Servicio no disponible");
}

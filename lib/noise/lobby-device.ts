/** Opaque browser identity, scoped to this origin. Never exposed in seat views. */
export function lobbyDevice(req:Request){
 const value=req.headers.get('cookie')?.match(/(?:^|;\s*)velmont-device=([a-f0-9-]{36})(?:;|$)/i)?.[1];
 const key=value||crypto.randomUUID();
 return {key,cookie:value?undefined:'velmont-device='+key+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400'+(new URL(req.url).protocol==='https:'?'; Secure':'')};
}

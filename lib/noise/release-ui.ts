/** UI lifecycle decisions; no game or transport rules. */
export type SavedSeat={code:string;token:string};
export function savedSeat(value:unknown):SavedSeat|null{if(!value||typeof value!=='object')return null;const s=value as Record<string,unknown>;return typeof s.code==='string'&&/^[A-Z0-9]{6}$/.test(s.code)&&typeof s.token==='string'&&s.token.length>0?{code:s.code,token:s.token}:null;}
export function resumeInvite(code:string|null,seat:SavedSeat|null){return !!code&&!!seat&&code.toUpperCase()===seat.code;}
export function hostEnded(v:{phase:string;finishReason?:string}|null|undefined){return v?.phase==='finished'&&v.finishReason==='Host left. Job ended';}
export function hostLeaveWarning(mode:string,v:{host:string;you:string;phase:string}|null|undefined){return mode==='online'&&!!v&&v.host===v.you&&v.phase!=='finished';}
export function withoutCrew(url:string){const u=new URL(url);u.searchParams.delete('crew');return u.pathname+u.search+u.hash;}

import type {SeatExitReason} from './engine.ts';
export type LostCrew={code:string;name:string;message:string;reason?:SeatExitReason;previousToken?:string};
export const shouldAutoRejoin=(reason:SeatExitReason)=>reason==='stale';
export const departureReason=(error:unknown):SeatExitReason=>{const r=(error as {departureReason?:SeatExitReason})?.departureReason;return r==='removed'||r==='stale'||r==='left'?r:'unknown';};
/** Fresh admission must use the old room and codename, never a removed token. */
export async function rejoinLobby<T>(crew:Pick<LostCrew,'code'|'name'|'reason'|'previousToken'>,join:(payload:Record<string,unknown>)=>Promise<T>):Promise<T>{
 if(crew.reason==='removed'||crew.reason==='left')throw Error(crew.reason==='removed'?'The host removed you from this crew.':'You left the crew.');
 return join({type:'join',peerMode:true,code:crew.code,name:crew.name,...(crew.previousToken?{previousToken:crew.previousToken}:{})});
}
export const seatUnavailable=(error:unknown)=>{const e=error as {status?:number;message?:string};return e?.status===401||e?.status===403&&(error as {departureReason?:string})?.departureReason==='removed'||!!e?.message?.includes('Seat unavailable');};

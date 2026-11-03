export type LostCrew={code:string;name:string;message:string};
/** Fresh admission must use the old room and codename, never a removed token. */
export async function rejoinLobby<T>(crew:Pick<LostCrew,'code'|'name'>,join:(payload:Record<string,unknown>)=>Promise<T>):Promise<T>{
 return join({type:'join',peerMode:true,code:crew.code,name:crew.name});
}
export const seatUnavailable=(error:unknown)=>{const e=error as {status?:number;message?:string};return e?.status===401||!!e?.message?.includes('Seat unavailable');};

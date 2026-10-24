// Best-effort serialization inside one Worker isolate. D1 compare-and-swap remains
// the authority across isolates; this never caches a room or assumes affinity.
const tails=new Map<string,Promise<void>>();
export async function withRoomLock<T>(code:string,work:()=>Promise<T>):Promise<T>{
 const before=tails.get(code)||Promise.resolve();let release!:()=>void;
 const mine=new Promise<void>(r=>{release=r;});const tail=before.then(()=>mine);tails.set(code,tail);
 await before;
 try{return await work();}finally{release();if(tails.get(code)===tail)tails.delete(code);}
}

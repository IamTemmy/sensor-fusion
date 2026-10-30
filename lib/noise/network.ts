import {action,command,view,type Game,type View,type Vec} from './engine.ts';
// Transport-only metadata; never changes engine rules or leaves the server.
export type NetAction={id:number;action:string;aim:Vec};
type Stored=Game&{net?:{match:number;acks:Record<string,number>}};
export const arenaKey=(g:Game|View)=>`${g.code}:${g.match}:${g.layout}:${g.crewMode}`;
export function actionAck(g:Game,id:string){const n=(g as Stored).net;return n?.match===g.match?n.acks[id]||0:0;}
export function applyPacket(g:Game,id:string,a:Record<string,any>){
 if(a.type!=='input'||a.protocol!==2){command(g,id,a as Parameters<typeof command>[2]);return;}
 if(a.match!==g.match)return;
 const s=g.seats.find(s=>s.id===id)!;
 // Movement is latest-wins. Actions have independent, contiguous acknowledgment.
 for(const old of (Array.isArray(a.previous)?a.previous:[]).slice(-2)){if(Number.isSafeInteger(old.seq)&&old.seq<a.seq&&old.match===g.match&&[old.dx,old.dy,old.aim?.x,old.aim?.y].every(Number.isFinite)&&Math.abs(old.dx)<=2&&Math.abs(old.dy)<=2)command(g,id,{type:'input',match:g.match,seq:old.seq,dx:old.dx,dy:old.dy,aim:old.aim,sneak:!!old.sneak});}
 command(g,id,{type:'input',match:g.match,seq:a.seq,dx:a.dx,dy:a.dy,aim:a.aim,sneak:a.sneak});
 const stored=g as Stored;if(stored.net?.match!==g.match)stored.net={match:g.match,acks:{}};
 const net=stored.net!;let ack=net.acks[id]||0;
 for(const item of (Array.isArray(a.actions)?a.actions:[]).slice(0,16)){
  if(!Number.isSafeInteger(item.id)||item.id<=ack)continue;if(item.id!==ack+1)break;
  if(typeof item.action!=='string'||item.action.length>32)break;
  const aim=item.aim&&Number.isFinite(item.aim.x)&&Number.isFinite(item.aim.y)?{x:Math.max(24,Math.min(936,item.aim.x)),y:Math.max(24,Math.min(576,item.aim.y))}:s.aim;
  action(g,s,item.action,aim);ack=item.id; // A rejected action is also acknowledged, allowing rollback.
 }net.acks[id]=ack;
}
export function packet(g:Game,id:string,known?:string){
 const v=view(g,id) as View&{net?:unknown};delete v.net;delete (v as View&{peer?:unknown}).peer;
 const key=arenaKey(g);const {walls,plate,hideSpots,sensors,arena:museum,...dynamic}=v;
 return {protocol:2,arenaKey:key,ack:actionAck(g,id),view:{...dynamic,sensorState:(sensors||[]).map(s=>({id:s.id,cooldown:s.cooldown,screamingUntil:s.screamingUntil,inside:s.inside}))},...(known===key?{}:{arena:{walls,plate,hideSpots,museum,sensors:(sensors||[]).map(({cooldown,inside,screamingUntil,...s})=>s)}})};
}
export type Wire=ReturnType<typeof packet>;
export function unpack(p:Wire,previous?:View|null):View{
 if(!p.arena&&(!previous||arenaKey(previous)!==p.arenaKey))throw Error('Arena snapshot required');
 const geometry=p.arena||previous!;const {sensorState,...dynamic}=p.view;
 return {...dynamic,arena:p.arena?p.arena.museum:previous?.arena,walls:geometry.walls,plate:geometry.plate,hideSpots:geometry.hideSpots,sensors:(geometry.sensors||[]).map(s=>({...s,...sensorState.find(t=>t.id===s.id),cooldown:sensorState.find(t=>t.id===s.id)?.cooldown||0}))} as View;
}

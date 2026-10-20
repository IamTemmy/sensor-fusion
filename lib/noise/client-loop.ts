import {command,advance,STEP,type Game,type Vec} from './engine.ts';
/** The browser's local RAF driver. Match changes invalidate all old input timing. */
export type LocalLoop={match:number;seq:number;elapsed:number};
export const newLocalLoop=():LocalLoop=>({match:-1,seq:0,elapsed:0});
export function runLocalFrame(g:Game,loop:LocalLoop,deltaMs:number,dir:Vec,aim:Vec,action?:string,sneak=false){
 if(loop.match!==g.match){loop.match=g.match;loop.seq=g.seats[0].lastSeq;loop.elapsed=0;}
 if(g.phase!=='playing'){loop.elapsed=0;return;}
 command(g,g.seats[0].id,{type:'input',match:g.match,seq:++loop.seq,dx:dir.x,dy:dir.y,aim,action,sneak});
 loop.elapsed+=Math.min(100,Math.max(0,deltaMs));
 const elapsed=Math.floor(loop.elapsed/STEP)*STEP;loop.elapsed-=elapsed;
 if(elapsed)advance(g,g.now+elapsed);
}

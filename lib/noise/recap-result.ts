import {crewScores,type View} from './engine.ts';
export function winningResult(v:View){
 const scores=crewScores(v),amount=Math.max(0,...scores.map(s=>s.bank));
 const winners=scores.filter(s=>amount>0&&s.bank===amount);
 const names=winners.map(t=>v.seats.filter(s=>s.team===t.team).map(s=>s.name).join(' & '));
 return {amount,names,teams:winners.map(t=>t.name),tied:winners.length>1,title:amount===0?'No haul this time':names.join(' / ')+(winners.length>1?' tie!':v.seats.filter(s=>s.team===winners[0].team).length===1?' wins!':' win!')};
}

export type RunRecord={stars:number;bank:number;time:number};
export function betterRecord(old:RunRecord|null,next:RunRecord):RunRecord {
 if(!old||!Number.isFinite(old.stars)||!Number.isFinite(old.bank)||!Number.isFinite(old.time))return next;
 return next.stars>old.stars||next.stars===old.stars&&(next.bank>old.bank||next.bank===old.bank&&next.time<old.time)?next:old;
}

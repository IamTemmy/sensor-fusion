export type RunRecord={stars:number;bank:number;time:number};
export function betterRecord(old:RunRecord|null,next:RunRecord):RunRecord {
 if(!old||!Number.isFinite(old.stars)||!Number.isFinite(old.bank)||!Number.isFinite(old.time))return next;
 return next.stars>old.stars||next.stars===old.stars&&(next.bank>old.bank||next.bank===old.bank&&next.time<old.time)?next:old;
}

export const recordKey=(difficulty:string,mode:string,layout:number)=>`noise-best-v16:${difficulty}:${mode}:${layout}`;

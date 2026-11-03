import type {PeerRoom} from '../../lib/noise/peer-client.ts';
/** Test doubles implement only the browser APIs exercised by each transport test. */
export function mockLink<T>(value:T):T & Parameters<PeerRoom['bind']>[0]{return value as T & Parameters<PeerRoom['bind']>[0];}
export function mockChannel<T>(value:T):T & RTCDataChannel & {onmessage:(event:{data:string})=>void;onopen:()=>void}{return value as T & RTCDataChannel & {onmessage:(event:{data:string})=>void;onopen:()=>void};}

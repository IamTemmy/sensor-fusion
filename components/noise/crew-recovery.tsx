export function CrewRecovery({code,message,busy,removed=false,onRejoin,onHome}:{code:string;message:string;busy:boolean;removed?:boolean;onRejoin:()=>void;onHome:()=>void}){
 return <div className="overlay"><section className="panel crew-recovery" role="dialog" aria-modal="true" aria-labelledby="crew-recovery-title">
 <h2 id="crew-recovery-title">{removed?'The host removed you from the crew':'You left the crew'}</h2>
 <p className="secondary-copy">{removed?'Ask the host for a new invite.':busy?'Rejoining crew '+code+'…':message}</p>
 {!removed&&<button className="primary" disabled={busy} onClick={onRejoin}>Rejoin</button>}
 <button className="secondary" onClick={onHome}>Back to hideout</button>
 </section></div>;
}

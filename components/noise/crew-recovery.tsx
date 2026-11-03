export function CrewRecovery({code,message,busy,onRejoin,onHome}:{code:string;message:string;busy:boolean;onRejoin:()=>void;onHome:()=>void}){
 return <div className="overlay"><section className="panel crew-recovery" role="dialog" aria-modal="true" aria-labelledby="crew-recovery-title">
 <h2 id="crew-recovery-title">You left the crew</h2>
 <p className="secondary-copy">{busy?'Rejoining crew '+code+'…':message}</p>
 <button className="primary" disabled={busy} onClick={onRejoin}>Rejoin</button>
 <button className="secondary" onClick={onHome}>Back to hideout</button>
 </section></div>;
}

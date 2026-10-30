/** Menu-only portraits drawn from the same hero character sheet. */
export function MenuCrew({kind}:{kind:'bots'|'friends'|'coop'|'rivals'}){
 const people=kind==='friends'?['rookie','violet','echo']:kind==='rivals'?['echo','violet']:['rookie','echo'];
 return <div className={'menu-crew menu-crew-'+kind} aria-hidden="true">{people.map((person,i)=><span className="menu-crew-slot" key={person}>{kind==='rivals'&&i===1&&<i className="menu-versus">VS</i>}<span className={'menu-character menu-character-'+person}/></span>)}{kind==='bots'&&<span className="menu-bot-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v3M9 3h6M4 11H2m20 0h-2"/><rect x="4" y="6" width="16" height="14" rx="4"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><path d="M8 16h8"/></svg></span>}</div>;
}

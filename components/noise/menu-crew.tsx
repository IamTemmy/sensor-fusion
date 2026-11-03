/** Menu-only portraits drawn from the same hero character sheet. */
export function MenuCrew({kind}:{kind:'bots'|'friends'|'coop'|'rivals'}){
 const people=kind==='friends'?['rookie','violet','echo']:kind==='rivals'?['echo','violet']:['rookie','echo'];
 return <div className={'menu-crew menu-crew-'+kind} aria-hidden="true">{people.map((person,i)=><span className="menu-crew-slot" key={person}>{kind==='rivals'&&i===1&&<i className="menu-versus">VS</i>}<span className={'menu-character menu-character-'+person}/></span>)}</div>;
}

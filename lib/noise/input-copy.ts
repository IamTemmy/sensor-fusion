/** Presentation only: commands and engine bindings remain unchanged. */
export function touchCopy(text:string,touch:boolean){
 if(!touch)return text;
 return text
 .replaceAll('Aim away and F shakes off the alarm. Then aim at Echo and F passes quiet art.','Aim away and tap Shake off alarm. Then aim at Echo and tap Pass quiet art.')
 .replaceAll('Carrying art? F flings its alarm after 1s. A teammate takes it instantly.','Carrying art? Tap Shake off alarm; it flies after 1s. A teammate takes it instantly.')
 .replaceAll('Q asks Echo to pass art. F passes quiet art or shakes off its alarm. G drops it.','Tap Pass it to ask Echo for art. Use Pass quiet art, Shake off alarm, or Drop.')
 .replaceAll('F shakes off alarm','Tap Shake off alarm')
 .replace('Move WASD, aim with the mouse. E grabs, unties and stashes. F throws. G drops. Shift sneaks.','Drag the thumbstick to move. Tap the floor to aim. Use Grab, Untie, Stash, Throw and Drop. Tap Sneak to toggle stealth.')
 .replaceAll('Press R in your dock','Tap Board van in your dock').replaceAll('R again hops out','Tap Hop out').replaceAll('R again uses Hop out','Tap Hop out')
 .replaceAll('R boards or hops out before Last Call.','Tap Board van, or Hop out before Last Call.')
 .replaceAll('Board with R','Tap Board van').replaceAll('R leaves the van','Hop out lets you hop out').replaceAll('R lets you hop out','Tap Hop out')
 .replaceAll('R boards the van.','Tap Board van.').replaceAll('R boards.','Tap Board van.')
 .replaceAll('Press R again','Tap Confirm empty exit').replaceAll('Press R to board your van.','Tap Board van to escape.')
 .replaceAll('G drops art','Tap Drop to put down art').replaceAll('E grabs it.','Tap Grab.').replaceAll('Partner uses E.','Partner taps Grab alarm.')
 .replaceAll('Q asks Echo to pass art. F passes yours. G drops it.','Tap Pass it to ask Echo for art. Pass art throws yours; Drop puts it down.')
 .replaceAll('F throws.','Tap Throw alarm.').replaceAll('F throws','Tap Throw alarm')
 .replaceAll('E interacts','Tap an action').replaceAll('hold E','tap Untie and stay beside you')
 .replaceAll('E while carrying art','tap Stash while carrying art')
 .replace(/\bwith E\b/g,'with Grab').replace(/\(E\)/g,'(Grab)').replace(/\(F\)/g,'(Pass art)').replace(/\(Shift\)/g,'(Sneak)').replace(/\(R\)/g,'(Board van)')
 .replaceAll('E grabs the highlighted alarm.','Tap Grab alarm on the highlighted alarm.').replaceAll('F passes the art.','tap Pass art.').replaceAll('E stashes it safely.','Tap Stash to keep it safe.').replaceAll('press R to board','tap Board van').replaceAll('hold Shift (or tap Sneak)','tap Sneak')
 .replaceAll('SHIFT · HIDE','SNEAK · HIDE').replaceAll('Shift','Sneak');
}

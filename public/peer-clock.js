/* A worker drives transport ticks while desktop rendering is backgrounded.
   Browsers/OSes can still suspend workers; mobile hosts explicitly pause. */
let timer;
self.onmessage=e=>{if(e.data==='start'){clearInterval(timer);timer=setInterval(()=>self.postMessage('tick'),10);}else if(e.data==='stop'){clearInterval(timer);self.close();}};

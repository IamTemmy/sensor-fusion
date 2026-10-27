/* At most one outstanding main-thread tick: never build a message backlog
   while AI, rendering, or a backgrounded browser delays the host. */
let timer, pending=false;
self.onmessage=e=>{if(e.data==='ack'){pending=false;return;}if(e.data==='start'){clearInterval(timer);pending=false;timer=setInterval(()=>{if(!pending){pending=true;self.postMessage('tick');}},10);}else if(e.data==='stop'){clearInterval(timer);self.close();}};

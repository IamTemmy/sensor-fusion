/** Indexed min-heap. Decreasing a key preserves its first-insertion tie order. */
export class RouteQueue {
 private heap:number[]=[];
 private position:Int32Array;
 private priority:Float64Array;
 private order:Int32Array;
 private serial=0;
 constructor(size:number){this.position=new Int32Array(size).fill(-1);this.priority=new Float64Array(size);this.order=new Int32Array(size);}
 get length(){return this.heap.length;}
 private before(a:number,b:number){return this.priority[a]<this.priority[b]||this.priority[a]===this.priority[b]&&this.order[a]<this.order[b];}
 private swap(a:number,b:number){const x=this.heap[a],y=this.heap[b];this.heap[a]=y;this.heap[b]=x;this.position[x]=b;this.position[y]=a;}
 decrease(id:number,priority:number){let i=this.position[id];this.priority[id]=priority;if(i<0){i=this.heap.length;this.position[id]=i;this.order[id]=this.serial++;this.heap.push(id);}while(i>0){const p=(i-1)>>1;if(!this.before(this.heap[i],this.heap[p]))break;this.swap(i,p);i=p;}}
 pop(){const id=this.heap[0],last=this.heap.pop()!;this.position[id]=-1;if(this.heap.length){this.heap[0]=last;this.position[last]=0;let i=0;for(;;){const a=i*2+1,b=a+1;let next=i;if(a<this.heap.length&&this.before(this.heap[a],this.heap[next]))next=a;if(b<this.heap.length&&this.before(this.heap[b],this.heap[next]))next=b;if(next===i)break;this.swap(i,next);i=next;}}return id;}
}

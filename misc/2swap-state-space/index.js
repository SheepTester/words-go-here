var _=class{#t=[];#e=0;#i=0;#o(){return this.#e===this.#t.length}length(){return this.#o()?0:this.#e<=this.#i?this.#i-this.#e+1:this.#t.length-this.#e+this.#i}pushRight(o){if(this.#o()){this.#t.length>0?this.#t[0]=o:this.#t.push(o),this.#e=0,this.#i=0;return}let g=(this.#i+1)%this.#t.length;g===this.#e?(this.#e>0&&(this.#t=this.#e<=this.#i?this.#t.slice(this.#e,this.#i+1):[...this.#t.slice(this.#e),...this.#t.slice(0,this.#i+1)],this.#e=0),this.#i=this.#t.length,this.#t.push(o)):(this.#t[g]=o,this.#i=g)}peekLeft(){return this.#o()?null:this.#t[this.#e]}popLeft(){if(this.#o())return null;let o=this.#t[this.#e];return this.#e===this.#i?this.#e=this.#t.length:(this.#e++,this.#e%=this.#t.length),o}peekRight(){return this.#o()?null:this.#t[this.#i]}popRight(){if(this.#o())return null;let o=this.#t[this.#i];return this.#e===this.#i?this.#e=this.#t.length:(this.#i+=this.#t.length-1,this.#i%=this.#t.length),o}};function B(t,o){let g=new Int32Array(t.width*t.height);g.fill(-1);for(let[f,d]of t.blocks.entries()){let{left:m,top:k}=o[f];for(let w=0;w<d.height;w++)for(let b=0;b<d.width;b++)g[(k+w)*t.width+m+b]=f}let s="";for(let[f,d]of g.entries())f>0&&f%t.width===0&&(s+=`
`),s+=d===-1?" ":d.toString(36).toUpperCase();return s}function V(t,o,g){let s={},f=new Set,d=new _,m=new Uint8Array(t.width*t.height*2),k=l=>{m.fill(0);for(let[n,i]of t.blocks.entries()){let{left:h,top:a}=l[n];for(let r=0;r<i.height;r++)for(let e=0;e<i.width;e++)m[((a+r)*t.width+h+e)*2]=+i.canHorizontal*128|i.width,m[((a+r)*t.width+h+e)*2+1]=+i.canVertical*128|i.height}return m.join(" ")},w=(l,n)=>{let i=k(l);s[i]||(s[i]={state:l,neighbors:new Set,prev:s[n]},d.pushRight(i)),s[i].neighbors.add(s[n]),s[n].neighbors.add(s[i]),f.add(i<n?`${i}-${n}`:`${n}-${i}`)},b=k(o);s[b]={state:o,neighbors:new Set},d.pushRight(b);let v=new Uint8Array(t.width*t.height);for(;;){let l=g==="breadth"?d.popLeft():d.popRight();if(l===null)break;let n=s[l].state;v.fill(0);for(let[i,h]of t.blocks.entries()){let{left:a,top:r}=n[i];for(let e=0;e<h.height;e++)for(let c=0;c<h.width;c++)v[(r+e)*t.width+a+c]=1}for(let[i,h]of t.blocks.entries()){let{left:a,top:r}=n[i];if(h.canHorizontal){t:if(a>0){for(let e=0;e<h.height;e++)if(v[(r+e)*t.width+a-1])break t;w(n.map((e,c)=>c===i?{left:a-1,top:r}:e),l)}t:if(a<t.width-h.width){for(let e=0;e<h.height;e++)if(v[(r+e)*t.width+a+h.width])break t;w(n.map((e,c)=>c===i?{left:a+1,top:r}:e),l)}}if(h.canVertical){t:if(r>0){for(let e=0;e<h.width;e++)if(v[(r-1)*t.width+a+e])break t;w(n.map((e,c)=>c===i?{left:a,top:r-1}:e),l)}t:if(r<t.height-h.height){for(let e=0;e<h.width;e++)if(v[(r+h.height)*t.width+a+e])break t;w(n.map((e,c)=>c===i?{left:a,top:r+1}:e),l)}}}}return{nodes:Object.values(s),edges:Array.from(f,l=>{let[n,i]=l.split("-");return[s[n],s[i]]})}}var N=`struct Node {
  pos: vec3f,
  vel: vec3f,
}

@binding(0) @group(0) var<storage, read> nodes_in: array<Node>;
@binding(1) @group(0) var<storage, read_write> nodes_out: array<Node>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
  var index = global_invocation_id.x;

  var node_pos = nodes_in[index].pos;
  var node_vel = nodes_in[index].vel;
  var pos: vec3f;
  var vel: vec3f;

  for (var i = 0u; i < arrayLength(&nodes_in); i++) {
    if (i == index) {
      continue;
    }

    pos = nodes_in[i].pos.xyz;
    vel = nodes_in[i].vel.xyz;
  }

  nodes_out[index].pos = node_pos;
  nodes_out[index].vel = node_vel;
}
`;var H={width:4,height:5,blocks:[{width:1,height:2,canHorizontal:!0,canVertical:!0},{width:2,height:2,canHorizontal:!0,canVertical:!0},{width:1,height:2,canHorizontal:!0,canVertical:!0},{width:1,height:2,canHorizontal:!0,canVertical:!0},{width:2,height:1,canHorizontal:!0,canVertical:!0},{width:1,height:1,canHorizontal:!0,canVertical:!0},{width:1,height:1,canHorizontal:!0,canVertical:!0},{width:1,height:2,canHorizontal:!0,canVertical:!0},{width:1,height:1,canHorizontal:!0,canVertical:!0},{width:1,height:1,canHorizontal:!0,canVertical:!0}]},u=V(H,[{left:0,top:0},{left:1,top:0},{left:3,top:0},{left:0,top:2},{left:1,top:2},{left:1,top:3},{left:2,top:3},{left:3,top:2},{left:0,top:4},{left:3,top:4}],"breadth");console.log(u);var R=0,S="",x=u.nodes[u.nodes.length-1];for(;x;)S=`${B(H,x.state)}

${S}`,x=x.prev,x&&R++;console.groupCollapsed(`Longest path (${R} moves)`);console.log(S);console.groupEnd();console.log("max neighbors",u.nodes.reduce((t,o)=>Math.max(t,o.neighbors.size),0));console.log("avg neighbors",u.nodes.reduce((t,o)=>t+o.neighbors.size,0)/u.nodes.length);var A=await navigator.gpu.requestAdapter();if(!A)throw new TypeError("Failed to obtain WebGPU adapter.");var y=await A.requestDevice(),M=y.createComputePipeline({layout:"auto",compute:{module:y.createShaderModule({code:N})}}),p=new Float32Array(u.nodes.length*6);for(let t=0;t<u.nodes.length;++t)p[t*6+0]=2*(Math.random()-.5),p[t*6+1]=2*(Math.random()-.5),p[t*6+2]=2*(Math.random()-.5),p[t*6+3]=2*(Math.random()-.5)*.1,p[t*6+4]=2*(Math.random()-.5)*.1,p[t*6+5]=2*(Math.random()-.5)*.1;var G=Array.from({length:2},t=>{let o=y.createBuffer({size:p.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE,mappedAtCreation:!0});return new Float32Array(o.getMappedRange()).set(p),o.unmap(),o}),L=G.map((t,o)=>y.createBindGroup({layout:M.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:t,offset:0,size:p.byteLength}},{binding:1,resource:{buffer:G[(o+1)%G.length],offset:0,size:p.byteLength}}]})),T=y.createCommandEncoder(),z=T.beginComputePass();z.setPipeline(M);z.setBindGroup(0,L[0]);z.dispatchWorkgroups(Math.ceil(u.nodes.length/64));z.end();y.queue.submit([T.finish()]);

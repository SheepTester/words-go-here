function Shep(elmname,attrs,evlis,parent) {
  attrs=attrs||{};
  evlis=evlis||{};
  parent=parent||null;
  if (attrs.ns) {
    this.e=document.createElementNS('http://www.w3.org/2000/svg',elmname);
    for (var span in attrs) this.e.setAttributeNS(null,span,attrs[span]);
  } else {
    this.e=document.createElement(elmname);
    for (var span in attrs) this.e.setAttribute(span,attrs[span]);
  }
  for (var span in evlis)
    if (typeof evlis[span]==='function') this.e.addEventListener(span,evlis[span],{passive:false});
    else for (var i=0;i<evlis[span].length;i++) this.e.addEventListener(span,evlis[span][i],{passive:false});
  if (parent) {
    if (typeof parent==='object') parent.appendChild(this.e);
    else if (parent==='b'||parent==='body'||parent='db') document.body.appendChild(this.e);
    else if (parent==='h'||parent==='head'||parent='dh') document.body.appendChild(this.e);
    else if (parent==='doc'||parent==='document'||parent='d') document.appendChild(this.e);
  }
  this.move=elem=>{
    elem.appendChild(this.e);
  };
}
Shep.move=(de,a)=>a.appendChild(de);
Shep.empty=node=>{
  while (node.hasChildNodes()) node.removeChild(node.lastChild);
};

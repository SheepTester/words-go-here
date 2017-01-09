function line(content,id) {
  var content,id;
  this.representative=document.createElement('line');
  this.representative.setAttribute('contenteditable','');
  this.representative.setAttribute('spellcheck','false');
  this.representative.appendChild(document.createTextNode(content||''));
  this.representative.oninput=()=>{
    var val=this.representative.innerHTML;
    if (/<div><br><\/div>/.test(val)) {
      this.representative.innerHTML=val.replace(/<div><br><\/div>/,'');
      let messyshtuff=new line('',id+1);
    }
  };
  if (!id) {
    id=lines.length;
    lines.push(this);
  } else {
    lines.splice(id,0,this);
  }
  document.querySelector('#editor').insertBefore(this.representative,document.querySelector('#editor > line:nth-child('+id+')'));
}
var lines=[];
(function () {
  var shep=new line('test'),
  purple=new line('teehee');
})();

var lines=[],linesinline,charwidth=(function(){
  let clone=document.createElement('span');
  clone.className='getTextLength';
  clone.innerHTML='GIGGLES';
  clone.style.fontFamily=document.defaultView.getComputedStyle(document.querySelector('editor')).fontFamily;
  clone.style.fontSize='15px';
  document.body.appendChild(clone);
  let smth=clone.offsetWidth/'GIGGLES'.length;
  document.body.removeChild(clone);
  return smth;
})();
function line(editor,content,id) {
  var content,id;
  this.rep=document.createElement('line');
  this.text=document.createTextNode(content||'');
  this.rep.appendChild(this.text);
  if (id) {
    editor.insertBefore(this.rep,editor.children[id]);
    lines.splice(id,0,this);
  } else {
    editor.appendChild(this.rep);
    lines.push(this);
  }
  this.val=function(){
    return this.text.nodeValue;
  };
  this.update=function(newcontent){
    this.text.nodeValue=newcontent;
  };
  this.suicide=()=>{
    var i,dearChild=this.rep;
    for (i=0;(dearChild=dearChild.previousSibling);i++); // http://stackoverflow.com/questions/5913927/get-child-node-index
    editor.removeChild(this.rep);
    lines.splice(i,1);
    // good bye, cruel world...
  };
}
function cursor(editor) {
  this.line=1;
  this.col=1;
  this.rep=document.createElement('cursor');
  this.rep.style.width=charwidth+'px';
  this.rep.style.top='0px';
  this.rep.style.left='0px';
  this.input=document.createElement('textarea');
  this.input.value=' ';
  this.input.classList.add('input');
  this.input.onblur=()=>{this.input.focus()}; // keep focus on the cursor
  this.input.onkeydown=(e)=>{
    switch (e.keyCode) {
      case 38:
        this.line--;
        if (lines[this.line-1]&&this.col>lines[this.line-1].val().length+1) this.col=lines[this.line-1].val().length+1;
        break;
      case 40:
        this.line++;
        if (lines[this.line-1]&&this.col>lines[this.line-1].val().length+1) this.col=lines[this.line-1].val().length+1;
        break;
      case 37:
        this.col--;
        break;
      case 39:
        this.col++;
        break;
    }
    if (this.col<1) {
      if (this.line<=1)
        this.col=1;
      else {
        this.line--;
        this.col=lines[this.line-1].val().length+1;
      }
    }
    if (this.line>=1&&this.line<=lines.length&&this.col>lines[this.line-1].val().length+1) {
      if (this.line>=lines.length)
        this.col=lines[this.line-1].val().length+1;
      else {
        this.line++;
        this.col=1;
      }
    }
    if (this.line<1) {
      this.line=1;
      this.col=1;
    }
    if (this.line>lines.length) {
      this.line=lines.length;
      this.col=lines[this.line-1].val().length+1;
    }
    // console.log(this.line+':'+this.col);
    if (e.keyCode>=37&&e.keyCode<=40) {
      this.moveCursor();
      e.preventDefault(); // prevent user from moving cursor in textarea :P
    }
  };
  this.input.oninput=()=>{
    // lines[this.line-1].splice()
    if (this.input.value) {
      if (/\r|\n/.test(this.input.value)) {
        // line break
        let val=lines[this.line-1].val(),
        giggles=new line(editor,val.slice(this.col-1),this.line);
        lines[this.line-1].update(val.slice(0,this.col-1));
        this.line++;
        this.col=1;
      } else {
        let val=lines[this.line-1].val(),input=this.input.value.slice(1);
        // add text normally
        val=val.slice(0,this.col-1)+input+val.slice(this.col-1);
        lines[this.line-1].update(val);
        this.col+=input.length;
      }
    } else {
      // delete text
      if (this.col===1) {
        if (this.line>1) {
          this.col=lines[this.line-2].val().length+1;
          lines[this.line-2].update(lines[this.line-2].val()+lines[this.line-1].val());
          lines[this.line-1].suicide();
          this.line--;
        }
      } else {
        let val=lines[this.line-1].val();
        val=val.slice(0,this.col-2)+val.slice(this.col-1);
        lines[this.line-1].update(val);
        this.col--;
      }
    }
    this.input.value=' ';
    this.moveCursor();
  };
  this.moveCursor=()=>{
    this.rep.style.top=(document.querySelector('line').offsetHeight*(this.line-1))+'px';
    this.rep.style.left=(charwidth*(this.col-1))+'px';
  };
  editor.appendChild(this.rep);
  document.body.appendChild(this.input);
  this.input.focus();
}
(function(){
  var editor=document.querySelector('editor'),
  firstline=new line(editor,'test lol'),
  secondline=new line(editor,'wow cool mate'),
  curs=new cursor(editor);
})();

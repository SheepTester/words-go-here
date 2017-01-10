function widthOf(text,fontCSS) {
  var fontCSS;
  if (!fontCSS) fontCSS='15px '+document.defaultView.getComputedStyle(document.querySelector('editor')).fontFamily;
  let clone=document.createElement('span');
  clone.className='getTextLength';
  clone.innerHTML=text;
  clone.style.font=fontCSS;
  document.body.appendChild(clone);
  let smth=clone.offsetWidth;
  document.body.removeChild(clone);
  return smth;
}
var lines=[],linesinline;
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
function cursor(editor,initLine,initCol,initLineSel,initColSel) {
  var initLine,initCol,initLineSel,initColSel;
  this.line=initLine||1;
  this.col=initCol||1;
  this.lineSel=initLineSel||undefined;
  this.colSel=initColSel||undefined;
  this.rep=document.createElement('cursor');
  this.rep.style.width='1px';
  this.select=document.createElement('canvas');
  this.select.classList.add('selection');
  this.input=document.createElement('textarea');
  this.input.value=' ';
  this.input.classList.add('input');
  this.input.onblur=()=>{this.input.focus()}; // keep focus on the cursor
  this.input.onkeydown=(e)=>{
    var defaulted=false;
    if (e.keyCode>=37&&e.keyCode<=40) {
      if (e.shiftKey) {
        if (this.lineSel||this.colSel) {
          this.lineSel=this.line;
          this.colSel=this.col;
        }
      } else if (this.lineSel||this.colSel) {
        this.lineSel=undefined;
        this.colSel=undefined;
      }
    }
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
      case 9:
        if (e.shiftKey) {
          if (lines[this.line-1].val().slice(0,2)==='  ') {
            lines[this.line-1].update(lines[this.line-1].val().slice(2));
            this.col-=2;
          }
        } else {
          lines[this.line-1].update('  '+lines[this.line-1].val());
          this.col+=2;
        }
        break;
      case 46:
        if (this.col===lines[this.line-1].val().length+1) {
          if (this.line<lines.length) {
            lines[this.line].update(lines[this.line-1].val()+lines[this.line].val());
            lines[this.line-1].suicide();
          }
        } else {
          let val=lines[this.line-1].val();
          val=val.slice(0,this.col-1)+val.slice(this.col);
          lines[this.line-1].update(val);
        }
        break;
      default:
        defaulted=true;
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
    if (!defaulted) {
      this.moveCursor();
      this.rep.classList.add('moving');
      e.preventDefault(); // prevent user from moving cursor in textarea :P
    }
    // console.log(this.line+':'+this.col);
  };
  this.input.onkeyup=()=>{
    this.rep.classList.remove('moving');
  };
  this.input.oninput=()=>{
    // lines[this.line-1].splice()
    if (this.lineSel||this.colSel) {
      if (this.line===this.lineSel) {
        var selIsBehind=this.col>this.colSel;
        let val=lines[this.line-1].val();
        val=val.slice(0,(selIsBehind?this.colSel:this.col)-1)+val.slice((selIsBehind?this.col:this.colSel)-1);
        lines[this.line-1].update(val);
        if (selIsBehind) this.col=this.colSel-1;
      } else {
        var selIsBehind=this.line>this.lineSel,
        currentLine=selIsBehind?this.lineSel:this.line,
        destLine=selIsBehind?this.line:this.lineSel;
        for (var i=currentLine;i<=destLine;i++) {
          if (i==currentLine) {
            // first line
          } else if (i==destLine) {
            // last line
          } else {
            // whole lines
          }
        }
      }
    }
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
    } else if (!(this.lineSel||this.colSel)) {
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
    if (this.lineSel||this.colSel) {
      this.lineSel=undefined;
      this.colSel=undefined;
    }
    this.input.value=' ';
    this.moveCursor();
  };
  this.moveCursor=()=>{
    if (this.lineSel||this.colSel) {
      this.rep.style.display='none';
      this.select.style.display='block';
      this.renderSelect();
    } else {
      this.rep.style.display='block';
      this.select.style.display='none';
      this.rep.style.top=(document.querySelector('line').offsetHeight*(this.line-1))+'px';
      this.rep.style.left=widthOf(lines[this.line-1].val().slice(0,this.col-1))+'px';
      function isElementInViewport(el) {
        // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
        var rect=el.getBoundingClientRect();
        return (
          rect.top>=0&&
          rect.left>=0&&
          rect.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&
          rect.right<=(window.innerWidth||document.documentElement.clientWidth)
        );
      }
      if (!isElementInViewport(this.rep)) this.rep.scrollIntoView();
    }
  };
  editor.onclick=(e)=>{
    let lineheight=document.querySelector('line').offsetHeight;
    this.line=Math.floor((e.clientY-editor.getBoundingClientRect().top)/lineheight)+1;
    this.col=Math.floor((e.clientX-editor.getBoundingClientRect().left)/widthOf('.'));
    if (this.line>lines.length) this.line=lines.length;
    if (this.line<1) this.line=1;
    if (this.col>lines[this.line-1].val().length+1) this.col=lines[this.line-1].val().length+1;
    if (this.col<1) this.col=1;
    if (this.colSel||this.lineSel) {
      this.lineSel=undefined;
      this.colSel=undefined;
    }
    this.moveCursor();
  };
  this.renderSelect=()=>{
    this.select.width=editor.offsetWidth;
    this.select.height=editor.offsetHeight;
    if (this.lineSel&&this.colSel) {
      var c=this.select.getContext('2d'),lineHeight=document.querySelector('line').offsetHeight;
      if (this.lineSel===this.line&&this.col===this.colSel) {
        this.lineSel=undefined;
        this.colSel=undefined;
        return 'hapes';
      }
      c.fillStyle="rgba(255,255,255,0.3)";
      if (this.line===this.lineSel) {
        var selIsBehind=this.col>this.colSel;
        c.fillRect(
          widthOf(lines[this.line-1].val().slice(0,(selIsBehind?this.colSel:this.col)-1)),
          lineHeight*(this.line-1),
          widthOf(lines[this.line-1].val().slice((selIsBehind?this.colSel:this.col)-1)),
          lineHeight
        );
      } else {
        var selIsBehind=this.line>this.lineSel,
        currentLine=selIsBehind?this.lineSel:this.line,
        destLine=selIsBehind?this.line:this.lineSel;
        for (var i=currentLine;i<=destLine;i++) {
          if (i==currentLine) {
            c.fillRect(
              widthOf(lines[i-1].val().slice(0,(selIsBehind?this.colSel:this.col)-1)),
              lineHeight*(i-1),
              widthOf(lines[i-1].val().slice((selIsBehind?this.colSel:this.col)-1)+' '),
              lineHeight
            );
          } else if (i==destLine) {
            c.fillRect(
              0,
              lineHeight*(i-1),
              widthOf(lines[i-1].val().slice(0,(selIsBehind?this.col:this.colSel)-1)),
              lineHeight
            );
          } else {
            c.fillRect(
              0,
              lineHeight*(i-1),
              widthOf(lines[i-1].val()+' '),
              lineHeight
            );
          }
        }
      }
    }
  };
  editor.appendChild(this.rep);
  editor.appendChild(this.select);
  this.moveCursor();
  document.body.appendChild(this.input);
  this.input.focus();
}
(function(){
  let editor=document.querySelector('editor'),
  firstline=new line(editor,'                      29feb\'17'),
  secondline=new line(editor,'Dear Bob:'),
  thirdline=new line(editor,''),
  fourthline=new line(editor,'  How does one properly hold a spoon? I don\'t know.'),
  fifthline=new line(editor,''),
  sixthline=new line(editor,' - Chad'),
  curs=new cursor(editor,4,39,4,51);
})();

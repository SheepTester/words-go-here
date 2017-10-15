class Point {
  constructor(x,y) {
    this.x=x;
    this.y=y;
  }
}
class Line {
  constructor(point1,point2) {
    this.pt1=point1;
    this.pt2=point2;
    this.slope=(this.pt1.y-this.pt2.y)/(this.pt1.x-this.pt2.x);
    if (this.slope===-Infinity) this.slope=Infinity;
  }
  contains(point) {
    if (this.slope===Infinity) {
      return this.pt1.x=point.x;
    } else {
      return this.pt1.y-point.y===this.slope*(this.pt1.x-point.x);
    }
  }
  intersect(line) {
    if (this.slope===line.slope) return null;
    if (this.slope===Infinity) {
      return new Point(this.pt1.x,line.yAt(this.pt1.x));
    } else if (line.slope===Infinity) {
      return new Point(line.pt1.x,this.yAt(line.pt1.x));
    } else {
      var x=(this.slope*this.pt1.x-line.slope*line.pt1.x+line.pt1.y-this.pt1.y)/(this.slope-line.slope);
      return new Point(Math.round(x*10000)/10000,Math.round((this.slope*(x-this.pt1.x)+this.pt1.y)*10000)/10000);
    }
  }
  xAt(y) {
    if (this.slope===0) return NaN;
    else return (y-this.pt1.y)*this.slope+this.pt1.x;
  }
  yAt(x) {
    if (this.slope===Infinity) return NaN;
    else return this.slope*(x-this.pt1.x)+this.pt1.y;
  }
}
class Rectangle {
  constructor(point1,point2) {
    this.minpt=new Point(Math.min(point1.x,point2.x),Math.min(point1.y,point2.y));
    this.maxpt=new Point(Math.max(point1.x,point2.x),Math.max(point1.y,point2.y));
    this.top=new Line(new Point(this.minpt.x,this.minpt.y),new Point(this.maxpt.x,this.minpt.y));
    this.left=new Line(new Point(this.minpt.x,this.minpt.y),new Point(this.minpt.x,this.maxpt.y));
    this.right=new Line(new Point(this.maxpt.x,this.minpt.y),new Point(this.maxpt.x,this.maxpt.y));
    this.bottom=new Line(new Point(this.minpt.x,this.maxpt.y),new Point(this.maxpt.x,this.maxpt.y));
  }
  contains(point) {
    return point.x>=this.minpt.x&&point.x<=this.maxpt.x&&point.y>=this.minpt.y&&point.y<=this.maxpt.y;
  }
  clip(line) {
    if (this.contains(line.pt1)&&this.contains(line.pt2)) return line;
    if (!this.contains(line.pt1)&&!this.contains(line.pt2)) return null;
    if (line.slope===Infinity) {
      if (!this.contains(new Point(line.pt1.x,this.minpt.y))) return null;
    } else if (line.slope===0) {
      if (!this.contains(new Point(this.minpt.x,line.pt1.y))) return null;
    } else if (!this.contains(line.intersect(this.top))&&!this.contains(line.intersect(this.left))&&!this.contains(line.intersect(this.right))) return null;
    var pt1=line.pt1.y<line.pt2.y?line.pt1:line.pt2,
    pt2=line.pt1.y<line.pt2.y?line.pt2:line.pt1;
    if (!this.contains(pt1)) {
      pt1=line.intersect(this.top);
      if (!pt1||!this.contains(pt1)) pt1=line.intersect(line.slope<=0?this.right:this.left);
    };
    if (!this.contains(pt2)) {
      pt2=line.intersect(this.bottom);
      if (!pt2||!this.contains(pt2)) pt2=line.intersect(line.slope<=0?this.left:this.right);
    };
    return new Line(pt1,pt2);
  }
}

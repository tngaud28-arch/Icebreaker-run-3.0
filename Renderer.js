import{OceanRenderer}from'./OceanRenderer.js';
export class Renderer{
  constructor(c){
    this.c=c;
    this.ocean=new OceanRenderer();
    this.w=0;
    this.h=0;
  }
  resize(w,h,dpr){
    this.w=w;
    this.h=h;
    this.c.canvas.width=Math.floor(w*dpr);
    this.c.canvas.height=Math.floor(h*dpr);
    this.c.setTransform(dpr,0,0,dpr,0,0);
  }
  draw(t,icebergs,boat){
    this.ocean.draw(this.c,this.w,this.h,t);
    icebergs.forEach(x=>x.draw(this.c));
    boat.draw(this.c,this.w);
  }
}
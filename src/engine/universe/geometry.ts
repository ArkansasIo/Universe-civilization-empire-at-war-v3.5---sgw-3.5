import type { Bounds3, GalaxyShape, Vec3 } from "./types";
import { randomFloat, randomInt } from "./rng";
export const round=(n:number,p=1000)=>Math.round(n*p)/p;
export function distance(a:Vec3,b:Vec3):number { const x=a.x-b.x,y=a.y-b.y,z=a.z-b.z; return Math.sqrt(x*x+y*y+z*z); }
export function midpoint(a:Vec3,b:Vec3):Vec3{return{x:round((a.x+b.x)/2),y:round((a.y+b.y)/2),z:round((a.z+b.z)/2)};}
export function galaxySystemPosition(shape:GalaxyShape,radius:number,r:()=>number,index:number,count:number):Vec3 {
 const angle=index/Math.max(1,count)*Math.PI*2+(r()-.5)*.22; const radial=Math.sqrt(r())*radius; let x=Math.cos(angle)*radial,y=(r()-.5)*radius*.15,z=Math.sin(angle)*radial;
 if(shape==="spiral"||shape==="barred-spiral"){const arm=randomInt(r,0,3);const a=angle+radial/Math.max(radius,1)*Math.PI*2.2+arm*Math.PI/2;x=Math.cos(a)*radial;z=Math.sin(a)*radial;if(shape==="barred-spiral")x*=.72;}
 else if(shape==="elliptical"){z*=.58;y=(r()-.5)*radius*.3;}
 else if(shape==="ring"){const rr=radius*(.72+r()*.22);x=Math.cos(angle)*rr;z=Math.sin(angle)*rr;y=(r()-.5)*radius*.05;}
 else if(shape==="irregular"){x+=(r()-.5)*radius*.4;z+=(r()-.5)*radius*.4;y=(r()-.5)*radius*.25;}
 else y=(r()-.5)*radius*.5;
 return{x:round(x),y:round(y),z:round(z)};
}
export function boundsOf(points:Vec3[]):Bounds3 { if(!points.length)return{min:{x:0,y:0,z:0},max:{x:0,y:0,z:0}}; return points.reduce((b,p)=>({min:{x:Math.min(b.min.x,p.x),y:Math.min(b.min.y,p.y),z:Math.min(b.min.z,p.z)},max:{x:Math.max(b.max.x,p.x),y:Math.max(b.max.y,p.y),z:Math.max(b.max.z,p.z)}}),{min:{...points[0]!},max:{...points[0]!}}); }
export function scale(v:Vec3,s:number):Vec3{return{x:round(v.x*s),y:round(v.y*s),z:round(v.z*s)};}

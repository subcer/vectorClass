console.clear()

//設定初始位置
var Vector = function(x,y){
  this.x = x
  this.y = y
}
//移動位置
Vector.prototype.move = function(x,y){
  this.x += x
  this.y += y
  
  return this
}
//向量相加
Vector.prototype.add = function(v){
  return new Vector(this.x+v.x,this.y+v.y)
}
//向量 物件轉成字串
Vector.prototype.toString = function(v){
  return "("+this.x+","+this.y+")"
}
//向量相減
Vector.prototype.sub = function(v){
  return new Vector(this.x-v.x,this.y-v.y)
}
//向量相乘
Vector.prototype.mul = function(s){
  return new Vector(this.x*s,this.y*s)
}
//向量長度
Vector.prototype.length = function(){
  return Math.sqrt(this.x*this.x+this.y*this.y)
}
Vector.prototype.angle = function(){
  return Math.atan2(this.y,this.x)
}
Vector.prototype.set = function(x,y){
  this.x = x
  this.y = y
  return this
}
Vector.prototype.equal = function(v){
  return (this.x==v.x) && (this.y==v.y)
}
Vector.prototype.clone = function(){
  return new Vector(this.x,this.y)
}



//抓取canvas
var canvas = document.getElementById("mycanvas")
var ctx = canvas.getContext("2d")

ww = canvas.width = window.innerWidth
wh = canvas.height = window.innerHeight

//更新視窗大小 也跟著更新
window.addEventListener("resize",function(){
  //設定寬高滿版
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
})
//定義球的類別
var Ball = function(){
  this.p = new Vector(ww/2,wh/2)
  this.v = new Vector(-10,3)
  this.a = new Vector(0,1)
  this.r = 50
  this.dragging = false
}
//繪製這顆球
Ball.prototype.draw = function(){
  ctx.beginPath()
  ctx.save()
    ctx.translate(this.p.x,this.p.y)
    ctx.arc(0,0,this.r,0,Math.PI*2)
    ctx.fillStyle = controls.color
    ctx.fill()
  ctx.restore()
  
  this.drawV()
}
Ball.prototype.drawV = function(){
  ctx.beginPath()
  ctx.save()  
    ctx.translate(this.p.x,this.p.y)
    ctx.scale(3,3)
    ctx.moveTo(0,0)
    ctx.lineTo(this.v.x,this.v.y)
    ctx.strokeStyle = "blue"
    ctx.stroke()
  
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(this.v.x,0)
    ctx.strokeStyle = "red"
    ctx.stroke()    
  
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(0,this.v.y)
    ctx.strokeStyle = "green"
    ctx.stroke()
  
  ctx.restore() 
}
//更新球的位置
Ball.prototype.update = function(){
  if(this.dragging == false){
    //更新位置
    this.p = this.p.add(this.v)
    //更新速度
    this.v = this.v.add(this.a)
    //速度的摩擦力
    this.v = this.v.mul(controls.fade)

    ///把最新的數值更新到控制器上
    controls.vx = this.v.x
    controls.vy = this.v.y
    controls.ay = this.a.y
    //檢查邊界碰撞
    this.checkBoundary()
  }  

}
Ball.prototype.checkBoundary = function(){
  if(this.p.x + this.r > ww){
    this.v.x = -Math.abs(this.v.x)
  }
  if(this.p.x - this.r < 0){
    this.v.x = Math.abs(this.v.x)
  }
  if(this.p.y + this.r > wh){
    this.v.y = -Math.abs(this.v.y)
  }
  if(this.p.y - this.r < 0){
    this.v.y = Math.abs(this.v.y)
  }
}
//設定控制項
var controls = {
  vx: 0,
  vy: 0,
  ay: 0.6,
  fade: 0.99,
  update: true,
  color: "#fff",
  step: function(){
    ball.update()
  },
  FPS: 30
}
//初始化控制介面
var gui = new dat.GUI()
//listen 雙向監聽變動，onchange 掛載變動事件
gui.add(controls,"vx",-50,50).listen().onChange(function(value){
  ball.v.x = value
})
gui.add(controls,"vy",-50,50).listen().onChange(function(value){
  ball.v.y = value
})

gui.add(controls,"ay",-1,1).step(0.001).listen().onChange(function(value){
  ball.a.y = value
})
gui.add(controls,"fade",0,1).step(0.001).listen()
gui.add(controls,"update")
gui.addColor(controls,"color")
gui.add(controls,"step")
gui.add(controls,"FPS",1,120)

//新增一顆球
var ball
function init(){
  //初始化
  ball = new Ball()
}
init()

//固定時間的更新
function update(){
  if(controls.update){
    ball.update()
  }
}

setInterval(update,1000/30)


function draw(){
  ctx.fillStyle = "rgba(0,0,0,0.5)"
  ctx.fillRect(0,0,ww,wh)
  
  ball.draw()  
  setTimeout(draw,1000/controls.FPS)
}
requestAnimationFrame(draw)

let mousePos = {x: 0,y: 0}

function getDistanece(p1,p2){
  let temp1 = p1.x - p2.x
  let temp2 = p1.y - p2.y
  
  let dist = Math.pow(temp1,2) + Math.pow(temp2,2)
  return Math.sqrt(dist)
}

canvas.addEventListener("mousedown",function(evt){
  mousePos = new Vector(evt.x,evt.y)
  console.log(mousePos)
  let dist = mousePos.sub(ball.p).length()
  if(dist < ball.r){
    console.log("ball checked")
    ball.dragging = true
  }
})
canvas.addEventListener("mousemove",function(evt){
  let nowPos = new Vector(evt.x,evt.y)
  if(ball.dragging){
    
    //滑鼠跟前個位置的變化量
    let delta = nowPos.sub(mousePos)
    // let dx = nowPos.x - mousePos.x
    // let dy = nowPos.y - mousePos.y
        
    //球的位置新增變化量
    ball.p = ball.p.add(delta)
    // ball.p.x += dx
    // ball.p.y += dy
    
    
    //球的速度為最後變化的量
    ball.v = delta.clone()
    // ball.v.x = dx 
    // ball.v.y = dy
  }
  
  //如果移動時滑鼠在球上，提示可以按
  let dist = getDistanece(nowPos,ball.p)
  if(dist<ball.r){
    canvas.style.cursor = "move"
  }
  else{
    canvas.style.cursor = "initial"
  }
  //更新滑鼠位置
  mousePos = nowPos
})
//滑鼠放開
canvas.addEventListener("mouseup",function(evt){
  ball.dragging = false
})


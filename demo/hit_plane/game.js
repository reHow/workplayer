class Flying{
    img
    x
    y
    width
    height
    life
    speedX
    speedY
    dead
    constructor(x=0,y=0,imgsrc="./assets/no-img.png"){
        this.img=getImgNode(imgsrc)
        this.img.classList.add("flying")
        this.x=x
        this.y=y
        this.speedX=5        
        this.speedY=5
        this.width=this.img.width
        this.height=this.img.height
        this.dead=false
    }
    draw(){
        this.img.style.left=this.x-this.width/2+'px'
        this.img.style.top=this.y-this.height/2+'px'
    }
    isCrashOther(other){
        let left=this.x
        let oLeft=other.x
        let right=this.x+this.width
        let oRight=other.x+other.width
        let top=this.y
        let oTop=other.y
        let bottom=this.y+this.height
        let oBottom=other.y+other.height
        if(     (numInArea(top,oTop,oBottom)  || numInArea(bottom,oTop,oBottom))
            &&  (numInArea(left,oLeft,oRight) || numInArea(right,oLeft,oRight))){
                return true
        }
        return false
    }
    isCrashPoint(x,y){
        let left=this.x
        let right=this.x+this.width
        let top=this.y
        let bottom=this.y+this.height
        if(numInArea(x+this.width/2,left,right) && numInArea(y+this.height/2,top,bottom)){
            return true
        }
        return false
    }
}
class Player extends Flying{
    constructor(x,y){
        super(x,y,"./assets/plane.png")
        this.img.classList.add("player")
        this.life=3
    }
}
class Enemy extends Flying{
    constructor(x,y){
        super(x,y,"./assets/enemy.png")
        this.img.classList.add("enemy")
        this.life=1
        this.score=10
    }
    step(player){
        this.y+=this.speedY
        if(this.isCrashOther(player)){
            this.life--
            player.life--
            if(this.life<=0){
                this.dead=true
            }
        }
    }
}
class Bullet extends Flying{
    constructor(x,y){
        super(x,y,"./assets/bullet.png")
        this.img.classList.add("bullet")
        this.life=1
        this.speedY=40
    }
    step(enemies){
        this.y-=this.speedY
        enemies.forEach(enemy => {
            if(this.life>0 && enemy.life>0 && enemy.isCrashPoint(this.x,this.y)){
                this.life--
                enemy.life--
                if(enemy.life<=0){
                    enemy.dead=true
                }
                if(this.life<=0){
                    this.dead=true
                }
            }
        });
    }
}
class Game{
    gameboard=dq(".gaming")
    pointX
    pointY
    player
    enemies
    bullets
    hard
    score
    timer
    animate
    gameover
    updateTime
    gapBullet=5
    gapEnemy=5
    gapCount=0
    constructor(){
        this.updateTime=50
        this.pointHandle=this.pointHandle.bind(this)
        this.keyboardHandle=this.keyboardHandle.bind(this)
        this.animateHandle=this.animateHandle.bind(this)
        this.timerHandle=this.timerHandle.bind(this)
        this.clearGame()
        this.gameStart()
    }
    pointHandle(e){
        this.pointX=e.clientX
        this.pointY=e.clientY
    }
    timerHandle(){
        this.player.x=this.pointX
        this.player.y=this.pointY
        this.gapCount++
        if(this.gapCount%this.gapBullet===0){
            this.createBullets()
            this.bullets.filter(i=>!i.dead)
            this.bullets.forEach(i=>i.step(this.enemies))
        }
        if(this.gapCount%this.gapEnemy===0){
            this.createEnemy()
            this.enemies.filter(i=>!i.dead)
            this.enemies.forEach(i=>{
                i.step(this.player)
                if(i.dead){
                    i.img.remove()
                }
                
            })
        }
        if(this.player.dead){
            this.gameOver()
            console.log("gameOver")
        }
        if(this.gapCount===this.MAX_GAP){
            this.gapCount=0
        }
    }
    checkOut(){
        this.enemies.forEach(i=>{
            if(i.y<this.MIN_Y){
                i.img.remove()
                i.dead=true
            }
        })
    }
    createBullets(){
        if(this.bullets.length<20){
            let bullet=new Bullet(this.player.x,this.player.y)
            this.gameboard.append(bullet.img)
            this.bullets.push(bullet)
        }
    }
    createEnemy(){
        if(this.enemies.length<this.hard){
            let enemy=new Enemy(parseInt(Math.random()*this.MAX_X),0)
            this.gameboard.append(enemy.img)
            this.enemies.push(enemy)
        }
    }
    animateHandle(){
        this.player.draw()
        this.enemies.forEach(i=>i.draw())
        this.bullets.forEach(i=>i.draw())
        requestAnimationFrame(this.animateHandle)
    }
    keyboardHandle(e){
    }
    pointEventStart(){
        this.gameboard.addEventListener("pointermove",this.pointHandle)
    }
    keyboardEventStart(){
        document.body.addEventListener("keydown",this.keyboardHandle)
    }
    pointEventCancel(){
        this.gameboard.removeEventListener("pointermove",this.pointHandle)
    }
    keyboardEventCancel(){
        document.body.removeEventListener("keydown",this.keyboardHandle)
    }
    gameStart(){
        this.clearGame()
        this.pointEventStart()
        this.keyboardEventStart()
        this.player=new Player()
        this.gameboard.append(this.player.img)
        this.gameContinue()
    }
    gameContinue(){
        this.timer=setInterval(this.timerHandle,this.updateTime)
        this.animate=requestAnimationFrame(this.animateHandle)
    }

    gamePause(e){
        clearInterval(this.timer)
        cancelAnimationFrame(this.animate)
        this.keyboard.cancel(this.keyboard.node)
        this.point.cancel(this.point.node)
    }
    gameOver(){

    }
    clearGame(){
        let flyings=dqAll(".flying")
        if(flyings){
            [...flyings].forEach(flying=>flying.remove())
        }
        this.hard=5
        this.player=new Player()
        this.bullets=[]
        this.enemies=[]
        this.score=0
        clearInterval(this.timer)
        this.timer=null
        cancelAnimationFrame(this.animate)
        this.animate=null
        this.gameover=false
        this.pointX=this.MAX_X/2
        this.pointY=this.MAX_Y
    }
    get MAX_X(){return document.body.offsetWidth}
    get MAX_Y(){return document.body.offsetHeight}
    get MIN_X(){return 0}
    get MIN_Y(){return 0}
    get MAX_GAP(){return 100}
}
new Game()
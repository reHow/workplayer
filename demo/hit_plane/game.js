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
        let xLeft=this.y
        let xRight=this.y+this.width
        let yTop=this.y
        let yBottom=this.y+this.height
        let xOtherLeft=other.x
        let xOtherRight=other.x+other.width
        let yOtherTop=other.y
        let yOtherBottem=other.y+other.height
        console.log("run")
        if(numInArea(yTop,yOtherTop,yOtherBottem) || numInArea(yBottom,yOtherTop,yOtherBottem)){
            console.log("inarea")
            if(numInArea(xLeft,xOtherLeft,xOtherRight) || numInArea(xRight,xOtherLeft,xOtherRight)){
                console.log("crash")
                return true
            }
        }
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
    }
}
class Bullet extends Flying{
    constructor(x,y){
        super(x,y,"./assets/bullet.png")
        this.img.classList.add("bullet")
        this.life=1
    }
    step(enemies){
        this.y-=this.speedY
        enemies.forEach(enemy => {
            if(this.life>0 && enemy.life>0 && this.isCrashOther(enemy)){
                this.life--
                enemy.life--
                if(enemy.life<=0){
                    enemy.dead=true
                    enemy.img.remove()
                }
                if(this.life<=0){
                    this.dead=true
                    this.img.remove()
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
    gapBullet=this.MAX_GAP/20
    gapEnemy=this.MAX_GAP/10
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
            this.enemies.forEach(i=>i.step(this.player))
            this.bullets.forEach(i=>i.step(this.enemies))
        }
        if(this.gapCount%this.gapEnemy===0){
            this.createEnemy()
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
            let enemy=new Enemy(Math.random()*this.MAX_X,0)
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
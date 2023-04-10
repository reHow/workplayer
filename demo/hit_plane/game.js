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
        this.speedX=14
        this.speedY=12
    }
    move(x,y){
        if(Math.abs(this.x-x)>this.speedX){
            if(this.x>x){
                this.x-=this.speedX
            }else{
                this.x+=this.speedX
            }
        }else{
            this.x=x
        }
        if(Math.abs(this.y-y)>this.speedY){
            if(this.y>y){
                this.y-=this.speedY
            }else{
                this.y+=this.speedY
            }
        }else{
            this.y=y
        }
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
            --this.life
            --player.life
            this.dead=this.life<=0
            player.dead=player.life<=0
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
        forEach(enemies,enemy=>{
            if(this.life>0 && enemy.life>0 && enemy.isCrashPoint(this.x,this.y)){
                --this.life,--enemy.life
                enemy.dead=enemy.life<=0
                this.dead=this.life<=0
            }
        })
    }
}
class Game{
    gameboard=dq(".gaming")
    scorePoint=dq(".score-point")
    lifePoint=dq(".life-point")
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
    createBulletGap
    createEnemyGap
    gameStepGap
    constructor(){
        this.updateTime=50
        this.createBulletTime=10
        this.createEnemyTime=2000
        this.gameStepGap=100
        this.pointHandle=this.pointHandle.bind(this)
        this.keyboardHandle=this.keyboardHandle.bind(this)
        this.animateHandle=this.animateHandle.bind(this)
        this.timerHandle=this.timerHandle.bind(this)
        //this.createBullets=throttle(this.createBullets,this.createBulletGap)
        //this.createEnemy=throttle(this.createEnemy,this.createEnemyGap)
        this.gameStep=throttle(this.gameStep,this.gameStepGap)

        this.clearGame()
        this.gameStart()
    }
    pointHandle(e){
        this.pointX=e.clientX
        this.pointY=e.clientY
    }
    timerHandle(){
        this.createBullets()
        this.createEnemy()
        this.gameStep()
        this.checkOutBullets()
        this.checkClearBullets()
        this.checkClearEneny()
        if(this.player.dead){
            this.gameOver()
        }
    }
    gameStep(){
        this.player.move(this.pointX,this.pointY)
        forEach(this.bullets,i=>i.step(this.enemies))
        forEach(this.enemies,i=>i.step(this.player))
    }
    checkOutBullets(){
        forEach([...this.bullets],i=>{console.log(i,i.y);if(i.y<this.MIN_Y){i.dead=true}})
    }
    checkClearEneny(){
        forEach(this.enemies.filter(i=>i.dead),i=>{this.updateScore(i.score),i.img.remove()})
        this.enemies=this.enemies.filter(i=>!i.dead)
    }
    updateScore(score){
        this.score+=score
        this.scorePoint.innerHTML=this.score
    }
    checkClearBullets(){
        forEach(this.bullets.filter(i=>i.dead),i=>{i.img.remove()})
        this.bullets=this.bullets.filter(i=>!i.dead)
        this.bullets.forEach(i=>i.step(this.enemies))
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
        forEach([this.player,...this.enemies,...this.bullets],i=>i.draw())
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
        this.player=new Player(this.MAX_X/2,this.MAX_Y)
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
        this.pointEventCancel()
        this.keyboardEventCancel()
    }
    gameOver(){
        this.gamePause()
        this.gameboard.classList.add("hide")
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
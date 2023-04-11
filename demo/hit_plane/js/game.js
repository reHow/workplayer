class Flying{
    img
    x
    y
    width
    height
    life
    speedX
    speedY
    willRemove
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
        this.isOut=false
        this.willRemove=false
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
    remove(){
        this.willRemove=true
        this.img.remove()
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
                --this.life
                --enemy.life
                enemy.dead=enemy.life<=0
                this.dead=this.life<=0
            }
        })
    }
}
class Game{
    gamePage=dq(".gaming")
    overPage=dq(".game-over")
    pages=dq(".app [class*='page-']")
    point={
        score:dq(".score-point"),
        life:dq(".life-point"),
        hard:dq(".hard-point"),
        finally:dq(".finlly-score-point")
    }
    handleType={
        point:dq("use-point"),
        keyboad:dq("use-keyboard"),
        screenHandle:dq("use-screnn-handle")
    }
    screenHandle={
        up:dq(".handle-up"),
        left:dq(".handle-left"),
        right:dq(".handle-right"),
        down:dq(".handle-down")
    }
    eventHandle={
        pointmove:null,
        pointdown:null,
        keydown:null
    }
    pageSwitch
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
    MIN_X=0
    MIN_Y=0
    constructor(){
        this.handleBind()
        this.pageSwitch=page=>pageSwitch.apply(null,[page,this.pages]) // 偏函数

        this.updateTime=100
        this.createBulletGap=800
        this.createEnemyGap=500
        this.gameStepGap=100
        
        this.createBullets=throttle(this.createBullets,this.createBulletGap)
        this.createEnemy=throttle(this.createEnemy,this.createEnemyGap)
        this.gameStep=throttle(this.gameStep,this.gameStepGap)
    }
    animateHandle(){
        forEach([this.player,...this.enemies,...this.bullets],i=>i.draw())
        requestAnimationFrame(this.animateHandle)
    }
    timerHandle(){
        // status save
        let life=this.player.life
        let hard=this.hard
        // step & check
        this.player.move(this.pointX,this.pointY)
        forEach(this.bullets,bullet=>{
            bullet.step(this.enemies)
            if(bullet.y<this.MIN_Y || bullet.life<=0){
                bullet.remove()
            }
        })
        forEach(this.enemies,enemy=>{
            enemy.step(this.player)
            if(enemy.life<=0){
                this.score+=enemy.score
                this.point.score.innerText=this.score
                enemy.remove()
            }else if(enemy.y>this.MAX_Y){
                enemy.remove()
            }
        })
        // clear array
        this.enemies=this.enemies.filter(i=>!i.willRemove)
        this.bullets=this.bullets.filter(i=>!i.willRemove)
        // create
        this.createBullets()
        this.createEnemy()
        // score bouns
        if(this.score>1000 && this.score%1000===0){
            ++this.player.life
            ++this.hard
        }
        // status check
        // life check
        if(this.player.life!==life){
            this.point.life.innerText=this.player.life
        }
        if(this.player.life<=0){
            this.gameOver()
        }
        // hard check
        if(this.hard!==hard){
            this.point.hard.innerText=this.hard
        }
    }
    createBullets(){
        if(this.bullets.length<20){
            let bullet=new Bullet(this.player.x,this.player.y)
            this.gamePage.append(bullet.img)
            this.bullets.push(bullet)
        }
    }
    createEnemy(){
        if(this.enemies.length<this.hard){
            let enemy=new Enemy(parseInt(Math.random()*this.MAX_X),0)
            this.gamePage.append(enemy.img)
            this.enemies.push(enemy)
        }
    }
    handleBind(){
        this.animateHandle=this.animateHandle.bind(this)
        this.timerHandle=this.timerHandle.bind(this)
        this.eventHandle.pointmove=(function(e){
            this.pointX=e.clientX
            this.pointY=e.clientY
        }).bind(this)
        this.eventHandle.keydown=(function(e){
            let key=e.key.toLowerCase()
            if(key==="a"){
                this.pointX=this.player.x-this.player.speedX*2
            }else if(key==="d"){
                this.pointX=this.player.x+this.player.speedX*2
            }else if(key==="w"){
                this.pointY=this.player.y-this.player.speedY*2
            }else if(key==="s"){
                this.pointY=this.player.y+this.player.speedY*2
            }
        }).bind(this)
    }
    pointmoveStart(){
        this.gamePage.addEventListener("pointermove",this.eventHandle.pointmove)
    }
    pointmoveCancel(){
        this.gamePage.removeEventListener("pointermove",this.eventHandle.pointmove)
    }
    keydownStart(){
        document.body.addEventListener("keypress",this.eventHandle.keydown)
    }
    keydownCancel(){
        document.body.removeEventListener("keypress",this.eventHandle.keydown)
    }
    gameStart(){
        this.clearGame()
        this.pointmoveStart()
        this.keydownStart()
        this.player=new Player(this.MAX_X/2,this.MAX_Y)
        this.gamePage.append(this.player.img)
        this.gameContinue()
    }
    gameContinue(){
        this.timer=setInterval(this.timerHandle,this.updateTime)
        this.animate=requestAnimationFrame(this.animateHandle)
    }

    gamePause(){
        clearInterval(this.timer)
        this.timer=null
        cancelAnimationFrame(this.animate)
        this.animate=null
        this.pointmoveCancel()
        this.keydownCancel()
    }
    gameOver(){
        this.gamePause()
        this.pageSwitch(this.overPage)
        this.point.finally.innerText=this.score
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
        this.point.score.innerText=0
        this.point.life.innerText=3
    }
    get MAX_X(){return document.body.offsetWidth}
    get MAX_Y(){return document.body.offsetHeight}
}

testStart()
function testStart(){
    pageSwitch(dq(".gaming"),dq(".app [class*='page-']"));
    (new Game()).gameStart();
}

(()=>{
    let game=new Game()
    let pageGaming=()=>{pageSwitch(dq(".gaming"),dq(".app [class*='page-']"))}
    let gameStart=()=>{
        pageGaming()
        game.gameStart()
    }
    dq(".game-start-btn").addEventListener("pointerdown",gameStart)
    dq(".game-retry-btn").addEventListener("pointerdown",gameStart)
})()

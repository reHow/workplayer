class Flying{
    constructor(gameBoard,position=new Position(0,0)){
        this.img=getImgNode("./assets/no-img.png")
        this.img.classList.add("flying")
        this.gameBoard=gameBoard
        this.gameBoard.appendChild(this.img)

        this.pos=position
        this.size={width:this.img.width,height:this.img.height}
        this.speed={x:10,y:10}
        this.dead=false
    }
    draw(){
        this.imgLeft=this.x-this.img.width/2
        this.imgTop=this.y-this.img.height/2
    }
    // @param {Flying} other
    isCrashOther(other){
    }
    // @param {number} x
    set imgLeft(x){
        this.img.style.left=x+"px"
    }
    get imgLeft(){
        return parseFloat(this.img.style.left || 0)
    }
    // @param {number} y
    set imgTop(y){
        this.img.style.top=y+"px"
    }
    get imgTop(){
        return parseFloat(this.img.style.top)
    }
}
class Plane extends Flying{
    constructor(gameBoard,position){
        super(gameBoard,position)
        this.img.src="./assets/plane.png"

        this.pos.update(document.body.offsetWidth/2,document.body.offsetHeight)
        this.speed={x:20,y:20}
        this.power=1
        this.life=3
        this.powerSpeed=10
        this.powerGap=4
    }
    /**
    * @param {Position} to
    * @returns undefined
    */
    step(to){
        let from=this.pos
        let fromX=this.pos.x,fromY=pos.y
        let toX=to.x,toY=to.y
        let speedX=this.speed.x,speedY=this.speed.y
        if(Math.abs(fromX-toX)>Math.abs(speedX)){
            if(to.moreRight(from)){
                this.pos.x+=speedX
            }else{
                this.pos.x-=speedX
            }
        }else{
            this.pos.x=toX
        }
        if(Math.abs(fromY-toY)>Math.abs(speedY)){
            if(to.moreRight(from)){
                this.pos.y+=speedY
            }else{
                this.pos.y-=speedY
            }
        }else{
            this.pos.y=toY
        }
    }
}

class Enemy extends Flying{
    constructor(gameBoard,position){
        super(gameBoard,position)
        this.img.src="./assets/enemy.png"
        
        this.pos.update(Math.random()*Position.MAX.x,-this.img.height)
        this.score=10
        this.speed={x:0,y:7}
        this.life=2
    }
    step(){

    }
    get isOut(){
        return (this.x<0 || this.x>Position.MAX.x) || this.y<0
    }
}
class PointEvent{
    constructor(cssStr){
        this.event=dq(cssStr).addEventListener("pointermove",this.handle.bind(this))
        this.pos=new Position(0,0)
    }
    handle(e){
        this.pos.update(e.clientX,e.clientY)
    }
}
class Position{
    /**
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x,y){
        this.x=x
        this.y=y
    }
    /**
     * @param {Number} x
     * @param {Number} y
     */
    update(x,y){
        this.x=x
        this.y=y
    }
    /**
     * @param {Position} speed
     */
    add(speed){
        this.x+=speed.x
        this.y+=speed.y
    }
    /**
     * @param {Position} speed
     */
    sub(speed){
        this.x-=speed.x
        this.y-=speed.y
    }
    /**
     * @param {Position} anthor
     */
    moreLeft(anthor){
        return this.x<anthor.x
    }
    /**
     * @param {Position} anthor
     */
    moreRight(anthor){
        return this.x>anthor.x
    }
    /**
     * @param {Position} anthor
     */
    moreTop(anthor){
        return this.y<anthor.y
    }
    /**
     * @param {Position} anthor
     */
    moreBottom(anthor){
        return this.y>anthor.y
    }
    // @param {Object} position
    set std(position={x:0,y:0}){
        this.x=position.x
        this.y=position.y
    }
    get std(){
        return {x:this.x,y:this.y}
    }
    static get MAX(){
        return {x:document.body.offsetWidth,y:document.body.offsetHeight}
    }
    static get MIN(){
        return {x:0,y:0}
    }
}
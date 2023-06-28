const print = console.log
const not = bool => !bool

const inLimitNum = (num, left, right) => num >= left && num <= right
const limitNum = (num, min, max) => Math.min(Math.max(num, min), max)

const packObject = (keys = "x,y", ...args) => {
    let obj = {}
    keys.split(",").forEach((key, index) => {
        obj[key] = args[index]
    })
    return obj
}

const mapObject = (obj = {}, callback = i => i) => {
    let newObj = {}
    Object.keys(obj).forEach(key => {
        newObj[key] = callback(obj[key])
    })
    return newObj
}
//reduceObject((p,c)=>p+c,{x:1,y:2},{x:7,y:5})
//> { x: 8, y: 7 }
const reduceObject = (callback, ...objs) => {
    let [newObj, fristObj] = [{}, objs.shift()]
    Object.keys(fristObj).forEach(key => {
        let value = fristObj[key]
        objs.forEach(obj => { value = callback(value, obj[key]) })
        newObj[key] = value
    })
    return newObj
}
const signObj = (obj) => mapObject(obj, i => Math.sign(i))
const addObjNum = (obj = {}, num = 0, int = true) => mapObject(obj, i => int ? parseInt(i + num) : i + num)
const subObjNum = (obj = {}, num = 0, int = true) => mapObject(obj, i => int ? parseInt(i - num) : i - num)
const divObjNum = (obj = {}, num = 1, int = true) => mapObject(obj, i => int ? parseInt(i / num) : i / num)
const mulObjNum = (obj = {}, num = 1, int = true) => mapObject(obj, i => int ? parseInt(i * num) : i * num)
const absObj = (obj) => mapObject(obj, i => Math.abs(i))

const maxObject = (...objs) => reduceObject((p, c) => p < c ? c : p, ...objs)
const minObject = (...objs) => reduceObject((p, c) => p < c ? p : c, ...objs)
const addObject = (...objs) => reduceObject((p, c) => p + c, ...objs)
const subObject = (...objs) => reduceObject((p, c) => p - c, ...objs)
const divObject = (...objs) => reduceObject((p, c) => p / c, ...objs)
const mulObject = (...objs) => reduceObject((p, c) => p * c, ...objs)

// size:{w,h,halfW,halfH,doubleW,doubleH} pos:{x,y}
const getPos = (x = 0, y = 0) => { return { x: x, y: y } }
const getSize = (w = 0, h = 0) => { return { w: w, h: h, halfW: w / 2, halfH: h / 2, doubleW: w * 2, doubleH: h * 2 } }

const originPos = getPos()

const computedCssValue = (node, cssName) => parseFloat(window.getComputedStyle(node)[cssName])
const computedCssPos = node => getPos(computedCssValue(node, "left"), computedCssValue(node, "top"))
const computedCssSize = node =>
    getSize(computedCssValue(node, "width") + computedCssValue(node, "borderLeftWidth") + computedCssValue(node, "borderRightWidth"),
        computedCssValue(node, "height") + computedCssValue(node, "borderTopWidth") + computedCssValue(node, "borderBottomWidth"))
const setCssValue = (node, cssName, value) => node["style"][cssName] = value
const setCssPos = (node, pos) => { setCssValue(node, "left", pos.x + "px"); setCssValue(node, "top", pos.y + "px") }
const setCssPosLimit = (node, pos, size, minPos, maxPos, centerMode = true) => {
    let x = centerMode ? limitNum(pos.x, minPos.x - size.halfW, maxPos.x - size.halfW) : limitNum(pos.x, minPos.x, maxPos.x - size.w)
    let y = centerMode ? limitNum(pos.y, minPos.y - size.halfH, maxPos.y - size.halfH) : limitNum(pos.y, minPos.y, maxPos.y - size.h)
    setCssValue(node, "left", x + "px");
    setCssValue(node, "top", y + "px")
}

const inCircle = (x, y, centerX, centerY, radius) => Math.abs(x - centerX) ** 2 + Math.abs(y - centerY) ** 2 < radius ** 2
const inCirclePos = (pos, centerPos, radius) => inCircle(pos.x, pos.y, centerPos.x, centerPos.y, radius)
const notInCirclePos = (pos, centerPos, radius) => not(inCircle(pos.x, pos.y, centerPos.x, centerPos.y, radius))

const absTwoPos = (posA, posB) => getPos(Math.abs(posA.x - posB.x), Math.abs(posA.y - posB.y))
const addTwoPos = (posA, posB) => getPos(posA.x + posB.x, posA.y + posB.y)
const subTwoPos = (posA, posB) => getPos(posA.x - posB.x, posA.y - posB.y)
const dividePos = (pos, divisor) => getPos(parseInt(pos.x / divisor), parseInt(pos.y / divisor))
const multiplePos = (pos, multipler) => getPos(parseInt(pos.x * multipler), parseInt(pos.y * multipler))

const limitPosInCircle = (pos, centerPos, radius) => {
    let stdPos = subTwoPos(pos, centerPos), stdPosRaius = Math.sqrt(stdPos.x ** 2 + stdPos.y ** 2)
    return stdPosRaius <= radius ? stdPos : dividePos(stdPos, stdPosRaius / radius)
}

let screenMinPos = originPos
let screenMaxPos = getPos(document.body.offsetWidth, document.body.offsetHeight)
// 改变窗口大小时，更新依赖窗口的数据
window.addEventListener("resize", e => {
    screenMaxPos = getPos(document.body.offsetWidth, document.body.offsetHeight)
})
const throttle = function (func, wait) {
    let lastFunc = Date.now()
    return function (...args) {
        const context = this
        const now = Date.now()
        const gapFunc = now - lastFunc
        if (gapFunc < wait) {
            return null
        }
        lastFunc = now
        return func.apply(context, args)
    }
}
const debounce = (func, wait) => {
    let timeout
    return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, arguments), wait)
    }
}
const getNode = (selector) => {
    if (typeof selector !== "string")
        return selector
    let nodes = document.querySelectorAll(selector)
    return (nodes && nodes.length > 1) ? nodes : (nodes[0] ?? null)
}
const createNode = (tag, attr = { src: "" }) => {
    let node = document.createElement(tag);
    [...Object.keys(attr)].forEach(name => node.setAttribute(name, attr[name]))
    return node
}
const updateTextNode = (node, text) => { node.innerHTML = text }

const setThisNodeChild = function (node) { this.node.appendChild(node) }
const createNodeActuator = (n) => {
    return {
        node: n,
        get text() { return this.node.innerText },
        set text(t) { this.node.innerText = t },
        add: setThisNodeChild
    }
}


function setThisImgPos() { setCssPos(this.img, getPos(this.pos.x , this.pos.y )) }
function isCrashRectPos(pos, size, otherPos, otherSize) {
    let _x1 = pos.x
    let _x2 = pos.x + size.w
    let _y1 = pos.y
    let _y2 = pos.y + size.h
    let x1 = otherPos.x
    let x2 = otherPos.x + otherSize.w
    let y1 = otherPos.y
    let y2 = otherPos.y + otherSize.h
    return (
        (inLimitNum(_x1, x1, x2) || inLimitNum(_x2, x1, x2)) &&
        (inLimitNum(_y1, y1, y2) || inLimitNum(_y2, y1, y2))
    )
}
function isCrashRect(other) {
    //console.log(this.pos,this.size,other.pos,other.size)
    return isCrashRectPos(this.pos, this.size, other.pos, other.size)
}
function isCenterPointCrash(other) {
    let x1 = other.pos.x
    let x2 = other.pos.x + other.size.w
    let y1 = other.pos.y
    let y2 = other.pos.y + other.size.h
    let x = this.pos.x + this.size.halfW
    let y = this.pos.y + this.size.halfH
    return inLimitNum(x, x1, x2) && inLimitNum(y, y1, y2)
}
const stepFlying = function () {
    this.pos = addObject(this.pos, this.speed)
}
const sizeCache = {}
const createFlying =  (pos = getPos(0, 0), src = "./assets/no-img.png", className = '') => {
    let img = createNode('img', { 'src': src, 'class': "flying " + className })
    if(!sizeCache[src]){
        img.onload=()=>{
            console.log('load')
            sizeCache[src]=getSize(img.width,img.height)
        }
    }
    return {
        img: img,
        _dead: false,
        get dead() { return this._dead },
        set dead(bool) {
            if (bool) this.img.remove()
            this._dead = bool
        },
        life: 1,
        pos: pos,
        speed: getPos(5, 5),
        size: sizeCache[src]||getSize(10,10),//getSize(img.width,img.height),
        draw: setThisImgPos,
        isCrashRect: isCrashRect,
        isCenterPointCrash: isCenterPointCrash,
        step: stepFlying
    }
}

function setThisImgPosPlayer() { setCssPos(this.img, getPos(this.pos.x - this.img.width / 2, this.pos.y - this.img.height / 2)) }
const createPlayer = (pos) => {
    return {
        ...createFlying(pos, "./assets/plane.png", "player"),
        life: 3,
        maxBullet: 30,
        bulletGap: 200,
        power: 1,
        // 不写死会出现 getSize(0,0) 的情况，资源加载有延迟，Js代码比网络资源加载快
        size:getSize(142,129),
        speed: getPos(12, 12),
        _dest: pos,
        get dest() { return this._dest },
        set dest(dest) {
            if (isNaN(this.dest.x) || isNaN(this.dest.y)) return false
            let sizeOffset = subObject(getPos(this.size.halfW, this.size.halfH), getPos(15, 15))
            let minPos = subObject(screenMinPos, sizeOffset)
            let maxPos = addObject(screenMaxPos, sizeOffset)
            this._dest = minObject(maxObject(minPos, dest), maxPos)
            return true
        },
        createBullet() {
            return {
                ...createFlying(
                    null,
                    "./assets/bullet.png",
                    "bullet"
                ),
                pos: getPos(this.pos.x+this.size.halfW,this.pos.y+this.size.halfH),
                speed: getPos(0, -15),
                power: this.power,
                isThrough: false,
                get outScreen() { return this.pos.y < screenMinPos.y }
            }
        },
        move() {
            let length = subObject(this.dest, this.pos)
            this.pos = addObject(
                this.pos,
                mulObject(
                    minObject(absObj(length), this.speed),
                    signObj(length)
                )
            )
        }
    }
}

const createEnemy = (pos) => {
    return {
        ...createFlying(pos, "./assets/enemy.png", "enemy"),
        speed: getPos(0, 7),
        score:10,
        damage: 1,
        get outScreen() { return this.pos.y > screenMaxPos.y }
    }
}
const limitMoveInSpeed = (move, speed) => {
    let x = Math.abs(move.x) > speed.x ? Math.sign(move.x) * speed.x : move.x
    let y = Math.abs(move.y) > speed.y ? Math.sign(move.y) * speed.y : move.y
    return getPos(x, y)
}

const not = bool => !bool
const ASSERT=(condition,message)=>{
    if(!condition) throw "ASSERT FAILED："+message
}
const curry = (fn, arity = fn.length) => {
    //for (let idx = 97,arr=[],str=''; idx < 97+26; idx++) {arr.push(String.fromCharCode(idx)),str+=`${arr.join('=>')}=>fn(${arr.join(',')}),`}
    if (arity > 26) throw new Error("Overflow: too many arity,over 26")
    const fns = [a => fn(a), a => b => fn(a, b), a => b => c => fn(a, b, c), a => b => c => d => fn(a, b, c, d), a => b => c => d => e => fn(a, b, c, d, e), a => b => c => d => e => f => fn(a, b, c, d, e, f), a => b => c => d => e => f => g => fn(a, b, c, d, e, f, g), a => b => c => d => e => f => g => h => fn(a, b, c, d, e, f, g, h), a => b => c => d => e => f => g => h => i => fn(a, b, c, d, e, f, g, h, i), a => b => c => d => e => f => g => h => i => j => fn(a, b, c, d, e, f, g, h, i, j), a => b => c => d => e => f => g => h => i => j => k => fn(a, b, c, d, e, f, g, h, i, j, k), a => b => c => d => e => f => g => h => i => j => k => l => fn(a, b, c, d, e, f, g, h, i, j, k, l), a => b => c => d => e => f => g => h => i => j => k => l => m => fn(a, b, c, d, e, f, g, h, i, j, k, l, m), a => b => c => d => e => f => g => h => i => j => k => l => m => n => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => u => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => u => v => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => u => v => w => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => u => v => w => x => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => u => v => w => x => y => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y), a => b => c => d => e => f => g => h => i => j => k => l => m => n => o => p => q => r => s => t => u => v => w => x => y => z => fn(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z)]
    return fns[arity]
}
const add = (...args) => args.reduce((p, c) => p + c, 0)
const sub = (...args) => args.reduce((p, c) => p - c, 0)
const mul = (...args) => args.reduce((p, c) => p * c, 0)
const div = (...args) => args.reduce((p, c) => p / c, 0)
const F = Object.freeze({
    get right() { return this.value },
    set right(val) { this.value = val },
    value: null,
    left: null,
    Functor: "@F/Functor",
    Maybe: "@F/Maybe",
    Either: "@F/Either",
    Ap: "@F/Ap",
    Mound: "@F/Mound",
    of(value, left, tag = F.Functor) {
        return { value, left, tag }
    },
    _checkFn(fn) {
        if (fn.constructor !== Function) throw new Error('TyprError:Input isnt function')
    },
    _checkFu(fn) {
        if (fn?.__proto__ !== F) throw new Error('TyprError:Input isnt functor')
    },
    map(fn) {
        F._checkFn(fn)
        return F.of(fn(this.value))
    },
    maybe(fn) {
        F._checkFn(this.value)
        return this.value ? F.of(fn(this.value)) : F.of(this.value)
    },
    either(fn) {
        F._checkFn(this.value)
        return this.right ? F.of(fn(this.right), this.left) : F.of(this.right, fn(this.left))
    },
    ap(fu) {
        F._checkFn(this.value)
        return F.of(this.right(fu.value))
    },
    join() {
        F._checkFn(fu)
        return this.value
    },
    flatMap(fu) {
        F._checkFn(fu)
        F._checkFn(fu.value)
        return this.map(fu).join()
    }
})

const randInt = num => parseInt(Math.random() * num)

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
const Pos = (x = 0, y = 0) => { return { x: x, y: y } }
const Size = (w = 0, h = 0) => { return { w: w, h: h, halfW: w / 2, halfH: h / 2, doubleW: w * 2, doubleH: h * 2 } }

const originPos = Pos(0, 0)

const computedCssValue = (node, cssName) => parseFloat(window.getComputedStyle(node)[cssName])
const computedCssPos = node => Pos(computedCssValue(node, "left"), computedCssValue(node, "top"))
const computedCssSize = node =>
    Size(computedCssValue(node, "width") + computedCssValue(node, "borderLeftWidth") + computedCssValue(node, "borderRightWidth"),
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

const absTwoPos = (posA, posB) => Pos(Math.abs(posA.x - posB.x), Math.abs(posA.y - posB.y))
const addTwoPos = (posA, posB) => Pos(posA.x + posB.x, posA.y + posB.y)
const subTwoPos = (posA, posB) => Pos(posA.x - posB.x, posA.y - posB.y)
const dividePos = (pos, divisor) => Pos(parseInt(pos.x / divisor), parseInt(pos.y / divisor))
const multiplePos = (pos, multipler) => Pos(parseInt(pos.x * multipler), parseInt(pos.y * multipler))

const limitPosInCircle = (pos, centerPos, radius) => {
    let stdPos = subTwoPos(pos, centerPos), stdPosRaius = Math.sqrt(stdPos.x ** 2 + stdPos.y ** 2)
    return stdPosRaius <= radius ? stdPos : dividePos(stdPos, stdPosRaius / radius)
}

let screenMinPos = originPos
let screenMaxPos = Pos(document.body.offsetWidth, document.body.offsetHeight)
// 改变窗口大小时，更新依赖窗口的数据
window.addEventListener("resize", e => {
    screenMaxPos = Pos(document.body.offsetWidth, document.body.offsetHeight)
})

const throttleWithNow = (func, gap) => {
    let finallyActTime = 0
    return function (now, ...args) {
        if (now - finallyActTime > gap) {
            finallyActTime = now
            return func.apply(this, ...args)
        }
    }
}

const limitMoveInSpeed = (move, speed) => {
    let x = Math.abs(move.x) > speed.x ? Math.sign(move.x) * speed.x : move.x
    let y = Math.abs(move.y) > speed.y ? Math.sign(move.y) * speed.y : move.y
    return Pos(x, y)
}
const filterDel = (arr, fn) => {
    for (let idx = 0, len = arr.length; idx < len; ++idx) {
        item = arr[idx]
        if (fn(item))
            arr.splice(idx, 1), --idx, --len
    }
}
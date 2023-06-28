const gamePlay = getNode(".game-page-play")
const gameStatus = (() => {
    const lifePoint = getNode(".life-point")
    const hardPoint = getNode(".hard-point")
    const scorePoint = getNode(".score-point")
    const player = new Proxy(createPlayer(getPos(screenMaxPos.x / 2, screenMaxPos.y)), { set: setter })
    if (player.size.w === 0) {
        throw Error('Zero Size!')
    }
    const nodeActuator = {
        "score": (val) => { scorePoint.innerText = val },
        "hard": (val) => { hardPoint.innerText = val },
        "life": (val) => { lifePoint.innerText = val }
    }
    const nodeActuatorKeys = Object.keys(nodeActuator)
    function setter(target, prop, val, receiver) {
        target[prop] = val
        if (nodeActuatorKeys.includes(prop))
            return nodeActuator[prop](val)
        return true
    }
    const imgArrProxyHandle = {
        set(target, prop, val) {
            if (prop === 'length') return true
            gamePlay.append(val.img)
            target[prop] = val
            return true
        },
        deleteProperty(target, key) {
            target[key].img.remove()
            target.splice(key, 1)
            return true
        }
    }
    const bullets = new Proxy([], imgArrProxyHandle)
    const enemies = new Proxy([], imgArrProxyHandle)
    const status = new Proxy({
        score: 0,
        hard: 5,
        player: player,
        bullets: bullets,
        enemies: enemies
    }, { set: setter })
    return status
})()

gamePlay.append(gameStatus.player.img)

const playerMoveEvent = (e) => {
    let dest = null
    const speedKeyRadio = 2
    if (e.type === 'pointermove') {
        dest = subObject(getPos(e.clientX, e.clientY), getPos(gameStatus.player.size.halfW, gameStatus.player.size.halfH))
    } else if (e.type === 'keypress') {
        switch (e.key.toLocaleLowerCase()) {
            case 'w':
                gameStatus.player.dest.y -= gameStatus.player.speed.y * speedKeyRadio
                break
            case 'a':
                gameStatus.player.dest.x -= gameStatus.player.speed.x * speedKeyRadio
                break
            case 's':
                gameStatus.player.dest.y += gameStatus.player.speed.y * speedKeyRadio
                break
            case 'd':
                gameStatus.player.dest.x += gameStatus.player.speed.x * speedKeyRadio
                break
        }
    }
    gameStatus.player.dest = dest ?? gameStatus.player.dest
}


let rocker = getNode(".vitual-rocker")
let stick = getNode(".rocker-handle")

let rockerSize = computedCssSize(rocker)
let stickSize = computedCssSize(stick)

let rockerPos = computedCssPos(rocker)
let stickPos = computedCssPos(stick)

const updateCssData = () => {
    rockerPos = computedCssPos(rocker)
    stickPos = computedCssPos(stick)
}
// 改变窗口大小时，更新依赖窗口的数据
window.addEventListener("resize", updateCssData)


// 魔数
const zeroSpeed = getPos(0, 0)
const SpeedRadio = 0.2
const RockerRangeRadio = 1.5
// 事件函数
let moveTimer = null
let speed = zeroSpeed


function stickHandleAdd(e) {
    e.preventDefault()
    eventGourp = {
        touchstart: { move: "touchmove", up: "touchend" },
        mousedown: { move: "mousemove", up: "mouseup" }
    }
    window.addEventListener(eventGourp[e.type]["move"], stickMove)
    window.addEventListener(eventGourp[e.type]["up"], srickHandleRemove)
}

function srickHandleRemove(e) {
    e.preventDefault()
    eventGourp = {
        touchend: { move: "touchmove", up: "touchend" },
        mouseup: { move: "mousemove", up: "mouseup" }
    }
    speed = zeroSpeed
    setCssPos(stick, stickPos)
    window.removeEventListener(eventGourp[e.type]["move"], stickMove)
    window.removeEventListener(eventGourp[e.type]["up"], srickHandleRemove)
}


function stickMove(e) {
    e.preventDefault()
    let clientPos
    switch (e.type) {
        case "touchmove":
            let touch = e.touches[0]
            clientPos = getPos(touch.clientX, touch.clientY)
            break
        case "mousemove":
            clientPos = getPos(e.clientX, e.clientY)
            break;
    }
    let rockerRadius = rockerSize.halfW * RockerRangeRadio
    let rockerCenter = getPos(rockerSize.halfW, rockerSize.halfH)
    let clientInRockerPos = subTwoPos(clientPos, rockerPos)
    // 【鼠标在Rocker的坐标】裁切成圆形，裁切函数会标准化圆到原点坐标，需要位移
    let clientInRockerCirclePos = addTwoPos(limitPosInCircle(clientInRockerPos, rockerCenter, rockerRadius), rockerCenter)
    // Stick中心 向左上移动原点 原点 重合的偏移坐标
    let stickCenterOffsetPos = getPos(-stickSize.halfW, -stickSize.halfH)
    // Stick中心在【鼠标在Rocker的坐标】上时，Stick的坐标

    let newStickPos = addTwoPos(clientInRockerCirclePos, stickCenterOffsetPos)
    speed = multiplePos(subTwoPos(newStickPos, stickPos), SpeedRadio)
    setCssPos(stick, newStickPos)
}

const inputType = getNode('.input-type')
const usePointer = getNode('.use-pointer')
const useKeyboard = getNode('.use-keyboard')
const useVitualRoker = getNode('.use-vitual-rocker')

const cancelInput = () => {
    rocker.style.display = 'none'
    window.removeEventListener("pointermove", playerMoveEvent)
    window.removeEventListener("keypress", playerMoveEvent)
    stick.removeEventListener("touchstart", stickHandleAdd)
    stick.removeEventListener("mousedown", stickHandleAdd)
}
const switchInputButton = (button) => {
    [usePointer, useKeyboard, useVitualRoker].forEach(btn => { btn.classList.remove('enable') })
    button.classList.add('enable')
}
const switchInputType = e => {
    cancelInput()
    switchInputButton(e.target)
    switch (e.target) {
        case usePointer:
            window.addEventListener("pointermove", playerMoveEvent)
            break;
        case useKeyboard:
            window.addEventListener("keypress", playerMoveEvent)
            break;
        case useVitualRoker:
            rocker.style.display = 'block'
            updateCssData()
            stick.addEventListener("touchstart", stickHandleAdd)
            stick.addEventListener("mousedown", stickHandleAdd)
            break;
    }
}
const createBulletHasGap = throttle(gameStatus.player.createBullet.bind(gameStatus.player), gameStatus.player.bulletGap);
const createEnemyHasGap = throttle(createEnemy, 500);

function pageTo(page) {
    const START = ''
    const PLAY = ''
    const OVER = '';

}


pageTo.PAGES = [...getNode("[class^='game-page-']")]
pageTo.START = getNode(".game-page-start")
pageTo.PLAY = getNode(".game-page-play")
pageTo.OVER = getNode(".game-page-over")
function pageTo(page) {
    pageTo.PAGES.forEach(i => i.classList.add('hide'))
    page.classList.remove('hide')
}

// game start
(() => {
    let pause = false
    let idRAF = null
    function gameRetry() {
        console.log('retry')
        pageTo(pageTo.PLAY)
        gameStatus.enemies.splice(0, 999)
        gameStatus.bullets.splice(0, 999)
        gameStatus.score = 0
        gameStatus.player.life = 3
        gameStatus.hard = 5
        idRAF = requestAnimationFrame(draw)
    }

    function gameOver() {
        getNode('.finlly-score-point').innerText=gameStatus.score
        pageTo(pageTo.OVER)
    }

    function gameStart() {
        pageTo(pageTo.PLAY)
        idRAF = requestAnimationFrame(draw)
    }
    getNode('.game-start-btn').addEventListener("click", gameStart)
    getNode('.game-retry-btn').addEventListener("click", gameRetry)
    window.addEventListener("pointermove", playerMoveEvent)
    inputType.addEventListener("click", switchInputType)


    window.addEventListener("keydown", e => {
        if (e.key.toLowerCase() !== 'p' || gameStatus.player.life <= 0) return
        if (pause) {
            idRAF = requestAnimationFrame(draw)
        } else {
            cancelAnimationFrame(idRAF)
        }
        pause = !pause
    })


    function checkdata() {
        const player = gameStatus.player
        const bullets = gameStatus.bullets
        const enemies = gameStatus.enemies
        for (let index = 0, length = enemies.length; index < length; ++index) {
            const enemy = enemies[index]
            if (enemy.outScreen) {
                delete enemies[index]
                --index, --length
            } else if (enemy.isCrashRect(player)) {
                player.life -= enemy.damage
                delete enemies[index]
                --index, --length
            }
        }
        if (enemies.length < gameStatus.hard) {
            let enemy = createEnemyHasGap(getPos(parseInt(Math.random() * screenMaxPos.x), 0))
            if (enemy)
                enemies.push(enemy)
        }

        for (let index = 0, length = bullets.length; index < length; ++index) {
            const bullet = bullets[index]
            if (bullet.outScreen) {
                delete bullets[index]
                --index, --length
            } else {
                for (let idx = 0, len = enemies.length; idx < len; ++idx) {
                    const enemy = enemies[idx]
                    if (bullet.isCenterPointCrash(enemy)) {
                        //throw Error('crash')
                        gameStatus.score += enemy.score
                        if(gameStatus.score%1000===0)
                            ++gameStatus.hard
                        delete bullets[index]
                        delete enemies[idx]
                        --index, --length
                        --idx, --len
                    }
                }
            }
        }
        if (bullets.length < player.maxBullet) {
            let bullet = createBulletHasGap()
            if (bullet)
                bullets.push(bullet)
        }
    }
    function draw() {
        checkdata()
        if (speed.x !== 0 || speed.y !== 0)
            gameStatus.player.dest = addTwoPos(gameStatus.player.pos, speed)
        gameStatus.enemies.forEach(i => { i.step(), i.draw() })
        gameStatus.bullets.forEach(i => { i.step(), i.draw() })
        gameStatus.player.move()
        gameStatus.player.draw()
        if (gameStatus.player.life > 0)
            idRAF = requestAnimationFrame(draw)
        else
            gameOver()
    }

})()
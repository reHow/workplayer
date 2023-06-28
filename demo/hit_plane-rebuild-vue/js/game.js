const {
    ref,
    reactive,
    createApp,
    onMounted,
    onUnmounted,
    computed
} = Vue
const useEventListener = (target, event, callback) => {
    onMounted(() => target.addEventListener(event, callback))
    onUnmounted(() => target.removeEventListener(event, callback))
}
const useMouse = () => {
    const [x, y] = [ref(0), ref(0)]
    useEventListener(window, 'mousemove', e => [x.value, y.value] = [e.clientX, e.clientY])
    return { x, y }
}

// Global --> //
const gameStatus = reactive({
    page: 'pageStart',
    inputType: 'inputPointer',
    score: 0,
    life: 3,
    hard: 5,
    inputSpeed: Pos(0, 0),
    player: Player(Pos(screenMaxPos.x / 2, screenMaxPos.y - 100)),
    bullets: [Bullet(Pos(666, 666)), Bullet(Pos(777, 666))],
    enemies: [Enemy(Pos(123, 333)), Enemy(Pos(223, 563))]
})
const speed = Pos(0, 0)
// const keypress={
//     w:false,
//     a:false,
//     s:false,
//     d:false
// }

const buildBullet = throttleWithNow(() => {
    const { pos, size } = gameStatus.player
    gameStatus.bullets.push(Bullet(Pos(pos.x + size.halfW, pos.y)))
}, 500)
const buildEnemy = throttleWithNow(() => { gameStatus.enemies.push(Enemy(Pos(randInt(screenMaxPos.x), 0))) }, 500)

const gameStep = now => {
    const { inputSpeed, hard, player, bullets, enemies } = gameStatus

    const delFlyings = new WeakSet()
    if (bullets.length < 100)
        buildBullet(now)
    if (enemies.length < hard)
        buildEnemy(now)

    if (inputSpeed.x !== 0 || inputSpeed.y !== 0)
        player.dest = addObject(player.dest, inputSpeed)
    gameStatus.player.move()

    enemies.forEach(enemy => {
        if (enemy.outScreen)
            delFlyings.add(enemy)
        else if (enemy.isCrashRect(player))
            delFlyings.add(enemy), gameStatus.life--
        else {
            let bullet = bullets.find(bullet => bullet.isCenterPointCrash(enemy))
            if (bullet) {
                delFlyings.add(enemy)
                delFlyings.add(bullet)
                gameStatus.score += enemy.score
                if (gameStatus.score > 0 && gameStatus.score % 500 === 0)
                    ++gameStatus.hard
            } else {
                enemy.step()
            }
        }
    })
    bullets.forEach(bullet => bullet.outScreen ? delFlyings.add(bullet) : bullet.step())

    filterDel(bullets, bullet => delFlyings.has(bullet))
    filterDel(enemies, enemy => delFlyings.has(enemy))

    if (gameStatus.life > 0)
        requestAnimationFrame(gameStep)
    else {
        gameStatus.page = 'pageOver'
    }
}
let gameTimer = null

// <-- Global //


const noneTemplate = `<template v-if="false"></template>`
const inputPointer = {
    name: '指针',
    template: noneTemplate,
    setup() {
        useEventListener(window, "pointermove", (e) => {
            const { player } = gameStatus
            const sizeOffset = Pos(player.size.halfW, player.size.halfH)
            player.dest = subObject(Pos(e.clientX, e.clientY), sizeOffset)
        })
    }
}

const destTable={
    w:()=>gameStatus.player.dest.y -= player.speed.y,
    a:()=>gameStatus.player.dest.x -= player.speed.x,
    s:()=>gameStatus.player.dest.y += player.speed.y,
    d:()=>gameStatus.player.dest.x += player.speed.x
}
const inputKeyboard = {
    name: '键盘',
    template: noneTemplate,
    setup() {
        useEventListener(window, "keydown", e => {
            const key=e.key.toLocaleLowerCase()
            if(keypress.hasOwnProperty(key))
                destTable[key]()
        })
        useEventListener(window, "keyup", e => {
            const key=e.key.toLocaleLowerCase()
            if(keypress.hasOwnProperty(key))
                destTable[key]()
        })
    }

}
const inputVitualRorker = {
    name: '虚拟摇杆',
    template: `
<div ref="rockerRef" class="vitual-rocker">
    <div ref="stickRef" class="rocker-handle"></div>
</div>`,
    setup() {
        const [rockerRef, stickRef] = [ref(null), ref(null)]
        onMounted(() => {
            const [rocker, stick] = [rockerRef.value, stickRef.value]

            let rockerSize = computedCssSize(rocker)
            let stickSize = computedCssSize(stick)

            let rockerPos = computedCssPos(rocker)
            let stickPos = computedCssPos(stick)
            const updateCssData = () => {
                rockerPos = computedCssPos(rocker)
                stickPos = computedCssPos(stick)
            }
            window.addEventListener("resize", updateCssData)

            const eventGourp = {}
            const eventUniName=["down","move","up"]
            ;[
                ["touchstart","touchmove","touchend"],
                ["mousedown","mousemove","mouseup"],
                ["pointerdown","pointermove","pointerup"]
            ].forEach(group=>{
                const events={}
                eventUniName.forEach((name,index)=>events[name]=group[index])
                group.forEach(event=>{eventGourp[event]=events})
            })
            const SpeedRadio = 0.2
            const RockerRangeRadio = 1.5
            const zeroSpeed = Pos(0, 0)

            const stickMove = e => {
                e.preventDefault()
                let clientPos
                switch (e.type) {
                    case "touchmove":
                        let touch = e.touches[0]
                        clientPos = Pos(touch.clientX, touch.clientY)
                        break
                    case "mousemove":
                    case "pointermove":
                        clientPos = Pos(e.clientX, e.clientY)
                        break
                }
                let rockerRadius = rockerSize.halfW * RockerRangeRadio
                let rockerCenter = Pos(rockerSize.halfW, rockerSize.halfH)
                let clientInRockerPos = subTwoPos(clientPos, rockerPos)
                // 【鼠标在Rocker的坐标】裁切成圆形，裁切函数会标准化圆到原点坐标，需要位移
                let clientInRockerCirclePos = addTwoPos(limitPosInCircle(clientInRockerPos, rockerCenter, rockerRadius), rockerCenter)
                // Stick中心 向左上移动原点 原点 重合的偏移坐标
                let stickCenterOffsetPos = Pos(-stickSize.halfW, -stickSize.halfH)
                // Stick中心在【鼠标在Rocker的坐标】上时，Stick的坐标

                let newStickPos = addTwoPos(clientInRockerCirclePos, stickCenterOffsetPos)
                gameStatus.inputSpeed = multiplePos(subTwoPos(newStickPos, stickPos), SpeedRadio)

                setCssPos(stick, newStickPos)
            }

            const srickHandleRemove = e => {
                e.preventDefault()
                gameStatus.inputSpeed = zeroSpeed
                setCssPos(stick, stickPos)
                window.removeEventListener(eventGourp[e.type]["move"], stickMove)
                window.removeEventListener(eventGourp[e.type]["up"], srickHandleRemove)
            }

            const stickHandleAdd = e => {
                e.preventDefault()
                window.addEventListener(eventGourp[e.type]["move"], stickMove)
                window.addEventListener(eventGourp[e.type]["up"], srickHandleRemove)
            }
            const startEvent = ["touchstart", "pointerdown", "mousedown"]
            startEvent.forEach(eventName => stick.addEventListener(eventName, stickHandleAdd))
            onUnmounted(() => {
                window.removeEventListener("resize", updateCssData)
                startEvent.forEach(eventName => stick.removeEventListener(eventName, stickHandleAdd))
            })
        })
        return { rockerRef, stickRef }
    }
}
const inputPage = { inputPointer, inputKeyboard, inputVitualRorker }
const inputInfo = {
    template: `
<div class="input-type">
    <button 
        v-for="(input,key) in inputPage" 
        @click="gameStatus.inputType=key" 
        :class="{'enable':gameStatus.inputType===key}">
    {{ input.name }}
    </button>
</div>`,
    setup() {
        return {
            gameStatus,
            inputPage
        }
    }
}

const playStatus = {
    components: {
        inputInfo
    },
    template: `
<div class="play-status">
    <div class="score">分数:<span class="score-point">{{ gameStatus.score }}</span></div>
    <div class="hard">难度:<span class="hard-point">{{ gameStatus.hard }}</span></div>
    <div class="life">生命:<span class="life-point">{{ gameStatus.life }}</span></div>
    <input-info/>
</div>`,
    setup() {
        return {
            gameStatus
        }
    }
}


const drawFlying = {
    template: `
<img :src="player.src" :class="player.className" :style="flying2Style(player)"/>
<template v-for="enemy in enemies">
    <img :src="enemy.src" :class="enemy.className" :style="flying2Style(enemy)"/>
</template>
<template v-for="bullet in bullets">
    <img :src="bullet.src" :class="bullet.className" :style="flying2Style(bullet)"/>
</template>`,
    setup() {
        const { player, bullets, enemies } = gameStatus
        const flying2Style = flying => {
            return {
                width: flying.size.w + 'px',
                height: flying.size.h + 'px',
                left: flying.pos.x + 'px',
                top: flying.pos.y + 'px'
            }
        }
        return {
            flying2Style,
            player,
            bullets,
            enemies
        }
    }
}


const pagePlay = {
    components: {
        inputVitualRorker,
        playStatus,
        drawFlying,
        ...inputPage
    },
    template: `
<div class="game-page-play">
    <play-status/>
    <component :is="gameStatus.inputType"></component>
    <draw-flying/>
</div>`,
    setup() {
        return {
            gameStatus
        }
    }
}

const gameStartBtn = () => {
    gameStatus.page = 'pagePlay'
    gameTimer = requestAnimationFrame(gameStep)
}
const pageStart = {
    template: `
<div class="game-page-start">
    <h1 class="game-title">打飞机</h1>
    <button @click="gameStartBtn" class="game-start-btn">开始</button>
</div>`,
    setup() { return { gameStartBtn } }
}
const gameRetry = () => {
    gameStatus.life = 3
    gameStatus.score = 0
    gameStatus.hard = 5
    gameStatus.player.pos = Pos(screenMaxPos.x / 2, screenMaxPos.y - 100)
    gameStatus.player.dest = Pos(screenMaxPos.x / 2, screenMaxPos.y - 100)
    gameStatus.page = 'pagePlay'
    gameStatus.bullets.splice(0)
    gameStatus.enemies.splice(0)
    gameTimer = requestAnimationFrame(gameStep)
}
const pageOver = {
    template: `
<div class="game-page-over">
    <div class="finally-score">最终得分:<span class="finlly-score-point">{{ gameStatus.score }}</span></div>
    <button @click="gameRetry" class="game-retry-btn">再来一次</button>
</div>`,
    setup() {
        return {
            gameStatus,
            gameRetry
        }
    }
}


const pages = { pageStart, pagePlay, pageOver }
const main = {
    components: {
        ...pages
    },
    setup() {
        return {
            gameStatus
        }
    }
}

const app = createApp(main)
app.mount(".app")
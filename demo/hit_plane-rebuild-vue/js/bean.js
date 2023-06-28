
function setThisImgPosPlayer() { setCssPos(this.img, Pos(this.pos.x - this.img.width / 2, this.pos.y - this.img.height / 2)) }
function isCrashRect(other) {
    //console.log(this.pos,this.size,other.pos,other.size)
    return isCrashRectPos(this.pos, this.size, other.pos, other.size)
}
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

const Flying = (pos, size, src, className) => {
    return {
        src,
        pos,
        size,
        className: `flying ${className}`,

        speed: Pos(0, 0),
        life: 1,
        step: stepFlying,
        isCenterPointCrash,
        isCrashRect
    }
}

const Bullet = (pos) => {
    return {
        ...Flying(pos, Size(10, 10), './assets/bullet.png', 'bullet'),
        speed: Pos(0, -10),
        get outScreen() { return this.pos.y < screenMinPos.y }
    }
}

const Player = (pos) => {
    return {
        ...Flying(pos, Size(100, 100), './assets/player.png', 'player'),
        life: 3,
        speed: Pos(12, 12),
        _dest: pos,
        get dest() { return this._dest },
        set dest(dest) {
            if (isNaN(this.dest.x) || isNaN(this.dest.y)) return false
            let sizeOffset = subObject(Pos(this.size.halfW, this.size.halfH), Pos(15, 15))
            let minPos = subObject(screenMinPos, sizeOffset)
            let maxPos = addObject(screenMaxPos, sizeOffset)
            this._dest = minObject(maxObject(minPos, dest), maxPos)
            return true
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

const Enemy = (pos) => {
    return {
        ...Flying(pos, Size(100, 100), './assets/enemy.png', 'enemy'),
        speed: Pos(0, 7),
        score: 10,
        damage: 1,
        get outScreen() { return this.pos.y > screenMaxPos.y }
    }
}

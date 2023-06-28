const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(script)
    script.onerror = () => reject(new Error(`Failed load script for url:${src}`))
    document.head.append(script)
})
const lowcurry = f => x => y => z => f(x, y, z)
const curry2 = (func) => {
    return function curried(...args) {
        return args.length >= func.length ?
            func.apply(this, args) :
            function (...moreArgs) {
                return curried.apply(this, args.concat(moreArgs))
            }
    }
}
const curry = fn => {
    const judge = (...args) =>
        args.length >= fn.length
            ? fn(...args)
            : (...more) => judge(...args, ...more)
    return judge
}

const compose=(...fns)=>{
    return function(...args){
        let i=0
        let result=fns[0](...args)
        while(++i<fns.length)result=fns[i](result)
        return result
    }
}
const composeRight=(...fns)=>{
    return function(...args){
        let i=fns.length-1
        let result=fns[i](...args)
        while(--i>=0)result=fns[i](result)
        return result
    }
}
// console.log(
//     compose(
//         i=>console.log(1,i??undefined),
//         i=>console.log(2),
//         i=>console.log(3,i??undefined)
//     )("abcd")
// )
const sum = (x, y, z, ...more) => more ? more.reduce((p, c) => p + c, 0) + x + y + z : x + y + z
//console.log(curry(sum)(1)(2)(3))
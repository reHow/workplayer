
// DOM function
function getImgNode(src){
    let img=document.createElement('img')
    img.src=src
    return img
}
/**
 * 
 * @param {Node} page 
 * @param {NodeList} pages 
 * @param {String} hideClass 
 */
function pageSwitch(page,pages,hideClass="hide"){
    forEach([...pages],p=>p.classList.add(hideClass))
    page.classList.remove(hideClass)
}
// pure util function
/**
 * better forEach
 * @param {Array} array 
 * @param {Function} callback 
 * @returns {Number} finally index
 */
function forEach(array,callback){
    for(let index=0,length=array.length; index<length; ++index){
        if(callback(array[index],index,array)===true){
            return index
        }
    }
}
function numInArea(target,leftValue,rightValue){
    if(target>=leftValue && target<=rightValue){
        return true
    }
    return false
}
function throttle(fn=new Function(),ms=9999){
    let isThrottle=false
    let savedArgs
    let savedThis
    function wrapper(){
        if(isThrottle){
            savedArgs=arguments
            savedThis=this
            return
        }
        isThrottle=true
        fn.apply(this,arguments)
        setTimeout(() => {
            isThrottle=false
            if(savedArgs){
                wrapper.apply(savedThis,savedArgs)
                savedArgs=savedThis=null
            }
        }, ms);
    }
    return wrapper
}
function debounce(fn=new Function, ms=9999) {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout=setTimeout(()=>fn.apply(this,arguments),ms);
    };
  }
function dqOne(cssStr){
    return document.querySelector(cssStr)
}
function dqAll(cssStr){
    return document.querySelectorAll(cssStr)
}
/**
 * 
 * @param {String} cssStr 
 * @returns NodeList || HTMLElement
 */
function dq(cssStr){
    if(typeof cssStr!=="string" ){
        return cssStr
    }
    let node=dqAll(cssStr)
    if(node && node.length>1){
        return node
    }
    return dqOne(cssStr)
}
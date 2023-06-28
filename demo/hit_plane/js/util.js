
// DOM function
/**
 * 生成图像节点
 * @param {String} src 图片的url
 * @returns {HTMLImageElement} HTML图像节点
 */
function getImgNode(src){
    let img=document.createElement('img')
    img.src=src
    return img
}
/**
 * 为一组DOM节点切换class开关
 * @param {Node} node 目标节点，默认仅限目标节点添加className，nodes全部移除
 * @param {Array.<Node>} nodes 目标节点同类的一组节点，数组
 * @param {String} className 要切换的class属性
 * @param {boolean} onlyNodeHasMode 仅目标节点添加模式
 */
function nodesClassSwitch(node,nodes,className,onlyNodeHasMode=true){
    if(onlyNodeHasMode){
        forEach(nodes,node=>node.classList.remove(className))
        node.classList.add(className)
    }else{
        forEach(nodes,node=>node.classList.add(className))
        node.classList.remove(className)
    }
}
function classToggle(node,className){
    node.classList.toggle(className)
}
/**
 * 切换页面
 * @param {Node} page 目标页面
 * @param {NodeList} pages 页面组
 * @param {String} hideClass 隐藏页面用标签
 */
function pageSwitch(page,pages,hideClass="hide"){
    nodesClassSwitch(page,[...pages],hideClass,false)
}
// pure util function
/**
 * 更好的forEach
 * @param {Array} array 目标数组
 * @param {function(elem,idx,array):boolean} callback 回调函数(当前元素，当前索引，使用数组)：是否打断
 * @returns {Number} Callback返回true时打断forEach时的数组索引
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
 * document.querySelector和document.querySelectorAll的简化写法
 * @param {String} cssStr CSS选择器
 * @returns {Node|NodeList|null|any} HTML节点
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
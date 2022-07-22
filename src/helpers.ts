const md5 = require('md5');

//get md5 hash 
export const hashVals = (v1: string, v2: string) => {
  return md5(v1 + v2)
}

export const findFunctionIndex = (f) => {
  let index = 1
  while (true){
    let func = f(index,1,1)
    try{
      if (func.default.name == 'onRecieveMessage'){
        return index
      }
    } catch {
      //pass
    }
    index++
    if (index > 1000){
      throw "Could not find function index"
    }
  }
}

const md5 = require('md5');

//get md5 hash 
export const hashVals = (v1: string, v2: string) => {
  return md5(v1 + v2)
}
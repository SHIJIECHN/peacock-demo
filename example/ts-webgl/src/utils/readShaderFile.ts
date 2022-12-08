/**
 * 读取本地着色器文件名
 * @param {*} vsFileName 顶点着色器文件名
 * @param {*} fsFileName 片段着色器文件名
 * @returns {vs, fs} 返回顶点着色器、片段着色器代码资源
 */
type sourceData = {
  vs: string,
  fs: string
}
const readShaderFile = (vsFileName: string, fsFileName: string) => {
  return new Promise<sourceData>((resolve, reject) => {
    // 接收着色器文件内容
    let p1 = http(vsFileName, 'v');
    let p2 = http(fsFileName, 'f');
    Promise.all([p1, p2]).then(res => {
      let vs = res[0];
      let fs = res[1];
      resolve({
        vs, fs
      });
    }).catch(e => {
      console.log('Failed to request source.');
      reject(e);
    })
  })
}

// Ajax异步请求着色器文件
const http = (fileName: string, shader: string) => {
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status !== 404) {
        resolve(request.responseText)
      }
    }
    request.open('GET', fileName, true);
    request.send();
  })
}

// const onReadShaderSource = (fileString: string, shader: string): string => {
//   let result = ''
//   if (shader == 'v') {
//     result = fileString;
//   } else if (shader == 'f') {
//     result =  fileString;
//   }
// }

export {
  readShaderFile,
}
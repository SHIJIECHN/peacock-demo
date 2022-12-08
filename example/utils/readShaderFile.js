; (function () {
  /**
   * 读取本地着色器文件名
   * @param {*} vsFileName 顶点着色器文件名
   * @param {*} fsFileName 片段着色器文件名
   * @returns {vs, fs} 返回顶点着色器、片段着色器代码资源
   */
  const readShaderFile = (vsFileName, fsFileName) => {
    return new Promise((resolve, reject) => {
      const source = {
        vs: '',
        fs: ''
      };
      // 接收着色器文件内容
      let p1 = http(vsFileName, 'v');
      let p2 = http(fsFileName, 'f');
      Promise.all([p1, p2]).then(res => {
        source.vs = res[0];
        source.fs = res[1];
        resolve(source)
      }).catch(e => {
        console.log('Failed to request source.');
        reject(e);
      })
    })
  }

  // Ajax异步请求着色器文件
  const http = (fileName, shader) => {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {
          resolve(onReadShaderSource(request.responseText, shader))
        }
      }
      request.open('GET', fileName, true);
      request.send();
    })
  }

  const onReadShaderSource = (fileString, shader) => {
    if (shader == 'v') {
      return fileString;
    } else if (shader == 'f') {
      return fileString;
    }

  }

  window.readShaderFile = readShaderFile;
})();
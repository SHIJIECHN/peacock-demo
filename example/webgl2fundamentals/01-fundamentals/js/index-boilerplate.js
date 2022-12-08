/**
 * 从脚本标签的内容创建一个着色器
 * 
 * @param {!WebGLRenderingContext} gl WebGL 上下文
 * @param {string} scriptId script标签的id
 * @param {string} opt_shaderType 要创建的着色器的类型，如果没有定义，就使用script标签的type属性
 * @return {!WebGLShader} 着色器
 */
function createShaderFromScript(gl, scriptId, opt_shaderType) {
  // 通过id查找脚本的内容
  const shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw ("*** Error : unknown script element " + scriptId);
  }
  // 提取标签中的内容
  const shaderSource = shaderScript.textContent;
  // 如果没有传入类型，就使用标签发‘type’属性
  if (!opt_shaderType) {
    if (shaderScript.type === 'x-shader/x-vertex') {
      opt_shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type == 'x-shader/x-fragment') {
      opt_shaderType = gl.FRAGMENT_SHADER;
    } else if (!opt_shaderType) {
      throw ("*** Error: shader type not set");
    }
  }

  return compileShader(gl, shaderSource, opt_shaderType)
}

/**
 * 
 * @param {!WebGLRenderingContext} gl WebGL上下文 
 * @param {string} vertexShaderId 顶点着色器的标签id
 * @param {string} fragmentShaderId 片段着色器的标签id
 * @returns {!WebGLProgram} 程序
 */
function createProgramFromSources(gl, vertexShaderId, fragmentShaderId) {
  const vertexShader = createShaderFromScriptTag(gl, vertexShaderId, gl.VERTEX_SHADER);
  const fragmentShader = createShaderFromScriptTag(gl, fragmentShader, gl.FRAGMENT_SHADER);
  return createProgram(gl, vertexShader, fragmentShader);
}
const resizeCanvas = (gl: WebGL2RenderingContext) => {
  const canvas = gl.canvas as HTMLCanvasElement;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width != displayWidth || canvas.height != displayHeight) {
    canvas.height = displayHeight;
    canvas.width = displayWidth;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
}

// 加载纹理
const loadTexture = (gl: WebGL2RenderingContext, image: HTMLImageElement, type: number) => {
  const texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture.');
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

export {
  resizeCanvas, loadTexture
}
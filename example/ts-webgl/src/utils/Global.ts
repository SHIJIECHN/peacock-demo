export let canvas = <HTMLCanvasElement>document.getElementById('webgl');
export let gl = <WebGL2RenderingContext>canvas.getContext('webgl2', { antialias: true });
export const SCR_WIDTH = canvas.width;
export const SCR_HRIGHT = canvas.height;
export function getTextFromLocation(path: string) {
  let request = new XMLHttpRequest;

  request.open('GET', path, false);
  request.send();

  return request.responseText;
}

// 加载纹理
export const loadTexture = (gl: WebGL2RenderingContext, image: HTMLImageElement, type: number) => {
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
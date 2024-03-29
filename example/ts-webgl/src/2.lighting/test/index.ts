﻿import { gl, loadTexture } from './Global'
import { Shader } from "./Shader"
import { mat4, vec3, glMatrix } from "gl-matrix"
import { Camera, CameraMovement } from "./Camera"
import colorFs from './colorsFs.fs'
import colorVs from './colorsVs.vs'
import lampVs from './lampVs.vs'
import lampFs from './lampFs.fs'
import container2 from '../../resource/container2.png'
import container2_specular from '../../resource/container2_specular.png'

const image1 = new Image();
const image2 = new Image();
image1.src = container2;
image2.src = container2_specular;

const SCR_WIDTH = (<HTMLCanvasElement>document.getElementById('webgl')).width;
const SCR_HEIGHT = (<HTMLCanvasElement>document.getElementById('webgl')).height;

let camera = new Camera(vec3.fromValues(0.0, 0.0, 3.0));
let lastX = SCR_WIDTH / 2.0;
let lastY = SCR_HEIGHT / 2.0;
let firstMouse = true;

let deltaTime = 0.0;
let lastFrame = 0.0;

function keyDown(ev: KeyboardEvent) {

    if (ev.key === 'w') {
        camera.ProcessKeyboard(CameraMovement.FORWARD, deltaTime);
    }
    else if (ev.key === 's') {
        camera.ProcessKeyboard(CameraMovement.BACKWARD, deltaTime);
    }
    else if (ev.key === 'a') {
        camera.ProcessKeyboard(CameraMovement.LEFT, deltaTime);
    }
    else if (ev.key === 'd') {
        camera.ProcessKeyboard(CameraMovement.RIGHT, deltaTime);
    }
}

function scroll(ev: WheelEvent) {
    camera.ProcessMouseScroll(ev.deltaY / 100);  //网页滚轮变化幅度很大，所以除以一个系数100，用户可以自己尝试一个理想的系数值
}

function mouseMove(ev: MouseEvent) {
    if (firstMouse) {
        lastX = ev.clientX;
        lastY = ev.clientY;
        firstMouse = false;
    }

    let xoffset = ev.clientX - lastX;
    let yoffset = lastY - ev.clientY;

    lastX = ev.clientX;
    lastY = ev.clientY;

    camera.ProcessMouseMovement(xoffset, yoffset);
}

let lightPos = vec3.fromValues(1.2, 1.0, 2.0);

export default function main(): void {
    let canvas = <HTMLCanvasElement>document.getElementById('webgl');
    canvas.addEventListener("keydown", keyDown);
    canvas.addEventListener("wheel", scroll);
    canvas.addEventListener("mousemove", mouseMove);

    canvas.setAttribute('tabindex', '0'); // 让canvas获取焦点从而响应事件
    canvas.addEventListener('click', function () {
        canvas.focus();
    });

    let lightingShader = new Shader(colorVs, colorFs);
    let lampShader = new Shader(lampVs, lampFs);

    let vertices = new Float32Array([
        -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 1.0, 0.0,
        0.5, 0.5, -0.5, 0.0, 0.0, -1.0, 1.0, 1.0,
        0.5, 0.5, -0.5, 0.0, 0.0, -1.0, 1.0, 1.0,
        -0.5, 0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 1.0,
        -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 0.0,

        -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0,
        0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0,
        0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0,
        -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 0.0, 1.0,
        -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0,

        -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, 1.0, 0.0,
        -0.5, 0.5, -0.5, -1.0, 0.0, 0.0, 1.0, 1.0,
        -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, 0.0, 1.0,
        -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, 0.0, 1.0,
        -0.5, -0.5, 0.5, -1.0, 0.0, 0.0, 0.0, 0.0,
        -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, 1.0, 0.0,

        0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
        0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 1.0,
        0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.0, 1.0,
        0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.0, 1.0,
        0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.0, 0.0,
        0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0,

        -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 0.0, 1.0,
        0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 1.0, 1.0,
        0.5, -0.5, 0.5, 0.0, -1.0, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.5, 0.0, -1.0, 0.0, 1.0, 0.0,
        -0.5, -0.5, 0.5, 0.0, -1.0, 0.0, 0.0, 0.0,
        -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 0.0, 1.0,

        -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0,
        0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0,
        0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0,
        -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 0.0, 0.0,
        -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0
    ]);

    let cubePositions = [
        [0.0, 0.0, 0.0],
        [2.0, 5.0, - 15.0],
        [-1.5, -2.2, -2.5],
        [-3.8, -2.0, -12.3],
        [2.4, -0.4, -3.5],
        [-1.7, 3.0, -7.5],
        [1.3, -2.0, -2.5],
        [1.5, 2.0, -2.5],
        [1.5, 0.2, -1.5],
        [-1.3, 1.0, -1.5]
    ];

    let VBO = gl.createBuffer();
    if (!VBO) {
        alert('Failed to create the buffer object');
        return;
    }

    let gles = gl.getExtension('OES_vertex_array_object');
    let cubeVAO = gl.createVertexArray();
    if (!cubeVAO) {
        alert('Failed to create the VAO');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindVertexArray(cubeVAO);

    lightingShader.use();
    let aPos = lightingShader.getAttribLocation('aPos');
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(aPos);

    let aNormal = lightingShader.getAttribLocation('aNormal');
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aNormal);

    let aTexCoords = lightingShader.getAttribLocation('aTexCoords');
    gl.vertexAttribPointer(aTexCoords, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aTexCoords);

    let lightVAO = gl.createVertexArray();
    if (!lightVAO) {
        alert('Failed to create the VAO');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

    gl.bindVertexArray(lightVAO);

    lampShader.use();
    aPos = lampShader.getAttribLocation('aPos');
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    let diffuseMap = loadTexture(image1, gl.RGBA);
    let specularMap = loadTexture(image2, gl.RGBA);

    lightingShader.use();
    lightingShader.setInt("material.diffuse", 0);
    lightingShader.setInt("material.specular", 1);

    gl.enable(gl.DEPTH_TEST);

    function render() {
        let currentFrame = (new Date).getTime() / 1000;
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        lightingShader.use();
        lightingShader.setVec3("light.position", camera.Position);
        // console.log(camera.Position)
        lightingShader.setVec3("light.direction", camera.Front);
        lightingShader.setFloat("light.cutOff", Math.cos(glMatrix.toRadian(12.5)));
        lightingShader.setVec3("viewPos", camera.Position);

        lightingShader.setVec3("light.ambient", 0.1, 0.1, 0.1);
        lightingShader.setVec3("light.diffuse", 0.8, 0.8, 0.8);
        lightingShader.setVec3("light.specular", 1.0, 1.0, 1.0);
        lightingShader.setFloat("light.constant", 1.0);
        lightingShader.setFloat("light.linear", 0.09);
        lightingShader.setFloat("light.quadratic", 0.032);

        lightingShader.setFloat("material.shininess", 32.0);

        let projection = mat4.perspective(mat4.create(), glMatrix.toRadian(camera.Zoom), SCR_WIDTH / SCR_HEIGHT, 0.1, 100.0);
        let view = camera.GetViewMatrix();
        lightingShader.setMat4("projection", projection);
        lightingShader.setMat4("view", view);

        let model = mat4.create();
        lightingShader.setMat4("model", model);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, diffuseMap);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, specularMap);

        let changeMat4 = mat4.create();
        mat4.multiply(changeMat4, view, model);
        mat4.invert(changeMat4, changeMat4);
        mat4.transpose(changeMat4, changeMat4);
        lightingShader.setMat4("changeMat", changeMat4);

        gl.bindVertexArray(cubeVAO);
        for (let i = 0; i < 10; ++i) {
            let model = mat4.create();
            mat4.translate(model, model, cubePositions[i] as vec3);
            let angle = 20.0 * i;
            mat4.rotate(model, model, glMatrix.toRadian(angle), vec3.fromValues(1.0, 0.3, 0.5));
            lightingShader.setMat4("model", model);

            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }

        //lampShader.use();
        //lampShader.setMat4("projection", projection);
        //lampShader.setMat4("view", view);
        //model = mat4.create();
        //model = mat4.translate(model,model, lightPos);
        //model = mat4.scale(model,model, vec3.fromValues(0.2,0.2,0.2));
        //lampShader.setMat4("model", model);

        //gles.bindVertexArrayOES(lightVAO);
        //gl.drawArrays(gl.TRIANGLES, 0, 36);

        requestAnimationFrame(render);
    }

    render();
}
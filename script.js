"use strict";

const vertexShaderSource = `#version 300 es

in vec4 a_position;

// All shaders have a main function.
void main() {
    gl_Position = a_position;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

// Declare an output for the fragment shader.
out vec4 outColor;

void main() {
    outColor = vec4(0.0, 0.7, 0.5, 1.0);
}
`;

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector(".canvas");

/** @type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2");

if (!gl) {
    const error = document.querySelector(".error");
    error.textContent = "Please use a modern browser, as your current one does not support WebGL2.";
}

function createShader(/** @type {WebGL2RenderingContext} */gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) return shader;

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    
    return undefined;
}

function createProgram(/** @type {WebGL2RenderingContext} */gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) return program;

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    
    return undefined;
}

function resize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function main() {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link both shaders into a program.
    const program = createProgram(gl, vertexShader, fragmentShader);
    // Look up where the vertex data will go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    // Create a buffer and put three 2d clip space points in it.
    const positionBuffer = gl.createBuffer();

    // Bind it to the ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a vertex array object (attribute state).
    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell the attribute how to get data out of the positionBuffer (ARRAY_BUFFER).
    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0; // Start at the beginning of the buffer.

    gl.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        offset
    );

    // Resize the canvas on window resize event.
    resize(gl.canvas);

    // Tell WebGL how to convert from clip space to px.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell gl to use our program.
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Draw
    const primitiveType = gl.TRIANGLES;
    const count = 3;

    gl.drawArrays(primitiveType, offset, count);

}

main();
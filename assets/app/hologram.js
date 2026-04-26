class HologramRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.accelerometerCoords = [0.0, 0.0, 0.0];
        this.textures = {};
        this.program = null;
        
        this.init();
    }

    getVertexShaderSource() {
        return `
            uniform mat4 u_MVPMatrix;
            attribute vec4 a_VertexPosition;
            attribute vec2 a_TextureCoordinates;
            uniform vec3 u_AccelerometerCoordinates;
            varying vec2 v_TextureCoordinates;
            varying vec2 v_AccelerometerCoordinates;
            
            void main() {
                gl_Position = u_MVPMatrix * a_VertexPosition;
                v_TextureCoordinates = a_TextureCoordinates;
                v_AccelerometerCoordinates = normalize(u_AccelerometerCoordinates).xy;
            }
        `;
    }

    getFragmentShaderSource() {
        return `
            precision mediump float;
            
            uniform sampler2D u_BackgroundTexture;
            uniform sampler2D u_HologramTexture;
            uniform sampler2D u_HoloMapTexture;
            uniform sampler2D u_EagleTexture;
            
            varying vec2 v_TextureCoordinates;
            varying vec2 v_AccelerometerCoordinates;
            
            void main() {
                vec2 redAccelerometerCoordinates = v_AccelerometerCoordinates + 0.1 * v_TextureCoordinates;
                vec2 greenAccelerometerCoordinates = v_AccelerometerCoordinates + vec2(0.333, -0.333) + 0.1 * v_TextureCoordinates;
                vec2 blueAccelerometerCoordinates = v_AccelerometerCoordinates + vec2(0.667, -0.667) + 0.1 * v_TextureCoordinates;
                
                vec3 backgroundColor = texture2D(u_BackgroundTexture, v_TextureCoordinates).rgb;
                vec4 eagleColor = texture2D(u_EagleTexture, v_TextureCoordinates);
                
                vec3 redHologramColor = texture2D(u_HologramTexture, redAccelerometerCoordinates).rgb;
                vec3 greenHologramColor = texture2D(u_HologramTexture, greenAccelerometerCoordinates).rgb;
                vec3 blueHologramColor = texture2D(u_HologramTexture, blueAccelerometerCoordinates).rgb;
                
                vec4 holoMapColor = texture2D(u_HoloMapTexture, v_TextureCoordinates);
                
                float backgroundWeight = 1.0 - min(1.0, holoMapColor.r + holoMapColor.g + holoMapColor.b);
                
                vec3 hologramColor =
                    holoMapColor.r * redHologramColor +
                    holoMapColor.g * greenHologramColor +
                    holoMapColor.b * blueHologramColor +
                    backgroundWeight * backgroundColor;
                
                vec3 finalColor = eagleColor.rgb * (1.0 - holoMapColor.a * 0.5) + hologramColor * holoMapColor.a * 0.5;
                
                gl_FragColor = vec4(finalColor, eagleColor.a);
            }
        `;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.getVertexShaderSource());
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.getFragmentShaderSource());
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    loadTexture(url) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        };
        image.src = url;
        
        return texture;
    }

    init() {
        this.program = this.createProgram();
        if (!this.program) return;

        this.textures.background = this.loadTexture('images/hologram_background.webp');
        this.textures.hologram = this.loadTexture('images/hologram_overlay.webp');
        this.textures.holoMap = this.loadTexture('images/hologram_emblem_fake.png');
        this.textures.eagle = this.loadTexture('images/hologram_emblem_top.webp');

        const vertices = new Float32Array([
            -1.0, -1.0, 0.0, 1.0,
             1.0, -1.0, 1.0, 1.0,
            -1.0,  1.0, 0.0, 0.0,
             1.0,  1.0, 1.0, 0.0
        ]);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_VertexPosition');
        this.texCoordLocation = this.gl.getAttribLocation(this.program, 'a_TextureCoordinates');
        
        this.mvpMatrixLocation = this.gl.getUniformLocation(this.program, 'u_MVPMatrix');
        this.accelerometerLocation = this.gl.getUniformLocation(this.program, 'u_AccelerometerCoordinates');
        this.backgroundTextureLocation = this.gl.getUniformLocation(this.program, 'u_BackgroundTexture');
        this.hologramTextureLocation = this.gl.getUniformLocation(this.program, 'u_HologramTexture');
        this.holoMapTextureLocation = this.gl.getUniformLocation(this.program, 'u_HoloMapTexture');
        this.eagleTextureLocation = this.gl.getUniformLocation(this.program, 'u_EagleTexture');

        this.render();
    }

    updateAccelerometer(x, y, z) {
        this.accelerometerCoords = [x, y, z];
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 16, 0);
        
        this.gl.enableVertexAttribArray(this.texCoordLocation);
        this.gl.vertexAttribPointer(this.texCoordLocation, 2, this.gl.FLOAT, false, 16, 8);

        const mvpMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.gl.uniformMatrix4fv(this.mvpMatrixLocation, false, mvpMatrix);

        this.gl.uniform3fv(this.accelerometerLocation, this.accelerometerCoords);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.background);
        this.gl.uniform1i(this.backgroundTextureLocation, 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.hologram);
        this.gl.uniform1i(this.hologramTextureLocation, 1);

        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.holoMap);
        this.gl.uniform1i(this.holoMapTextureLocation, 2);

        this.gl.activeTexture(this.gl.TEXTURE3);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.eagle);
        this.gl.uniform1i(this.eagleTextureLocation, 3);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(() => this.render());
    }
}

let hologramRenderer;
let isGyroscopeEnabled = false;

function initHologram() {
    const canvas = document.getElementById('hologramCanvas');
    if (!canvas) return;
    // Dopasowanie rozmiarów płótna do 2x rozdzielczości względem CSS dla ostrości (np. CSS width to ok. 30px na telefonie)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width ? rect.width * 2 : 84;
    canvas.height = rect.height ? rect.height * 2 : 106;
    hologramRenderer = new HologramRenderer('hologramCanvas');
}

function requestGyroscopePermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    isGyroscopeEnabled = true;
                    startGyroscope();
                }
            })
            .catch(console.error);
    } else {
        isGyroscopeEnabled = true;
        startGyroscope();
    }
}

function startGyroscope() {
    window.addEventListener('deviceorientation', handleOrientation);
}

function handleOrientation(event) {
    if (!isGyroscopeEnabled) return;

    const gamma = (event.gamma || 0) / 90.0;
    const beta = (event.beta || 0) / 90.0;
    const alpha = (event.alpha || 0) / 360.0;

    if (hologramRenderer) {
        hologramRenderer.updateAccelerometer(gamma, beta, alpha);
    }
}

window.addEventListener('load', initHologram);

document.addEventListener('click', function() {
    if (!isGyroscopeEnabled) {
        requestGyroscopePermission();
    }
}, { once: true });

if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
    setTimeout(() => {
        isGyroscopeEnabled = true;
        startGyroscope();
    }, 1000);
}

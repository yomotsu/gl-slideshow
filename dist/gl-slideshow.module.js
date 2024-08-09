/*!
 * @author yomotsu
 * GLSlideshow
 * https://github.com/yomotsu/gl-slideshow
 * Released under the MIT License.
 */
class EventDispatcher {
    constructor() {
        this._listeners = {};
    }
    addEventListener(type, listener) {
        const listeners = this._listeners;
        if (listeners[type] === undefined)
            listeners[type] = [];
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    }
    hasEventListener(type, listener) {
        const listeners = this._listeners;
        return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
    }
    removeEventListener(type, listener) {
        const listeners = this._listeners;
        const listenerArray = listeners[type];
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            if (index !== -1)
                listenerArray.splice(index, 1);
        }
    }
    dispatchEvent(event) {
        const listeners = this._listeners;
        const listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            const array = listenerArray.slice(0);
            for (let i = 0, l = array.length; i < l; i++) {
                array[i].call(this, event);
            }
        }
    }
}

function getWebglContext(canvas, contextAttributes) {
    return (canvas.getContext('webgl', contextAttributes) ||
        canvas.getContext('experimental-webgl', contextAttributes));
}
const MAX_TEXTURE_SIZE = (() => {
    const $canvas = document.createElement('canvas');
    const gl = getWebglContext($canvas);
    const MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext)
        ext.loseContext();
    return MAX_TEXTURE_SIZE;
})();
function ceilPowerOfTwo(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}
function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0 && value !== 0;
}

const defaultImage = document.createElement('canvas');
defaultImage.width = 2;
defaultImage.height = 2;
class Texture extends EventDispatcher {
    constructor(image, gl) {
        super();
        this.image = image;
        this.gl = gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        this.onload();
    }
    isLoaded() {
        if (this.image instanceof HTMLCanvasElement)
            return true;
        return this.image.naturalWidth !== 0;
    }
    onload() {
        const onload = () => {
            this.image.removeEventListener('load', onload);
            this.setImage(this.image);
        };
        if (this.isLoaded()) {
            this.setImage(this.image);
            return;
        }
        this.image.addEventListener('load', onload);
    }
    setImage(image) {
        const _gl = this.gl;
        let _image;
        this.image = image;
        if (this.isLoaded()) {
            _image = this.image;
        }
        else {
            _image = defaultImage;
            this.onload();
        }
        if (!_gl) {
            this.dispatchEvent({ type: 'updated' });
            return;
        }
        const width = this.image instanceof HTMLImageElement ? this.image.naturalWidth : this.image.width;
        const height = this.image instanceof HTMLImageElement ? this.image.naturalHeight : this.image.height;
        const isPowerOfTwoSize = isPowerOfTwo(width) && isPowerOfTwo(height);
        _gl.bindTexture(_gl.TEXTURE_2D, this.texture);
        _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, isPowerOfTwoSize ? _gl.LINEAR_MIPMAP_NEAREST : _gl.LINEAR);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
        _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image);
        if (isPowerOfTwoSize)
            _gl.generateMipmap(_gl.TEXTURE_2D);
        _gl.bindTexture(_gl.TEXTURE_2D, null);
        this.dispatchEvent({ type: 'updated' });
    }
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
	gl_Position = vec4( position, 1., 1. );
	vUv = uv;
}
`;
const FRAGMENT_SHADER_SOURCE_HEAD = `
precision highp float;
varying vec2 vUv;
uniform float progress, ratio;
uniform vec2 resolution;
uniform sampler2D from, to;
vec4 getFromColor( vec2 uv ) {
	return texture2D(from, uv);
}
vec4 getToColor( vec2 uv ) {
	return texture2D(to, uv);
}
`;
const FRAGMENT_SHADER_SOURCE_FOOT = `
void main(){
	gl_FragColor = transition( vUv );
}
`;
const shaders = {
    crossFade: {
        uniforms: {},
        source: `
vec4 transition (vec2 uv) {
	return mix( getFromColor(uv), getToColor(uv), progress );
}`
    },
    crossZoom: {
        uniforms: {
            strength: 0.4,
        },
        source: `
// License: MIT
// Author: rectalogic
// ported by gre from https://gist.github.com/rectalogic/b86b90161503a0023231

// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag
// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js
// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib

uniform float strength; // = 0.4

const float PI = 3.141592653589793;

float Linear_ease(in float begin, in float change, in float duration, in float time) {
	return change * time / duration + begin;
}

float Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {
	if (time == 0.0)
		return begin;
	else if (time == duration)
		return begin + change;
	time = time / (duration / 2.0);
	if (time < 1.0)
		return change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;
	return change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;
}

float Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {
	return -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;
}

float rand (vec2 co) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 crossFade(in vec2 uv, in float dissolve) {
	return mix(getFromColor(uv).rgb, getToColor(uv).rgb, dissolve);
}

vec4 transition(vec2 uv) {
	vec2 texCoord = uv.xy / vec2(1.0).xy;

	// Linear interpolate center across center half of the image
	vec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);
	float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);

	// Mirrored sinusoidal loop. 0->strength then strength->0
	float strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);

	vec3 color = vec3(0.0);
	float total = 0.0;
	vec2 toCenter = center - texCoord;

	/* randomize the lookup values to hide the fixed number of samples */
	float offset = rand(uv);

	for (float t = 0.0; t <= 40.0; t++) {
		float percent = (t + offset) / 40.0;
		float weight = 4.0 * (percent - percent * percent);
		color += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;
		total += weight;
	}
	return vec4(color / total, 1.0);
}
`
    },
    directionalWipe: {
        uniforms: {
            direction: [1, -1],
            smoothness: 0.4
        },
        source: `
// Author: gre
// License: MIT

uniform vec2 direction; // = vec2(1.0, -1.0)
uniform float smoothness; // = 0.5

const vec2 center = vec2(0.5, 0.5);

vec4 transition (vec2 uv) {
	vec2 v = normalize(direction);
	v /= abs(v.x)+abs(v.y);
	float d = v.x * center.x + v.y * center.y;
	float m =
		(1.0-step(progress, 0.0)) * // there is something wrong with our formula that makes m not equals 0.0 with progress is 0.0
		(1.0 - smoothstep(-smoothness, 0.0, v.x * uv.x + v.y * uv.y - (d-0.5+progress*(1.+smoothness))));
	return mix(getFromColor(uv), getToColor(uv), m);
}
`
    },
    wind: {
        uniforms: {
            size: 0.2,
        },
        source: `
// Author: gre
// License: MIT

// Custom parameters
uniform float size; // = 0.2

float rand (vec2 co) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 transition (vec2 uv) {
	float r = rand(vec2(0, uv.y));
	float m = smoothstep(0.0, -size, uv.x*(1.0-size) + size*r - (progress * (1.0 + size)));
	return mix(
		getFromColor(uv),
		getToColor(uv),
		m
	);
}
`
    },
    ripple: {
        uniforms: {
            amplitude: 100,
            speed: 50,
        },
        source: `
// Author: gre
// License: MIT
uniform float amplitude; // = 100.0
uniform float speed; // = 50.0

vec4 transition (vec2 uv) {
	vec2 dir = uv - vec2(.5);
	float dist = length(dir);
	vec2 offset = dir * (sin(progress * dist * amplitude - progress * speed) + .5) / 30.;
	return mix(
		getFromColor(uv + offset),
		getToColor(uv),
		smoothstep(0.2, 1.0, progress)
	);
}
`
    },
    pageCurl: {
        uniforms: {},
        source: `
// author: Hewlett-Packard
// license: BSD 3 Clause
// Adapted by Sergey Kosarevsky from:
// http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html

/*
Copyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

	* Redistributions of source code must retain the above copyright
		notice, this list of conditions and the following disclaimer.
	* Redistributions in binary form must reproduce the above
		copyright notice, this list of conditions and the following disclaimer
		in the documentation and/or other materials provided with the
		distribution.
	* Neither the name of Hewlett-Packard nor the names of its
		contributors may be used to endorse or promote products derived from
		this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
in vec2 texCoord;
*/

const float MIN_AMOUNT = -0.16;
const float MAX_AMOUNT = 1.3;
float amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;

const float PI = 3.141592653589793;

const float scale = 512.0;
const float sharpness = 3.0;

float cylinderCenter = amount;
// 360 degrees * amount
float cylinderAngle = 2.0 * PI * amount;

const float cylinderRadius = 1.0 / PI / 2.0;

vec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)
{
	float hitPoint = hitAngle / (2.0 * PI);
	point.y = hitPoint;
	return rrotation * point;
}

vec4 antiAlias(vec4 color1, vec4 color2, float distanc)
{
	distanc *= scale;
	if (distanc < 0.0) return color2;
	if (distanc > 2.0) return color1;
	float dd = pow(1.0 - distanc / 2.0, sharpness);
	return ((color2 - color1) * dd) + color1;
}

float distanceToEdge(vec3 point)
{
	float dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);
	float dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);
	if (point.x < 0.0) dx = -point.x;
	if (point.x > 1.0) dx = point.x - 1.0;
	if (point.y < 0.0) dy = -point.y;
	if (point.y > 1.0) dy = point.y - 1.0;
	if ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);
	return min(dx, dy);
}

vec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)
{
	float hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);
	vec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);
	if (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))
	{
		return getToColor(p);
	}

	if (yc > 0.0) return getFromColor(p);

	vec4 color = getFromColor(point.xy);
	vec4 tcolor = vec4(0.0);

	return antiAlias(color, tcolor, distanceToEdge(point));
}

vec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)
{
	float shadow = distanceToEdge(point) * 30.0;
	shadow = (1.0 - shadow) / 3.0;

	if (shadow < 0.0) shadow = 0.0; else shadow *= amount;

	vec4 shadowColor = seeThrough(yc, p, rotation, rrotation);
	shadowColor.r -= shadow;
	shadowColor.g -= shadow;
	shadowColor.b -= shadow;

	return shadowColor;
}

vec4 backside(float yc, vec3 point)
{
	vec4 color = getFromColor(point.xy);
	float gray = (color.r + color.b + color.g) / 15.0;
	gray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));
	color.rgb = vec3(gray);
	return color;
}

vec4 behindSurface(vec2 p, float yc, vec3 point, mat3 rrotation)
{
	float shado = (1.0 - ((-cylinderRadius - yc) / amount * 7.0)) / 6.0;
	shado *= 1.0 - abs(point.x - 0.5);

	yc = (-cylinderRadius - cylinderRadius - yc);

	float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;
	point = hitPoint(hitAngle, yc, point, rrotation);

	if (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5))
	{
		shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / (71.0 / 100.0));
		shado *= pow(-yc / cylinderRadius, 3.0);
		shado *= 0.5;
	}
	else
	{
		shado = 0.0;
	}
	return vec4(getToColor(p).rgb - shado, 1.0);
}

vec4 transition(vec2 p) {

	const float angle = 30.0 * PI / 180.0;
	float c = cos(-angle);
	float s = sin(-angle);

	mat3 rotation = mat3(
		c, s, 0,
		-s, c, 0,
		0.12, 0.258, 1
	);
	c = cos(angle);
	s = sin(angle);

	mat3 rrotation = mat3(
		c, s, 0,
		-s, c, 0,
		0.15, -0.5, 1
	);

	vec3 point = rotation * vec3(p, 1.0);

	float yc = point.y - cylinderCenter;

	if (yc < -cylinderRadius)
	{
		// Behind surface
		return behindSurface(p,yc, point, rrotation);
	}

	if (yc > cylinderRadius)
	{
		// Flat surface
		return getFromColor(p);
	}

	float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;

	float hitAngleMod = mod(hitAngle, 2.0 * PI);
	if ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))
	{
		return seeThrough(yc, p, rotation, rrotation);
	}

	point = hitPoint(hitAngle, yc, point, rrotation);

	if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)
	{
		return seeThroughWithShadow(yc, p, point, rotation, rrotation);
	}

	vec4 color = backside(yc, point);

	vec4 otherColor;
	if (yc < 0.0)
	{
		float shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);
		shado *= pow(-yc / cylinderRadius, 3.0);
		shado *= 0.5;
		otherColor = vec4(0.0, 0.0, 0.0, shado);
	}
	else
	{
		otherColor = getFromColor(p);
	}

	color = antiAlias(color, otherColor, cylinderRadius - abs(yc));

	vec4 cl = seeThroughWithShadow(yc, p, point, rotation, rrotation);
	float dist = distanceToEdge(point);

	return antiAlias(color, cl, dist);
}
`
    }
};
function getShader(effectName) {
    return shaders[effectName];
}
function addShader(effectName, source, uniforms) {
    shaders[effectName] = {
        uniforms,
        source,
    };
}

const UV = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
]);
class GLSlideshow extends EventDispatcher {
    static addShader(effectName, source, uniforms) {
        addShader(effectName, source, uniforms);
    }
    static convertPowerOfTwo(image) {
        var _a;
        const $canvas = document.createElement('canvas');
        if (image.naturalWidth === 0) {
            console.warn('Image must be loaded before converting');
            return image;
        }
        const width = Math.min(ceilPowerOfTwo(image.naturalWidth), MAX_TEXTURE_SIZE);
        const height = Math.min(ceilPowerOfTwo(image.naturalHeight), MAX_TEXTURE_SIZE);
        if (isPowerOfTwo(width) && isPowerOfTwo(height))
            return image;
        $canvas.width = width;
        $canvas.height = height;
        (_a = $canvas.getContext('2d')) === null || _a === void 0 ? void 0 : _a.drawImage(image, 0, 0, width, height);
        return $canvas;
    }
    constructor(images, options = {}) {
        super();
        this.duration = 1000;
        this.interval = 5000;
        this._currentIndex = 0;
        this._startTime = 0;
        this._elapsedTime = 0;
        this._transitionStartTime = 0;
        this._progress = 0;
        this._isRunning = true;
        this._inTransition = false;
        this._hasUpdated = true;
        this._images = [];
        this._resolution = new Float32Array([0, 0]);
        this._destroyed = false;
        this._extraTextures = [];
        this._vertexes = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, -1,
            1, 1,
            -1, 1,
        ]);
        this._startTime = Date.now();
        this.duration = options && options.duration || 1000;
        this.interval = Math.max(options && options.interval || 5000, this.duration);
        this._domElement = options && options.canvas || document.createElement('canvas');
        images.forEach((image, i) => this.insert(image, i));
        this._resolution[0] = options.width || this._domElement.width;
        this._resolution[1] = options.height || this._domElement.height;
        this._imageAspect = options.imageAspect || this._resolution[0] / this._resolution[1];
        this._gl = getWebglContext(this._domElement);
        this._vertexBuffer = this._gl.createBuffer();
        this._uvBuffer = this._gl.createBuffer();
        this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
        this._gl.shaderSource(this._vertexShader, VERTEX_SHADER_SOURCE);
        this._gl.compileShader(this._vertexShader);
        this.setEffect(options.effect || 'crossFade');
        let initialSlide = true;
        const tick = () => {
            if (this._destroyed)
                return;
            if (this._isRunning)
                this._elapsedTime = Date.now() - this._startTime;
            requestAnimationFrame(tick);
            const timeout = initialSlide ? this.interval : this.interval + this.duration;
            if (timeout < this._elapsedTime) {
                initialSlide = false;
                this.to(this.nextIndex);
            }
            if (this._hasUpdated)
                this.render();
        };
        tick();
    }
    get domElement() {
        return this._domElement;
    }
    get currentIndex() {
        return this._currentIndex;
    }
    get nextIndex() {
        return (this._currentIndex < this.length - 1) ? this._currentIndex + 1 : 0;
    }
    get prevIndex() {
        return (this._currentIndex !== 0) ? this._currentIndex - 1 : this.length - 1;
    }
    get length() {
        return this._images.length;
    }
    get inTransition() {
        return this._inTransition;
    }
    to(to) {
        this._from.setImage(this._images[this._currentIndex]);
        this._to.setImage(this._images[to]);
        this._transitionStartTime = Date.now();
        this._startTime = Date.now();
        this._currentIndex = to;
        this._inTransition = true;
        this._hasUpdated = true;
        this.dispatchEvent({ type: 'transitionStart' });
    }
    play() {
        if (this._isRunning)
            return this;
        const pauseElapsedTime = Date.now() - (this._pauseStartTime || 0);
        this._startTime += pauseElapsedTime;
        this._isRunning = true;
        delete this._pauseStartTime;
        return this;
    }
    pause() {
        if (!this._isRunning)
            return this;
        this._isRunning = false;
        this._pauseStartTime = Date.now();
        return this;
    }
    insert(image, order) {
        const onload = (event) => {
            if (!(event.target instanceof Element))
                return;
            this._hasUpdated = true;
            event.target.removeEventListener('load', onload);
        };
        if (image instanceof HTMLImageElement && image.naturalWidth !== 0) {
            image.addEventListener('load', onload);
        }
        else if (typeof image === 'string') {
            const src = image;
            image = new Image();
            image.addEventListener('load', onload);
            image.src = src;
        }
        else {
            return;
        }
        this._images.splice(order, 0, image);
    }
    remove(order) {
        if (this.length === 1)
            return;
        this._images.splice(order, 1);
    }
    replace(images) {
        const length = this.length;
        images.forEach((image) => this.insert(image, this.length));
        for (let i = 0; i < length; i++) {
            this.remove(0);
        }
        this._hasUpdated = true;
        this.to(0);
    }
    setEffect(effectName) {
        const shader = getShader(effectName);
        const FSSource = FRAGMENT_SHADER_SOURCE_HEAD + shader.source + FRAGMENT_SHADER_SOURCE_FOOT;
        const uniforms = shader.uniforms;
        if (this._program) {
            this._gl.deleteTexture(this._from.texture);
            this._gl.deleteTexture(this._to.texture);
            this._gl.deleteShader(this._fragmentShader);
            this._gl.deleteProgram(this._program);
            this._extraTextures.forEach((texture) => this._gl.deleteTexture(texture));
            this._extraTextures.length = 0;
        }
        this._fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
        this._gl.shaderSource(this._fragmentShader, FSSource);
        this._gl.compileShader(this._fragmentShader);
        this._program = this._gl.createProgram();
        this._gl.attachShader(this._program, this._vertexShader);
        this._gl.attachShader(this._program, this._fragmentShader);
        this._gl.linkProgram(this._program);
        this._gl.useProgram(this._program);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexes, this._gl.STATIC_DRAW);
        const position = this._gl.getAttribLocation(this._program, 'position');
        this._gl.vertexAttribPointer(position, 2, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(position);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._uvBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, UV, this._gl.STATIC_DRAW);
        const uv = this._gl.getAttribLocation(this._program, 'uv');
        this._gl.vertexAttribPointer(uv, 2, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(uv);
        this._uniformLocations = {
            progress: this._gl.getUniformLocation(this._program, 'progress'),
            resolution: this._gl.getUniformLocation(this._program, 'resolution'),
            from: this._gl.getUniformLocation(this._program, 'from'),
            to: this._gl.getUniformLocation(this._program, 'to'),
        };
        for (const i in uniforms) {
            this._uniformLocations[i] = this._gl.getUniformLocation(this._program, i);
            this._setUniform(i, uniforms[i]);
        }
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._from = new Texture(this._images[this._currentIndex], this._gl);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._to = new Texture(this._images[this.nextIndex], this._gl);
        this._from.addEventListener('updated', this._updateTexture.bind(this));
        this._to.addEventListener('updated', this._updateTexture.bind(this));
        this._progress = 0;
        this.setSize(this._resolution[0], this._resolution[1]);
        this._updateTexture();
    }
    updateImageAspect(imageAspect) {
        this._imageAspect = imageAspect || this._resolution[0] / this._resolution[1];
        this._updateAspect();
        this._hasUpdated = true;
    }
    setSize(w, h) {
        if (this._domElement.width === w && this._domElement.height === h)
            return;
        this._domElement.width = w;
        this._domElement.height = h;
        this._resolution[0] = w;
        this._resolution[1] = h;
        this._gl.viewport(0, 0, w, h);
        this._gl.uniform2fv(this._uniformLocations.resolution, this._resolution);
        this._updateAspect();
        this._hasUpdated = true;
    }
    easing(t) {
        return t;
    }
    render() {
        if (this._destroyed)
            return;
        if (this._inTransition) {
            const transitionElapsedTime = Date.now() - this._transitionStartTime;
            this._progress = this._inTransition ? this.easing(Math.min(transitionElapsedTime / this.duration, 1)) : 0;
            this._gl.uniform1f(this._uniformLocations.progress, this._progress);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
            this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
            this._gl.flush();
            if (this._progress === 1) {
                this._inTransition = false;
                this._hasUpdated = false;
                this.dispatchEvent({ type: 'transitionEnd' });
            }
        }
        else {
            this._gl.uniform1f(this._uniformLocations.progress, this._progress);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
            this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
            this._gl.flush();
            this._hasUpdated = false;
        }
    }
    destroy() {
        this._destroyed = true;
        this._isRunning = false;
        this._inTransition = false;
        this.setSize(1, 1);
        if (this._program) {
            this._gl.activeTexture(this._gl.TEXTURE0);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.activeTexture(this._gl.TEXTURE1);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.activeTexture(this._gl.TEXTURE2);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.activeTexture(this._gl.TEXTURE3);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.activeTexture(this._gl.TEXTURE4);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.activeTexture(this._gl.TEXTURE5);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
            this._gl.deleteTexture(this._from.texture);
            this._gl.deleteTexture(this._to.texture);
            this._extraTextures.forEach((texture) => this._gl.deleteTexture(texture));
            this._extraTextures.length = 0;
            this._gl.deleteBuffer(this._vertexBuffer);
            this._gl.deleteBuffer(this._uvBuffer);
            this._gl.deleteShader(this._vertexShader);
            this._gl.deleteShader(this._fragmentShader);
            this._gl.deleteProgram(this._program);
        }
        if (!!this._domElement.parentNode) {
            this._domElement.parentNode.removeChild(this._domElement);
        }
    }
    _setUniform(key, value) {
        if (!this._program)
            return;
        const uniformLocation = this._gl.getUniformLocation(this._program, key);
        if (typeof value === 'number') {
            this._gl.uniform1f(uniformLocation, value);
        }
        else if (Array.isArray(value) && value.length === 2) {
            this._gl.uniform2f(uniformLocation, value[0], value[1]);
        }
        else if (Array.isArray(value) && value.length === 3) {
            this._gl.uniform3f(uniformLocation, value[0], value[1], value[2]);
        }
        else if (Array.isArray(value) && value.length === 4) {
            this._gl.uniform4f(uniformLocation, value[0], value[1], value[2], value[3]);
        }
        else if (value instanceof HTMLImageElement) {
            const textureUnit = this._extraTextures.length === 0 ? this._gl.TEXTURE2 :
                this._extraTextures.length === 1 ? this._gl.TEXTURE3 :
                    this._extraTextures.length === 2 ? this._gl.TEXTURE4 :
                        this._extraTextures.length === 3 ? this._gl.TEXTURE5 :
                            null;
            if (!textureUnit)
                return;
            this._gl.activeTexture(textureUnit);
            const texture = new Texture(value, this._gl);
            this._gl.bindTexture(this._gl.TEXTURE_2D, texture.texture);
            this._extraTextures.push(texture);
            this._gl.uniform1i(uniformLocation, 1 + this._extraTextures.length);
        }
    }
    _updateTexture() {
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._from.texture);
        this._gl.uniform1i(this._uniformLocations.from, 0);
        this._gl.activeTexture(this._gl.TEXTURE1);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._to.texture);
        this._gl.uniform1i(this._uniformLocations.to, 1);
        this._hasUpdated = true;
    }
    _updateAspect() {
        const canvasAspect = this._resolution[0] / this._resolution[1];
        const aspect = this._imageAspect / canvasAspect;
        const posX = aspect < 1 ? 1.0 : aspect;
        const posY = aspect > 1 ? 1.0 : canvasAspect / this._imageAspect;
        this._vertexes[0] = -posX;
        this._vertexes[1] = -posY;
        this._vertexes[2] = posX;
        this._vertexes[3] = -posY;
        this._vertexes[4] = -posX;
        this._vertexes[5] = posY;
        this._vertexes[6] = posX;
        this._vertexes[7] = -posY;
        this._vertexes[8] = posX;
        this._vertexes[9] = posY;
        this._vertexes[10] = -posX;
        this._vertexes[11] = posY;
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertexes, this._gl.STATIC_DRAW);
    }
}

export { GLSlideshow as default };

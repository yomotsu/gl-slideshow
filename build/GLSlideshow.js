/*!
 * @author yomotsu / http://yomotsu.net/
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GLSlideshow = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/*!
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function EventDispatcher() {};

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function apply(object) {

		object.addEventListener = EventDispatcher.prototype.addEventListener;
		object.hasEventListener = EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;
	},

	addEventListener: function addEventListener(type, listener) {

		if (this._listeners === undefined) this._listeners = {};

		var listeners = this._listeners;

		if (listeners[type] === undefined) {

			listeners[type] = [];
		}

		if (listeners[type].indexOf(listener) === -1) {

			listeners[type].push(listener);
		}
	},

	hasEventListener: function hasEventListener(type, listener) {

		if (this._listeners === undefined) return false;

		var listeners = this._listeners;

		if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {

			return true;
		}

		return false;
	},

	removeEventListener: function removeEventListener(type, listener) {

		if (this._listeners === undefined) return;

		var listeners = this._listeners;
		var listenerArray = listeners[type];

		if (listenerArray !== undefined) {

			var index = listenerArray.indexOf(listener);

			if (index !== -1) {

				listenerArray.splice(index, 1);
			}
		}
	},

	dispatchEvent: function dispatchEvent(event) {

		if (this._listeners === undefined) return;

		var listeners = this._listeners;
		var listenerArray = listeners[event.type];

		if (listenerArray !== undefined) {

			event.target = this;

			var array = [];
			var length = listenerArray.length;

			for (var i = 0; i < length; i++) {

				array[i] = listenerArray[i];
			}

			for (var i = 0; i < length; i++) {

				array[i].call(this, event);
			}
		}
	}

};

exports.default = EventDispatcher;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _EventDispatcher = require('./EventDispatcher.js');

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

var _WebGLRenderer = require('./WebGLRenderer.js');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _shaderLib = require('./shaderLib.js');

var _shaderLib2 = _interopRequireDefault(_shaderLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GLSlideshow = {

	hasCanvas: function () {

		var canvas = document.createElement('canvas');
		return !!(canvas.getContext && canvas.getContext('2d'));
	}(),

	hasWebGL: function () {

		try {

			var canvas = document.createElement('canvas');
			return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch (e) {

			return false;
		}
	}(),

	WebGLRenderer: _WebGLRenderer2.default,
	shaderLib: _shaderLib2.default

};

exports.default = GLSlideshow;
module.exports = exports['default'];

},{"./EventDispatcher.js":1,"./WebGLRenderer.js":4,"./shaderLib.js":6}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Primitive Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.shader
 */

var Renderer = function () {
	function Renderer(images, params) {
		_classCallCheck(this, Renderer);

		var that = this;

		this.count = 0;
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.isRunning = true;
		this.isAnimating = false;
		this.duration = params && params.duration || 1000;
		this.interval = Math.max(params && params.interval || 5000, this.duration);
		this.isUpdated = true;
		this.domElement = document.createElement('canvas');
		this.images = [];

		images.forEach(function (image, i) {
			that.insert(image, i);
		});
	}

	_createClass(Renderer, [{
		key: 'transition',
		value: function transition(to) {

			this.from.setImage(this.images[this.count]);
			this.to.setImage(this.images[to]);

			this.transitionStartTime = Date.now();
			this.startTime = Date.now();
			this.count = to;
			this.isAnimating = true;
			this.isUpdated = true;
		}
	}, {
		key: 'setSize',
		value: function setSize(w, h) {

			this.domElement.width = w;
			this.domElement.height = h;
			this.isUpdated = true;
		}

		// setEconomyMode ( state ) {

		// 	// TODO
		// 	// LINEAR_MIPMAP_LINEAR to low
		// 	// lowFPS
		// 	// and othres
		// 	this.isEconomyMode = state;

		// }

	}, {
		key: 'tick',
		value: function tick() {

			var next = 0;

			if (this.isRunning) {

				this.elapsedTime = Date.now() - this.startTime;
			}

			if (this.interval < this.elapsedTime) {

				next = this.getNext();
				this.transition(next);
			}

			requestAnimationFrame(this.tick.bind(this));

			if (this.isUpdated || this.isAnimating) {
				this.render();
			}
		}
	}, {
		key: 'render',
		value: function render() {}
	}, {
		key: 'play',
		value: function play() {

			var pauseElapsedTime = 0;

			if (this.isRunning) {
				return this;
			}

			pauseElapsedTime = Date.now() - this.pauseStartTime;
			this.startTime += pauseElapsedTime;
			this.isRunning = true;

			delete this._pauseStartTime;
			return this;
		}
	}, {
		key: 'pause',
		value: function pause() {

			if (!this.isRunning) {
				return this;
			}

			this.isRunning = false;
			this.pauseStartTime = Date.now();

			return this;
		}
	}, {
		key: 'getNext',
		value: function getNext() {

			return this.count < this.images.length - 1 ? this.count + 1 : 0;
		}
	}, {
		key: 'insert',
		value: function insert(image, order) {

			var src;

			if (image instanceof Image) {

				// nothing happens

			} else if (typeof image === 'string') {

					src = image;
					image = new Image();
					image.src = src;
				} else {

					return;
				}

			this.images.splice(order, 0, image);
		}
	}, {
		key: 'remove',
		value: function remove(order) {

			if (this.images.length === 1) {

				return;
			}

			this.images.splice(order, 1);
		}
	}]);

	return Renderer;
}();

exports.default = Renderer;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Renderer2 = require('./Renderer.js');

var _Renderer3 = _interopRequireDefault(_Renderer2);

var _WebGLTexture = require('./WebGLTexture.js');

var _WebGLTexture2 = _interopRequireDefault(_WebGLTexture);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var vertexShaderSource = '\nattribute vec2 position;\nvoid main(){\n\tgl_Position = vec4( position, 1., 1. );\n}\n';

/**
 * WebGL Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.shader
 */

var WebGLRenderer = function (_Renderer) {
	_inherits(WebGLRenderer, _Renderer);

	function WebGLRenderer(images, params) {
		_classCallCheck(this, WebGLRenderer);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebGLRenderer).call(this, images, params));

		var that = _this;

		_this.gl = _this.domElement.getContext('webgl') || _this.domElement.getContext('experimental-webgl');
		_this.resolution = new Float32Array([params && params.width || _this.domElement.width, params && params.height || _this.domElement.height]);

		_this.vertexShader = _this.gl.createShader(_this.gl.VERTEX_SHADER);
		_this.gl.shaderSource(_this.vertexShader, vertexShaderSource);
		_this.gl.compileShader(_this.vertexShader);
		_this.setShaderProgram(params && params.shader || 'crossFade');

		_this.tick();

		return _this;
	}

	_createClass(WebGLRenderer, [{
		key: 'setShaderProgram',
		value: function setShaderProgram(fragmentShaderType, params) {

			var i = 0;
			var position;
			var FSSource = GLSlideshow.shaderLib[fragmentShaderType].source;
			var uniforms = GLSlideshow.shaderLib[fragmentShaderType].uniforms;

			if (this.program) {

				this.from.image.removeEventListener(this.from.onload);
				this.to.image.removeEventListener(this.to.onload);

				this.gl.deleteTexture(this.from.texture);
				this.gl.deleteTexture(this.to.texture);
				this.gl.deleteBuffer(this.vertexBuffer);
				this.gl.deleteShader(this.fragmentShader);
				this.gl.deleteProgram(this.program);
			}

			this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
			this.gl.shaderSource(this.fragmentShader, FSSource);
			this.gl.compileShader(this.fragmentShader);

			this.program = this.gl.createProgram();
			this.gl.attachShader(this.program, this.vertexShader);
			this.gl.attachShader(this.program, this.fragmentShader);
			this.gl.linkProgram(this.program);
			this.gl.useProgram(this.program);

			this.vertexBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), this.gl.STATIC_DRAW);

			position = this.gl.getAttribLocation(this.program, 'position');
			this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);
			this.gl.enableVertexAttribArray(position);

			this.uniforms = {
				progress: this.gl.getUniformLocation(this.program, 'progress'),
				resolution: this.gl.getUniformLocation(this.program, 'resolution'),
				from: this.gl.getUniformLocation(this.program, 'from'),
				to: this.gl.getUniformLocation(this.program, 'to')
			};

			for (i in uniforms) {

				this.uniforms[i] = this.gl.getUniformLocation(this.program, i);
				this.setUnifrom(i, uniforms[i].value, uniforms[i].type);
			}

			this.from = new _WebGLTexture2.default(this.gl, this.images[this.count]);
			this.to = new _WebGLTexture2.default(this.gl, this.images[this.getNext()]);

			this.from.addEventListener('updated', this.updateWebGLTexture.bind(this));
			this.to.addEventListener('updated', this.updateWebGLTexture.bind(this));

			this.setSize(this.resolution[0], this.resolution[1]);
			this.updateWebGLTexture();
		}
	}, {
		key: 'setUnifrom',
		value: function setUnifrom(key, value, type) {

			// TODO
			var unifromLocation = this.gl.getUniformLocation(this.program, key);

			if (type === 'float') {

				this.gl.uniform1f(unifromLocation, value);
			} else if (type === 'vec2') {

				// this.gl.uniform2fv

			}
		}
	}, {
		key: 'updateWebGLTexture',
		value: function updateWebGLTexture() {

			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.from.texture);
			this.gl.uniform1i(this.uniforms.from, 0);

			this.gl.activeTexture(this.gl.TEXTURE1);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.to.texture);
			this.gl.uniform1i(this.uniforms.to, 1);

			this.isUpdated = true;
		}
	}, {
		key: 'setSize',
		value: function setSize(w, h) {

			_get(Object.getPrototypeOf(WebGLRenderer.prototype), 'setSize', this).call(this, w, h);

			this.resolution[0] = w;
			this.resolution[1] = h;
			this.gl.viewport(0, 0, w, h);
			this.gl.uniform2fv(this.uniforms.resolution, this.resolution);
			this.isUpdated = true;
		}
	}, {
		key: 'render',
		value: function render() {

			var transitionElapsedTime = 0;
			var progress = 0;

			if (this.isAnimating) {

				transitionElapsedTime = Date.now() - this.transitionStartTime;
				progress = this.isAnimating ? Math.min(transitionElapsedTime / this.duration, 1.0) : 0;

				if (progress === 1.0) {

					this.isAnimating = false;
				}
			}

			// this.gl.clearColor( 0, 0, 0, 1 );
			this.gl.uniform1f(this.uniforms.progress, progress);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
			this.gl.flush();
			this.isUpdated = false;
		}
	}, {
		key: 'dispose',
		value: function dispose() {

			this.isRunning = false;
			this.isAnimating = false;
			this.from.image.removeEventListener(this.from.onload);
			this.to.image.removeEventListener(this.to.onload);

			this.tick = function () {};

			if (this.program) {

				this.gl.deleteTexture(this.from.texture);
				this.gl.deleteTexture(this.to.texture);
				this.gl.deleteBuffer(this.vertexBuffer);
				this.gl.deleteShader(this.vertexShader);
				this.gl.deleteShader(this.fragmentShader);
				this.gl.deleteProgram(this.program);
			}
		}
	}]);

	return WebGLRenderer;
}(_Renderer3.default);

exports.default = WebGLRenderer;
module.exports = exports['default'];

},{"./Renderer.js":3,"./WebGLTexture.js":5}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _EventDispatcher = require('./EventDispatcher.js');

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var textureCanvas = document.createElement('canvas');
var textureCanvasContext = textureCanvas.getContext('2d');
var defaultImage = new Image();
defaultImage.src = 'data:image/gif;base64,R0lGODlhAgACAPAAAP///wAAACwAAAAAAgACAEACAoRRADs=';

/**
 * WebGL Texture class.
 * @class WebGLTexture
 * @constructor
 * @param {WebGLRenderingContext} gl
 * @param {Image} image HTMLImageElement
 */

var WebGLTexture = function () {
	function WebGLTexture(gl, image) {
		_classCallCheck(this, WebGLTexture);

		this.gl = gl;
		this.texture = gl.createTexture();
		this.setImage(image);
		this.onload = this.setImage.bind(this, this.image);

		this.image.addEventListener('load', this.onload);

		// document.body.appendChild( this.textureCanvas );

		return this;
	}

	_createClass(WebGLTexture, [{
		key: 'setImage',
		value: function setImage(image) {

			var _gl = this.gl;
			var isLoaded = image.naturalWidth !== 0;
			var _image;
			var w, h, size;

			this.image = image;

			if (isLoaded) {

				w = image.naturalWidth;
				h = image.naturalHeight;
				// largest 2^n integer that does not exceed s
				size = Math.pow(2, Math.log(Math.max(w, h)) / Math.LN2 | 0);

				textureCanvas.height = textureCanvas.width = size;
				textureCanvasContext.drawImage(image, 0, 0, w, h, 0, 0, size, size);
				_image = textureCanvas;
			} else {

				_image = defaultImage;
			}

			_gl.bindTexture(_gl.TEXTURE_2D, this.texture);
			_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
			_gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image);
			_gl.generateMipmap(_gl.TEXTURE_2D);
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR);
			_gl.bindTexture(_gl.TEXTURE_2D, null);

			this.dispatchEvent({ type: 'updated' });
		}
	}]);

	return WebGLTexture;
}();

exports.default = WebGLTexture;

_EventDispatcher2.default.prototype.apply(WebGLTexture.prototype);
module.exports = exports['default'];

},{"./EventDispatcher.js":1}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	crossFade: {

		uniforms: {},
		source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nvoid main() {\n\tvec2 p = gl_FragCoord.xy / resolution.xy;\n\t// gl_FragColor =texture2D( from, p );\n\t// gl_FragColor=texture2D( to, p );\n\tgl_FragColor = mix( texture2D( from, p ), texture2D( to, p ), progress );\n\n}\n'

	},

	crossZoom: {

		// by http://transitions.glsl.io/transition/b86b90161503a0023231

		uniforms: {
			strength: { value: 0.4, type: 'float' }
		},
		source: '\n// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag\n// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js\n// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib\n\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float strength;\n\nconst float PI = 3.141592653589793;\n\nfloat Linear_ease(in float begin, in float change, in float duration, in float time) {\n\t\treturn change * time / duration + begin;\n}\n\nfloat Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {\n\t\tif (time == 0.0)\n\t\t\t\treturn begin;\n\t\telse if (time == duration)\n\t\t\t\treturn begin + change;\n\t\ttime = time / (duration / 2.0);\n\t\tif (time < 1.0)\n\t\t\t\treturn change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;\n\t\treturn change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;\n}\n\nfloat Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {\n\t\treturn -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;\n}\n\n/* random number between 0 and 1 */\nfloat random(in vec3 scale, in float seed) {\n\t\t/* use the fragment position for randomness */\n\t\treturn fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvec3 crossFade(in vec2 uv, in float dissolve) {\n\t\treturn mix(texture2D(from, uv).rgb, texture2D(to, uv).rgb, dissolve);\n}\n\nvoid main() {\n\t\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\t\n\t\t// Linear interpolate center across center half of the image\n\t\tvec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);\n\t\tfloat dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);\n\t\t\n\t\t// Mirrored sinusoidal loop. 0->strength then strength->0\n\t\tfloat strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);\n\t\t\n\t\tvec3 color = vec3(0.0);\n\t\tfloat total = 0.0;\n\t\tvec2 toCenter = center - texCoord;\n\t\t\n\t\t/* randomize the lookup values to hide the fixed number of samples */\n\t\tfloat offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\t\t\n\t\tfor (float t = 0.0; t <= 40.0; t++) {\n\t\t\t\tfloat percent = (t + offset) / 40.0;\n\t\t\t\tfloat weight = 4.0 * (percent - percent * percent);\n\t\t\t\tcolor += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;\n\t\t\t\ttotal += weight;\n\t\t}\n\t\tgl_FragColor = vec4(color / total, 1.0);\n}\n'

	},

	cube: {

		// by http://transitions.glsl.io/transition/ee15128c2b87d0e74dee

		uniforms: {
			persp: { value: 0.7, type: 'float' },
			unzoom: { value: 0.3, type: 'float' },
			reflection: { value: 0.4, type: 'float' },
			floating: { value: 3, type: 'float' }
		},
		source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float persp;\nuniform float unzoom;\nuniform float reflection;\nuniform float floating;\n\nvec2 project (vec2 p) {\n\treturn p * vec2(1.0, -1.2) + vec2(0.0, -floating/100.);\n}\n\nbool inBounds (vec2 p) {\n\treturn all(lessThan(vec2(0.0), p)) && all(lessThan(p, vec2(1.0)));\n}\n\nvec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {\n\tvec4 c = vec4(0.0, 0.0, 0.0, 1.0);\n\tpfr = project(pfr);\n\tif (inBounds(pfr)) {\n\t\tc += mix(vec4(0.0), texture2D(from, pfr), reflection * mix(1.0, 0.0, pfr.y));\n\t}\n\tpto = project(pto);\n\tif (inBounds(pto)) {\n\t\tc += mix(vec4(0.0), texture2D(to, pto), reflection * mix(1.0, 0.0, pto.y));\n\t}\n\treturn c;\n}\n\n// p : the position\n// persp : the perspective in [ 0, 1 ]\n// center : the xcenter in [0, 1]  0.5 excluded\nvec2 xskew (vec2 p, float persp, float center) {\n\tfloat x = mix(p.x, 1.0-p.x, center);\n\treturn (\n\t\t(\n\t\t\tvec2( x, (p.y - 0.5*(1.0-persp) * x) / (1.0+(persp-1.0)*x) )\n\t\t\t- vec2(0.5-distance(center, 0.5), 0.0)\n\t\t)\n\t\t* vec2(0.5 / distance(center, 0.5) * (center<0.5 ? 1.0 : -1.0), 1.0)\n\t\t+ vec2(center<0.5 ? 0.0 : 1.0, 0.0)\n\t);\n}\n\nvoid main() {\n\tvec2 op = gl_FragCoord.xy / resolution.xy;\n\tfloat uz = unzoom * 2.0*(0.5-distance(0.5, progress));\n\tvec2 p = -uz*0.5+(1.0+uz) * op;\n\tvec2 fromP = xskew(\n\t\t(p - vec2(progress, 0.0)) / vec2(1.0-progress, 1.0),\n\t\t1.0-mix(progress, 0.0, persp),\n\t\t0.0\n\t);\n\tvec2 toP = xskew(\n\t\tp / vec2(progress, 1.0),\n\t\tmix(pow(progress, 2.0), 1.0, persp),\n\t\t1.0\n\t);\n\tif (inBounds(fromP)) {\n\t\tgl_FragColor = texture2D(from, fromP);\n\t}\n\telse if (inBounds(toP)) {\n\t\tgl_FragColor = texture2D(to, toP);\n\t}\n\telse {\n\t\tgl_FragColor = bgColor(op, fromP, toP);\n\t}\n}\n'

	},

	wind: {

		// by http://transitions.glsl.io/transition/7de3f4b9482d2b0bf7bb

		uniforms: {
			size: { value: 0.2, type: 'float' }
		},
		source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \n// Custom parameters\nuniform float size;\n \nfloat rand (vec2 co) {\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  float r = rand(vec2(0, p.y));\n  float m = smoothstep(0.0, -size, p.x*(1.0-size) + size*r - (progress * (1.0 + size)));\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);\n}\n'

	}

};
module.exports = exports['default'];

},{}]},{},[2])(2)
});
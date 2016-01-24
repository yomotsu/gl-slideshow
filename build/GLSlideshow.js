/*!
 * @author yomotsu / http://yomotsu.net/
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GLSlideshow = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _Renderer2 = require('./Renderer.js');

var _Renderer3 = _interopRequireDefault(_Renderer2);

var _Texture = require('./Texture.js');

var _Texture2 = _interopRequireDefault(_Texture);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * Canvas Renderer class.
 * @class CanvasRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 */

var CanvasRenderer = function (_Renderer) {
	_inherits(CanvasRenderer, _Renderer);

	function CanvasRenderer(images, params) {
		_classCallCheck(this, CanvasRenderer);

		var _this = _possibleConstructorReturn(this, _Renderer.call(this, images, params));

		var that = _this;

		_this.from = new _Texture2.default(_this.images[_this.count]);
		_this.to = new _Texture2.default(_this.images[_this.getNext()]);

		_this.from.addEventListener('updated', _this.updateTexture.bind(_this));
		_this.to.addEventListener('updated', _this.updateTexture.bind(_this));

		_this.setSize(params.width || _this.domElement.width, params.height || _this.domElement.height);
		_this.tick();

		return _this;
	}

	CanvasRenderer.prototype.updateTexture = function updateTexture() {

		this.isUpdated = true;
	};

	CanvasRenderer.prototype.render = function render() {

		var transitionElapsedTime = 0;
		var progress = 1;
		var width = this.domElement.width;
		var height = this.domElement.height;

		if (this.inTranstion) {

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min(transitionElapsedTime / this.duration, 1) : 0;

			if (progress !== 1) {

				this.context2d.drawImage(this.from.image, 0, 0, width, height);
				this.context2d.globalAlpha = progress;
				this.context2d.drawImage(this.to.image, 0, 0, width, height);
				this.context2d.globalAlpha = 1;
			} else {

				this.context2d.drawImage(this.to.image, 0, 0, width, height);
				this.inTranstion = false; // may move to tick()
				this.isUpdated = false;
				// transitionEnd!
			}
		} else {

				this.context2d.drawImage(this.images[this.count], 0, 0, width, height);
				this.isUpdated = false;
			}
	};

	CanvasRenderer.prototype.dispose = function dispose() {

		this.isRunning = false;
		this.inTranstion = false;

		this.tick = function () {};

		this.setSize(1, 1);

		if (!!this.domElement.parentNode) {

			this.domElement.parentNode.removeChild(this.domElement);
		}

		delete this.from;
		delete this.to;
		delete this.domElement;
	};

	return CanvasRenderer;
}(_Renderer3.default);

exports.default = CanvasRenderer;
module.exports = exports['default'];

},{"./Renderer.js":4,"./Texture.js":5}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
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

},{}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _WebGLRenderer = require('./WebGLRenderer.js');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _CanvasRenderer = require('./CanvasRenderer.js');

var _CanvasRenderer2 = _interopRequireDefault(_CanvasRenderer);

var _autoDetectRenderer = require('./autoDetectRenderer.js');

var _autoDetectRenderer2 = _interopRequireDefault(_autoDetectRenderer);

var _shaderLib = require('./shaderLib.js');

var _shaderLib2 = _interopRequireDefault(_shaderLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

	hasCanvas: _utils2.default.hasCanvas,
	hasWebGL: _utils2.default.hasWebGL,
	autoDetectRenderer: _autoDetectRenderer2.default,
	WebGLRenderer: _WebGLRenderer2.default,
	CanvasRenderer: _CanvasRenderer2.default,
	shaderLib: _shaderLib2.default

};
module.exports = exports['default'];

},{"./CanvasRenderer.js":1,"./WebGLRenderer.js":6,"./autoDetectRenderer.js":7,"./shaderLib.js":8,"./utils.js":9}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rAF = function () {

	var lastTime = 0;

	if (!!window.requestAnimationFrame) {

		return window.requestAnimationFrame;
	} else {

		return function (callback, element) {

			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
}();

/**
 * Primitive Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 */

var Renderer = function () {
	function Renderer(images, params) {
		_classCallCheck(this, Renderer);

		var that = this;

		this.count = 0;
		this.startTime = Date.now();
		this.elapsedTime = 0;
		this.isRunning = true;
		this.inTranstion = false;
		this.duration = params && params.duration || 1000;
		this.interval = Math.max(params && params.interval || 5000, this.duration);
		this.isUpdated = true;
		this.domElement = document.createElement('canvas');
		this.context2d = this.domElement.getContext('2d');
		this.images = [];

		images.forEach(function (image, i) {
			that.insert(image, i);
		});
	}

	Renderer.prototype.transition = function transition(to) {

		this.from.setImage(this.images[this.count]);
		this.to.setImage(this.images[to]);

		this.transitionStartTime = Date.now();
		this.startTime = Date.now();
		this.count = to;
		this.inTranstion = true;
		this.isUpdated = true;
	};

	Renderer.prototype.setSize = function setSize(w, h) {

		this.domElement.width = w;
		this.domElement.height = h;
		this.isUpdated = true;
	};

	// setEconomyMode ( state ) {

	// 	// TODO
	// 	// LINEAR_MIPMAP_LINEAR to low
	// 	// lowFPS
	// 	// and othres
	// 	this.isEconomyMode = state;

	// }

	Renderer.prototype.tick = function tick() {

		var next = 0;

		if (this.isRunning) {

			this.elapsedTime = Date.now() - this.startTime;
		}

		if (this.interval + this.duration < this.elapsedTime) {

			next = this.getNext();
			this.transition(next);
			// transition start
		}

		rAF(this.tick.bind(this));

		if (this.isUpdated) {
			this.render();
		}
	};

	Renderer.prototype.render = function render() {};

	Renderer.prototype.play = function play() {

		var pauseElapsedTime = 0;

		if (this.isRunning) {
			return this;
		}

		pauseElapsedTime = Date.now() - this.pauseStartTime;
		this.startTime += pauseElapsedTime;
		this.isRunning = true;

		delete this._pauseStartTime;
		return this;
	};

	Renderer.prototype.pause = function pause() {

		if (!this.isRunning) {
			return this;
		}

		this.isRunning = false;
		this.pauseStartTime = Date.now();

		return this;
	};

	Renderer.prototype.getCurrent = function getCurrent() {

		return this.count;
	};

	Renderer.prototype.getNext = function getNext() {

		return this.count < this.images.length - 1 ? this.count + 1 : 0;
	};

	Renderer.prototype.getPrev = function getPrev() {

		return this.count !== 0 ? this.count - 1 : this.images.length;
	};

	Renderer.prototype.insert = function insert(image, order) {

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
	};

	Renderer.prototype.remove = function remove(order) {

		if (this.images.length === 1) {

			return;
		}

		this.images.splice(order, 1);
	};

	return Renderer;
}();

exports.default = Renderer;
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _EventDispatcher = require('./EventDispatcher.js');

var _EventDispatcher2 = _interopRequireDefault(_EventDispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultImage = new Image();
defaultImage.src = 'data:image/gif;base64,R0lGODlhAgACAPAAAP///wAAACwAAAAAAgACAEACAoRRADs=';

/**
 * WebGL Texture class.
 * @class WebGLTexture
 * @constructor
 * @param {Image} image HTMLImageElement
 * @param {WebGLRenderingContext} gl
 */

var WebGLTexture = function () {
	function WebGLTexture(image, gl) {
		_classCallCheck(this, WebGLTexture);

		this.image = image;

		if (!!gl && gl instanceof WebGLRenderingContext) {

			this.gl = gl;
			this.texture = gl.createTexture();
		};

		this.setImage(this.image);
	}

	WebGLTexture.prototype.isLoaded = function isLoaded() {

		return this.image.naturalWidth !== 0;
	};

	WebGLTexture.prototype.onload = function onload() {

		var onload = function () {

			this.image.removeEventListener('load', onload);
			this.setImage(this.image);
		}.bind(this);

		if (this.isLoaded()) {

			this.setImage(this.image);
			return;
		}

		this.image.addEventListener('load', onload);
	};

	WebGLTexture.prototype.setImage = function setImage(image) {

		var _gl = this.gl;
		var _image;

		this.image = image;

		if (this.isLoaded()) {

			_image = this.image;
		} else {

			_image = defaultImage;
			this.onload();
		}

		if (!_gl) {

			this.dispatchEvent({ type: 'updated' });
			return;
		}

		_gl.bindTexture(_gl.TEXTURE_2D, this.texture);
		_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
		_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
		_gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _image);
		_gl.bindTexture(_gl.TEXTURE_2D, null);

		this.dispatchEvent({ type: 'updated' });
	};

	return WebGLTexture;
}();

exports.default = WebGLTexture;

_EventDispatcher2.default.prototype.apply(WebGLTexture.prototype);
module.exports = exports['default'];

},{"./EventDispatcher.js":2}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _Renderer2 = require('./Renderer.js');

var _Renderer3 = _interopRequireDefault(_Renderer2);

var _Texture = require('./Texture.js');

var _Texture2 = _interopRequireDefault(_Texture);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var vertexShaderSource = '\nattribute vec2 position;\nvoid main () { gl_Position = vec4( position, 1., 1. ); }\n';

/**
 * WebGL Renderer class.
 * @class WebGLRenderer
 * @constructor
 * @param {...(String|Image)} images List of path to image of Image element
 * @param {Object} params
 * @param {Number} params.width
 * @param {Number} params.height
 * @param {String} params.effect
 */

var WebGLRenderer = function (_Renderer) {
	_inherits(WebGLRenderer, _Renderer);

	function WebGLRenderer(images, params) {
		_classCallCheck(this, WebGLRenderer);

		var _this = _possibleConstructorReturn(this, _Renderer.call(this, images, params));

		var that = _this;

		_this.glCanvas = document.createElement('canvas');
		_this.gl = _this.glCanvas.getContext('webgl') || _this.glCanvas.getContext('experimental-webgl');
		_this.resolution = new Float32Array([params && params.width || _this.domElement.width, params && params.height || _this.domElement.height]);

		_this.vertexShader = _this.gl.createShader(_this.gl.VERTEX_SHADER);
		_this.gl.shaderSource(_this.vertexShader, vertexShaderSource);
		_this.gl.compileShader(_this.vertexShader);
		_this.setEffect(params && params.effect || 'crossFade');

		_this.tick();

		return _this;
	}

	WebGLRenderer.prototype.setEffect = function setEffect(effectName, params) {

		var i = 0;
		var position;
		var FSSource = GLSlideshow.shaderLib[effectName].source;
		var uniforms = GLSlideshow.shaderLib[effectName].uniforms;

		if (this.program) {

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

		this.from = new _Texture2.default(this.images[this.count], this.gl);
		this.to = new _Texture2.default(this.images[this.getNext()], this.gl);

		this.from.addEventListener('updated', this.updateTexture.bind(this));
		this.to.addEventListener('updated', this.updateTexture.bind(this));

		this.setSize(this.resolution[0], this.resolution[1]);
		this.updateTexture();
	};

	WebGLRenderer.prototype.setUnifrom = function setUnifrom(key, value, type) {

		// TODO
		var unifromLocation = this.gl.getUniformLocation(this.program, key);

		if (type === 'float') {

			this.gl.uniform1f(unifromLocation, value);
		} else if (type === 'vec2') {

			// this.gl.uniform2fv

		}
	};

	WebGLRenderer.prototype.updateTexture = function updateTexture() {

		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.from.texture);
		this.gl.uniform1i(this.uniforms.from, 0);

		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.to.texture);
		this.gl.uniform1i(this.uniforms.to, 1);

		this.isUpdated = true;
	};

	WebGLRenderer.prototype.setSize = function setSize(w, h) {

		_Renderer.prototype.setSize.call(this, w, h);

		this.glCanvas.width = w;
		this.glCanvas.height = h;
		this.resolution[0] = w;
		this.resolution[1] = h;
		this.gl.viewport(0, 0, w, h);
		this.gl.uniform2fv(this.uniforms.resolution, this.resolution);
		this.isUpdated = true;
	};

	WebGLRenderer.prototype.render = function render() {

		var transitionElapsedTime = 0;
		var progress = 1;

		if (this.inTranstion) {

			transitionElapsedTime = Date.now() - this.transitionStartTime;
			progress = this.inTranstion ? Math.min(transitionElapsedTime / this.duration, 1) : 0;

			// this.gl.clearColor( 0, 0, 0, 1 );
			this.gl.uniform1f(this.uniforms.progress, progress);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
			this.gl.flush();
			this.context2d.drawImage(this.glCanvas, 0, 0);

			if (progress === 1) {

				this.context2d.drawImage(this.to.image, 0, 0, this.domElement.width, this.domElement.height);
				this.inTranstion = false; // may move to tick()
				this.isUpdated = false;
				// transitionEnd!
			}
		} else {

				this.context2d.drawImage(this.images[this.count], 0, 0, this.domElement.width, this.domElement.height);
				this.isUpdated = false;
			}
	};

	WebGLRenderer.prototype.dispose = function dispose() {

		this.isRunning = false;
		this.inTranstion = false;

		this.tick = function () {};

		if (this.program) {

			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.gl.activeTexture(this.gl.TEXTURE1);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
			// this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, null );
			// this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, null );
			// this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

			this.gl.deleteTexture(this.from.texture);
			this.gl.deleteTexture(this.to.texture);
			this.gl.deleteBuffer(this.vertexBuffer);
			// this.gl.deleteRenderbuffer( ... );
			// this.gl.deleteFramebuffer( ... );
			this.gl.deleteShader(this.vertexShader);
			this.gl.deleteShader(this.fragmentShader);
			this.gl.deleteProgram(this.program);
		}

		this.setSize(1, 1);

		if (!!this.domElement.parentNode) {

			this.domElement.parentNode.removeChild(this.domElement);
		}

		delete this.from;
		delete this.to;
		delete this.domElement;
		delete this.glCanvas;
	};

	return WebGLRenderer;
}(_Renderer3.default);

exports.default = WebGLRenderer;
module.exports = exports['default'];

},{"./Renderer.js":4,"./Texture.js":5}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports.default = function (images, params) {

	if (!_utils2.default.hasCanvas) {

		// your browser is not available both canvas and webgl
		return;
	}

	if (!_utils2.default.hasWebGL) {

		return new _CanvasRenderer2.default(images, params);
	}

	return new _WebGLRenderer2.default(images, params);
};

var _utils = require('./utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _WebGLRenderer = require('./WebGLRenderer.js');

var _WebGLRenderer2 = _interopRequireDefault(_WebGLRenderer);

var _CanvasRenderer = require('./CanvasRenderer.js');

var _CanvasRenderer2 = _interopRequireDefault(_CanvasRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];

},{"./CanvasRenderer.js":1,"./WebGLRenderer.js":6,"./utils.js":9}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
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
		source: '\n// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag\n// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js\n// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib\n\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float strength;\n\nconst float PI = 3.141592653589793;\n\nfloat Linear_ease(in float begin, in float change, in float duration, in float time) {\n\treturn change * time / duration + begin;\n}\n\nfloat Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {\n\tif (time == 0.0)\n\t\treturn begin;\n\telse if (time == duration)\n\t\treturn begin + change;\n\ttime = time / (duration / 2.0);\n\tif (time < 1.0)\n\t\treturn change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;\n\treturn change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;\n}\n\nfloat Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {\n\treturn -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;\n}\n\n/* random number between 0 and 1 */\nfloat random(in vec3 scale, in float seed) {\n\t/* use the fragment position for randomness */\n\treturn fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvec3 crossFade(in vec2 uv, in float dissolve) {\n\treturn mix(texture2D(from, uv).rgb, texture2D(to, uv).rgb, dissolve);\n}\n\nvoid main() {\n\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\n\t// Linear interpolate center across center half of the image\n\tvec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);\n\tfloat dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);\n\n\t// Mirrored sinusoidal loop. 0->strength then strength->0\n\tfloat strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);\n\n\tvec3 color = vec3(0.0);\n\tfloat total = 0.0;\n\tvec2 toCenter = center - texCoord;\n\n\t/* randomize the lookup values to hide the fixed number of samples */\n\tfloat offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n\tfor (float t = 0.0; t <= 40.0; t++) {\n\t\tfloat percent = (t + offset) / 40.0;\n\t\tfloat weight = 4.0 * (percent - percent * percent);\n\t\tcolor += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;\n\t\ttotal += weight;\n\t}\n\tgl_FragColor = vec4(color / total, 1.0);\n}\n'

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
		source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\n\n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n\n// Custom parameters\nuniform float size;\n\nfloat rand (vec2 co) {\n\treturn fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\tvec2 p = gl_FragCoord.xy / resolution.xy;\n\tfloat r = rand(vec2(0, p.y));\n\tfloat m = smoothstep(0.0, -size, p.x*(1.0-size) + size*r - (progress * (1.0 + size)));\n\tgl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);\n}\n'

	},

	ripple: {

		// by http://transitions.glsl.io/transition/94ffa2725b65aa8b9979

		uniforms: {
			amplitude: { value: 100, type: 'float' },
			speed: { value: 50, type: 'float' }
		},
		source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\n\n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n\nuniform float amplitude;\nuniform float speed;\n\nvoid main()\n{\n\tvec2 p = gl_FragCoord.xy / resolution.xy;\n\tvec2 dir = p - vec2(.5);\n\tfloat dist = length(dir);\n\tvec2 offset = dir * (sin(progress * dist * amplitude - progress * speed) + .5) / 30.;\n\tgl_FragColor = mix(texture2D(from, p + offset), texture2D(to, p), smoothstep(0.2, 1.0, progress));\n}\n'

	},

	pageCurl: {

		// by http://transitions.glsl.io/transition/166e496a19a4fdbf1aae

		uniforms: {},
		source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D from, to;\nuniform float progress;\nuniform vec2 resolution;\n\n// Adapted by Sergey Kosarevsky from:\n// http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html\n\n/*\nCopyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n   * Redistributions of source code must retain the above copyright\n     notice, this list of conditions and the following disclaimer.\n   * Redistributions in binary form must reproduce the above\n     copyright notice, this list of conditions and the following disclaimer\n     in the documentation and/or other materials provided with the\n     distribution.\n   * Neither the name of Hewlett-Packard nor the names of its\n     contributors may be used to endorse or promote products derived from\n     this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\nin vec2 texCoord;\n*/\n\nconst float MIN_AMOUNT = -0.16;\nconst float MAX_AMOUNT = 1.3;\nfloat amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;\n\nconst float PI = 3.141592653589793;\n\nconst float scale = 512.0;\nconst float sharpness = 3.0;\n\nfloat cylinderCenter = amount;\n// 360 degrees * amount\nfloat cylinderAngle = 2.0 * PI * amount;\n\nconst float cylinderRadius = 1.0 / PI / 2.0;\n\nvec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)\n{\n\tfloat hitPoint = hitAngle / (2.0 * PI);\n\tpoint.y = hitPoint;\n\treturn rrotation * point;\n}\n\nvec4 antiAlias(vec4 color1, vec4 color2, float distanc)\n{\n\tdistanc *= scale;\n\tif (distanc < 0.0) return color2;\n\tif (distanc > 2.0) return color1;\n\tfloat dd = pow(1.0 - distanc / 2.0, sharpness);\n\treturn ((color2 - color1) * dd) + color1;\n}\n\nfloat distanceToEdge(vec3 point)\n{\n\tfloat dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);\n\tfloat dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);\n\tif (point.x < 0.0) dx = -point.x;\n\tif (point.x > 1.0) dx = point.x - 1.0;\n\tif (point.y < 0.0) dy = -point.y;\n\tif (point.y > 1.0) dy = point.y - 1.0;\n\tif ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);\n\treturn min(dx, dy);\n}\n\nvec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)\n{\n\tfloat hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);\n\tvec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);\n\tif (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))\n\t{\n\t  vec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\treturn texture2D(to, texCoord);\n\t}\n\n\tif (yc > 0.0) return texture2D(from, p);\n\n\tvec4 color = texture2D(from, point.xy);\n\tvec4 tcolor = vec4(0.0);\n\n\treturn antiAlias(color, tcolor, distanceToEdge(point));\n}\n\nvec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)\n{\n\tfloat shadow = distanceToEdge(point) * 30.0;\n\tshadow = (1.0 - shadow) / 3.0;\n\n\tif (shadow < 0.0) shadow = 0.0; else shadow *= amount;\n\n\tvec4 shadowColor = seeThrough(yc, p, rotation, rrotation);\n\tshadowColor.r -= shadow;\n\tshadowColor.g -= shadow;\n\tshadowColor.b -= shadow;\n\n\treturn shadowColor;\n}\n\nvec4 backside(float yc, vec3 point)\n{\n\tvec4 color = texture2D(from, point.xy);\n\tfloat gray = (color.r + color.b + color.g) / 15.0;\n\tgray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));\n\tcolor.rgb = vec3(gray);\n\treturn color;\n}\n\nvec4 behindSurface(float yc, vec3 point, mat3 rrotation)\n{\n\tfloat shado = (1.0 - ((-cylinderRadius - yc) / amount * 7.0)) / 6.0;\n\tshado *= 1.0 - abs(point.x - 0.5);\n\n\tyc = (-cylinderRadius - cylinderRadius - yc);\n\n\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\tif (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5))\n\t{\n\t\tshado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / (71.0 / 100.0));\n\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\tshado *= 0.5;\n\t}\n\telse\n\t{\n\t\tshado = 0.0;\n\t}\n\t\n\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\n\treturn vec4(texture2D(to, texCoord).rgb - shado, 1.0);\n}\n\nvoid main()\n{\n\tvec2 texCoord = gl_FragCoord.xy / resolution.xy;\n\t\n\tconst float angle = 30.0 * PI / 180.0;\n\tfloat c = cos(-angle);\n\tfloat s = sin(-angle);\n\n\tmat3 rotation = mat3( c, s, 0,\n\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t0.12, 0.258, 1\n\t\t\t\t\t\t\t\t);\n\tc = cos(angle);\n\ts = sin(angle);\n\n\tmat3 rrotation = mat3(\tc, s, 0,\n\t\t\t\t\t\t\t\t\t-s, c, 0,\n\t\t\t\t\t\t\t\t\t0.15, -0.5, 1\n\t\t\t\t\t\t\t\t);\n\n\tvec3 point = rotation * vec3(texCoord, 1.0);\n\n\tfloat yc = point.y - cylinderCenter;\n\n\tif (yc < -cylinderRadius)\n\t{\n\t\t// Behind surface\n\t\tgl_FragColor = behindSurface(yc, point, rrotation);\n\t\treturn;\n\t}\n\n\tif (yc > cylinderRadius)\n\t{\n\t\t// Flat surface\n\t\tgl_FragColor = texture2D(from, texCoord);\n\t\treturn;\n\t}\n\n\tfloat hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;\n\n\tfloat hitAngleMod = mod(hitAngle, 2.0 * PI);\n\tif ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))\n\t{\n\t\tgl_FragColor = seeThrough(yc, texCoord, rotation, rrotation);\n\t\treturn;\n\t}\n\n\tpoint = hitPoint(hitAngle, yc, point, rrotation);\n\n\tif (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)\n\t{\n\t\tgl_FragColor = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\t\treturn;\n\t}\n\n\tvec4 color = backside(yc, point);\n\n\tvec4 otherColor;\n\tif (yc < 0.0)\n\t{\n\t\tfloat shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);\n\t\tshado *= pow(-yc / cylinderRadius, 3.0);\n\t\tshado *= 0.5;\n\t\totherColor = vec4(0.0, 0.0, 0.0, shado);\n\t}\n\telse\n\t{\n\t\totherColor = texture2D(from, texCoord);\n\t}\n\n\tcolor = antiAlias(color, otherColor, cylinderRadius - abs(yc));\n\n\tvec4 cl = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);\n\tfloat dist = distanceToEdge(point);\n\n\tgl_FragColor = antiAlias(color, cl, dist);\n}\n'

	}

};
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = {

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
	}()

};
module.exports = exports['default'];

},{}]},{},[3])(3)
});
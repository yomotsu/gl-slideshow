/*!
 * @author yomotsu
 * GLSlideshow
 * https://github.com/yomotsu/GLSlideshow
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.GLSlideshow = factory());
}(this, (function () { 'use strict';

	var utils = {

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

	function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
			var _this = this;

			_classCallCheck$1(this, Renderer);

			this.count = 0;
			this.startTime = Date.now();
			this.elapsedTime = 0;
			this.isRunning = true;
			this.inTranstion = false;
			this.duration = params && params.duration || 1000;
			this.interval = Math.max(params && params.interval || 5000, this.duration);
			this.isUpdated = true;
			this.domElement = params && params.canvas || document.createElement('canvas');
			this.images = [];

			images.forEach(function (image, i) {
				_this.insert(image, i);
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
			this.dispatchEvent({ type: 'transitionStart' });
		};

		Renderer.prototype.setSize = function setSize(w, h) {

			if (this.domElement.width === w && this.domElement.height === h) {

				return;
			}

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

			if (this.isRunning) {

				this.elapsedTime = Date.now() - this.startTime;
			}

			if (this.interval + this.duration < this.elapsedTime) {

				this.transition(this.getNext());
				// transition start
			}

			rAF(this.tick.bind(this));

			if (this.isUpdated) {
				this.render();
			}
		};

		Renderer.prototype.render = function render() {};

		Renderer.prototype.play = function play() {

			if (this.isRunning) {
				return this;
			}

			var pauseElapsedTime = Date.now() - this.pauseStartTime;
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
			var _this2 = this;

			var onload = function onload(e) {

				_this2.isUpdated = true;
				e.target.removeEventListener('load', onload);
			};

			if (image instanceof Image) {

				image.addEventListener('load', onload);
			} else if (typeof image === 'string') {

				var src = image;
				image = new Image();
				image.addEventListener('load', onload);
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

		Renderer.prototype.replace = function replace(images) {
			var _this3 = this;

			var length = this.images.length;

			images.forEach(function (image) {

				slideshow.insert(image, _this3.images.length);
			});

			for (var i = 0 | 0; i < length; i = i + 1 | 0) {

				this.remove(0);
			}

			this.isUpdated = true;
			this.transition(0);
		};

		return Renderer;
	}();

	EventDispatcher.prototype.apply(Renderer.prototype);

	function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
			_classCallCheck$2(this, WebGLTexture);

			this.image = image;

			if (!!gl && gl instanceof WebGLRenderingContext) {

				this.gl = gl;
				this.texture = gl.createTexture();
			}

			this.setImage(this.image);
		}

		WebGLTexture.prototype.isLoaded = function isLoaded() {

			return this.image.naturalWidth !== 0;
		};

		WebGLTexture.prototype.onload = function onload() {
			var _this = this;

			var onload = function onload() {

				_this.image.removeEventListener('load', onload);
				_this.setImage(_this.image);
			};

			if (this.isLoaded()) {

				this.setImage(this.image);
				return;
			}

			this.image.addEventListener('load', onload);
		};

		WebGLTexture.prototype.setImage = function setImage(image) {

			var _gl = this.gl;
			var _image = void 0;

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

	EventDispatcher.prototype.apply(WebGLTexture.prototype);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

			_this.context = _this.domElement.getContext('webgl') || _this.domElement.getContext('experimental-webgl');
			_this.resolution = new Float32Array([params && params.width || _this.domElement.width, params && params.height || _this.domElement.height]);

			_this.vertexShader = _this.context.createShader(_this.context.VERTEX_SHADER);
			_this.context.shaderSource(_this.vertexShader, vertexShaderSource);
			_this.context.compileShader(_this.vertexShader);
			_this.setEffect(params && params.effect || 'crossFade');
			_this.progress = 0;

			_this.tick();

			return _this;
		}

		WebGLRenderer.prototype.setEffect = function setEffect(effectName) {

			var FSSource = GLSlideshow.shaderLib[effectName].source;
			var uniforms = GLSlideshow.shaderLib[effectName].uniforms;
			var i = 0;
			var position = void 0;

			if (this.program) {

				this.context.deleteTexture(this.from.texture);
				this.context.deleteTexture(this.to.texture);
				this.context.deleteBuffer(this.vertexBuffer);
				this.context.deleteShader(this.fragmentShader);
				this.context.deleteProgram(this.program);
			}

			this.fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
			this.context.shaderSource(this.fragmentShader, FSSource);
			this.context.compileShader(this.fragmentShader);

			this.program = this.context.createProgram();
			this.context.attachShader(this.program, this.vertexShader);
			this.context.attachShader(this.program, this.fragmentShader);
			this.context.linkProgram(this.program);
			this.context.useProgram(this.program);

			this.vertexBuffer = this.context.createBuffer();
			this.context.bindBuffer(this.context.ARRAY_BUFFER, this.vertexBuffer);
			this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), this.context.STATIC_DRAW);

			position = this.context.getAttribLocation(this.program, 'position');
			this.context.vertexAttribPointer(position, 2, this.context.FLOAT, false, 0, 0);
			this.context.enableVertexAttribArray(position);

			this.uniforms = {
				progress: this.context.getUniformLocation(this.program, 'progress'),
				resolution: this.context.getUniformLocation(this.program, 'resolution'),
				from: this.context.getUniformLocation(this.program, 'from'),
				to: this.context.getUniformLocation(this.program, 'to')
			};

			for (i in uniforms) {

				this.uniforms[i] = this.context.getUniformLocation(this.program, i);
				this.setUniform(i, uniforms[i].value, uniforms[i].type);
			}

			this.from = new WebGLTexture(this.images[this.count], this.context);
			this.to = new WebGLTexture(this.images[this.getNext()], this.context);

			this.from.addEventListener('updated', this.updateTexture.bind(this));
			this.to.addEventListener('updated', this.updateTexture.bind(this));

			this.progress = 0;
			this.setSize(this.resolution[0], this.resolution[1]);
			this.updateTexture();
		};

		WebGLRenderer.prototype.setUniform = function setUniform(key, value, type) {

			var uniformLocation = this.context.getUniformLocation(this.program, key);

			if (type === 'float') {

				this.context.uniform1f(uniformLocation, value);
			} else if (type === 'vec2') {

				this.context.uniform2f(uniformLocation, value[0], value[1]);
			} else if (type === 'vec3') {

				this.context.uniform3f(uniformLocation, value[0], value[1], value[2]);
			} else if (type === 'vec4') {

				this.context.uniform4f(uniformLocation, value[0], value[1], value[2], value[3]);
			}
		};

		WebGLRenderer.prototype.updateTexture = function updateTexture() {

			this.context.activeTexture(this.context.TEXTURE0);
			this.context.bindTexture(this.context.TEXTURE_2D, this.from.texture);
			this.context.uniform1i(this.uniforms.from, 0);

			this.context.activeTexture(this.context.TEXTURE1);
			this.context.bindTexture(this.context.TEXTURE_2D, this.to.texture);
			this.context.uniform1i(this.uniforms.to, 1);

			this.isUpdated = true;
		};

		WebGLRenderer.prototype.setSize = function setSize(w, h) {

			_Renderer.prototype.setSize.call(this, w, h);

			this.domElement.width = w;
			this.domElement.height = h;
			this.resolution[0] = w;
			this.resolution[1] = h;
			this.context.viewport(0, 0, w, h);
			this.context.uniform2fv(this.uniforms.resolution, this.resolution);
			this.isUpdated = true;
		};

		WebGLRenderer.prototype.render = function render() {

			if (this.inTranstion) {

				var transitionElapsedTime = Date.now() - this.transitionStartTime;
				this.progress = this.inTranstion ? Math.min(transitionElapsedTime / this.duration, 1) : 0;

				// this.context.clearColor( 0, 0, 0, 1 );
				this.context.uniform1f(this.uniforms.progress, this.progress);
				this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
				this.context.drawArrays(this.context.TRIANGLES, 0, 6);
				this.context.flush();

				if (this.progress === 1) {

					this.inTranstion = false; // may move to tick()
					this.isUpdated = false;
					this.dispatchEvent({ type: 'transitionEnd' });
					// transitionEnd!
				}
			} else {

				// this.context.clearColor( 0, 0, 0, 1 );
				this.context.uniform1f(this.uniforms.progress, this.progress);
				this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
				this.context.drawArrays(this.context.TRIANGLES, 0, 6);
				this.context.flush();
				this.isUpdated = false;
			}
		};

		WebGLRenderer.prototype.dispose = function dispose() {

			this.isRunning = false;
			this.inTranstion = false;

			this.tick = function () {};

			if (this.program) {

				this.context.activeTexture(this.context.TEXTURE0);
				this.context.bindTexture(this.context.TEXTURE_2D, null);
				this.context.activeTexture(this.context.TEXTURE1);
				this.context.bindTexture(this.context.TEXTURE_2D, null);
				this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
				// this.context.bindBuffer( this.context.ELEMENT_ARRAY_BUFFER, null );
				// this.context.bindRenderbuffer( this.context.RENDERBUFFER, null );
				// this.context.bindFramebuffer( this.context.FRAMEBUFFER, null );

				this.context.deleteTexture(this.from.texture);
				this.context.deleteTexture(this.to.texture);
				this.context.deleteBuffer(this.vertexBuffer);
				// this.context.deleteRenderbuffer( ... );
				// this.context.deleteFramebuffer( ... );
				this.context.deleteShader(this.vertexShader);
				this.context.deleteShader(this.fragmentShader);
				this.context.deleteProgram(this.program);
			}

			this.setSize(1, 1);

			if (!!this.domElement.parentNode) {

				this.domElement.parentNode.removeChild(this.domElement);
			}

			delete this.from;
			delete this.to;
			delete this.domElement;
		};

		return WebGLRenderer;
	}(Renderer);

	function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
		_inherits$1(CanvasRenderer, _Renderer);

		function CanvasRenderer(images, params) {
			_classCallCheck$3(this, CanvasRenderer);

			var _this = _possibleConstructorReturn$1(this, _Renderer.call(this, images, params));

			_this.context = _this.domElement.getContext('2d');

			_this.from = new WebGLTexture(_this.images[_this.count]);
			_this.to = new WebGLTexture(_this.images[_this.getNext()]);

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

			var width = this.domElement.width;
			var height = this.domElement.height;

			if (this.inTranstion) {

				var transitionElapsedTime = Date.now() - this.transitionStartTime;
				var progress = this.inTranstion ? Math.min(transitionElapsedTime / this.duration, 1) : 0;

				if (progress !== 1) {

					this.context.drawImage(this.from.image, 0, 0, width, height);
					this.context.globalAlpha = progress;
					this.context.drawImage(this.to.image, 0, 0, width, height);
					this.context.globalAlpha = 1;
				} else {

					this.context.drawImage(this.to.image, 0, 0, width, height);
					this.inTranstion = false; // may move to tick()
					this.isUpdated = false;
					this.dispatchEvent({ type: 'transitionEnd' });
					// transitionEnd!
				}
			} else {

				this.context.drawImage(this.images[this.count], 0, 0, width, height);
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
	}(Renderer);

	var autoDetectRenderer = (function (images, params) {

		if (!utils.hasCanvas) {

			// your browser is not available both canvas and webgl
			return;
		}

		if (!utils.hasWebGL) {

			return new CanvasRenderer(images, params);
		}

		return new WebGLRenderer(images, params);
	});

	var shaderLib = {

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

		directionalWipe: {

			// by http://transitions.glsl.io/transition/90000743fedc953f11a4

			uniforms: {
				direction: { value: [1, -1], type: 'vec2' },
				smoothness: { value: 0.4, type: 'float' }
			},
			source: '\n#ifdef GL_ES\nprecision highp float;\n#endif\n \n// General parameters\nuniform sampler2D from;\nuniform sampler2D to;\nuniform float progress;\nuniform vec2 resolution;\n \nuniform vec2 direction;\nuniform float smoothness;\n \nconst vec2 center = vec2(0.5, 0.5);\n \nvoid main() {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  vec2 v = normalize(direction);\n  v /= abs(v.x)+abs(v.y);\n  float d = v.x * center.x + v.y * center.y;\n  float m = smoothstep(-smoothness, 0.0, v.x * p.x + v.y * p.y - (d-0.5+progress*(1.+smoothness)));\n  gl_FragColor = mix(texture2D(to, p), texture2D(from, p), m);\n}\n'

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

	var GLSlideshow$1 = {

		hasCanvas: utils.hasCanvas,
		hasWebGL: utils.hasWebGL,
		autoDetectRenderer: autoDetectRenderer,
		WebGLRenderer: WebGLRenderer,
		CanvasRenderer: CanvasRenderer,
		shaderLib: shaderLib

	};

	return GLSlideshow$1;

})));

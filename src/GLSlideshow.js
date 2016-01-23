import utils              from './utils.js';
import WebGLRenderer      from './WebGLRenderer.js';
import CanvasRenderer     from './CanvasRenderer.js';
import audoDetectRenderer from './audoDetectRenderer.js';
import shaderLib          from './shaderLib.js';

export default {

	hasCanvas:          utils.hasCanvas,
	hasWebGL:           utils.hasWebGL,
	audoDetectRenderer: audoDetectRenderer,
	WebGLRenderer:      WebGLRenderer,
	CanvasRenderer:     CanvasRenderer,
	shaderLib:          shaderLib

}

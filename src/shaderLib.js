export default {

	crossFade: {

		uniforms: {},
		source: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D from, to;
uniform float progress;
uniform vec2 resolution;

void main() {
	vec2 p = gl_FragCoord.xy / resolution.xy;
	// gl_FragColor =texture2D( from, p );
	// gl_FragColor=texture2D( to, p );
	gl_FragColor = mix( texture2D( from, p ), texture2D( to, p ), progress );

}
`

	},

	crossZoom: {

		// by http://transitions.glsl.io/transition/b86b90161503a0023231

		uniforms: {
			strength: { value: 0.4, type: 'float' }
		},
		source: `
// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag
// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js
// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib

#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D from, to;
uniform float progress;
uniform vec2 resolution;

uniform float strength;

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

/* random number between 0 and 1 */
float random(in vec3 scale, in float seed) {
	/* use the fragment position for randomness */
	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

vec3 crossFade(in vec2 uv, in float dissolve) {
	return mix(texture2D(from, uv).rgb, texture2D(to, uv).rgb, dissolve);
}

void main() {
	vec2 texCoord = gl_FragCoord.xy / resolution.xy;

	// Linear interpolate center across center half of the image
	vec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);
	float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);

	// Mirrored sinusoidal loop. 0->strength then strength->0
	float strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);

	vec3 color = vec3(0.0);
	float total = 0.0;
	vec2 toCenter = center - texCoord;

	/* randomize the lookup values to hide the fixed number of samples */
	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

	for (float t = 0.0; t <= 40.0; t++) {
		float percent = (t + offset) / 40.0;
		float weight = 4.0 * (percent - percent * percent);
		color += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;
		total += weight;
	}
	gl_FragColor = vec4(color / total, 1.0);
}
`

	},

	cube: {

		// by http://transitions.glsl.io/transition/ee15128c2b87d0e74dee

		uniforms: {
			persp:      { value: 0.7, type: 'float' },
			unzoom:     { value: 0.3, type: 'float' },
			reflection: { value: 0.4, type: 'float' },
			floating:   { value: 3,   type: 'float' }
		},
		source: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D from, to;
uniform float progress;
uniform vec2 resolution;

uniform float persp;
uniform float unzoom;
uniform float reflection;
uniform float floating;

vec2 project (vec2 p) {
	return p * vec2(1.0, -1.2) + vec2(0.0, -floating/100.);
}

bool inBounds (vec2 p) {
	return all(lessThan(vec2(0.0), p)) && all(lessThan(p, vec2(1.0)));
}

vec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {
	vec4 c = vec4(0.0, 0.0, 0.0, 1.0);
	pfr = project(pfr);
	if (inBounds(pfr)) {
		c += mix(vec4(0.0), texture2D(from, pfr), reflection * mix(1.0, 0.0, pfr.y));
	}
	pto = project(pto);
	if (inBounds(pto)) {
		c += mix(vec4(0.0), texture2D(to, pto), reflection * mix(1.0, 0.0, pto.y));
	}
	return c;
}

// p : the position
// persp : the perspective in [ 0, 1 ]
// center : the xcenter in [0, 1] \ 0.5 excluded
vec2 xskew (vec2 p, float persp, float center) {
	float x = mix(p.x, 1.0-p.x, center);
	return (
		(
			vec2( x, (p.y - 0.5*(1.0-persp) * x) / (1.0+(persp-1.0)*x) )
			- vec2(0.5-distance(center, 0.5), 0.0)
		)
		* vec2(0.5 / distance(center, 0.5) * (center<0.5 ? 1.0 : -1.0), 1.0)
		+ vec2(center<0.5 ? 0.0 : 1.0, 0.0)
	);
}

void main() {
	vec2 op = gl_FragCoord.xy / resolution.xy;
	float uz = unzoom * 2.0*(0.5-distance(0.5, progress));
	vec2 p = -uz*0.5+(1.0+uz) * op;
	vec2 fromP = xskew(
		(p - vec2(progress, 0.0)) / vec2(1.0-progress, 1.0),
		1.0-mix(progress, 0.0, persp),
		0.0
	);
	vec2 toP = xskew(
		p / vec2(progress, 1.0),
		mix(pow(progress, 2.0), 1.0, persp),
		1.0
	);
	if (inBounds(fromP)) {
		gl_FragColor = texture2D(from, fromP);
	}
	else if (inBounds(toP)) {
		gl_FragColor = texture2D(to, toP);
	}
	else {
		gl_FragColor = bgColor(op, fromP, toP);
	}
}
`

	},

	wind: {

		// by http://transitions.glsl.io/transition/7de3f4b9482d2b0bf7bb

		uniforms: {
			size: { value: 0.2, type: 'float' }
		},
		source: `
#ifdef GL_ES
precision highp float;
#endif

// General parameters
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;

// Custom parameters
uniform float size;

float rand (vec2 co) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec2 p = gl_FragCoord.xy / resolution.xy;
	float r = rand(vec2(0, p.y));
	float m = smoothstep(0.0, -size, p.x*(1.0-size) + size*r - (progress * (1.0 + size)));
	gl_FragColor = mix(texture2D(from, p), texture2D(to, p), m);
}
`

	}

}

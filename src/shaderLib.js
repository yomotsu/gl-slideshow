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

	},

	ripple: {

		// by http://transitions.glsl.io/transition/94ffa2725b65aa8b9979

		uniforms: {
			amplitude: { value: 100, type: 'float' },
			speed:     { value: 50,  type: 'float' }
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

uniform float amplitude;
uniform float speed;

void main()
{
	vec2 p = gl_FragCoord.xy / resolution.xy;
	vec2 dir = p - vec2(.5);
	float dist = length(dir);
	vec2 offset = dir * (sin(progress * dist * amplitude - progress * speed) + .5) / 30.;
	gl_FragColor = mix(texture2D(from, p + offset), texture2D(to, p), smoothstep(0.2, 1.0, progress));
}
`

	},

	pageCurl: {

		// by http://transitions.glsl.io/transition/166e496a19a4fdbf1aae

		uniforms: {},
		source: `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D from, to;
uniform float progress;
uniform vec2 resolution;

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
	  vec2 texCoord = gl_FragCoord.xy / resolution.xy;
		return texture2D(to, texCoord);
	}

	if (yc > 0.0) return texture2D(from, p);

	vec4 color = texture2D(from, point.xy);
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
	vec4 color = texture2D(from, point.xy);
	float gray = (color.r + color.b + color.g) / 15.0;
	gray += (8.0 / 10.0) * (pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));
	color.rgb = vec3(gray);
	return color;
}

vec4 behindSurface(float yc, vec3 point, mat3 rrotation)
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
	
	vec2 texCoord = gl_FragCoord.xy / resolution.xy;

	return vec4(texture2D(to, texCoord).rgb - shado, 1.0);
}

void main()
{
	vec2 texCoord = gl_FragCoord.xy / resolution.xy;
	
	const float angle = 30.0 * PI / 180.0;
	float c = cos(-angle);
	float s = sin(-angle);

	mat3 rotation = mat3( c, s, 0,
								-s, c, 0,
								0.12, 0.258, 1
								);
	c = cos(angle);
	s = sin(angle);

	mat3 rrotation = mat3(	c, s, 0,
									-s, c, 0,
									0.15, -0.5, 1
								);

	vec3 point = rotation * vec3(texCoord, 1.0);

	float yc = point.y - cylinderCenter;

	if (yc < -cylinderRadius)
	{
		// Behind surface
		gl_FragColor = behindSurface(yc, point, rrotation);
		return;
	}

	if (yc > cylinderRadius)
	{
		// Flat surface
		gl_FragColor = texture2D(from, texCoord);
		return;
	}

	float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;

	float hitAngleMod = mod(hitAngle, 2.0 * PI);
	if ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))
	{
		gl_FragColor = seeThrough(yc, texCoord, rotation, rrotation);
		return;
	}

	point = hitPoint(hitAngle, yc, point, rrotation);

	if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)
	{
		gl_FragColor = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);
		return;
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
		otherColor = texture2D(from, texCoord);
	}

	color = antiAlias(color, otherColor, cylinderRadius - abs(yc));

	vec4 cl = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation);
	float dist = distanceToEdge(point);

	gl_FragColor = antiAlias(color, cl, dist);
}
`

	}


}

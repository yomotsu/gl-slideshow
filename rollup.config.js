import babel from 'rollup-plugin-babel'
import pkg from './package.json';

const license = `/*!
 * @author yomotsu
 * GLSlideshow
 * https://github.com/yomotsu/gl-slideshow
 * Released under the MIT License.
 */`

export default {
	input: 'src/index.js',
	output: [
		{
			format: 'umd',
			name: 'GLSlideshow',
			file: pkg.main,
			banner: license,
			indent: '\t',
		},
		{
			format: 'es',
			file: pkg.module,
			banner: license,
			indent: '\t',
		}
	],
	plugins: [
		babel( { exclude: 'node_modules/**' } )
	]
};

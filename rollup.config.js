import babel from 'rollup-plugin-babel'

const license = `/*!
 * @author yomotsu
 * GLSlideshow
 * https://github.com/yomotsu/GLSlideshow
 * Released under the MIT License.
 */`

export default {
	input: 'src/GLSlideshow.js',
	sourceMap: false,
	plugins: [
		babel( { exclude: 'node_modules/**' } )
	],
	output: [
		{
			format: 'umd',
			name: 'GLSlideshow',
			file: 'dist/GLSlideshow.js',
			indent: '\t',
			banner: license
		},
		{
			format: 'es',
			file: 'dist/GLSlideshow.module.js',
			indent: '\t',
			banner: license
		}
	]
};

import babel from 'rollup-plugin-babel'

const license = `/*!
 * @author yomotsu
 * GLSlideshow
 * https://github.com/yomotsu/GLSlideshow
 * Released under the MIT License.
 */`

export default {
	entry: 'src/GLSlideshow.js',
	indent: '\t',
	sourceMap: false,
	plugins: [
		babel( {
			exclude: 'node_modules/**',
			presets: [
				[ 'env', {
					targets: {
						browsers: [
							'last 2 versions',
							'ie >= 11'
						]
					},
					loose: true,
					modules: false
				} ]
			]
		} )
	],
	targets: [
		{
			format: 'umd',
			moduleName: 'GLSlideshow',
			dest: 'dist/GLSlideshow.js',
			banner: license
		},
		{
			format: 'es',
			dest: 'dist/GLSlideshow.module.js',
			banner: license
		}
	]
};

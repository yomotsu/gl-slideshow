import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const license = `/*!
 * @author yomotsu
 * GLSlideshow
 * https://github.com/yomotsu/gl-slideshow
 * Released under the MIT License.
 */`;

export default {
	input: 'src/index.ts',
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
		typescript( { typescript: require( 'typescript' ) } ),
	],
};

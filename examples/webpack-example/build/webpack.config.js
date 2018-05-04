const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = ( env, argv ) => {

	const config = {
		entry: {
			'dist/bundle.js': './src/main.js'
		},
		output: {
			path: path.resolve( __dirname, '../' ),
			filename: '[name]',
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					use: [
						{ loader: 'babel-loader' },
					],
				},
			],
		},
		resolve: {
			modules: [ 'node_modules' ],
			extensions: [ '.js' ],
		},
		devServer: {
			host: '0.0.0.0',
			port: 3000,
			contentBase: path.resolve( __dirname, '../' ),
			watchContentBase: true,
			inline: true,
			historyApiFallback: true,
			noInfo: true,
		},
		performance: {
			hints: false,
		},
		plugins: [
			new webpack.NamedModulesPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			...(
				argv.mode === 'production' ? [
					new webpack.DefinePlugin( {
						'process.env': {
							NODE_ENV: '"production"'
						}
					} ),
					new webpack.LoaderOptionsPlugin( {
						minimize: true
					} )
				] : []
			)
		],
		devtool: argv.mode === 'production' ? false : 'inline-source-map',
	};

	return config;

};

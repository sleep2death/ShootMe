module.exports = function ( grunt ) {
	grunt.initConfig( {
		src: './src/WonderCraft.ts',
		target: 'es5',
		dest: {
			dev: "./build/wondercraft-dev.js",
		},
		refs: {
			ref: './src/_references.ts',
			phaser: './typings/phaser/phaser.d.ts',
			browserify: './typings/browserify/browserify.d.ts'
		},
		ts: {
			dev: {
				src: [ "<%= refs.browserify %>", "<%= refs.ref %>", "<%= refs.phaser %>", "<%= src %>" ],
				out: "<%= dest.dev %>",
			},
			options: {
				verbose: true,
				module: 'commonjs',
				target: '<%= target %>',
				sourceMap: true,
				declaration: false,
				fast: 'never'
			}
		},
		clean: {
			dev: [ "build/*.*" ]
		},
		watch: {
			dev: {
				files: [ 'src/**/*.ts' ],
				tasks: [ 'clean:dev', 'ts:dev', 'browserify:dev', "copy:phaser", "copy:phaser_map","notify:watch" ],
				options: {},
			},
		},
		browserify: {
			dev: {
				files: {
					"<%= dest.dev %>": [ " <%= dest.dev %> " ]
				}
			},

			options: {}
		},
		copy: {
			phaser: {
				src: 'node_modules/phaser/build/phaser.min.js',
				dest: 'build/phaser.min.js',
			},
			phaser_map: {
				src: 'node_modules/phaser/build/phaser.map',
				dest: 'build/phaser.map',
			},
		},
		notify: {
			watch: {
				options: {
					title: 'Compile Complete', // optional
					message: 'clean/ts/browserify/copy_phaser/ finished running', //required
				}
			},
		}
	} );

	grunt.loadNpmTasks( 'grunt-ts' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-notify' );

	grunt.registerTask( "default", [ "watch:dev" ] );
};

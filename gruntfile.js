module.exports = function(grunt) {
    grunt.initConfig({
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
                src: ["<%= refs.browserify %>", "<%= refs.ref %>", "<%= refs.phaser %>", "<%= src %>"],
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
            dev: ["build/*.*"]
        },
        watch: {
            dev: {
                files: ['src/**/*.ts'],
                tasks: ['clean:dev', 'ts:dev', 'browserify:dev'],
                options: {},
            },
        },
        browserify: {
            dev: {
                files: {
                    "<%= dest.dev %>": [" <%= dest.dev %> "]
                }
            },

            options: {}
        },
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask("default", ["watch:dev"]);
};

module.exports = function(grunt) {
    grunt.initConfig({
        src: './scripts/**/*.ts',
        test: './tests/**/*.ts',
        target: 'es3',
        dest: {
            test: "./build/WonderCraft-tests.js",
            dev: "./build/WonderCraft-dev.js",
            build: "./build/WonderCraft-min.js",
        },
        refs: {
            ref: './scripts/_references.ts',
            l1: './typings/l1-path-finder/l1-path-finder.d.ts',
            phaser: './typings/phaser/phaser.d.ts',
            qunit: './typings/qunit/qunit.d.ts',
            browserify: './typings/browserify/browserify.d.ts'
        },
        ts: {
            test: {
                src: ["<%= refs.browserify %>", "<%= refs.pf %>", "<%= refs.qunit %>", "<%= test %>"],
                out: "<%= dest.test %>",
            },
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
            js: ["scripts/**/*.js", "scripts/**/*.map", "tests/**/*.js", "tests/**/*.map"],
            test: ["<%= dest.test %>"],
            dev: ["<%= dest.dev %>"]
        },
        watch: {
            dev: {
                files: ['<%= src %>'],
                tasks: ['clean:dev', 'ts:dev', 'browserify:dev', 'clean:js'],
                options: {},
            },
            tests: {
                files: ['tests/**/*.ts'],
                tasks: ['clean:build', 'ts:test', 'clean:js'],
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
        'http-server': {
            'dev': {
                root: "./",
                port: 8282,
                host: "0.0.0.0",
                cache: -1,
                showDir: true,
                autoIndex: true,
                ext: "html",
                runInBackground: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-http-server');

    grunt.registerTask("default", ["watch:dev"]);
};

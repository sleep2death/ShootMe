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
            pf: './scripts/pf/pf_references.ts',
            phaser: './typings/phaser/phaser.d.ts',
            qunit: './typings/qunit/qunit.d.ts',
        },
        ts: {
            test: {
                src: ["<%= refs.pf %>", "<%= refs.qunit %>", "<%= test %>"],
                out: "<%= dest.test %>",
            },
            dev: {
                src: ["<%= refs.pf %>", "<%= refs.phaser %>", "<%= src %>"],
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
                tasks: ['clean:dev', 'ts:dev', 'clean:js'],
                options: {},
            },
            tests: {
                files: ['tests/**/*.ts'],
                tasks: ['clean:build', 'ts:test', 'clean:js'],
                options: {},
            },
        },
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask("default", ["watch:dev"]);
};
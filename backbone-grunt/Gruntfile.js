/* jshint node: true */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jshint: {
        all: [
            "Gruntfile.js"
          , "src/js/models/*.js"
          , "src/js/views/*.js"
          , "src/js/app.js"
        ]
      , options: {
          jshintrc: '.jshintrc'
        },
    },
    jst: {
      compile: {
        files: {
          "backbone_example/static/backbone_example/templates.js": [
            "src/templates/*.html",
            "src/templates/**/*.html"
          ]
        }
      }
    },
    watch: {
      src: {
        // we compile html templates with 'jst'
        files: [
            'src/templates/*.html',
            'src/templates/**/*.html'
        ],
        tasks: ['jst']
      },
      scripts: {
        // and concatonate js files into a single figure.js
        files: [
            'src/js/models/*.js',
            'src/js/views/*.js',
            'src/js/app.js'
        ],
        tasks: ['concat']
      }
    },
    concat: {
      js: {
        src: [
            'src/js/models/*.js',
            'src/js/views/*.js',
            'src/js/app.js'],
        dest: 'backbone_example/static/backbone_example/app.js',
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  //grunt.registerTask(['concat', 'jst']);
};

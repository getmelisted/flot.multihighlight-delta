module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Project configuration
  grunt.initConfig({

    // Linting disabled for now
    /*jshint: {
      files: [
        'Gruntfile.js',
        'js/jquery.flot.multihighlight-delta.js'
      ]
    },*/

    pkg: {
      name: 'jquery.flot.multihightlight-delta',
      version: '0.1',
      author: 'Patrick de Lanauze @pdelanauze',
      description: 'Multi highlight flot plugin with deltas',
      license: 'MIT',
      website: 'https://github.com/pdelanauze/flot.multihightlight-delta'
    },

    meta: {

    },

    uglify: {
      main: {
        src: ['js/jquery.flot.multihighlight-delta.js'],
        dest: 'js/jquery.flot.multihighlight-delta.min.js'
      }
    },

    watch: {
      main: {
        files: 'js/*.source.js',
        tasks: ['lint','concat:main','uglify:main']
      }
    }
  });

  // Default task
  grunt.registerTask('build', ['uglify:main']); // I AM THE LINTER, actually IntelliJ is too

};

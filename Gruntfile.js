module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sonarRunner: {
            analysis: {
                options: {
                    debug: true,
                    separator: '\n',
                    sonar: {
                        host: {
                            url: 'http://localhost:9036'
                        },
                        projectKey: 'sonar:dubbot',
                        projectName: 'dubbot',
                        projectVersion: '0.2.2',
                        sources: './',
                        exclusions: ['node_modules/*', 'commands.md', 'README.md'],
                        language: 'js',
                        sourceEncoding: 'UTF-8'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-sonar-runner');

    grunt.registerTask('default', ['sonarRunner']);
};

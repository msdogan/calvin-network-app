var approot = '../hobbes-network-app';

var grunt = require('grunt');
var path = require('path');


grunt.option('srcRoot', path.join(__dirname, approot));
grunt.option('projectRoot', __dirname);

require(path.join(approot, 'Gruntfile'))(grunt);
grunt.task.run('build').start();

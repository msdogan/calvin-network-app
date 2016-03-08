var config = {
  dev : true,
  root : '../hobbes-network-app',
  db : ''
};

var server = require('../hobbes-network-app')(config);
var app = server.app;


if( config.dev ) {
  app.use(server.express.static(__dirname+'/public'));
} else {
  app.use(server.express.static(__dirname+'/dist'));
}

server.start(function(){
  //require('./controllers/regions')(server.config);
});

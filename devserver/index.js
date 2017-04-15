var http = require('http');
var app = require('./routes');

// Create dev server
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log('Viewsaurus dev server started on *:' + port);
});
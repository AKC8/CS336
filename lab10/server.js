var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var COMMENTS_FILE = path.join(__dirname, 'comments.json');

var MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect('mongodb://cs336:bjarne1@ds155653.mlab.com:55653/cs336db', function (err, client) {
  if (err) throw err

  db = client;
  app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
  });
});

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/comments', function(req, res) {
  db.collection('comments').find().toArray(function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(data);
  });
});

app.post('/api/comments', function(req, res) {
  db.collection('comments').insertOne({
    author: req.body.author,
    text: req.body.text,
  }, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
  db.collection('comments').find().toArray(function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(data);
  });
});

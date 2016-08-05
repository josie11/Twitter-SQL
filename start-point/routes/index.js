'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){

    client.query('SELECT name, tweets.userid, pictureurl, content, tweets.id FROM Users JOIN tweets ON tweets.userid = Users.id', function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    console.log("I'M HERE");
    res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){

    client.query('SELECT content, name, tweets.id FROM tweets JOIN Users ON tweets.userid = Users.id WHERE userid IN (SELECT id FROM Users WHERE name=$1)', [req.params.username], function (err, result) {
      if (err) return next(err);// pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){

    client.query('SELECT content, name, tweets.id FROM tweets JOIN Users ON tweets.userid = Users.id WHERE tweets.id=$1', [req.params.id], function (err, result) {
      if (err) return next(err);// pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

  });

  router.get('/delete/:id', function(req, res, next){

    client.query('DELETE FROM tweets WHERE id=$1', [req.params.id], function (err, result) {
      if (err) return next(err);// pass errors to Express
      console.log(req);
      var tweets = result.rows;
      res.redirect(req.get('referer'));
    });
  });


  // create a new tweet
  router.post('/tweets', function(req, res, next){

    var name = req.body.name;
    var content = req.body.content;

    client.query('SELECT * FROM Users WHERE name=$1', [name], function (err, result) {
      if (err) return next(err);// pass errors to Express
      console.log(result);
      if (result.rowCount == 0) {
          client.query('INSERT INTO Users (name, pictureUrl) VALUES ($1, $2)', [name,    'http://i.imgur.com/CTil4ns.jpg'], function (err, result) {
            console.log("I inserted " + name + " as a user");
          });
      }

      client.query('INSERT INTO Tweets (userId, content) VALUES ((SELECT id from Users where name=$1), $2)', [name, content], function (err, result) {
        console.log("I inserted tweet " + content);
      });


    res.redirect('/');

  });




  });




  return router;
}

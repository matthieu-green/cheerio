const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const cors = require('./cors');

const Author = require('../models/author');

const authorRouter = express.Router();

authorRouter.use(bodyParser.json());

authorRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
  .get(cors.cors, (req, res, next) =>{
    Author.find(req.query)
    .then((author) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(author);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.create(req.body)
    .then((author) =>{
      console.log('Author added ', author);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(author);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /author');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Author.remove({})
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  });


  authorRouter.route('/:authorId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
  .get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then((author) => {
      res.statusCode = 200;
      res.setHeader('Content-typ', 'application/json');
      res.json(author);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res, next) =>{
    res.statusCode = 403;
    res.end('POST is not supported on /authors/' + req.params.authorId);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Author.findByIdAndUpdate(req.params.authorId, {
      $set: req.body
    }, {new: true})
    .then((author) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(author);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findByIdAndRemove(req.params.authorId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = authorRouter;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const cors = require('./cors');

const Product = require('../models/product');

const productRouter = express.Router();

productRouter.use(bodyParser.json());

productRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
  .get(cors.cors, (req, res, next) =>{
    Product.find(req.query)
    .then((product) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(product);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Product.create(req.body)
    .then((product) =>{
      console.log('Product created ', product);
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(product);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /products');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Product.remove({})
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  });


  productRouter.route('/:productId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
  .get(cors.cors, (req, res, next) => {
    Product.findById(req.params.productId)
    .then((product) => {
      res.statusCode = 200;
      res.setHeader('Content-typ', 'application/json');
      res.json(product);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res, next) =>{
    res.statusCode = 403;
    res.end('POST is not supported on /products/' + req.params.productId);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Product.findByIdAndUpdate(req.params.productId, {
      $set: req.body
    }, {new: true})
    .then((product) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(product);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Product.findByIdAndRemove(req.params.productId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = productRouter;

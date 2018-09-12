const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate')

const cors = require('./cors');

const Contact = require('../models/contact');

const contactRouter = express.Router();

contactRouter.use(bodyParser.json());

contactRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
  .get(cors.cors, authenticate.verifyUser, (req, res, next) =>{
    Contact.find(req.query)
    .then((contact) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(contact);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    Contact.create(req.body)
    .then((contact) => {
      console.log('Contact Saved', contact);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(contact);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /contacts');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Contact.remove({})
    .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  });

  contactRouter.route('/:contactId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) =>{
      Contact.findById(req.params.contactId)
      .then((contact) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(contact);
      }, (err) => next(err))
      .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, (req, res, next) =>{
      res.statusCode = 403;
      res.end('POST is not supported on /contacts/' + req.params.contactId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
      Contact.findByIdAndUpdate(req.params.contactId, {
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
      Contact.findByIdAndRemove(req.params.contactId)
      .then((resp) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });





  module.exports = contactRouter;

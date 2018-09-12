const rp = require('request-promise');
const cheerio = require('cheerio');
const table = require('cli-table');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate')

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('035a7eca524945ffb93c8588bfdafe49');

const moment = require('moment')

const cors = require('./cors');


const fetchRouter = express.Router();

fetchRouter.use(bodyParser.json());


fetchRouter.route('/')

fetchRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, (req, res, next) =>{

    console.log("Getting Everything")
      newsapi.v2.topHeadlines({
        sources: "bbc-news, le-monde, techradar, wired, the-wall-street-journal, the-economist, hacker-news, lequipe",
        pageSize: 50
      }).then(response => {
        return res.status(200).json(response.articles)
      })
  .catch((err) => {
    console.error(err)
  })
})

module.exports = fetchRouter;

var request = require('request');
var cheerio = require('cheerio');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const cors = require('./cors');


const saveRouter = express.Router();

saveRouter.use(bodyParser.json());


saveRouter.route('/')

saveRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, (req, res, next) =>{
    var table = []
    request('https://www.coordinationsud.org/financements/?type=&theme=&localisation=senegal&duree=', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html)
        $('article.t_localisations_geographiques-senegal').each(function(i, element){
          var a = $(this)

          var url = a.children().eq(0).attr('href')

          var header = a.children('header.entry-header')
          var title = header.children('h1.entry-title').text().replace(/(\r\n|\n|\r|\t)/gm, "")
          var financement = header.children('div.entry-meta').children().eq(0).text();
          var validite = header.children('div.entry-meta').children().eq(1).text().replace("Fin de validité : ", "")

          var summary = a.children('div.entry-summary')
          var theme = summary.children('p').text().replace("Thèmes : ", "")

          var metadata = {
            title: title,
            theme: theme,
            financement: financement,
            validite: validite,
            url: url
          }
          table.push(metadata)
        })
      }
      return res.status(200).json(table)
    })
})

module.exports = saveRouter;

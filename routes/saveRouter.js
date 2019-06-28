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


    //request for Coordination Sud
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
            url: url,
            source: "coordSud"
          }
          table.push(metadata)
        })
        return res.status(200).json(table)
      }
    })


    //request for luxdev
    request('https://senegal.luxdev.lu/fr/tenders', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html)
        $('tr.tender:not(.light)[data-country=SEN]').each(function(i, element){
          var a = $(this)

          var title = a.children('td').children('a').text()
          var url = a.children('td').children('a').attr('href')
          var validite = a.children('td').eq(2).text()

          var metadata = {
            title: title,
            url: url,
            validite: validite,
            theme: "Non Défini",
            financement: "",
            source: "luxdev"
          }

          table.push(metadata)
        })
      }
    })


    //request for AECID
    request('http://www.aecid.es/ES/la-aecid/anuncios/subvenciones', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('.listadoanuncios > li').each(function(i, element){

          var a = $(this);

          var title = a.children('p.tituloAnuncios').text()

          var validite = a.children('p.fechaPublicacionAnuncios').text().replace("Fecha de publicación: ", "Date de Publication: ")

          var verif = parseInt(validite.charAt(30))

          var url = a.children('a.vertodas').attr('href')

          if(verif > 8 ){
            var metadata = {
              title: title,
              url: url,
              validite: validite,
              theme: "Non Défini",
              financement: "AECID",
              source: "aecid"
            }

            table.push(metadata);
          }
        });
      }
    });




})

module.exports = saveRouter;

var request = require('request');
var cheerio = require('cheerio');
let Parser = require('rss-parser');
let parser = new Parser();


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
          var validite = header.children('div.entry-meta').children().eq(1).text()

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
            validite: "Fin de Validité: " + validite,
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
          return res.status(200).json(table)
        });
      }
    });


    //request for USAID
    async function asyncCall() {

      let feed = await parser.parseURL('https://www.grants.gov/rss/GG_OppModByCategory.xml');
      feed.items.forEach(item => {
        if(item['content:encoded'].toLowerCase().includes("senegal")){
          var title = item.title
          var url = item.link
          var validite = "Date de publication" + item.pubDate
          var metadata = {
            title: title,
            url: url,
            validite: validite,
            theme: "Non Défini",
            financement: "US GRANTS",
            source: "usaid"
          }
          table.push(metadata);
        }
      });
      return res.status(200).json(table)
    };

    asyncCall()

    request('https://www2.fundsforngos.org/tag/senegal/', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('.post.tag-senegal.tag-call-for-proposals-and-call-for-applications').each(function(i, element){

          var a = $(this);

          var link = a.children('h2.entry-title').children('a.entry-title-link')
          var title = link.text()
          var url = link.attr('href')

          var word = a.children('div.entry-content').children('p').text()
          var words = word.split(/\s+/)
          var validite = words[1] + " " + words[2] + " " + words[3]
          var description = word.split("\n")
          var theme = description[1]
          for(i = 2; i<description.length; i++){
            theme = theme + " " + description[i]
          }



          // let current_datetime = new Date()
          // let date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
          // var dateArray = date.split("-");

          // var current_date = dateArray[0]+ " " + dateArray[1]+ " " + dateArray[2]

          // var months = [" ", "January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
          //
          // var month = months.indexOf(words[2])



          // if(parseInt(dateArray[2]) < parseInt(words[3])){
          //   console.log(test)
          // }else if(parseInt(dateArray[2]) == parseInt(words[3])){
          //   if(parseInt(dateArray[1]) < parseInt(month)){
          //     console.log(test)
          //   }else if(parseInt(dateArray[1]) == parseInt(month)){
          //     if (parseInt(dateArray[0]) <= parseInt(words[1])){
          //       console.log(test)
          //     }
          //   }
          // }

            var metadata = {
              title: title,
              url: url,
              validite: validite,
              theme: theme,
              financement: "",
              source: "fundsforngos"
            }

            table.push(metadata);
          // }

        });
      }
    });





})

module.exports = saveRouter;

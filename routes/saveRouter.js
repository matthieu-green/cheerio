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
        var $ = cheerio.load(html);
        $('tr.tender:not(.light)[data-country=SEN]').each(function(i, element){
          var a = $(this);

          var title = a.children('td').children('a').text()
          var url = a.children('td').children('a').attr('href')
          var validite = a.children('td').eq(2).text()

          var urlArray = url.split(" ").join("%20").split("•").join("%E2%80%A2")

          request({method: "GET",
                          "rejectUnauthorized": false,
                          "url": urlArray}, function (error, response, html) {
            if (!error && response.statusCode == 200) {
              var $ = cheerio.load(html);
              $('.actionButton.large').each(function(i, element){
                var a = $(this);
                var theme = a.attr("href")

                var metadata = {
                  title: title,
                  url: urlArray,
                  validite: "Fin de validité: " + validite,
                  theme: theme,
                  financement: "LUXDEV",
                  source: "luxdev"
                }

                table.push(metadata);
              });
            }else{
              console.log("problem")
            }
          });
        });

      }
    });


    //request for AECID
    async function asyncCall2() {

      let feed = await parser.parseURL('http://www.aecid.es/_layouts/15/PortalWebAECID/VisorRss.aspx?IdCanal=2&lang=es');
      feed.items.forEach(item => {

        var title = item.title
        var url = item.link

        request(url, function (error, response, html) {
          if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('.detalleanuncio').each(function(i, element){
              var a = $(this);
              var validite = a.children(".fechalimitepresentaciondetalleanuncio").text().replace("FECHA LÍMITE PRESENTACIÓN - ", "")
              var theme = a.children(".cuerpodetalleanuncio").text()
              var valArray = validite.split("/")
              let current_datetime = new Date()
              let date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
              var dateArray = date.split("-");

              if(parseInt(dateArray[2]) < parseInt(valArray[2])){
                insertData()
              }else if(parseInt(dateArray[2]) == parseInt(valArray[2])){
                if(parseInt(dateArray[1]) < parseInt(valArray[1])){
                  insertData()
                }else if(parseInt(dateArray[1]) == parseInt(valArray[1])){
                  if (parseInt(dateArray[0]) <= parseInt(valArray[1])){
                    insertData()
                  }
                }
              }

              function insertData(){
                var metadata = {
                  title: title,
                  url: url,
                  validite: "Fin de validité: " + validite,
                  theme: theme,
                  financement: "AECID",
                  source: "aecid",
                }
                table.push(metadata);
              }
            });
          }else{
            console.log("error")
          }
        });

      });
    };

    asyncCall2()


    //request for USAID
    async function asyncCall() {

      let feed = await parser.parseURL('https://www.grants.gov/rss/GG_OppModByCategory.xml');
      feed.items.forEach(item => {
        if(item['content:encoded'].toLowerCase().includes("senegal")){
          var title = item.title
          var url = item.link
          var info = item['content:encoded'].split("</td></tr><tr><td>").join("|").split("</td></tr><tr><td valign=\'top\'>").join("|").split("</td><td>").join(" ").split("|").slice(2)

          var closeDateString = info[12].split(" ").slice(2).join(" ").split(",").join("")
          var closeDateArray = closeDateString.split(" ")

          let current_datetime = new Date()
          let date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
          var dateArray = date.split("-");

          var current_date = dateArray[0]+ " " + dateArray[1]+ " " + dateArray[2]

          var months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

          var month = months.indexOf(closeDateArray[0])

          var infoBox = info.join("=======================")

          if(parseInt(dateArray[2]) < parseInt(closeDateArray[2])){
            insertData()
          }else if(parseInt(dateArray[2]) == parseInt(closeDateArray[2])){
            if(parseInt(dateArray[1]) < parseInt(month)){
              insertData()
            }else if(parseInt(dateArray[1]) == parseInt(month)){
              if (parseInt(dateArray[0]) <= parseInt(closeDateArray[1])){
                insertData()
              }
            }
          }

          function insertData(){
            var metadata = {
              title: title,
              url: url,
              validite: "Fin de Validité: " + closeDateString,
              theme: info[18],
              financement: "US GRANTS",
              source: "usaid",
              info: infoBox
            }
            table.push(metadata);
          }
        }
      });
      return res.status(200).json(table)
    };

    asyncCall()


    //FUNDS FOR NGOS
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
              validite: "Fin de validité: " + validite,
              theme: theme,
              financement: "Multiple Sources",
              source: "fundsforngos"
            }

            table.push(metadata);
          // }

        });
      }
    });

    //US EMBASSY
    request('https://sn.usembassy.gov/education-culture/funding-opportunities/', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('.panel').each(function(i, element){

          var a = $(this);

          var title = a.children('.accordion-toggle').children('.panel-heading').children('.panel-title').text()

          var title2 = a.children('.panel-collapse').children('.panel-body').children('.accdiv').text()

          var array = title2.split(" ").join(";").split("\n").join(";").split(";")

          var infoArray = title2.split("\n")

          //check date
          var index = array.indexOf("Closing")
          var index1 = array.indexOf("Deadline")
          var dateVerif = false
          var dateClose = "Non Défini";

          if (index != -1){
            var date = array[index+2] + " " + array[index+3] + " " + array[index + 4]
            checkDate(date)
          }else if(index1 != -1){
            if(!isNaN(parseInt(array[index1 + 7]))){
              var date = array[index1+5] + " " + array[index1+6] + " " + array[index1 + 7]
              checkDate(date)
            }else{
              dateClose = "Info dans Info Box"
              dateVerif = true
            }
          }

          function checkDate(date){
            var dateClosing = date.split(",").join("").split(" ")
            dateClose = date.split(",").join("")
            let current_datetime = new Date()
            let date1 = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
            var dateArray = date1.split("-");
            var current_date = dateArray[0]+ " " + dateArray[1]+ " " + dateArray[2]
            var months = [" ", "January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            var month = months.indexOf(dateClosing[0])

            if(parseInt(dateArray[2]) < parseInt(dateClosing[2])){
              dateVerif = true
            }else if(parseInt(dateArray[2]) == parseInt(dateClosing[2])){
              if(parseInt(dateArray[1]) < parseInt(month)){
                dateVerif = true
              }else if(parseInt(dateArray[1]) == parseInt(month)){
                if (parseInt(dateArray[0]) <= parseInt(dateClosing[1])){
                  dateVerif = true
                }
              }
            }

          }


          if(title.toLowerCase().includes("grant") && dateVerif == true){
            var indexDescription = infoArray.indexOf(" Project description:")
            var indexDescription1 = infoArray.indexOf("A.PROGRAM DESCRIPTION")
            var indexDescription2 = infoArray.indexOf("A. PROGRAM DESCRIPTION")
            if(indexDescription != -1){
              var theme = infoArray[indexDescription+1]
            }else if(indexDescription1 != -1){
              var theme = infoArray[indexDescription1+1]
            }else if(indexDescription2 != -1){
              var theme = infoArray[indexDescription2+1]
            }else{
              var theme = "Chercher dans Info Box"
            }

            var metadata = {
              title: title,
              url: "https://sn.usembassy.gov/education-culture/funding-opportunities/",
              validite: "Fin de validité: " + dateClose,
              theme: theme,
              financement: "US EMBASSY",
              source: "usembassy",
              info: infoArray.join(")-----(")
            }
            table.push(metadata);
          }
        });
      }
    });


    //IDRC
    request({method: "GET",
            "rejectUnauthorized": false,
            "url": 'https://www.idrc.ca/en/funding'}, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('.view-display-id-block > .search-results-list-item').each(function(i, element){

          var a = $(this);

          var title = a.children('.views-field-title').children('.field-content').text()
          var url = 'https://www.idrc.ca/' + a.children('.views-field-title').children('.field-content').children('a').attr('href')
          var type = a.children().eq(1).text()
          var validite = a.children().eq(2).children('span').text()
          var info = "";
          var theme = "Non défini"

          if(type.toLowerCase().includes("proposals")){

            request({method: "GET",
                    "rejectUnauthorized": false,
                    "url": url}, function (error, response, html) {
              if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                $('.view-display-id-panel_pane_2').each(function(i, element){
                  var b = $(this);
                  theme = b.children(".views-row").children().eq(3).text()
                  info = b.text()
                  var metadata = {
                    title: title,
                    url: url,
                    validite: validite,
                    theme: theme,
                    financement: "International Development Research Center",
                    source: "idrc",
                    info: info.split("\n\n       ").join("============================")
                  }
                  table.push(metadata)
                });
              }
            });

          }

        });
      }else{
        console.log(error)
      }
    });


    //enabel
    async function asyncCall1() {

      let feed = await parser.parseURL('https://www.enabel.be/all-tenders-rss');
      feed.items.forEach(item => {

        var title = item.title
        var url = item.link


        if(item.content.toLowerCase().includes("senegal")){

          request(url, function (error, response, html) {
            if (!error && response.statusCode == 200) {
              var $ = cheerio.load(html);
              $('.file').each(function(i, element){

                var a = $(this)

                var theme = "https://www.enabel.be" + a.children('a').attr('href')

                var metadata = {
                  title: title,
                  url: url,
                  validite: "Status: Open",
                  theme: theme,
                  financement: "ENABEL",
                  source: "enabel",
                }

                table.push(metadata);
              });
            }else{
              console.log("error")
            }
          });
        }

      });
    };

    asyncCall1()

    //AFD
    request('https://www.afd.fr/en/calls-for-projects', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $('#25475 > .anchor > .content > div > div > div > div > div').each(function(i, element){

          var a = $(this);

          var title = a.children(".block").children(".__name").children(".__name").text()

          var description = a.children(".block").children(".__descriptive-nm").children(".__descriptive-nm").children("table").children('tbody')


          var theme = description.children().eq(1).text().replace('\n', '').replace('\t', '') + " " + description.children().eq(2).text().replace('\n', '').replace('\t', '')
          var validite = description.children().eq(0).children().eq(1).text()

          var info = a.children(".block").children(".__descriptive-nm").children(".__links-mv").children('div').children('div').children('div').children('a').attr('href')


          var metadata = {
            title: title,
            url: "https://www.afd.fr/en/calls-for-projects#25475",
            validite: validite,
            theme: info,
            financement: "AFD",
            source: "afd",
            info: theme
          }

          table.push(metadata);
        });
      }else{
        console.log(error)
      }
    });








})

module.exports = saveRouter;

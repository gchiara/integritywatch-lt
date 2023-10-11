import jquery, { each } from 'jquery';
window.jQuery = jquery;
window.$ = jquery;
require( 'datatables.net' )( window, $ )
require( 'datatables.net-dt' )( window, $ )

import underscore from 'underscore';
window.underscore = underscore;
window._ = underscore;

import '../public/vendor/js/popper.min.js'
import '../public/vendor/js/bootstrap.min.js'
import { csv } from 'd3-request'
import { json } from 'd3-request'

import '../public/vendor/css/bootstrap.min.css'
import '../public/vendor/css/dc.css'
import '/scss/main.scss';

import Vue from 'vue';
import Loader from './components/Loader.vue';
import ChartHeader from './components/ChartHeader.vue';

// Data object - is also used by Vue

var vuedata = {
  page: 'tabA',
  legislationSelected: 9,
  showMeetingsCharts: true,
  loader: true,
  readMore: false,
  showInfo: true,
  showShare: true,
  showAllCharts: true,
  chartMargin: 40,
  travelFilter: 'all',
  charts: {
    meetingsTotals: {
      title: 'Seimo narių susitikimai',
      info: 'Pasirinkite iki keturių Seimo narių ir palyginkite, kaip keitėsi jų susitikimų skaičius kadencijos metu.'
    },
    meetingsSelected: {
      title: 'Seimo narių susitikimai',
      info: 'Pasirinkite iki keturių Seimo narių ir palyginkite, kaip keitėsi jų susitikimų skaičius kadencijos metu.'
    },
    meetingsGroups: {
      title: 'Frakcijų susitikimai',
      info: 'Pasirinkite jus dominančią frakciją ir pamatykite, kaip keitėsi jos narių susitikimų skaičius kadencijos metu. Parlamentarui pakeitus frakciją, jo/ jos nauji susitikimai buvo priskirti tai frakcijai, prie kurios jis/ ji prisijungė. 2018 m. rudenį LLRA-KŠSF papildomai skelbė frakcijos darbotvarkę, kurioje pažymėjo 5 susitikimus su interesų grupėmis. Frakcija „Tvarka ir teisingumas“ iširo 2019 m. rugsėjį; Frakcija „Lietuvos Gerovei“ susikūrė 2019 m. rugsėjį, iširo 2020 m. sausį.'
    },
    wordcloud: {
      title: 'Susitikimų tema',
      info: 'Pasirinkite jus dominantį Seimo narį ir sužinokite, kokius susitikimus jis/ji turėjo dažniausiai (Seimo, komitetų, frakcijų posėdžiai neįtraukti į sąrašą).'
    },
    mainTable: {
      title: '',
      info: 'Pamatykite, kaip parlamentarai viešina savo darbotvarkes, su kokiomis interesų grupėmis susitinka, rikiuokite ir palyginkite parlamentarų aktyvumą paspausdami ant lentelės skilčių pavadinimų. Atkreipiame dėmesį, kad į Seimą išrinktų ir ministrais paskirtų politikų darbotvarkės yra skelbiamos ministerijų puslapiuose, todėl susitikimų, skelbiamų lrs.lt ir ministerijų puslapiuose, skaičius, gali skirtis. Susitikimai su interesų grupėmis buvo skaičiuojami peržiūrint tiek lrs.lt, tiek ministerijų puslapius.'
    },
    termsComparison: {
      title: 'Seimo narių susitikimai',
      info: 'Palyginkite, kaip keitėsi Seimo narių susitikimų skaičius skirtingų sesijų ir kadencijų metu.'
    }
  },
  openModalClicked: false,
  selectedElement: { "P": "", "Sub": ""},
  modalShowTable: '',
  selectedRows: [],
  selectedRowsAgendasData: [],
  globalAgendasString: "",
  globalAgendasData: [],
  meetingsCountsTablesL8: [
    {
      title: '2020 m. pavasario sesija',
      dataPrefix: '2020_Spring'
    },
    {
      title: '2019 m. rudens sesija',
      dataPrefix: '2019_Autumn'
    },
    {
      title: '2019 m. pavasario sesija',
      dataPrefix: '2019_Spring'
    },
    {
      title: '2018 m. rudens sesija',
      dataPrefix: '2018_Autumn'
    },
    {
      title: '2018 m. pavasario sesija',
      dataPrefix: '2018_Spring'
    },
    {
      title: '2017 m. rudens sesija',
      dataPrefix: '2017_Autumn'
    },
    {
      title: '2017 m. pavasario sesija',
      dataPrefix: '2017_Spring'
    }
  ],
  meetingsCountsTablesL9: [
    {
      title: '2023 m. pavasario sesija',
      dataPrefix: '2023_Spring',
      asteriskText: '- tiek susitikimų įvyko su lobistų sąraše registruotomis verslo asociacijomis ir įmonėmis.'
    },
    {
      title: '2022 m. rudens sesija',
      dataPrefix: '2022_Autumn',
      asteriskText: '- tiek susitikimų įvyko su lobistų sąraše registruotomis verslo asociacijomis ir įmonėmis.'
    },
    {
      title: '2022 m. pavasario sesija',
      dataPrefix: '2022_Spring',
      asteriskText: '- tiek susitikimų įvyko su lobistų sąraše registruotomis verslo asociacijomis ir įmonėmis.'
    },
    {
      title: '2021 m. rudens sesija',
      dataPrefix: '2021_Autumn',
      asteriskText: '- tiek susitikimų įvyko su lobistų sąraše registruotomis verslo asociacijomis ir įmonėmis.'
    },
    {
      title: '2021 m. pavasario sesija',
      dataPrefix: '2021_Spring',
      asteriskText: '- tiek susitikimų įvyko su lobistų sąraše registruotomis verslo asociacijomis.'
    },
  ],
  colors: {
    generic: ["#3b95d0", "#4081ae", "#406a95", "#395a75" ],
    default1: "#2b90b8",
    default2: "#449188",
    cloud: ["#264796", "#3a89c1", "#326f9b", "#5d8fb3", "#3e8bc2","#369f3e","#80b827", "#15811d"]
  }
}



//Set vue components and Vue app

Vue.component('chart-header', ChartHeader);
Vue.component('loader', Loader);

new Vue({
  el: '#app',
  data: vuedata,
  methods: {
    //Share
    downloadDataset: function () {
      window.open('./data/tab_a/legislation'+this.legislationSelected+'/meetings_totals.csv');
    },
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = 'Manoseimas.lt - SUŽINOK, SU KUO SUSITINKA SEIMO NARIAI ' + thisPage;
        var shareURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
        window.open(shareURL, '_blank');
        return;
      }
      if(platform == 'facebook'){
        var toShareUrl = 'http://manoseimas.lt/';
        var shareURL = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(toShareUrl);
        window.open(shareURL, '_blank', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250,top=300,left=300');
        return;
      }
    }
  }
});

//Initialize info popovers
$(function () {
  $('[data-toggle="popover"]').popover()
})

//Charts
var charts = {
  meetingsTotals: {
    chart: new dc.CompositeChart("#meetingstotals_chart"),
    type: 'line',
    divId: 'meetingstotals_chart'
  },
  meetingsSelected: {
    chart: new dc.CompositeChart("#meetingsselected_chart"),
    type: 'line',
    divId: 'meetingsselected_chart'
  },
  meetingsGroups: {
    chart: new dc.CompositeChart("#meetingsgroups_chart"),
    type: 'line',
    divId: 'meetingsgroups_chart'
  },
  wordcloud: {
    chart: null,
    type: 'd3',
    divId: 'wordcloud_chart'
  },
  mainTable: {
    chart: null,
    type: 'table',
    divId: 'dc-data-table'
  }
}

//Functions for responsivness
var recalcWidth = function(divId) {
  return document.getElementById(divId).offsetWidth - vuedata.chartMargin;
};
var recalcWidthWordcloud = function() {
  //Replace element if with wordcloud column id
  var width = document.getElementById("party_chart").offsetWidth - vuedata.chartMargin*2;
  return [width, 550];
};
var recalcCharsLength = function(width) {
  return parseInt(width / 8);
};
var calcPieSize = function(divId) {
  var newWidth = recalcWidth(divId);
  var sizes = {
    'width': newWidth,
    'height': 0,
    'radius': 0,
    'innerRadius': 0,
    'cy': 0,
    'legendY': 0
  }
  if(newWidth < 300) { 
    sizes.height = newWidth + 170;
    sizes.radius = (newWidth)/2;
    sizes.innerRadius = (newWidth)/4;
    sizes.cy = (newWidth)/2;
    sizes.legendY = (newWidth) + 30;
  } else {
    sizes.height = newWidth*0.75 + 170;
    sizes.radius = (newWidth*0.75)/2;
    sizes.innerRadius = (newWidth*0.75)/4;
    sizes.cy = (newWidth*0.75)/2;
    sizes.legendY = (newWidth*0.75) + 30;
  }
  return sizes;
};
var resizeGraphs = function() {
  for (var c in charts) {
    if((c == 'wordcloud' && vuedata.legislationSelected == 9) || (c == 'meetingsGroups' && vuedata.legislationSelected == 8 && vuedata.showAllCharts == false) || (c == 'meetingsSelected' && vuedata.selectedRows.length == 0) || (c == 'meetingsTotals' && (vuedata.selectedRows.length > 0 || vuedata.legislationSelected == 9))){

    } else {
      var sizes = calcPieSize(charts[c].divId);
      var newWidth = recalcWidth(charts[c].divId);
      var charsLength = recalcCharsLength(newWidth);
      if(charts[c].type == 'row'){
        charts[c].chart.width(newWidth);
        charts[c].chart.label(function (d) {
          var thisKey = d.key;
          if(thisKey.indexOf('###') > -1){
            thisKey = thisKey.split('###')[0];
          }
          if(thisKey.length > charsLength){
            return thisKey.substring(0,charsLength) + '...';
          }
          return thisKey;
        })
        charts[c].chart.redraw();
      } else if(charts[c].type == 'bar') {
        charts[c].chart.width(newWidth);
        charts[c].chart.rescale();
        charts[c].chart.redraw();
      } else if(charts[c].type == 'pie') {
        charts[c].chart
          .width(sizes.width)
          .height(sizes.height)
          .cy(sizes.cy)
          .innerRadius(sizes.innerRadius)
          .radius(sizes.radius)
          .legend(dc.legend().x(0).y(sizes.legendY).gap(10).legendText(function(d) { 
            var thisKey = d.name;
            if(thisKey.length > charsLength){
              return thisKey.substring(0, charsLength) + '...';
            }
            return thisKey;
          }));
        charts[c].chart.redraw();
      } else if(charts[c].type == 'cloud') {
        charts[c].chart.size(recalcWidthWordcloud());
        charts[c].chart.redraw();
      } else if(charts[c].type == 'line'){
        charts[c].chart
        .width(newWidth);
        charts[c].chart.rescale();
        charts[c].chart.redraw();
      } else if(charts[c].type == 'd3') {

      }
    }
  }
};

//Add commas to thousands
function addcommas(x){
  if(parseInt(x)){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return x;
}
//Custom date order for dataTables
var dmy = d3.timeParse("%d/%m/%Y");
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "date-eu-pre": function (date) {
    if(date.indexOf("Cancelled") > -1){
      date = date.split(" ")[0];
    }
      return dmy(date);
  },
  "date-eu-asc": function ( a, b ) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "date-eu-desc": function ( a, b ) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "name-pre": function (name) {
    var cleanName = name.replace(/<\/?[^>]+(>|$)/g, "");
    cleanName = cleanName.replace("Č","C").replace("Ž","Z").replace("Ž","Z").replace("Ą","A").replace("Š","S");
    return cleanName;
  },
  "name-asc": function ( a, b ) {
      return a.localeCompare(b);
  },
  "name-desc": function ( a, b ) {
      return b.localeCompare(a);
  }
});

jQuery.extend({
  highlight: function (node, re, nodeName, className) {
      if (node.nodeType === 3) {
          var match = node.data.match(re);
          if (match) {
              var highlight = document.createElement(nodeName || 'span');
              highlight.className = className || 'highlight';
              var wordNode = node.splitText(match.index);
              wordNode.splitText(match[0].length);
              var wordClone = wordNode.cloneNode(true);
              highlight.appendChild(wordClone);
              wordNode.parentNode.replaceChild(highlight, wordNode);
              return 1; //skip added node in parent
          }
      } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
              !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
              !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
          for (var i = 0; i < node.childNodes.length; i++) {
              i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
          }
      }
      return 0;
  }
});

//Highlighting plugin 
jQuery.fn.unhighlight = function (options) {
  var settings = { className: 'highlight', element: 'span' };
  jQuery.extend(settings, options);

  return this.find(settings.element + "." + settings.className).each(function () {
      var parent = this.parentNode;
      parent.replaceChild(this.firstChild, this);
      parent.normalize();
  }).end();
};
jQuery.fn.highlight = function (words, options) {
  var settings = { className: 'highlight', element: 'span', caseSensitive: false, wordsOnly: false };
  jQuery.extend(settings, options);
  
  if (words.constructor === String) {
      words = [words];
  }
  words = jQuery.grep(words, function(word, i){
    return word != '';
  });
  words = jQuery.map(words, function(word, i) {
    return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  });
  if (words.length == 0) { return this; };
  var flag = settings.caseSensitive ? "" : "i";
  var pattern = "(" + words.join("|") + ")";
  if (settings.wordsOnly) {
      pattern = "\\b" + pattern + "\\b";
  }
  var re = new RegExp(pattern, flag);
  return this.each(function () {
      jQuery.highlight(this, re, settings.element, settings.className);
  });
};

//Turn meetings totals into array and add avg
function objToArray(obj) {
  var arr = [];
  var tot = 0;
  var entriesNum = 0;
  Object.keys(obj).forEach(function(key) {
    tot += obj[key];
    entriesNum ++;
  });
  var avg = Math.round(tot/entriesNum);
  Object.keys(obj).forEach(function(key) {
    var entry = {x: key, y: obj[key], avg: avg};
    arr.push(entry);
  });
  return arr;
}

//Turn string into data for cloudword
function stringToCloudData(s) {
  var cloudData = [];
  var maxWords = 70;
  var stringArray = s.replace(/[!\.,:;'"\?]/g, '').split(" ");
  var blacklist = ["ir","o","bet","tačiau","dėl","nes","kad","jeigu","rytinis","vakarinis","su","prie","į","už","rugsėj","spal","lapkrit","gruod","saus","vasar","kov","baland","geguž","biržel","liep","rugpjū","k.","atšauktas","nuotoliniu","būdu","veiksmų","p.","m.","raj.","valanda","komitetas","komiteto","komitetui","komitetai","komitetui","posėdis","posėdžio","posėdyje","Seimo","Seimas","Seimui","komisijos","komisija","komisijai","frakcija","frakcijos","frakcijoje","viešina","plenarinis","plenarinio","plenariniame"];
  _.each(stringArray, function(w) {
    if(blacklist.indexOf(w) == -1) {
      //If word already in data, add value, else add data
      var wordData = _.find(cloudData, function(x) { return x.word == w });
      if(wordData) {
        wordData.size ++;
      } else {
        cloudData.push({word: w, size: 1});
      }
    }
  });
  cloudData.sort(function(a, b) {
    return b.size - a.size;
  }); 
  var cloudDataFiltered = cloudData.slice(0, maxWords);
  return cloudDataFiltered;
}

//Generate selected rows agendas data for word cloud
function genSelectedRowsCloudData() {
  if(vuedata.selectedRows.length == 0) {
    vuedata.selectedRowsAgendasData = [];
    return;
  }
  var fullString = "";
  _.each(vuedata.selectedRows, function(d){
    fullString += d.agendasString;
  })
  vuedata.selectedRowsAgendasData = stringToCloudData(fullString);
  return;
}
//Get URL parameters
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//Generate random parameter for dynamic dataset loading (to avoid caching)
var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}

var mpsDatasetFile = './data/tab_a/legislation9/p2b_ad_seimo_nariai.json';
var factionsDatasetFile = './data/tab_a/legislation9/p2b_ad_seimo_frakcijos.json';
var agendasDatasetFile = './data/tab_a/legislation9/p2b_ad_sn_darbotvarkes.json';
var photosDatasetFile = './data/tab_a/legislation9/photos.json';
var lobbyMeetingsDatasetFile = './data/tab_a/legislation9/meetings_totals.csv';
var partyMeetingsDatasetFile = './data/tab_a/legislation9/party_meetings.csv';
var wordcloudMainDataFile = './data/tab_a/legislation9/wordcloud.json';
var termsComparisonDataFile = './data/tab_a/legislation9/comparison_of_terms.csv';

var legislationSelected = getParameterByName('legislation');
if(legislationSelected == '8' || legislationSelected == '9') {
  vuedata.legislationSelected = legislationSelected;
  mpsDatasetFile = './data/tab_a/legislation'+legislationSelected+'/p2b_ad_seimo_nariai.json';
  factionsDatasetFile = './data/tab_a/legislation'+legislationSelected+'/p2b_ad_seimo_frakcijos.json';
  agendasDatasetFile = './data/tab_a/legislation'+legislationSelected+'/p2b_ad_sn_darbotvarkes.json';
  photosDatasetFile = './data/tab_a/legislation'+legislationSelected+'/photos.json';
  lobbyMeetingsDatasetFile = './data/tab_a/legislation'+legislationSelected+'/meetings_totals.csv';
  partyMeetingsDatasetFile = './data/tab_a/legislation'+legislationSelected+'/party_meetings.csv';
  wordcloudMainDataFile = './data/tab_a/legislation'+legislationSelected+'/wordcloud.json';
}
if(vuedata.legislationSelected == '9') {
  vuedata.showMeetingsCharts = false;
  vuedata.charts.mainTable.info = "Pamatykite, kaip parlamentarai viešina savo darbotvarkes, rikiuokite ir palyginkite parlamentarų aktyvumą paspausdami ant lentelės skilčių pavadinimų. Informacija apie Seimo narius atnaujinama remiantis atvirais Seimo duomenimis. Tais atvejais, kai Seimo narys (-ė) buvo paskirtas ministru (-e), papildomai peržiūrimi ir suskaičiuojami susitikimai su interesų grupių atstovais, skelbiami jo/jos, kaip ministro (-ės), darbotvarkėse.";
  vuedata.charts.meetingsGroups.info = "Pasirinkite jus dominančią frakciją ir pamatykite, kaip keitėsi jos narių susitikimų skaičius kadencijos metu. Parlamentarui pakeitus frakciją, jo/ jos nauji susitikimai buvo priskirti tai frakcijai, prie kurios jis/ ji prisijungė. Duomenys atnaujinami prieš kiekvieną sesiją."
}

//Load data and generate charts
json(mpsDatasetFile + '?' + randomPar, (err, mpsDataset) => {
  json(photosDatasetFile + '?' + randomPar, (err, photosDataset) => {
    json(factionsDatasetFile + '?' + randomPar, (err, factionsDataset) => {
      json(agendasDatasetFile + '?' + randomPar, (err, agendasDataset) => {
        csv(lobbyMeetingsDatasetFile + '?' + randomPar, (err, lobbyMeetingsDataset) => {
          csv(partyMeetingsDatasetFile + '?' + randomPar, (err, partyMeetingsDataset) => {
            json(wordcloudMainDataFile + '?' + randomPar, (err, wordcloudMainData) => {
              //Loop through data to apply fixes and calculations
              var mps = mpsDataset.SeimoInformacija.SeimoKadencija.SeimoNarys;
              var factions = factionsDataset.SeimoInformacija.SeimoKadencija.SeimoFrakcija;
              var agendas = agendasDataset.SeimoInformacija.SeimoNarys;
              var totAgendas = 0;
              var totMeetings = 0;
              var extraMeetings = 0;
              if(vuedata.legislationSelected == '8') { extraMeetings = 5; }
              var meetingsTotObject = {
                "2017 PAVASARIS": 0,
                "2017 RUDUO": 0,
                "2018 PAVASARIS": 0,
                "2018 RUDUO": extraMeetings,
                "2019 PAVASARIS": 0,
                "2019 RUDUO": 0,
                "2020 PAVASARIS": 0,
                //"2020 RUDUO": 0
              }
              //Loop through factions to get list of mps ids per faction
              _.each(factions, function (f) {
                f.mpsList = [];
                _.each(f.SeimoFrakcijosNarys, function (f2) {
                  f.mpsList.push(f2['@asmens_id']);
                });
              });
              //Loop through mps to link and tidy data
              _.each(mps, function (d) {
                //Find related data from other datasets.
                d.legislature = mpsDataset.SeimoInformacija.SeimoKadencija['@kadencijos_id'];
                d.faction = _.find(factions, function(x) { return x.mpsList.indexOf(d['@asmens_id']) > -1 });
                if(d.faction) {
                  d.factionDetail = _.find(d.faction.SeimoFrakcijosNarys, function(x) { return x['@asmens_id'] == d['@asmens_id']});
                }
                d.agendas = _.find(agendas, function(x) { return x['@asmens_id'] == d['@asmens_id']});
                d.lobbyMeetings = _.find(lobbyMeetingsDataset, function(x) { return x['last_name'].trim() == d['@pavardė'].trim() && x['first_name'].trim() == d['@vardas'].trim()});
                //Get photo url
                d.photoUrl = '';
                //console.log(d['@biografijos_nuoroda']);
                var photoEntry = _.find(photosDataset, function(x) {return x['url'] == d['@biografijos_nuoroda']});
                if(photoEntry) {
                  d.photoUrl = photoEntry.photoUrl;
                  d.photoLocalUrl = 'legislation' + vuedata.legislationSelected + '/' + _.last(photoEntry.photoUrl.split('/'));
                }
                //Add totals to totals object
                if(d.lobbyMeetings) {
                  var a2017 = parseInt(d.lobbyMeetings["2017_Spring_total"]);
                  var b2017 = parseInt(d.lobbyMeetings["2017_Autumn_total"]);
                  var a2018 = parseInt(d.lobbyMeetings["2018_Spring_total"]);
                  var b2018 = parseInt(d.lobbyMeetings["2018_Autumn_total"]);
                  var a2019 = parseInt(d.lobbyMeetings["2019_Spring_total"]);
                  var b2019 = parseInt(d.lobbyMeetings["2019_Autumn_total"]);
                  var a2020 = parseInt(d.lobbyMeetings["2020_Spring_total"]);
                  var b2020 = parseInt(d.lobbyMeetings["2020_Autumn_total"]);
                  if(!isNaN(a2017)){ meetingsTotObject["2017 PAVASARIS"] += a2017; }
                  if(!isNaN(b2017)){ meetingsTotObject["2017 RUDUO"] += b2017; }
                  if(!isNaN(a2018)){ meetingsTotObject["2018 PAVASARIS"] += a2018; }
                  if(!isNaN(b2018)){ meetingsTotObject["2018 RUDUO"] += b2018; }
                  if(!isNaN(a2019)){ meetingsTotObject["2019 PAVASARIS"] += a2019; }
                  if(!isNaN(b2019)){ meetingsTotObject["2019 RUDUO"] += b2019; }
                  if(!isNaN(a2020)){ meetingsTotObject["2020 PAVASARIS"] += a2020; }
                  //if(!isNaN(b2020)){ meetingsTotObject["2020_RUDUO"] += b2020; }
                }
                //Agendas count and string for word cloud
                d.agendasCount = 0;
                d.agendasString = "";
                if(d.agendas) {
                  _.each(d.agendas.SeimoNarioDarbotvarkėsĮvykis, function(a) {
                    //console.log(a);
                    if(vuedata.legislationSelected == '9') {
                      a['@pabaiga'] = a.e;
                      a['@pradžia'] = a.s;
                      a['@pavadinimas'] = a.t;
                      a['@vieta'] = a.l; 
                    }
                  });
                  if(vuedata.legislationSelected == '9') {
                    //Filter agendas to only keep entries after 13 Nov 2020
                    d.agendas["SeimoNarioDarbotvarkėsĮvykis"] = _.filter(d.agendas["SeimoNarioDarbotvarkėsĮvykis"], function(x) { 
                      var iniDate = parseInt(x["@pradžia"].split(" ")[0].replaceAll("-",""));
                      //return iniDate >= 20201113 && iniDate <= 20211231; 
                      return iniDate >= 20201113; 
                    });
                  } else {
                    //Filter agendas to only keep entries before 13 Nov 2020
                    d.agendas["SeimoNarioDarbotvarkėsĮvykis"] = _.filter(d.agendas["SeimoNarioDarbotvarkėsĮvykis"], function(x) { 
                      var iniDate = parseInt(x["@pradžia"].split(" ")[0].replaceAll("-",""));
                      return iniDate < 20201113; 
                    });
                  }
                  d.agendasCount = d.agendas["SeimoNarioDarbotvarkėsĮvykis"].length;
                  totAgendas += parseInt(d.agendasCount);
                  _.each(d.agendas.SeimoNarioDarbotvarkėsĮvykis, function(a) {
                    d.agendasString += " " + a["@pavadinimas"];
                  });
                  vuedata.globalAgendasString += d.agendasString;
                }
                //Meetings count
                d.meetingsCount = 0;
                if(d.lobbyMeetings && !isNaN(parseInt(d.lobbyMeetings['Total_all_periods']))) {
                  d.meetingsCount = parseInt(d.lobbyMeetings['Total_all_periods']);
                  totMeetings += parseInt(d.lobbyMeetings['Total_all_periods']);
                }
                /*
                if(d.lobbyMeetings && !isNaN(d.lobbyMeetings['2019_PAVASARIS'])) {
                  d.meetingsCount = d.lobbyMeetings['2019_PAVASARIS'];
                  totMeetings += parseInt(d.meetingsCount);
                }
                */
                //Generate string for group leader/chairman column
                d.chairmanString = "";
                _.each(d.Pareigos, function (p) {
                  if(p['@pareigos'] == "Komisijos pirmininkė") {
                    if(d.chairmanString.length > 0) {
                      d.chairmanString += "<br />";
                    }
                    d.chairmanString += "Komisijos pirmininkė " + p['@padalinio_pavadinimas'];
                  }
                });
              });
              var meetingsTotalsData = objToArray(meetingsTotObject);

              vuedata.globalAgendasData = wordcloudMainData;
              //To regenerate main wordcloud:
              //vuedata.globalAgendasData = stringToCloudData(vuedata.globalAgendasString);
              //console.log(JSON.stringify(vuedata.globalAgendasData));

              //Set totals for custom counters
              $('.count-box-agendas .total-count').html(totAgendas);
              $('.count-box-meetings .total-count').html(totMeetings + extraMeetings);

              //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
              var ndx = crossfilter(mps);
              var ndxMeetingsTotals = crossfilter(meetingsTotalsData);
              var ndxMeetingsGroups = crossfilter(partyMeetingsDataset);
              var searchDimension = ndx.dimension(function (d) {
                  var entryString = d['@vardas'] + ' ' + d['@pavardė'] + ' ' + d.agendasString;
                  if(d.faction) {
                    entryString += ' ' + d.faction['@padalinio_pavadinimo_santrumpa'];
                  }
                  return entryString.toLowerCase();
              });

              //CHART 1 DYNAMIC
              var createMeetingsSelectedChart = function(){
                //Hide if nothing selected
                if(vuedata.selectedRows.length == 0) {
                  $("#meetingsselected_chart_container").hide();
                  $("#meetingstotals_chart_container").show();
                  return;
                }
                $("#meetingsselected_chart_container").show();
                $("#meetingstotals_chart_container").hide();
                //Generate data
                var selectedMeetingsData = [
                  {timeId: "2017_Spring", time: "2017 PAVASARIS"},
                  {timeId: "2017_Autumn", time: "2017 RUDUO"},
                  {timeId: "2018_Spring", time: "2018 PAVASARIS"},
                  {timeId: "2018_Autumn", time: "2018 RUDUO"},
                  {timeId: "2019_Spring", time: "2019 PAVASARIS"},
                  {timeId: "2019_Autumn", time: "2019 RUDUO"},
                  {timeId: "2020_Spring", time: "2020 PAVASARIS"},
                  //{timeId: "2020_Autumn", time: "2020_RUDUO"},
                ];
                _.each(vuedata.selectedRows, function (d) {
                  var thisName = d['@vardas'] + ' ' + d['@pavardė'];
                  if(d.lobbyMeetings) {
                    _.each(selectedMeetingsData, function (a) {
                      var thisTime = a.timeId;
                      var thisTotal = parseInt(d.lobbyMeetings[thisTime + "_total"]);
                      if(isNaN(thisTotal)) {
                        a[thisName] = 0;
                      } else {
                        a[thisName] = thisTotal;
                      }
                    });
                  }
                });
                //Generate chart
                var ndxSelected = crossfilter(selectedMeetingsData);
                var chart = new dc.CompositeChart("#" + charts.meetingsSelected.divId);
                var dimension = ndxSelected.dimension(function (d) {
                  return d.time; 
                });
                var colors = ["#5196c8", "#264796", "#369f3e", "#80b827"];
                var groups = [];
                var composeArray = [];
                var groupscount = 0;
                _.each(vuedata.selectedRows, function (d) {
                  var thisName = d['@vardas'] + ' ' + d['@pavardė'];
                  var thisGroup =  dimension.group().reduceSum(function (d) { 
                    if(isNaN(d[thisName])) {
                      return 0;
                    }
                    return d[thisName]; 
                  });
                  var thisCompose = dc.lineChart(chart)
                  .group(thisGroup, thisName)
                  .colors(colors[groupscount])
                  .renderDataPoints({
                    radius: 2,
                    fillOpacity: 0.5,
                    strokeOpacity: 0.8
                  });
                  groups.push(thisGroup);
                  composeArray.push(thisCompose);
                  groupscount ++;
                });
                var width = recalcWidth(charts.meetingsSelected.divId);
                chart
                  .width(width)
                  .height(400)
                  .yAxisPadding(10)
                  .renderHorizontalGridLines(true)
                  .margins({top: 10, right: 10, bottom: 60, left: 30})
                  .legend(dc.legend().x(10).y(390).itemHeight(15).gap(15).horizontal(true).autoItemWidth(true))
                  .x(d3.scaleBand())
                  .xUnits(dc.units.ordinal)
                  .brushOn(false)
                  .xAxisLabel('')
                  .yAxisLabel('Susitikimų skaičius')
                  .dimension(dimension)
                  .group(groups[0], 'Susitikimų skaičius')
                  ._rangeBandPadding(1)
                  .compose(composeArray);
                chart.xAxis()
                  .tickFormat(function(d) { return d; });
                chart.filter = function() {};
                chart.renderlet(function (chart) {
                  // rotate x-axis labels
                  chart.selectAll('g.x text')
                    .attr('transform', 'translate(-10,10) rotate(315)');
                });
                chart.render();
                charts.meetingsSelected.chart = chart;
              }

              //CHART 1 - TOTALS
              var createMeetingsTotalsChart = function(){
                var chart = charts.meetingsTotals.chart;
                var dimension = ndxMeetingsTotals.dimension(function (d) {
                  return d.x; 
                });
                var group = dimension.group().reduceSum(function (d) { 
                  if(isNaN(d.y)) {
                    return 0;
                  }
                  return d.y; 
                });
                var group2 = dimension.group().reduceSum(function (d) { 
                  if(isNaN(d.avg)) {
                    return 0;
                  }
                  return d.avg; 
                });
                var width = recalcWidth(charts.meetingsTotals.divId);
                chart
                  .width(width)
                  .height(400)
                  .yAxisPadding(10)
                  .renderHorizontalGridLines(true)
                  .margins({top: 10, right: 10, bottom: 60, left: 30})
                  .legend(dc.legend().x(10).y(390).itemHeight(15).gap(15).horizontal(true).autoItemWidth(true))
                  .x(d3.scaleBand())
                  .xUnits(dc.units.ordinal)
                  .brushOn(false)
                  .xAxisLabel('')
                  .yAxisLabel('Susitikimų skaičius')
                  .dimension(dimension)
                  .group(group, 'Susitikimų skaičius')
                  ._rangeBandPadding(1)
                  .compose([
                    dc.lineChart(chart)
                    .group(group, "Visų susitikimų skaičius")
                    .colors('#369f3e')
                    .renderDataPoints({
                      radius: 2,
                      fillOpacity: 0.5,
                      strokeOpacity: 0.8
                    }),
                    dc.lineChart(chart)
                    .group(group2, "Vidutinis susitikimų skaičius")
                    .colors('#5196c8')
                    .renderDataPoints({
                      radius: 2,
                      fillOpacity: 0.5,
                      strokeOpacity: 0.8
                    })
                  ]);
                chart.filter = function() {};
                chart.render();
              }

              //CHART 2
              var createWordcloudChart = function() {
                //Data to use
                var thisData = vuedata.globalAgendasData;
                if(vuedata.selectedRows.length > 0) {
                  thisData = vuedata.selectedRowsAgendasData;
                }
                if(thisData.length == 0) {
                  thisData = [{word:" ", size:"1"}];
                }
                //Size variables
                var sizeScale = d3.scaleLinear()
                  .domain([1, thisData.length > 10 ? thisData[2].size : thisData[0].size])
                  .range([11, 50]);
                var margin = {top: -10, right: 0, bottom: 0, left: 0};
                var width = $("#" + charts.wordcloud.divId).width();
                var height = 450;
                //Append the svg object
                var svg = d3.select("#" + charts.wordcloud.divId).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                  .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");
                //Constructs cloud layout
                var layout = d3.layout.cloud()
                  .size([width, height])
                  .words(thisData.map(function(d) { return {text: d.word, size: d.size}; }))
                  .padding(5)        //space between words
                  .rotate(function() { return ~~(Math.random() * 2) * 90; })
                  .fontSize(function(d) { return sizeScale(d.size) > 50 ? 50 : sizeScale(d.size); })      // font size of words
                  .on("end", draw);
                layout.start();
                // Draw function
                function draw(words) {
                  var cloud = svg
                    .append("g")
                      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                      //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                      .selectAll("text")
                        .data(words);
                        cloud.enter().append("text")
                        .style("font-size", function(d) { return d.size; })
                        .style("fill", function(d) { return vuedata.colors.cloud[Math.floor(Math.random() * vuedata.colors.cloud.length)]; })
                        .attr("text-anchor", "middle")
                        .style("font-family", "Impact")
                        .attr("transform", function(d) {
                          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
                        })
                        .text(function(d) { return d.text; });
                        cloud.transition()
                          .duration(600)
                          .style("font-size", function(d) { return d.size; })
                          .attr("transform", function(d) {
                              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                          })
                          .style("fill-opacity", 1);
                        cloud.exit()
                        .transition()
                          .duration(200)
                          .style('fill-opacity', 1e-6)
                          .attr('font-size', 1)
                          .remove();
                }
              }

              //CHART 3
              var createMeetingsGroupsChart = function(){
                var partiesData = [
                  {name: "Liberalų sąjūdžio frakcija (LSF)", color: "#F49813"},
                  {name: "Lietuvos lenkų rinkimų akcijos-Krikščioniškų šeimų sąjungos frakcija (LLRA-KŠSF)", color: "#3164B7"},
                  {name: "Lietuvos socialdemokratų darbo frakcija (LSDDF)", color: "#DD3333"},
                  {name: "Lietuvos socialdemokratų partijos frakcija (LSDPF)", color: "#E10514"},
                  {name: "Lietuvos valstiečių ir žaliųjų sąjungos frakcija (LVŽSF)", color: "#0F7448"},
                  {name: "Mišri Seimo narių grupė (MG)", color: "#7D7D7D"},
                  {name: "Tėvynės sąjungos-Lietuvos krikščionių demokratų frakcija (TS-LKDF)", color: "#00A59B"},
                  {name: "Frakcija „Lietuvos gerovei“", color: "#04A03C"},
                  {name: "Frakcija „Tvarka ir teisingumas“", color: "#24418C"},
                ];
                if(vuedata.legislationSelected == 9) {
                  partiesData = [
                    {name: "Darbo partijos frakcija (DPF)", color: "#DD3333"},
                    {name: "Laisvės frakcija (LF)", color: "#3164B7"},
                    {name: "Liberalų sąjūdžio frakcija (LSF)", color: "#F49813"},
                    {name: "Lietuvos regionų frakcija (LRF)", color: "#04A03C"},
                    {name: "Lietuvos socialdemokratų partijos frakcija (LSDPF)", color: "#E10514"},
                    {name: "Lietuvos valstiečių ir žaliųjų sąjungos frakcija (LVŽSF)", color: "#0F7448"},
                    {name: "Mišri Seimo narių grupė (MG)", color: "#7D7D7D"},
                    {name: "Tėvynės sąjungos-Lietuvos krikščionių demokratų frakcija (TS-LKDF)", color: "#00A59B"},
                    {name: "Demokratų frakcija „Vardan Lietuvos“ (DFVL)", color: "#13136e"},
                    {name: "Seimo narys, neįsiregistravęs į frakciją", color: "#bbbbbb"}
                  ];
                }
                var chart = charts.meetingsGroups.chart;
                var dimension = ndxMeetingsGroups.dimension(function (d) {
                  return d.time; 
                });
                var groups = [];
                var composeArray = [];
                _.each(partiesData, function (p) {
                  var thisGroup = dimension.group().reduceSum(function (d) { 
                    if(d[p.name] == "N/A") {
                      return -1;
                    }
                    var val = parseInt(d[p.name]); 
                    if(isNaN(val)) {
                      return 0;
                    }
                    return val;
                  });
                  var thisCompose = dc.lineChart(chart)
                  .group(thisGroup, p.name)
                  .colors(p.color)
                  .defined(function(d){
                    return d.data.value !== -1;
                  })
                  .renderDataPoints({
                    radius: 2,
                    fillOpacity: 0.5,
                    strokeOpacity: 0.8
                  });
                  groups.push(thisGroup);
                  composeArray.push(thisCompose);
                });
                var width = recalcWidth(charts.meetingsGroups.divId);
                chart
                  .width(width)
                  .height(400)
                  .yAxisPadding(10)
                  .renderHorizontalGridLines(true)
                  .margins({top: 10, right: 10, bottom: 60, left: 30})
                  .legend(dc.legend().x(10).y(390).itemHeight(12).gap(7).horizontal(false).autoItemWidth(true))
                  .x(d3.scaleBand())
                  .xUnits(dc.units.ordinal)
                  .brushOn(false)
                  .xAxisLabel('')
                  .yAxisLabel('Susitikimų skaičius')
                  .dimension(dimension)
                  .group(groups[0], 'Susitikimų skaičius')
                  ._rangeBandPadding(1)
                  .compose(composeArray);
                chart.xAxis()
                  //.tickValues(d3.range(data.length))
                  .tickFormat(function(d) { return d; });
                chart.filter = function() {};
                chart.render();
              }

              //TERMS COMPARISON CHART
              var createTermsComparisonChart = function() {
                csv(termsComparisonDataFile + '?' + randomPar, (err, data) => {
                  var divId = "termscomparison_chart";
                  var margin = {top: 10, right: 20, bottom: 70, left: 50},
                  width = recalcWidth(divId) - margin.left - margin.right,
                  height = 500 - margin.top - margin.bottom;
                  var maxY = 0;
                  var svgRoot = d3.select("#"+divId)
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  var svg = svgRoot
                  .append("g")
                  .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
                  var subgroups = [];
                  _.each(data, function (d) {
                    var l8 = parseInt(d.legislation8 );
                    var l9 = parseInt(d.legislation9 );
                    if(l8 > maxY) { maxY = l8; }
                    if(l9 > maxY) { maxY = l9; }
                    subgroups.push(d.group);
                  });
                  subgroups = ["legislation9", "legislation8"];
                  var groups = d3.map(data, function(d){return(d.group)}).keys();
                  var x = d3.scaleBand()
                    .domain(groups)
                    .range([0, width])
                    .padding([0.2])
                  var xAxis = svg.append("g")
                  .attr("transform", "translate(0," + height + ")")
                  .call(d3.axisBottom(x).tickSize(0));
                  //Customize x labels
                  var editLabels = function() {
                    xAxis.selectAll('text') 
                      .call(function(t){                
                        t.each(function(d){ 
                          var self = d3.select(this);
                          var s = self.text().split(' / ');  
                          self.text(''); 
                          self.append("tspan") 
                            .attr("x", -5)
                            .attr("dy","1em")
                            .text(s[0].toUpperCase());
                          self.append("tspan")
                            .attr("x", 15)
                            .attr("dy","1.1em")
                            .text(s[1].toUpperCase());
                        });
                      })
                      .style("text-anchor", "end")
                      .attr("dx", "-1em")
                      .attr("dy", ".15em")
                      .attr("transform", "rotate(-25)");
                  }
                  editLabels();
                  var y = d3.scaleLinear()
                  .domain([0, maxY + 10])
                  .range([ height, 0 ]);
                  svg.append("g")
                  .call(d3.axisLeft(y));
                  var xSubgroup = d3.scaleBand()
                  .domain(subgroups)
                  .range([0, x.bandwidth()])
                  .padding([0.05])
                  var color = d3.scaleOrdinal().domain(subgroups).range(['#80b827','#3d8ac2']);
                  var barsGroup = svg.append("g")
                  .selectAll("g")
                  .data(data)
                  .enter()
                  .append("g")
                    .attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; });
                  var bars = barsGroup
                  .selectAll("rect")
                  .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
                  .enter().append("rect")
                    .attr("x", function(d) { return xSubgroup(d.key); })
                    .attr("y", function(d) { return y(d.value); })
                    .attr("width", xSubgroup.bandwidth())
                    .attr("height", function(d) { return height - y(d.value); })
                    .attr("fill", function(d) { return color(d.key); })
                    .append("svg:title") // TITLE APPENDED HERE
                      .text(function(d) { return d.value; });

                  svg.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("x", "-85px")
                    .attr("y", 0)
                    .attr("dy", "-2.3em")
                    .attr("transform", "rotate(-90)")
                    .text("Susitikimų skaičius");
                //Make chart responsive
                var redrawComparisonChart = function() {
                  width = recalcWidth(divId) - margin.left - margin.right;
                  svgRoot.attr("width", width + margin.left + margin.right);
                  x.range([0, width]);
                  xAxis.call(d3.axisBottom(x).tickSize(0));
                  editLabels();
                  xSubgroup.range([0, x.bandwidth()])
                  barsGroup.attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; });
                  bars
                  .attr("x", function(d) { return xSubgroup(d.key); })
                  .attr("width", xSubgroup.bandwidth())
                }
                window.addEventListener("resize", redrawComparisonChart);
                });
              }
              
              //TABLE
              var createTable = function() {
                var count=0;
                charts.mainTable.chart = $("#dc-data-table").dataTable({
                  "language": {
                    "info": "Rodoma _START_ iki _END_ iš _TOTAL_ įrašų",
                    "lengthMenu": "Rodyti _MENU_ įrašus",
                    "paginate": {
                      "first":      "First",
                      "last":       "Last",
                      "next":       "Kitas",
                      "previous":   "Ankstesnis"
                    },
                    "infoEmpty": "Įrašų nėra",
                    "emptyTable": "Nerasta"
                  },
                  "columnDefs": [
                    {
                      "searchable": false,
                      "orderable": false,
                      "targets": 0,   
                      data: function ( row, type, val, meta ) {
                        return count;
                      }
                    },
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 1,
                      "defaultContent":"N/A",
                      "type": "name",
                      "data": function(d) {
                        if(!d['@vardas'] && !d['@pavardė']) {
                          return "Nerasta";
                        }
                        return '<a href="https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&p_a=498&p_asm_id=' + d['@asmens_id'] +'" target="_blank">' + d['@vardas'] + ' ' + d['@pavardė'];
                      }
                    },
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 2,
                      "defaultContent":"N/A",
                      "data": function(d) {
                        if(d.faction) {
                          return d.faction['@padalinio_pavadinimo_santrumpa'];
                        }
                      }
                    },
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 3,
                      "defaultContent":"N/A",
                      "className": "dt-center",
                      "data": function(d) {
                        //return d.legislature;
                        return d['@kadencijų_skaičius'];
                      }
                    },
                    /*
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 4,
                      "defaultContent":"N/A",
                      "data": function(d) {
                        var groupsRoleString = "";
                        if(d.factionDetail && d.factionDetail['@pareigos'] == 'Frakcijos seniūnas') {
                          groupsRoleString += "Frakcijos seniūnas";
                        }
                        if(d.chairmanString.length > 0) {
                          if(d.chairmanString.length > 0) {
                            //groupsRoleString += "<br />";
                          }
                          groupsRoleString += d.chairmanString;
                        }
                        return groupsRoleString;
                      }
                    },
                    */
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 4,
                      "defaultContent":"N/A",
                      "className": "dt-center",
                      "data": function(d) {
                        return d.agendasCount;
                      }
                    },
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 5,
                      "defaultContent":"N/A",
                      "className": "dt-center",
                      "data": function(d) {
                        if(d.lobbyMeetings) {
                          return d.lobbyMeetings['Total_all_periods'];
                        } else {
                          return '-';
                        }
                      }
                    },
                    {
                      "searchable": false,
                      "orderable": true,
                      "targets": 6,
                      "defaultContent":"N/A",
                      "data": function(d) {
                        var rowId = d["@asmens_id"];
                        return '<button id="'+rowId +'" class="detailsModalBtn">Žiūrėti</button>';
                      }
                    }
                  ],
                  "iDisplayLength" : 25,
                  "bPaginate": true,
                  "bLengthChange": true,
                  "bFilter": false,
                  "order": [[ 1, "asc" ]],
                  "bSort": true,
                  "bInfo": true,
                  "bAutoWidth": false,
                  "bDeferRender": true,
                  "aaData": searchDimension.top(Infinity),
                  "bDestroy": true,
                });
                var datatable = charts.mainTable.chart;
                datatable.on( 'draw.dt', function () {
                  var PageInfo = $('#dc-data-table').DataTable().page.info();
                    datatable.DataTable().column(0, { page: 'current' }).nodes().each( function (cell, i) {
                        cell.innerHTML = i + 1 + PageInfo.start;
                    });
                  });
                  datatable.DataTable().draw();

                //Refresh selected rows list tags
                var regenTags = function() {
                  $('.selected-rows-title').html('Pasirinkta ('+vuedata.selectedRows.length+'/4):');
                  $('.selected-rows-tags').html("");
                  _.each(vuedata.selectedRows, function (d) {
                    var tag = '<div class="selected-tag">' + d['@vardas'] + ' ' + d['@pavardė'] + '<div class="selected-tag-remove" id="'+d['@asmens_id']+'">x</div></div>';
                    $('.selected-rows-tags').append(tag);
                  });
                }
                $(".chart-container-table").delegate("tbody tr", "click", function() {
                  if(vuedata.showMeetingsCharts) {
                    var data = datatable.DataTable().row( this ).data();
                    //Check if element is already selected and deselect
                    var currentElIndex = _.findIndex(vuedata.selectedRows, function(x) { return x['@asmens_id'] == data['@asmens_id']; });
                    if(currentElIndex  > -1) {
                      vuedata.selectedRows.splice(currentElIndex, 1);
                      $(this).removeClass("selected");
                    } else {
                      if(vuedata.selectedRows.length > 3) { return; }
                      vuedata.selectedRows.push(data);
                      $(this).addClass("selected");
                      $(this).attr("id", data['@asmens_id']);
                    }
                    //Refresh selected rows list tags
                    regenTags();
                    createMeetingsSelectedChart();
                    genSelectedRowsCloudData();
                    resetCloud();
                  }
                });
                //REMOVE SELECTED FROM TAG BUTTONS
                $(".selected-rows-tags").on("click", "div.selected-tag-remove", function(){
                  if(vuedata.showMeetingsCharts) {
                    var rowId = $(this).attr("id");
                    var currentElIndex = _.findIndex(vuedata.selectedRows, function(x) { return x['@asmens_id'] == rowId; });
                    vuedata.selectedRows.splice(currentElIndex, 1);
                    $("#dc-data-table").find("tr#" + rowId).removeClass("selected");
                    regenTags();
                    createMeetingsSelectedChart();
                    genSelectedRowsCloudData();
                    resetCloud();
                  }
                });
              }
              
              //OPEN DETAILS MODAL FROM BUTTONS
              function openDetailsModal(rowId) {
                var rowData = _.find(mps, function(x) { return x['@asmens_id'] == rowId; });
                vuedata.selectedElement = rowData;
                $('#detailsModal').modal();
                var dTable = $("#modalAgendasTable");
                dTable.DataTable ({
                    "language": {
                      "search": "Paieška:",
                      "info": "Nuo _START_ iki _END_ iš _TOTAL_ įrašų",
                      "lengthMenu": "Rodyti _MENU_ įrašus",
                      "paginate": {
                        "first":      "First",
                        "last":       "Last",
                        "next":       "Kitas",
                        "previous":   "Ankstesnis"
                      },
                      "infoEmpty": "No entries to show"
                    },
                    "data" : vuedata.selectedElement.agendas['SeimoNarioDarbotvarkėsĮvykis'],
                    "destroy": true,
                    "search": true,
                    "pageLength": 20,
                    "dom": '<<f><t>pi>',
                    //"dom": '<<t>pi>',
                    "order": [[ 0, "desc" ]],
                    "columns" : [
                        { "data" : function(d) { 
                            return d["@pradžia"].split(" ")[0];
                          } 
                        },
                        { "data" : "@pavadinimas" },
                        { "data" : "@vieta" }
                    ]
                });
                dTable.on( 'draw.dt', function () {
                  var body = $( dTable.DataTable().table().body() );
                  body.unhighlight();
                  body.highlight( dTable.DataTable().search() );  
                });
              }
              
              $(".chart-container-table").delegate(".detailsModalBtn", "click", function(e) {
                e.stopPropagation();
                var rowId = $(this).attr("id");
                openDetailsModal(rowId);       
              });

              //REFRESH TABLE
              function RefreshTable() {
                dc.events.trigger(function () {
                  var alldata = searchDimension.top(Infinity);
                  charts.mainTable.chart.fnClearTable();
                  charts.mainTable.chart.fnAddData(alldata);
                  charts.mainTable.chart.fnDraw();
                });
              }

              //SEARCH INPUT FUNCTIONALITY
              var typingTimer;
              var doneTypingInterval = 1000;
              var $input = $("#search-input");
              $input.on('keyup', function () {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
              });
              $input.on('keydown', function () {
                clearTimeout(typingTimer);
              });
              function doneTyping () {
                var s = $input.val().toLowerCase();
                searchDimension.filter(function(d) { 
                  return d.indexOf(s) !== -1;
                });
                throttle();
                var throttleTimer;
                function throttle() {
                  window.clearTimeout(throttleTimer);
                  throttleTimer = window.setTimeout(function() {
                      //dc.redrawAll();
                      RefreshTable();
                      customCounters.redraw();
                  }, 250);
                }
              }

              //Reset charts
              var resetGraphs = function() {
                for (var c in charts) {
                  if(charts[c].type !== 'table' && charts[c].type !== 'd3' && charts[c].chart.hasFilter()){
                    charts[c].chart.filterAll();
                  }
                }
                searchDimension.filter(null);
                $('#search-input').val('');
                if(vuedata.showMeetingsCharts) {
                  //Remove selected people, hide dynamic chart and show totals one
                  vuedata.selectedRows = [];
                  $('.dataTable tr').removeClass('selected');
                  $('.selected-rows-tags').html("");
                  $('.selected-rows-title').html('Selected ('+vuedata.selectedRows.length+'/4):');
                  createMeetingsSelectedChart();
                  resetCloud();
                  //dc.redrawAll();
                  resizeGraphs();
                }
                customCounters.redraw();
                
              }
              var resetCloud = function() {
                d3.selectAll("#" + charts.wordcloud.divId + " svg").remove();
                createWordcloudChart();
              }
              $('.reset-btn').click(function(){
                resetGraphs();
                RefreshTable();
              })
              
              //Render charts
              if(vuedata.showMeetingsCharts) {
                createMeetingsTotalsChart();
                
              }
              createMeetingsGroupsChart();
              createTable();
              if(vuedata.showMeetingsCharts) {
                createWordcloudChart();
              }
              if(vuedata.legislationSelected == 9) {
                createTermsComparisonChart();
              }

              $('.dataTables_wrapper').append($('.dataTables_length'));

              //Toggle last charts functionality and fix for responsiveness
              vuedata.showAllCharts = false;
              $('#charts-toggle-btn').click(function(){
                if(vuedata.showAllCharts){
                  resizeGraphs();
                }
              })

              //Hide loader
              vuedata.loader = false;
              $("#meetingsselected_chart_container").hide();

              //COUNTERS
              //Main counter
              var all = ndx.groupAll();
              var counter = dc.dataCount('.dc-data-count')
                .dimension(ndx)
                .group(all);
              counter.render();
              //Update datatables
              counter.on("renderlet.resetall", function(c) {
                RefreshTable();
              });

              //Custom counters
              var customCounters;
              function drawCustomCounters() {
                var dim = ndx.dimension (function(d) {
                  if (!d['@asmens_id']) {
                    return "";
                  } else {
                    return d['@asmens_id'];
                  }
                });
                var group = dim.group().reduce(
                  function(p,d) {  
                    p.nb +=1;
                    if (!d['@asmens_id']) {
                      return p;
                    }
                    p.agendas += +d.agendasCount;
                    p.meetings += d.meetingsCount;
                    return p;
                  },
                  function(p,d) {  
                    p.nb -=1;
                    if (!d['@asmens_id']) {
                      return p;
                    }
                    p.agendas -= +d.agendasCount;
                    p.meetings -= d.meetingsCount;
                    return p;
                  },
                  function(p,d) {  
                    return {nb: 0, agendas: 0, meetings: 0}; 
                  }
                );
                group.order(function(p){ return p.nb });
                var agendas = 0;
                var meetings = 0;
                customCounters = dc.dataCount(".count-box-main")
                .dimension(group)
                .group({value: function() {
                  agendas = 0;
                  meetings = 0;
                  return group.all().filter(function(kv) {
                    if (kv.value.nb >0) {
                      agendas += +kv.value.agendas;
                      meetings += +kv.value.meetings;
                    }
                    return kv.value.nb > 0; 
                  }).length;
                }})
                .renderlet(function (chart) {
                  $(".nbagendas").text(agendas);
                  $(".nbmeetings").text(meetings);
                  if(meetings  == totMeetings) {
                    $(".nbmeetings").text(meetings + extraMeetings);
                  }
                });
                customCounters.render();
              }
              drawCustomCounters();

              //Scroll to top
              $('.scrolltotop-btn').click(function(){
                window.scrollTo({top: 0, behavior: 'smooth'});
              })

              //Window resize function
              window.onresize = function(event) {
                resizeGraphs();
              };
            })
          })
        })
      })
    })
  })
})

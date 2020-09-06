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
      info: 'Pasirinkite jus dominančią frakciją ir pamatykite, kaip keitėsi jos narių susitikimų skaičius kadencijos metu. Parlamentarui pakeitus frakciją, jo/ jos nauji susitikimai buvo priskirti tai frakcijai, prie kurios jis/ ji prisijungė. 2018 m. rudenį  LLRA-KŠSF papildomai skelbė frakcijos darbotvarkę, kurioje pažymėjo 5 susitikimus su interesų grupėmis.'
    },
    wordcloud: {
      title: 'Susitikimų tema',
      info: 'Pasirinkite jus dominantį Seimo narį ir sužinokite, kokius susitikimus jis/ji turėjo dažniausiai (Seimo, komitetų, frakcijų posėdžiai neįtraukti į sąrašą).'
    },
    mainTable: {
      title: 'Table',
      info: 'Pamatykite, kaip parlamentarai viešina savo darbotvarkes, su kokiomis interesų grupėmis susitinka, rikiuokite ir palyginkite parlamentarų aktyvumą paspausdami ant lentelės skilčių pavadinimų.'
    }
  },
  openModalClicked: false,
  selectedElement: { "P": "", "Sub": ""},
  modalShowTable: '',
  selectedRows: [],
  selectedRowsAgendasData: [],
  globalAgendasString: "",
  globalAgendasData: [],
  meetingsCountsTables: [
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
  colors: {
    generic: ["#3b95d0", "#4081ae", "#406a95", "#395a75" ],
    default1: "#2b90b8",
    default2: "#449188",
    cloud: ["#264796", "#3a89c1", "#326f9b", "#5d8fb3", "#7f96a6", "#3e8bc2"]
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
      window.open('./data/tab_a/executive.csv');
    },
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = 'Share text here ' + thisPage;
        var shareURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
        window.open(shareURL, '_blank');
        return;
      }
      if(platform == 'facebook'){
        var toShareUrl = 'https://integritywatch.lt';
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
    if(((c == 'meetingsGroups') && vuedata.showAllCharts == false) || (c == 'meetingsSelected' && vuedata.selectedRows.length == 0) || (c == 'meetingsTotals' && vuedata.selectedRows.length > 0)){
      
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
  var blacklist = ['ir','o','bet','tačiau','dėl','nes','kad','jeigu','rytinis','vakarinis','su','prie','į','už','rugsėj','spal','lapkrit','gruod','saus','vasar','kov','baland','geguž','biržel','liep','rugpjū','k.','atšauktas','nuotoliniu','būdu','veiksmų','p.','m.','raj.','valanda','viešin'];
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
  console.log(cloudDataFiltered);
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

//Generate random parameter for dynamic dataset loading (to avoid caching)
var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
//Load data and generate charts
json('./data/tab_a/p2b_ad_seimo_nariai.json?' + randomPar, (err, mpsDataset) => {
  json('./data/tab_a/photos.json?' + randomPar, (err, photosDataset) => {
    json('./data/tab_a/p2b_ad_seimo_frakcijos.json?' + randomPar, (err, factionsDataset) => {
      json('./data/tab_a/p2b_ad_sn_darbotvarkes.json?' + randomPar, (err, agendasDataset) => {
        csv('./data/tab_a/meetings_totals.csv?' + randomPar, (err, lobbyMeetingsDataset) => {
          csv('./data/tab_a/party_meetings.csv?' + randomPar, (err, partyMeetingsDataset) => {
            //Loop through data to aply fixes and calculations
            var mps = mpsDataset.SeimoInformacija.SeimoKadencija.SeimoNarys;
            var factions = factionsDataset.SeimoInformacija.SeimoKadencija.SeimoFrakcija;
            var agendas = agendasDataset.SeimoInformacija.SeimoNarys;
            var totAgendas = 0;
            var totMeetings = 0;
            var extraMeetings = 5;
            var meetingsTotObject = {
              "2017 PAVASARIS": 0,
              "2017 RUDUO": 0,
              "2018 PAVASARIS": 0,
              "2018 RUDUO": 0,
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
              d.photoUrl = _.find(photosDataset, function(x) { return x['url'] == d['@biografijos_nuoroda']}).photoUrl;
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

            //console.log(vuedata.globalAgendasString);
            vuedata.globalAgendasData = stringToCloudData(vuedata.globalAgendasString);

            //Set totals for custom counters
            $('.count-box-agendas .total-count').html(totAgendas);
            $('.count-box-meetings .total-count').html(totMeetings + extraMeetings);

            //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
            var ndx = crossfilter(mps);
            var ndxMeetingsTotals = crossfilter(meetingsTotalsData);
            var ndxMeetingsGroups = crossfilter(partyMeetingsDataset);
            var searchDimension = ndx.dimension(function (d) {
                var entryString = d['@vardas'] + ' ' + d['@pavardė'];
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
              var colors = ["#5196c8", "#264796", "#ff5400", "#ffc000"];
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
                  .colors('#ff5400')
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
                {name: "Liberalų Sąjūdžio Frakcija (LSF)", color: "#F49813"},
                {name: "Lietuvos lenkų rinkimų akcijos-Krikščioniškų šeimų sąjungos frakcija (LLRA-KŠSF)", color: "#3164B7"},
                {name: "Lietuvos Socialdemokratų Darbo Frakcija (LSDDF) *", color: "DD3333"},
                {name: "Lietuvos Socialdemokratų Partijos Frackija (LSDPF)", color: "#E10514"},
                {name: "Lietuvos Valstiečių ir Žaliųjų Sąjungos Frakcija (LVŽSF)", color: "#0F7448"},
                {name: "Mišri Seimo narių grupė (MG)", color: "#7D7D7D"},
                {name: "Tėvynės sąjungos - Lietuvos Krikščionių demokratų frakcija (TS-LKDF)", color: "#00A59B"},
                {name: "Frakcija 'Lietuvos Gerovei' *", color: "#04A03C"},
                {name: "Tvarkos ir teisingumo frakcija (TTF) *", color: "#24418C"},
              ];
              var chart = charts.meetingsGroups.chart;
              var dimension = ndxMeetingsGroups.dimension(function (d) {
                return d.time; 
              });
              var groups = [];
              var composeArray = [];
              _.each(partiesData, function (p) {
                var thisGroup = dimension.group().reduceSum(function (d) { 
                  var val = parseInt(d[p.name]); 
                  if(isNaN(val)) {
                    return 0;
                  }
                  return val;
                });
                var thisCompose = dc.lineChart(chart)
                .group(thisGroup, p.name)
                .colors(p.color)
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
                .yAxisLabel('Meetings')
                .dimension(dimension)
                .group(groups[0], 'Meetings')
                ._rangeBandPadding(1)
                .compose(composeArray);
              chart.xAxis()
                //.tickValues(d3.range(data.length))
                .tickFormat(function(d) { return d; });
              chart.filter = function() {};
              chart.render();
            }
            
            //TABLE
            var createTable = function() {
              var count=0;
              charts.mainTable.chart = $("#dc-data-table").dataTable({
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
                    "data": function(d) {
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
                    "data": function(d) {
                      return d.agendasCount;
                    }
                  },
                  {
                    "searchable": false,
                    "orderable": true,
                    "targets": 5,
                    "defaultContent":"N/A",
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
                "order": [[ 1, "desc" ]],
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
              });
              //REMOVE SELECTED FROM TAG BUTTONS
              $(".selected-rows-tags").on("click", "div.selected-tag-remove", function(){
                var rowId = $(this).attr("id");
                var currentElIndex = _.findIndex(vuedata.selectedRows, function(x) { return x['@asmens_id'] == rowId; });
                vuedata.selectedRows.splice(currentElIndex, 1);
                $("#dc-data-table").find("tr#" + rowId).removeClass("selected");
                regenTags();
                createMeetingsSelectedChart();
                genSelectedRowsCloudData();
                resetCloud();
              });
            }
            
            //OPEN DETAILS MODAL FROM BUTTONS
            function openDetailsModal(rowId) {
              var rowData =  _.find(mps, function(x) { return x['@asmens_id'] == rowId; });
              vuedata.selectedElement = rowData;
              $('#detailsModal').modal();
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
              //Remove selected people, hide dynamic chart and show totals one
              vuedata.selectedRows = [];
              $('.dataTable tr').removeClass('selected');
              $('.selected-rows-tags').html("");
              $('.selected-rows-title').html('Selected ('+vuedata.selectedRows.length+'/4):');
              createMeetingsSelectedChart();
              resetCloud();
              //dc.redrawAll();
              resizeGraphs();
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
            createMeetingsTotalsChart();
            createMeetingsGroupsChart();
            createTable();
            createWordcloudChart();

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

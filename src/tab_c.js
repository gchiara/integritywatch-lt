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
  page: 'tabC',
  loader: true,
  readMore: false,
  showInfo: true,
  showShare: true,
  showAllCharts: true,
  chartMargin: 40,
  travelFilter: 'all',
  modalSearchString: '',
  charts: {
    committees: {
      title: 'Seimo komitetai',
      info: 'Pasirinkite komitetą, norėdami sužinoti, kokius teisės aktus svarstė ir kiek kartų. Pamatykite duomenų kaitą grafikuose ir lentelėje žemiau.'
    },
    topLaws: {
      title: 'Daugiausiai svarstyti teisės aktai',
      info: 'Pasirinkite teisės aktą, norėdami sužinoti, kokie komitetai svarstė su juo susijusius klausimus ir kiek kartų.'
    },
    mainTable: {
      title: 'Paspaudę ant teisės akto projekto, sužinokite, kokie su tuo susiję klausimai buvo svarstyti ir kas dalyvavo jų svarstyme.',
      info: 'Sužinokite, kokius teisės aktus ir kaip dažnai svarstė Seimo komitetai, taip pat – kokie viešojo sektoriaus ir interesų grupių atstovai dalyvavo jų svarstymuose. Paieškoje įveskite asmens pavardę ir sužinokite, prie kurių įstatymų ar nutarimų svarstymo jis/ji prisidėjo.'
    }
  },
  openModalClicked: false,
  selectedElement: { "P": "", "Sub": ""},
  colors: {
    generic: ["#3b95d0", "#4081ae", "#406a95", "#395a75" ],
    default1: "#5aa9e1",
    default2: "#64ad2f",
    generic2: ["#264796", "#1657a1", "#2570B2", "#3E8BC2", "#4EaBd2","#80b827" ,"#369f3e", "#15811d", "#05650D", "#ccc"]
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
      window.open('./data/tab_c/laws.csv');
    },
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = '' + thisPage;
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
  committees: {
    chart: new dc.RowChart("#committees_chart"),
    type: 'row',
    divId: 'committees_chart'
  },
  topLaws: {
    chart: new dc.RowChart("#toplaws_chart"),
    type: 'row',
    divId: 'toplaws_chart'
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
};

//Add commas to thousands
function addcommas(x){
  if(parseInt(x)){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return x;
}

//Shorten string to 10 words and add dots
function shortenString(str) {
  var maxWords = 10;
  var strArray = str.split(" ");
  if(strArray.length <= 10) {
    return str;
  }
  return strArray.slice(0, maxWords).join(" ") + " ...";
}

//Turn date into int
function dateToInt(x) {
  var dateInt = x;
  if(x.indexOf("/") > -1) {
    var splitDate = x.split("/");
    dateInt = parseInt(splitDate[2] + '' + splitDate[1] + '' + splitDate[0]);
  } else if(x.indexOf("-") > -1) {
    dateInt = parseInt(x.replaceAll("-",""));
  }
  return dateInt;
}

//Replace last word "projecto" with "projektas"
function replaceFinalWord(str) {
  return str.replace(/\bprojekto\s*$/, "projektas");
}

//Datatable sorting additional methods
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

//Generate random parameter for dynamic dataset loading (to avoid caching)
var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}

//Load data and generate charts
csv('./data/tab_c/laws.csv?' + randomPar, (err, entries) => {
csv('./data/tab_c/law_names_jstatymai.csv?' + randomPar, (err, lawNames1) => {
csv('./data/tab_c/law_names_seimo_nutarimai.csv?' + randomPar, (err, lawNames2) => {
  //Loop through badges to link and tidy data
  var laws = [];
  var totParticipantsPublic = 0;
  var totParticipantsInterest = 0;
  var totParticipantsPublicArr = [];
  var totParticipantsInterestArr = [];
  //Clean law names in all datasets
  _.each(lawNames1, function (law) {
    law.law_id = law.law_id.trim().replace("–","-");
  });
  _.each(lawNames2, function (law) {
    law.law_id = law.law_id.trim().replace("–","-");
  });
  _.each(entries, function (d) {
    //Find law short name
    d.law_name_short = d.law_name;
    d.law_id = d.law_id.trim().replace("–","-");
    var lawShortName = _.find(lawNames1, function(x) { return x.law_id == d.law_id });
    if(!lawShortName) {
      lawShortName = _.find(lawNames2, function(x) { return x.law_id == d.law_id });
    } 
    if(lawShortName) {
      d.law_name_short = lawShortName.name;
    }
    d.law_name_short = replaceFinalWord(d.law_name_short);
    //Date num
    d.datenum = dateToInt(d.regdate);
    //Create comittees based data
    var listedLaw = _.find(laws, function(x) { return x.law_id == d.law_id });
    if(listedLaw) {
      listedLaw.entries_num ++;
      if(listedLaw.committees.indexOf(d.committee) == -1) {
        listedLaw.committees.push(d.committee);
      }
      var thisEntry = d;
      listedLaw.entries.push(thisEntry);
      //Check dates
      if(listedLaw.date_newest == "" || dateToInt(listedLaw.date_newest) < d.datenum) {
        listedLaw.date_newest = d.regdate;
      }
      if(listedLaw.date_oldest == "" || dateToInt(listedLaw.date_oldest) > d.datenum) {
        listedLaw.date_oldest = d.regdate;
      }
      //Add participants
      _.each(d.public_institutions.split(","), function (a) {
        var aClean = a.trim().toLowerCase();
        if(listedLaw.participants_public_officials.indexOf(aClean) == -1 && aClean !== "") {
          listedLaw.participants_public_officials.push(aClean);
          totParticipantsPublic ++;
          if(totParticipantsPublicArr.indexOf(aClean) == -1 && aClean !== "") {
            totParticipantsPublicArr.push(aClean);
          }
        }
      });
      _.each(d.interest_groups.split(","), function (a) {
        var aClean = a.trim().toLowerCase();
        if(listedLaw.participants_interest_groups.indexOf(aClean) == -1 && aClean !== "") {
          listedLaw.participants_interest_groups.push(aClean);
          totParticipantsInterest ++;
          if(totParticipantsInterestArr.indexOf(aClean) == -1 && aClean !== "") {
            totParticipantsInterestArr.push(aClean);
          }
        }
      });
    } else {
      var newLaw = {
        "law_id": d.law_id,
        "law_name": d.law_name,
        "law_name_short": d.law_name_short,
        "entries": [],
        "committees": [d.committee],
        "entries_num": 1,
        "date_newest": d.regdate,
        "date_oldest": d.regdate,
        "participants_public_officials": [],
        "participants_interest_groups": []
      }
      _.each(d.public_institutions.split(","), function (a) {
        var aClean = a.trim().toLowerCase();
        if(newLaw.participants_public_officials.indexOf(aClean) == -1 && aClean !== "") {
          newLaw.participants_public_officials.push(aClean);
          totParticipantsPublic ++;
          if(totParticipantsPublicArr.indexOf(aClean) == -1 && aClean !== "") {
            totParticipantsPublicArr.push(aClean);
          }
        }
      });
      _.each(d.interest_groups.split(","), function (a) {
        var aClean = a.trim().toLowerCase();
        if(newLaw.participants_interest_groups.indexOf(aClean) == -1 && aClean !== "") {
          newLaw.participants_interest_groups.push(aClean);
          totParticipantsInterest ++;
          if(totParticipantsInterestArr.indexOf(aClean) == -1 && aClean !== "") {
            totParticipantsInterestArr.push(aClean);
          }
        }
      });
      var thisEntry = d;
      newLaw.entries.push(thisEntry);
      laws.push(newLaw);
    }
  });
  console.log("Participants public: " + totParticipantsPublic);
  console.log("Participants interest: " + totParticipantsInterest);
  console.log("Participants public unique: " + totParticipantsPublicArr.length);
  console.log("Participants interest unique: " + totParticipantsInterestArr.length);

  //Order badges array in people data
  _.each(laws, function (d) {
    d.entries.sort(function(a, b) { 
      return b.datenum - a.datenum;
    });
  });

  //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
  var ndx = crossfilter(entries);
  var ndxLaws = crossfilter(laws);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = d.committee + ' ' + d.law_id + ' ' + d.law_name + ' ' + d.public_institutions + ' ' + d.interest_groups; 
      return entryString.toLowerCase();
  });
  var idDimension = ndx.dimension(function (d) {
    var entryString = d.law_id;
    return entryString.toLowerCase();
  });
  var idDimensionLaws = ndxLaws.dimension(function (d) {
    if(!d.law_id) {
      console.log(d);
    }
    var entryString = d.law_id;
    return entryString.toLowerCase();
  });

  //Chart 1
  var createCommitteesChart = function() {
    var chart = charts.committees.chart;
    var dimension = ndx.dimension(function (d) {
        return d.committee_id;
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(100).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.committees.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(480)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default2;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
    chart.on('filtered', function(c) { 
      UpdateTable();
      dc.redrawAll() 
    });
  }

  //Chart 2
  var createTopLawsChart = function() {
    var chart = charts.topLaws.chart;
    var dimension = ndx.dimension(function (d) {
        return d.law_name_short;
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(20).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.topLaws.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(480)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default2;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
    chart.on('filtered', function(c) { 
      UpdateTable();
      dc.redrawAll() 
    });
  }
  
  //TABLE
  var createTable = function() {
    var count=0;
    charts.mainTable.chart = $("#dc-data-table").dataTable({
      "language": {
        "info": "Nuo _START_ iki _END_ iš _TOTAL_ įrašų",
        "lengthMenu": "Rodyti _MENU_ įrašus",
        "paginate": {
          "first":      "First",
          "last":       "Last",
          "next":       "Kitas",
          "previous":   "Ankstesnis"
        },
        "infoEmpty": "Įrašų nėra",
        "emptyTable": "Nerasta",
        "infoFiltered": ""
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
          "className": "",
          "type": "name",
          "data": function(d) {
            //return replaceFinalWord(shortenString(d.law_name_short));
            return shortenString(d.law_name_short);
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.date_oldest;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.date_newest;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.entries_num;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.committees.length;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 6,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.participants_public_officials.length;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 7,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.participants_interest_groups.length;
          }
        },
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
      "aaData": idDimensionLaws.top(Infinity),
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

      $('#dc-data-table tbody').on('click', 'tr', function () {
        var data = datatable.DataTable().row( this ).data();
        vuedata.selectedElement = data;
        $('#detailsModal').modal();
        //$('[data-toggle="popover"]').popover();
        var dTable = $("#modalEntriesTable");
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
              "infoEmpty": "Įrašų nėra",
              "emptyTable": "Nerasta",
              "zeroRecords": "Nerasta",
              "infoFiltered": ""
            },
            "data" : vuedata.selectedElement.entries,
            "destroy": true,
            "search": true,
            "pageLength": 20,
            "dom": '<<f><t>pi>',
            "order": [[ 0, "desc" ]],
            "columns" : [
              { "data" : function(a) { 
                  return replaceFinalWord(a.law_name);
                }
              },
              { "data" : function(a) { 
                  return a.regdate;
                }
              },
              { "data" : function(a) { 
                  return a.committee;
                } 
              },
              { "data" : function(a) { 
                  return a.public_institutions;
                } 
              },
              { "data" : function(a) { 
                  return a.interest_groups;
                }
              },
            ]
        });
        dTable.on( 'draw.dt', function () {
          var body = $( dTable.DataTable().table().body() );
          body.unhighlight();
          body.highlight( dTable.DataTable().search() );  
        });
      });
    }
  //REFRESH TABLE
  function RefreshTable() {
    dc.events.trigger(function () {
      var alldata = idDimensionLaws.top(Infinity);
      charts.mainTable.chart.fnClearTable();
      charts.mainTable.chart.fnAddData(alldata);
      charts.mainTable.chart.fnDraw();
    });
  }
  function UpdateTable() {
    var filteredIds = [];
    _.each(idDimension.top(Infinity), function (a) {
      var thisId = (a.law_id).toLowerCase();
      if(filteredIds.indexOf(thisId) == -1) {
        filteredIds.push(thisId);
      }
    });
    idDimensionLaws.filter(function(d) { 
      return filteredIds.indexOf(d) > -1;
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
          UpdateTable();
          dc.redrawAll();
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
    idDimension.filter(null);
    idDimensionLaws.filter(null);
    $('#search-input').val('');
    RefreshTable();
    dc.redrawAll();
  }
  $('.reset-btn').click(function(){
    resetGraphs();
  });
  
  //Render charts
  createCommitteesChart();
  createTopLawsChart();
  createTable();

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
      if (!d.law_id) {
        return "";
      } else {
        return d.law_id;
      }
    });
    var group = dim.group().reduce(
      function(p,d) {  
        p.nb +=1;
        if (!d.law_id) {
          return p;
        }
        p.laws += 1;
        return p;
      },
      function(p,d) {  
        p.nb -=1;
        if (!d.law_id) {
          return p;
        }
        p.laws -= 1;
        return p;
      },
      function(p,d) {  
        return {nb: 0, laws: 0}; 
      }
    );
    group.order(function(p){ return p.nb });
    var laws = 0;
    customCounters = dc.dataCount(".count-box-laws")
    .dimension(group)
    .group({value: function() {
      laws = 0;
      return group.all().filter(function(kv) {
        if (kv.value.nb >0) {
          laws += +kv.value.laws;
        }
        return kv.value.nb > 0; 
      }).length;
    }})
    .renderlet(function (chart) {
      //$(".nbpeople").text(people);
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

});
});
});
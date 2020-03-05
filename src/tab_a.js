import jquery from 'jquery';
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
    mainTable: {
      chart: null,
      type: 'table',
      title: 'Table',
      info: ''
    }
  },
  selectedElement: { "P": "", "Sub": ""},
  modalShowTable: '',
  colors: {
    generic: ["#3b95d0", "#4081ae", "#406a95", "#395a75" ],
    default1: "#2b90b8",
    default2: "#449188"
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

//Generate random parameter for dynamic dataset loading (to avoid caching)
var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}
//Load data and generate charts
json('./data/tab_a/p2b_ad_seimo_nariai.json?' + randomPar, (err, mpsDataset) => {
  json('./data/tab_a/p2b_ad_seimo_frakcijos.json?' + randomPar, (err, factionsDataset) => {
    json('./data/tab_a/p2b_ad_sn_darbotvarkes.json?' + randomPar, (err, agendasDataset) => {
      csv('./data/tab_a/lobby_meetings.csv?' + randomPar, (err, lobbyMeetingsDataset) => {
        //Loop through data to aply fixes and calculations
        var mps = mpsDataset.SeimoInformacija.SeimoKadencija.SeimoNarys;
        var factions = factionsDataset.SeimoInformacija.SeimoKadencija.SeimoFrakcija;
        var agendas = agendasDataset.SeimoInformacija.SeimoNarys;
        var totAgendas = 0;
        var totMeetings = 0;
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
          d.lobbyMeetings = _.find(lobbyMeetingsDataset, function(x) { return x['Pavardė'] == d['@pavardė'] && x['Vardas'] == d['@vardas']});
          //Agendas count
          d.agendasCount = 0;
          if(d.agendas) {
            d.agendasCount = d.agendas["SeimoNarioDarbotvarkėsĮvykis"].length;
            totAgendas += parseInt(d.agendasCount);
          }
          //Meetings count
          d.meetingsCount = 0;
          if(d.lobbyMeetings && !isNaN(d.lobbyMeetings['2019_PAVASARIS'])) {
            d.meetingsCount = d.lobbyMeetings['2019_PAVASARIS'];
            totMeetings += parseInt(d.meetingsCount);
          }
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

        //Set totals for custom counters
        $('.count-box-agendas .total-count').html(totAgendas);
        $('.count-box-meetings .total-count').html(totMeetings);

        //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
        var ndx = crossfilter(mps);
        var searchDimension = ndx.dimension(function (d) {
            var entryString = d['@vardas'] + ' ' + d['@pavardė'];
            return entryString.toLowerCase();
        });
        
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
                  return d.legislature;
                }
              },
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
                      groupsRoleString += "<br />";
                    }
                    groupsRoleString += d.chairmanString;
                  }
                  return groupsRoleString;
                }
              },
              {
                "searchable": false,
                "orderable": true,
                "targets": 5,
                "defaultContent":"N/A",
                "data": function(d) {
                  return d.agendasCount;
                }
              },
              {
                "searchable": false,
                "orderable": true,
                "targets": 6,
                "defaultContent":"N/A",
                "data": function(d) {
                  if(d.lobbyMeetings) {
                    return d.lobbyMeetings['2019_PAVASARIS'];
                  } else {
                    return '-';
                  }
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

          $('#dc-data-table tbody').on('click', 'tr', function () {
            var data = datatable.DataTable().row( this ).data();
            vuedata.selectedElement = data;
            $('#detailsModal').modal();
          });
        }
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
                dc.redrawAll();
            }, 250);
          }
        }

        //Reset charts
        var resetGraphs = function() {
          for (var c in charts) {
            if(charts[c].type !== 'table' && charts[c].chart.hasFilter()){
              charts[c].chart.filterAll();
            }
          }
          searchDimension.filter(null);
          $('#search-input').val('');
          dc.redrawAll();
        }
        $('.reset-btn').click(function(){
          resetGraphs();
        })
        
        //Render charts
        createTable();

        $('.dataTables_wrapper').append($('.dataTables_length'));

        //Hide loader
        vuedata.loader = false;

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
              p.meetings += +d.meetingsCount;
              return p;
            },
            function(p,d) {  
              p.nb -=1;
              if (!d['@asmens_id']) {
                return p;
              }
              p.agendas -= +d.agendasCount;
              p.meetings -= +d.meetingsCount;
              return p;
            },
            function(p,d) {  
              return {nb: 0, agendas: 0, meetings: 0}; 
            }
          );
          group.order(function(p){ return p.nb });
          var agendas = 0;
          var meetings = 0;
          var counter = dc.dataCount(".count-box-main")
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
          });
          counter.render();
        }
        drawCustomCounters();


        //Window resize function
        window.onresize = function(event) {
          resizeGraphs();
        };
      })
    })
  })
})

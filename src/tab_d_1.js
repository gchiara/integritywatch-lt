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
  page: 'tabD',
  loader: true,
  readMore: false,
  showInfo: true,
  showShare: true,
  showAllCharts: true,
  chartMargin: 40,
  travelFilter: 'all',
  modalSearchString: '',
  charts: {
    legalEntity: {
      title: 'Fizinių / juridinių lobistų skaičius',
      info: 'Pasirinkite jus dominančių lobistų grupę ir pamatykite, kaip keičiasi jų deklaracijų skaičius.'
    },
    topLobbyists: {
      title: 'Daugausiausiai deklaracijų paskelbę lobistai',
      info: ''
    },
    mainTable: {
      title: 'Lobistai',
      info: 'Rikiuokite ir palyginkite duomenis tarpusavyje, paspausdami lentelės skilties pavadinimą. Duomenų šaltinis: Vyriausioji tarnybinės etikos komisija. Į apžvalgą įtraukti visi registruoti lobistai ir jų deklaracijos nuo 2001 m. sausio 24 d. iki 2023 m. rugsėjo 6 d.. TILS atskirai nevertino, ar pateiktos lobistų skaidrumo deklaracijos atitinka LR lobistinės veiklos įstatymo nuostatas.'
    },
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
      window.open('./data/tab_d/list_of_lobbyists.json');
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
  legalEntity: {
    chart: new dc.PieChart("#legalentity_chart"),
    type: 'row',
    divId: 'legalentity_chart'
  },
  topLobbyists: {
    chart: new dc.RowChart("#toplobbyists_chart"),
    type: 'row',
    divId: 'toplobbyists_chart'
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
  var width = document.getElementById("cloud_chart").offsetWidth - vuedata.chartMargin*2;
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

//Generate random parameter for dynamic dataset loading (to avoid caching)
var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}

//Load data and generate charts
json('./data/tab_d/list_of_lobbyists.json?' + randomPar, (err, entries) => {
json('./data/tab_d/transparency_declarations.json?' + randomPar, (err, entriesDeclarations) => {
  _.each(entries, function (d) {
    d.tranparencyDeclarations = _.filter(entriesDeclarations, function(x) { 
      return x.lobbyist_number.trim() == d.certificate_num.trim();
    });
    d.activitiesNum = 0;
    if(d.tranparencyDeclarations) {
      d.activitiesNum = d.tranparencyDeclarations.length;
    }
  });
  //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
  var ndx = crossfilter(entries);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = d.certificate_num + ' ' + d.lobbyists  + ' ' + d.legal_entity_code + ' ' + d.legal_regulation_areas + ' ' + d.legal_entity_representatives.join(' '); 
      return entryString.toLowerCase();
  });

  //CHART 1
  var createLegalEntityChart = function() {
    var chart = charts.legalEntity.chart;
    var dimension = ndx.dimension(function (d) {
      if(d.legal_entity_code != '' && d.legal_entity_code != '-') {
        return 'Juridinių lobistų skaičius';
      }
      return 'Fizinių lobistų skaičius';
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.legalEntity.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .cap(7)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        return d.key + ': ' + d.value;
      })
      .dimension(dimension)
      //.ordinalColors(vuedata.colors.range)
      .group(group)
      .colorCalculator(function(d, i) {
        return vuedata.colors.generic[i];
      });
    chart.render();
  }

  //CHART 2
  var topLobbyistsChart = function() {
    var chart = charts.topLobbyists.chart;
    var dimension = ndx.dimension(function (d) {
        return d.lobbyists;
    });
    var group = dimension.group().reduceSum(function (d) {
        return d.activitiesNum;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(10).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.topLobbyists.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(440)
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
            return d.lobbyists;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            if(d.legal_entity_code == '-' || d.legal_entity_code == '' || d.legal_entity_code == ' ') {
              return '-';
            }
            return d.legal_entity_representatives.length;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.legal_regulation_areas_num;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.activitiesNum;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "data": function(d) {
            if(d.activitiesNum > 0) {
              //d.certificate_num
              //return '<a href="./lobbyists-transparency-declarations.php?lobbyist='+d.lobbyists+'" class="detailsModalBtn">Deklaracijos</button>';
              return '<a href="./lobbyists-transparency-declarations.php?lobbyist='+d.certificate_num+'" class="detailsModalBtn">Deklaracijos</button>';
            }
            return '';
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
      /*
      $('#dc-data-table tbody').on('click', 'tr', function () {
        var data = datatable.DataTable().row( this ).data();
        vuedata.selectedElement = data;
        $('#detailsModal').modal();
      });
      */
      $('#dc-data-table tbody').on('click', 'tr', function () {
        var data = datatable.DataTable().row( this ).data();
        vuedata.selectedElement = data;
        var tr = $(this);
        var row = datatable.DataTable().row( tr );
        if ( row.child.isShown() ) {
            //Close row details if already open
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            //Show row details
            var rowInfoContent = "<div class='row-details-container'>";
            if(vuedata.selectedElement.date_list_inclusion) {
              rowInfoContent += '<div class="row-details-entry"><strong>Įrašymo į lobistų sąrašą data:</strong> ' + vuedata.selectedElement.date_list_inclusion + '</div>';
            }
            if(vuedata.selectedElement.legal_entity_representatives && vuedata.selectedElement.legal_entity_representatives.length > 0) {
              rowInfoContent += '<div class="row-details-entry"><strong>Juridinio asmens atstovai:</strong> ' + vuedata.selectedElement.legal_entity_representatives.join(', ') + '</div>';
            } else {
              rowInfoContent += '<div class="row-details-entry"><strong>Juridinio asmens atstovai:</strong> -</div>';
            }
            if(vuedata.selectedElement.legal_regulation_areas) {
              rowInfoContent += '<div class="row-details-entry"><strong>Veiklos sritys:</strong> ' + vuedata.selectedElement.legal_regulation_areas + '</div>';
            }
            rowInfoContent += "</div>";
            row.child(rowInfoContent).show();
            tr.addClass('shown');
        }
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
  createLegalEntityChart();
  topLobbyistsChart();
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
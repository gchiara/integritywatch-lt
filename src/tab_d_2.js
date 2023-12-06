import jquery, { each } from 'jquery';
window.jQuery = jquery;
window.$ = jquery;
require( 'datatables.net' )( window, $ )
require( 'datatables.net-dt' )( window, $ )

import underscore, { after } from 'underscore';
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
    topBeneficiaries: {
      title: 'Dažniausi lobistinės veiklos naudos gavėjai',
      info: 'Lobistinės veiklos naudos gavėjas – fizinis asmuo, juridinis asmuo arba kita organizacija ar jų padalinys, kurių interesais siekiama vykdyti lobistinę veiklą ir (arba) kurie siekia gauti galutinę naudą iš lobistinės veiklos.'
    },
    topLegislations: {
      title: 'Teisės aktai, dėl kurių lobistinė įtaka daryta daugiausiai',
      info: 'Pasirinkite kategoriją (-as), norėdami sužinoti, kiek kartų lobistinė įtaka buvo daryta dėl pasirinktų teisės aktų. Pamatykite duomenų kaitą kituose grafikuose ir lentelėse.'
    },
    influencedType: {
      title: 'Lobistinę įtaką patyrusių asmenų ir asmenų grupių skaičius',
      info: ''
    },
    topPositions: {
      title: 'Daugiausiai lobistinės įtakos patyrusių asmenų pareigos',
      info: ''
    },
    mainTable: {
      title: 'Lobistų skaidrumo deklaracijos',
      info: 'Paspaudę ant pasirinktos eilutės, pamatykite, sužinokite apie lobistinę įtaką patyrusius asmenis ir/ar asmenų grupes. Rikiuokite ir palyginkite duomenis tarpusavyje, paspausdami lentelės skilties pavadinimą. Duomenų šaltinis: Vyriausioji tarnybinės etikos komisija. Į apžvalgą įtraukti visi registruoti lobistai ir jų deklaracijos nuo 2021 m. sausio 1 d. iki 2023 m. rugpjūčio 23 d.. TILS atskirai nevertino, ar pateiktos lobistų skaidrumo deklaracijos atitinka LR lobistinės veiklos įstatymo nuostatas.'
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
  topBeneficiaries: {
    chart: new dc.RowChart("#topbeneficiaries_chart"),
    type: 'row',
    divId: 'topbeneficiaries_chart'
  },
  topLegislations: {
    chart: new dc.RowChart("#toplegislations_chart"),
    type: 'row',
    divId: 'toplegislations_chart'
  },
  influencedType: {
    chart: new dc.RowChart("#influencedtype_chart"),
    type: 'row',
    divId: 'influencedtype_chart'
  },
  topPositions: {
    chart: new dc.RowChart("#toppositions_chart"),
    type: 'row',
    divId: 'toppositions_chart'
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
var testCount = 0;
//Load data and generate charts
json('./data/tab_d/transparency_declarations.json?' + randomPar, (err, entries) => {
  _.each(entries, function (d) {
    d.influencedPeopleNum = 0;
    d.influencedGroupsNum = 0;
    d.influencedPositions = [];
    d.influencedBars = [];
    d.influencedPeopleAndGroups = [];
    //Legislation names array made by splitting cleaned names by semicolon
    d.legislation_name_array = [];
    if(d.legislation_name_cleaned && d.legislation_name_cleaned != '') {
      d.legislation_name_array = d.legislation_name_cleaned.replaceAll('; ',';').split(';');
      if(d.legislation_name_cleaned.indexOf('LR Sveikatos draudimo įstatymas') > -1) {
        d.legislation_name_cleaned_testMark = '1';
        console.log(d.legislation_name_cleaned);
        console.log(d.legislation_name_array);
        testCount ++;
        console.log(testCount);
      }
    }
    d.influencedPeopleString = '';
    //Calculate influenced people and groups numbers, also add to array for influenced people and groups bars
    _.each(d.influenced_people, function (p) {
      d.influencedPeopleAndGroups.push(p);
      d.influencedPeopleString += ' ' + p.name + ' ' + p.institution;
      /*
      if(p.name && p.name != '-' && p.name != '') {
        d.influencedPeopleNum ++;
        d.influencedBars.push('Influenced people');
      } else if(p.occupation == '' || p.occupation == '-') {
        d.influencedGroupsNum ++;
        d.influencedBars.push('Influenced groups');
      }
      */
      d.influencedPeopleNum ++;
      d.influencedBars.push('Asmenys');
      if(p.occupation != '' & p.occupation != '-') {
        d.influencedPositions.push(p.occupation);
      }
    });
    _.each(d.influenced_groups, function (p) {
      d.influencedPeopleAndGroups.push({'group': p});
      d.influencedGroupsNum ++;
      d.influencedBars.push('Asmenų grupės');
    });
    

  });
  console.log(entries);
  //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
  var ndx = crossfilter(entries);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = d.legislation_description + ' ' + d.area_name + ' ' + d.legislation_name + ' ' + d.lobbyist_name + ' ' + d.number + ' ' + d.lobbyist_number + ' ' + d.influencedPeopleString + ' ' + d.beneficiaries.join(' ') + ' ' + d.influenced_groups.join(' ') + ' ' + d.clients.join(' '); 
      return entryString.toLowerCase();
  });

  //CHART 1
  var createTopBeneficiariesChart = function() {
    var chart = charts.topBeneficiaries.chart;
    var dimension = ndx.dimension(function (d) {
        return d.beneficiaries;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
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
    var width = recalcWidth(charts.topBeneficiaries.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(420)
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

  //CHART 2
  var createTopLegislationsChart = function() {
    var chart = charts.topLegislations.chart;
    var dimension = ndx.dimension(function (d) {
      return d.legislation_name_array;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
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
    var width = recalcWidth(charts.topLegislations.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(420)
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

  //CHART 3
  var createInfluencedTypeChart = function() {
    var chart = charts.influencedType.chart;
    var dimension = ndx.dimension(function (d) {
      return d.influencedBars;
    }, true);
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
    var width = recalcWidth(charts.influencedType.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(395)
      .margins({top: 0, left: 0, right: 20, bottom: 20})
      .gap(45)
      .group(filteredGroup)
      .dimension(dimension)
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .colorCalculator(function(d, i) {
        return vuedata.colors.default2;
      })
      .elasticX(true)
      .xAxis().ticks(2);
    chart.render();
  }

  //CHART 4
  var createTopPositionsChart = function() {
    var chart = charts.topPositions.chart;
    var dimension = ndx.dimension(function (d) {
        return d.influencedPositions;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
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
    var width = recalcWidth(charts.topPositions.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(420)
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
            return d.lobbyist_name;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            if(d.clients) {
            return d.clients.join(', ');
            } else {
              return '-';
            }
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "data": function(d) {
            if(d.beneficiaries) {
              return d.beneficiaries.join(', ');
            } else {
              return '-';
            }
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "data": function(d) {
            if(d.legislation_name_cleaned && d.legislation_name_cleaned != '') {
              return d.legislation_name_cleaned;
            }
            return d.legislation_name;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.influencedPeopleNum;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 6,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.influencedGroupsNum;
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
            "data" : vuedata.selectedElement.influencedPeopleAndGroups,
            "destroy": true,
            "search": true,
            "pageLength": 20,
            "dom": '<<><t>pi>',
            "order": [[ 0, "desc" ]],
            "columns" : [
              { "data" : function(a) { 
                  if(a.name) {
                    return a.name;
                  }
                  return '-';
                }
              },
              { "data" : function(a) { 
                  if(a.occupation) {
                    return a.occupation;
                  }
                  return '-';
                }
              },
              { "data" : function(a) { 
                  if(a.institution) {
                    return a.institution;
                  }
                  return '-';
                }
              },
              { "data" : function(a) { 
                  if(a.group) {
                    return a.group;
                  }
                  return '-';
                } 
              }
            ]
        });
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
  createTopBeneficiariesChart();
  createTopLegislationsChart();
  createInfluencedTypeChart();
  createTopPositionsChart();
  createTable();

  $('.dataTables_wrapper').append($('.dataTables_length'));

  //Hide loader
  vuedata.loader = false;

  //If lobbyist name in parameter, search
  if(getParameterByName('lobbyist')) {
    var lobbyistsParamName = getParameterByName('lobbyist');
    var lobbyistsSearch = lobbyistsParamName.toLowerCase();
    searchDimension.filter(function(d) { 
      return d.indexOf(lobbyistsSearch) !== -1;
    });
    $('#search-input').val(lobbyistsParamName);
    RefreshTable();
    dc.redrawAll();
  }

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
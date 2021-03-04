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
  page: 'tabB',
  loader: true,
  readMore: false,
  showInfo: true,
  showShare: true,
  showAllCharts: true,
  chartMargin: 40,
  travelFilter: 'all',
  charts: {
    orgType: {
      title: ' Išduotų leidimų skaičius pagal įstaigų/organizacijų kategoriją',
      info: ''
    },
    years: {
      title: 'Išduotų leidimų skaičius per metus',
      info: ''
    },
    topOrg: {
      title: 'Top 10 organizacijų ir įstaigų, gavusių daugiausiai leidimų',
      info: ''
    },
    mainTable: {
      title: '',
      info: ''
    }
  },
  openModalClicked: false,
  selectedElement: { "P": "", "Sub": ""},
  colors: {
    generic: ["#3b95d0", "#4081ae", "#406a95", "#395a75" ],
    default1: "#5aa9e1",
    default2: "#449188",
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
      window.open('/data/tab_b/badges.csv');
    },
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = 'Manoseimas.lt ' + thisPage;
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
  orgType: {
    chart: new dc.RowChart("#orgtype_chart"),
    type: 'row',
    divId: 'orgtype_chart'
  },
  years: {
    chart: new dc.LineChart("#years_chart"),
    type: 'line',
    divId: 'years_chart'
  },
  topOrg: {
    chart: new dc.RowChart("#toporg_chart"),
    type: 'row',
    divId: 'toporg_chart'
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
csv('./data/tab_b/badges.csv?' + randomPar, (err, badges) => {
csv('./data/tab_b/meetings.csv?' + randomPar, (err, meetings) => {
  //Loop through mps to link and tidy data
  var people = [];
  _.each(badges, function (d) {
    var listedPerson = _.find(people, function(x) { return x.ID == d.ID });
    if(listedPerson) {
      listedPerson.badges_num ++;
      var thisBadge = {
        "organisation_institution": d.organisation_institution,
        "org_inst_category": d.org_inst_category,
        "issue_year": d.issue_year,
        "issue_date": d.issue_date,
        "valid_until": d.valid_until
      }
      listedPerson.badges.push(thisBadge);
    } else {
      var newPerson = {
        "ID": d.ID,
        "name": d.name,
        "surname": d.surname,
        "organisation_institution": d.organisation_institution,
        "org_inst_category": d.org_inst_category,
        "profession": d.profession,
        "badges_num": 1,
        "badges": [],
        "meetings_num": 0
      }
      //Find meetings num
      var meetingsNum = _.find(meetings, function(x) { return x.ID == d.ID });
      if(meetingsNum) {
        newPerson.meetings_num = meetingsNum.num;
      }
      var thisBadge = {
        "organisation_institution": d.organisation_institution,
        "org_inst_category": d.org_inst_category,
        "issue_year": d.issue_year,
        "issue_date": d.issue_date,
        "valid_until": d.valid_until
      }
      newPerson.badges.push(thisBadge);
      people.push(newPerson);
    }
  });

  //Set totals for custom counters

  //Set dc main vars. The second crossfilter is used to handle the travels stacked bar chart.
  var ndx = crossfilter(badges);
  var ndxPeople = crossfilter(people);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = d.name + ' ' + d.surname + ' ' + d.organisation_institution + ' ' + d.org_inst_category;
      return entryString.toLowerCase();
  });
  var idDimension = ndx.dimension(function (d) {
    var entryString = d.ID;
    return entryString.toLowerCase();
});
  var idDimensionPeople = ndxPeople.dimension(function (d) {
    if(!d.ID) {
      console.log(d);
    }
    var entryString = d.ID;
    return entryString.toLowerCase();
  });

  //Chart 1
  var createOrgTypeChart_bkp = function() {
    var chart = charts.orgType.chart;
    var dimension = ndx.dimension(function (d) {
      return d.org_inst_category;
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.orgType.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .cap(9)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(true).legendWidth(sizes.width).legendText(function(d) { 
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
      .ordinalColors(vuedata.colors.generic2)
      .group(group);
    chart.render();
    chart.on('filtered', function(c) { 
      UpdateTable();
      dc.redrawAll() 
    });
  }

  //Chart 3
  var createOrgTypeChart = function() {
    var chart = charts.orgType.chart;
    var dimension = ndx.dimension(function (d) {
        return d.org_inst_category;
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
    var width = recalcWidth(charts.orgType.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(450)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default1;
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
  var createYearsChart = function() {
    var chart = charts.years.chart;
    var dimension = ndx.dimension(function (d) {
      return d.issue_year;
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.all().filter(function(d) {
            return (d.key !== "");
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.years.divId);
    chart
      .width(width)
      .height(460)
      .margins({top: 10, left: 10, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .x(d3.scaleBand())
      .xUnits(dc.units.ordinal)
      .brushOn(true)
      .xAxisLabel('')
      .yAxisLabel('')
      .renderHorizontalGridLines(true)
      .elasticY(true)
      .elasticX(false)
      //.defined(function (d) {return d.x !== null && d.x !== ""})
      .title(function (d) {
        return d.key + ': ' + d.value.toFixed(2);
      });
      chart.render();
      chart.on('filtered', function(c) { 
        UpdateTable();
        dc.redrawAll() 
      });
  }

  //Chart 3
  var createTopOrgChart = function() {
    var chart = charts.topOrg.chart;
    var dimension = ndx.dimension(function (d) {
        return d.organisation_institution;
    });
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
    var width = recalcWidth(charts.topOrg.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(450)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default1;
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
        "infoEmpty": "No entries to show"
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
          "data": function(d) {
            return d.name + " " + d.surname;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.organisation_institution;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "className": "",
          "data": function(d) {
            console.log(d);
            return d.profession;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "className": "",
          "data": function(d) {
            return d.badges_num;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "className": "",
          "data": function(d) {
            return d.meetings_num;
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
      "aaData": idDimensionPeople.top(Infinity),
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
            var badgesCount = 0;
            _.each(data.badges, function (a) {
              badgesCount ++;
              rowInfoContent += "<div class='row-details-entry'><span class='row-details-num'>" + badgesCount + ".</span> " + a.organisation_institution + " - " + a.org_inst_category + " - " + a.issue_date + " - " + a.valid_until + "</div>";
            });
            rowInfoContent += "</div>";
            row.child(rowInfoContent).show();
            tr.addClass('shown');
        }
      });
    }
  //REFRESH TABLE
  function RefreshTable() {
    dc.events.trigger(function () {
      var alldata = idDimensionPeople.top(Infinity);
      charts.mainTable.chart.fnClearTable();
      charts.mainTable.chart.fnAddData(alldata);
      charts.mainTable.chart.fnDraw();
    });
  }
  function UpdateTable() {
    var filteredIds = [];
    _.each(idDimension.top(Infinity), function (a) {
      var thisId = (a.ID).toLowerCase();
      if(filteredIds.indexOf(thisId) == -1) {
        filteredIds.push(thisId);
      }
    });
    idDimensionPeople.filter(function(d) { 
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
    $('#search-input').val('');
    dc.redrawAll();
  }
  $('.reset-btn').click(function(){
    resetGraphs();
  });
  
  //Render charts
  createOrgTypeChart();
  createYearsChart();
  createTopOrgChart();
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
      if (!d.surname) {
        return "";
      } else {
        return d.name + ' ' + d.surname;
      }
    });
    var group = dim.group().reduce(
      function(p,d) {  
        p.nb +=1;
        if (!d.surname) {
          return p;
        }
        p.people += 1;
        return p;
      },
      function(p,d) {  
        p.nb -=1;
        if (!d.surname) {
          return p;
        }
        p.people -= 1;
        return p;
      },
      function(p,d) {  
        return {nb: 0, people: 0}; 
      }
    );
    group.order(function(p){ return p.nb });
    var people = 0;
    customCounters = dc.dataCount(".count-box-people")
    .dimension(group)
    .group({value: function() {
      people = 0;
      return group.all().filter(function(kv) {
        if (kv.value.nb >0) {
          people += +kv.value.people;
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

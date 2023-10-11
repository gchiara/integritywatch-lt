<html lang="en">
<head>
    <?php include 'gtag.php' ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ManoSeimas.lt</title>
    <!-- Add twitter and og meta here -->
    <meta property="og:url" content="http://www.manoseimas.lt/app.php" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="ManoSeimas.lt" />
    <meta property="og:description" content="„ManoSeimas.lt“ galite sužinoti, ką svarsto Seimo komitetai, su kuo susitinka Seimo nariai bei kas gauna ilgalaikius leidimus į Seimą." />
    <meta property="og:image" content="http://www.manoseimas.lt/images/thumbnail_090621.png" />
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="630">
    <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Quicksand:500" rel="stylesheet">
    <link rel="stylesheet" href="static/tab_c.css">
</head>
<body>
    <div id="app" class="tabC">   
      <?php include 'header.php' ?>
      <div class="container-fluid dashboard-container-outer">
        <div class="row dashboard-container">
          <!-- ROW FOR INFO AND SHARE -->
          <div class="col-md-12">
            <div class="row">
              <!-- INFO -->
              <div class="col-md-8 chart-col" v-if="showInfo">
                <div class="boxed-container description-container">
                  <p>Svetainėje „ManoSeimas.lt“ galite greitai ir paprastai sužinoti, dėl kokių teisės aktų 2016-2020 m. dažniausiai svarstė Seimo komitetai ir kokie viešojo sektoriaus bei interesų grupių atstovai dalyvavo šiuose svarstymuose. Taip pat galite sužinoti, kaip LR Seimo nariai skelbia savo darbotvarkes ir praneša apie susitikimus su įvairių interesų grupių atstovais ar kitais politikais bei kas iš jų gauna ilgalaikius leidimus į Seimą. Šiuos duomenis galite lyginti tarpusavyje pasinaudodami interaktyviais grafikais. <a href="./about.php?section=4">Daugiau čia</a>.</p>
                  <i class="material-icons close-btn" @click="showInfo = false">close</i>
                </div>
              </div>
              <div class="col-md-4 chart-col" v-if="showInfo">
                <div class="boxed-container description-container">
                  <p>Ši svetainė – tai pirminė (beta) puslapio versija, todėl apie pastebėtas klaidas arba neatitikimus prašome pranešti mums el. paštu <a href="mailto:info@transparency.lt">info@transparency.lt</a></p>
                  <i class="material-icons close-btn" @click="showInfo = false">close</i>
                </div>
              </div>
            </div>
          </div>
          <!-- CHARTS -->
          <div class="col-md-6 chart-col">
            <div class="boxed-container chart-container tab_b_1">
              <chart-header :title="charts.committees.title" :info="charts.committees.info" ></chart-header>
              <div class="chart-inner" id="committees_chart"></div>
            </div>
          </div>
          <div class="col-md-6 chart-col">
            <div class="boxed-container chart-container tab_b_3">
              <chart-header :title="charts.topLaws.title" :info="charts.topLaws.info" ></chart-header>
              <div class="chart-inner" id="toplaws_chart"></div>
            </div>
          </div>
          <!-- TABLE -->
          <div class="col-12 chart-col">
            <div class="boxed-container chart-container chart-container-table">
              <chart-header :title="charts.mainTable.title" :subtitle="charts.mainTable.subtitle" :info="charts.mainTable.info" ></chart-header>
              <div class="chart-inner chart-table">
                <table class="table table-hover dc-data-table" id="dc-data-table">
                  <thead>
                    <tr class="header">
                      <th class="header header-num">Nr</th> 
                      <th class="header header-laws">Teisės akto projektas</th>
                      <th class="header header-laws">Pirma svarstymo data</th>
                      <th class="header header-laws">Paskutinė svarstymo data</th>
                      <th class="header header-laws">Kiek kartų svarstė?</th>
                      <th class="header header-laws">Kiek komitetų svarstė?</th>
                      <th class="header header-laws">Kiek buvo viešojo sektoriaus dalyvių?</th>
                      <th class="header header-laws">Kiek buvo interesų grupių dalyvių?</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- DETAILS MODAL -->
      <div class="modal" id="detailsModal">
        <div class="modal-dialog modal-dialog-laws">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <button type="button" class="btn btn-secondary btn-info" data-container="body" data-toggle="popover" data-trigger="hover" data-html="true" data-placement="bottom" data-content="Sužinokite, kokie klausimai, susiję su pasirinktu teisės aktu, buvo svarstomi, kada ir kokiuose komitetuose. Paieškoje įveskite asmens pavardę ir sužinokite, kuriuose klausimų svarstymuose jis/ji dalyvavo.">
                i
              </button>
              <div class="modal-title modal-title-law">
                <div>{{ selectedElement.law_id }} - {{ selectedElement.law_name_short }}</div>
              </div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-12">
                    <table id="modalEntriesTable" class="agendas-table">
                      <thead>
                        <tr><th>Svarstytas klausimas</th><th>Data</th><th>Komitetas</th><th>Viešojo sektoriaus atstovai</th><th>Interesų grupių atstovai</th></tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Bottom bar -->
      <div class="container-fluid footer-bar">
        <div class="row">
          <div class="footer-col col-12 col-sm-12 footer-counts">
            <div class="dc-data-count count-box count-box-main count-box-entries-c">
              <div class="filter-count">0</div>svarstyti klausimai iš <strong class="total-count">0</strong>
            </div>
            <div class="count-box count-box-laws">
              <div class="filter-count nblaws">0</div>teisės aktai iš <strong class="total-count">0</strong>
            </div>
            <div class="footer-input footer-input-laws">
              <input type="text" id="search-input" placeholder="Paieška (teisės aktas, pavardė, įstaiga...)">
              <i class="material-icons">search</i>
            </div>
          </div>
        </div>
        <!-- Reset filters -->
        <button class="reset-btn"><i class="material-icons">settings_backup_restore</i><span class="reset-btn-text">Atnaujinti</span></button>
        <div class="footer-buttons-right">
          <button @click="downloadDataset"><i class="material-icons">cloud_download</i></button>
          <!-- <button class="btn-twitter" @click="share('twitter')"><img src="./images/twitter.png" /></button> -->
          <button class="btn-fb" @click="share('facebook')"><img src="./images/facebook.png" /></button>
        </div>
      </div>
      <!-- Scroll to Top Button -->
      <div class="scrolltotop-btn">
        <i class="material-icons">arrow_upward</i>
      </div>
      <!-- Loader -->
      <loader v-if="loader" :text="'Kraunama...'" />
    </div>

    <script type="text/javascript" src="vendor/js/d3.v5.min.js"></script>
    <script type="text/javascript" src="vendor/js/d3.layout.cloud.js"></script>
    <script type="text/javascript" src="vendor/js/crossfilter.min.js"></script>
    <script type="text/javascript" src="vendor/js/dc.js"></script>
    <script src="static/tab_c.js"></script>

 
</body>
</html>
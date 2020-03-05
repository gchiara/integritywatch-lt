<html lang="en">
<head>
    <?php include 'gtag.php' ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>IW LT</title>
    <!-- Add twitter and og meta here -->
    <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Quicksand:500" rel="stylesheet">
    <link rel="stylesheet" href="static/tab_a.css">
</head>
<body>
    <div id="app" class="tabA">   
      <?php include 'header.php' ?>
      <div class="container-fluid dashboard-container-outer">
        <div class="row dashboard-container">
          <!-- ROW FOR INFO AND SHARE -->
          <div class="col-md-12">
            <div class="row">
              <!-- INFO -->
              <div class="col-md-8 chart-col" v-if="showInfo">
                <div class="boxed-container description-container">
                  <h1>ManoSeimas.lt – Seimo narių susitikimai</h1>
                  <p>Svetainėje „ManoSeimas.lt“ galite greitai ir paprastai sužinoti, kaip LR Seimo nariai skelbia savo  darbotvarkes ir praneša apie  susitikimus su įvairių interesų grupių atstovais, dalyvavimą renginiuose, susitikimus sukitais politikais.Galite šiuos duomenis analizuoti atskirose Seimo frakcijose arba tarpusavyje lyginti visų Seimo frakcijų rodiklius. <a href="./about.php">Daugiau čia</a>.</p>
                  <i class="material-icons close-btn" @click="showInfo = false">close</i>
                </div>
              </div>
              <div class="col-md-4 chart-col" v-if="showInfo">
                <div class="boxed-container description-container">
                  <p>Sužinok, kiek ir kokių susitikimų su registruotais lobistais ir interesų grupėmis turėjo Tavo išrinktas parlamentaras!</p>
                  <p>Kiekvienos sesijos susitikimų apžvalga nuo 2017 m. <a href="./about.php">čia</a>.</p>
                  <i class="material-icons close-btn" @click="showInfo = false">close</i>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLE -->
          <div class="col-12 chart-col">
            <div class="boxed-container chart-container chart-container-table">
              <chart-header :title="charts.mainTable.title" :info="charts.mainTable.info" ></chart-header>
              <div class="chart-inner chart-table">
                <table class="table table-hover dc-data-table" id="dc-data-table">
                  <thead>
                    <tr class="header">
                      <th class="header">Nr</th> 
                      <th class="header">Vardas ir pavardė</th>
                      <th class="header">Frakcija</th>
                      <th class="header">Kadencija</th>
                      <th class="header">Ar parlamentaras yra frakcijos seniūnas ir/arba komiteto pirmininkas?</th>
                      <th class="header">Visi lrs.lt darbotvarkės įrašai</th>
                      <th class="header">Susitikimai su interesų grupėmis ir registruotais lobistais</th>
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
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title">
                <div>{{ selectedElement['@vardas'] }} {{ selectedElement['@pavardė'] }}</div>
              </div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-12">
                    Lorem Ipsum
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
            <div class="dc-data-count count-box count-box-main">
              <div class="filter-count">0</div>parlamentarais iš <strong class="total-count">0</strong>
            </div>
            <div class="count-box count-box-agendas">
              <div class="filter-count nbagendas">0</div>iš <strong class="total-count">0</strong> darbotvarkės įrašai
            </div>
            <div class="count-box count-box-meetings">
              <div class="filter-count nbmeetings">0</div>iš <strong class="total-count">0</strong> susitikimų su lobistais
            </div>
            <div class="footer-input">
              <input type="text" id="search-input" placeholder="Paieška">
              <i class="material-icons">search</i>
            </div>
          </div>
        </div>
        <!-- Reset filters -->
        <button class="reset-btn"><i class="material-icons">settings_backup_restore</i><span class="reset-btn-text">Reset</span></button>
        <div class="footer-buttons-right">
          <button @click="downloadDataset"><i class="material-icons">cloud_download</i></button>
          <button class="btn-twitter" @click="share('twitter')"><img src="./images/twitter.png" /></button>
          <button class="btn-fb" @click="share('facebook')"><img src="./images/facebook.png" /></button>
        </div>
      </div>
      <!-- Loader -->
      <loader v-if="loader" :text="'Loading ...'" />
    </div>

    <script type="text/javascript" src="vendor/js/d3.v5.min.js"></script>
    <script type="text/javascript" src="vendor/js/d3.layout.cloud.js"></script>
    <script type="text/javascript" src="vendor/js/crossfilter.min.js"></script>
    <script type="text/javascript" src="vendor/js/dc.js"></script>
    <script type="text/javascript" src="vendor/js/dc.cloud.js"></script>
    <script src="static/tab_a.js"></script>

 
</body>
</html>
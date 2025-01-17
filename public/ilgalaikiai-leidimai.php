<html lang="en">
<head>
    <?php include 'gtag.php' ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ManoSeimas.lt</title>
    <!-- Add twitter and og meta here -->
    <meta property="og:url" content="http://www.manoseimas.lt/ilgalaikiai-leidimai.php" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="ManoSeimas.lt" />
    <meta property="og:description" content="Svetainėje „ManoSeimas.lt“ galite greitai ir paprastai sužinoti, kas gauna ilgalaikius leidimus į Seimą ir kaip dažnai šie asmenys dalyvauja komitetų posėdžiuose, taip pat - kaip LR Seimo nariai skelbia savo darbotvarkes ir praneša apie susitikimus su įvairių interesų grupių atstovais, dalyvavimą renginiuose, susitikimus su kitais politikais." />
    <meta property="og:image" content="http://www.manoseimas.lt/images/thumbnail_090621.png" />
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="630">
    <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Quicksand:500" rel="stylesheet">
    <link rel="stylesheet" href="static/tab_b.css">
</head>
<body>
    <div id="app" class="tabB">   
      <?php include 'header.php' ?>
      <div class="container-fluid dashboard-container-outer">
        <div class="row dashboard-container">
          <!-- ROW FOR INFO AND SHARE -->
          <div class="col-md-12">
            <div class="row">
              <!-- INFO -->
              <div class="col-md-8 chart-col" v-if="showInfo">
                <div class="boxed-container description-container">
                  <p>Svetainėje „ManoSeimas.lt“ galite greitai ir paprastai sužinoti, kas gauna ilgalaikius leidimus į Seimą ir kaip dažnai šie asmenys dalyvauja komitetų posėdžiuose, taip pat - kaip LR Seimo nariai skelbia savo darbotvarkes ir praneša apie susitikimus su įvairių interesų grupių atstovais, dalyvavimą renginiuose, susitikimus su kitais politikais. Šiuos duomenis galite lyginti tarpusavyje pasinaudodami interaktyviais grafikais. <a href="./about.php?section=3">Daugiau čia</a>.</p>
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
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container tab_b_1">
              <chart-header :title="charts.orgType.title" :info="charts.orgType.info" ></chart-header>
              <div class="chart-inner" id="orgtype_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container tab_b_2">
              <chart-header :title="charts.years.title" :info="charts.years.info" ></chart-header>
              <div class="chart-inner" id="years_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container tab_b_3">
              <chart-header :title="charts.topOrg.title" :info="charts.topOrg.info" ></chart-header>
              <div class="chart-inner" id="toporg_chart"></div>
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
                      <th class="header header-badges1">Vardas ir pavardė</th>
                      <th class="header header-badges2">Įstaiga</th>
                      <th class="header header-badges3">Pareigos</th>
                      <th class="header header-badges4">Leidimų skaičius</th>
                      <th class="header header-badges5">Dalyvavimas komitetų klausimų svarstymuose</th>
                    </tr>
                  </thead>
                </table>
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
              <div class="filter-count">0</div>leidimai iš <strong class="total-count">0</strong>
            </div>
            <div class="count-box count-box-people">
              <div class="filter-count nbpeople">0</div>asmenys iš <strong class="total-count">0</strong>
            </div>
            <div class="footer-input">
              <input type="text" id="search-input" placeholder="Paieška">
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
    <script src="static/tab_b.js"></script>

 
</body>
</html>
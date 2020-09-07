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
                  <p>Svetainėje „ManoSeimas.lt“ galite greitai ir paprastai sužinoti, kaip LR Seimo nariai skelbia savo darbotvarkes ir praneša apie susitikimus su įvairių interesų grupių atstovais, dalyvavimą renginiuose, susitikimus su kitais politikais. Galite šiuos duomenis analizuoti atskirose Seimo frakcijose arba tarpusavyje lyginti visų Seimo frakcijų rodiklius. Daugiau informacijos čia. <a href="./about.php">Daugiau čia</a>.</p>
                  <i class="material-icons close-btn" @click="showInfo = false">close</i>
                </div>
              </div>
              <div class="col-md-4 chart-col" v-if="showInfo">
                <div class="boxed-container description-container">
                  <p>Ši svetainė – tai pirminė (beta) puslapio versija, todėl apie pastebėtas klaidas prašome pranešti mums el. paštu info@transparency.lt</p>
                  <i class="material-icons close-btn" @click="showInfo = false">close</i>
                </div>
              </div>
            </div>
          </div>
          <!-- CHARTS - FIRST ROW -->
          <div class="col-md-6 chart-col">
            <div class="boxed-container chart-container tab_a_1" id="meetingstotals_chart_container">
              <chart-header :title="charts.meetingsTotals.title" :info="charts.meetingsTotals.info" ></chart-header>
              <div class="chart-inner" id="meetingstotals_chart"></div>
            </div>
            <div class="boxed-container chart-container tab_a_1b" id="meetingsselected_chart_container">
              <chart-header :title="charts.meetingsSelected.title" :info="charts.meetingsSelected.info" ></chart-header>
              <div class="chart-inner" id="meetingsselected_chart"></div>
            </div>
          </div>
          <div class="col-md-6 chart-col">
            <div class="boxed-container chart-container  tab_a_2">
              <chart-header :title="charts.wordcloud.title" :info="charts.wordcloud.info" ></chart-header>
              <div class="chart-inner" id="wordcloud_chart"></div>
            </div>
          </div>
          <!-- TOGGLE BUTTON -->
          <div class="col-md-12 toggle-btn-container">
            <button class="toggle-btn" id="charts-toggle-btn" @click="showAllCharts = !showAllCharts">Daugiau</button>
          </div>
          <!-- CHARTS - SECOND ROW - CAN BE TOGGLED -->
          <div class="col-md-6 chart-col" v-show="showAllCharts">
            <div class="boxed-container chart-container  tab_a_3">
              <chart-header :title="charts.meetingsGroups.title" :info="charts.meetingsGroups.info" ></chart-header>
              <div class="chart-inner" id="meetingsgroups_chart"></div>
            </div>
          </div>
          <!-- TABLE -->
          <div class="col-12 chart-col">
            <div class="selected-rows-list">
              <span class="selected-rows-title">Pasirinkta:</span>
              <div class="selected-rows-tags">
              </div>
            </div>
            <div class="boxed-container chart-container chart-container-table">
              <chart-header :title="charts.mainTable.title" :info="charts.mainTable.info" ></chart-header>
              <div class="chart-inner chart-table">
                <table class="table table-hover dc-data-table" id="dc-data-table">
                  <thead>
                    <tr class="header">
                      <th class="header header-num">Nr</th> 
                      <th class="header header-name">Vardas ir pavardė</th>
                      <th class="header header-group">Frakcija</th>
                      <th class="header header-term">Kadencija</th>
                      <!-- <th class="header">Ar parlamentaras yra frakcijos seniūnas ir/arba komiteto pirmininkas?</th> -->
                      <th class="header header-agenda">Visi lrs.lt darbotvarkės įrašai</th>
                      <th class="header header-meetings">Susitikimai su interesų grupėmis ir registruotais lobistais</th>
                      <th class="header header-extra">Daugiau</th>
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
                <div v-if="selectedElement.faction">{{ selectedElement.faction['@padalinio_pavadinimo_santrumpa'] }}</div>
              </div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-8">
                    <div class="details-line"><span class="details-line-title"><a :href="selectedElement['@biografijos_nuoroda']">LRS.lt profilis</a></span></div>
                    <div class="details-line">
                      <span class="details-line-title" v-if="selectedElement['@lytis'] == 'M'">Seimo narė nuo: </span>
                      <span class="details-line-title" v-else>Seimo nary nuo: </span>
                      {{ selectedElement['@data_nuo'] }}<span v-if="selectedElement['@data_iki']"> iki {{ selectedElement['@data_iki'] }}</span>
                    </div>
                    <div class="details-line" v-if="selectedElement.lobbyMeetings"><span class="details-line-title">Susitikimai su interesų grupėmis ir registruotais lobistais:</span> {{ selectedElement.lobbyMeetings.Total_all_periods }}</div>
                    <div class="details-line"><span class="details-line-title">Visi lrs.lt darbotvarkės įrašai:</span> {{ selectedElement.agendasCount }}</div>
                  </div>
                  <div class="col-md-4">
                    <img :src="selectedElement.photoUrl" class="photo" />
                  </div>
                  <!-- Meetings Counts Info -->
                  <div class="col-md-12">
                    <div class="modal-divider"></div>
                    <div v-if="selectedElement.lobbyMeetings">
                      <div class="meetings-count-info-container" v-for="el in meetingsCountsTables">
                        <div class="details-line details-line-meetings-title">{{ el.title }}: {{ selectedElement.lobbyMeetings[el.dataPrefix+'_total'] }}</div>
                        <table>
                          <thead><tr><th>Su verslu</th><th>Su registruotais lobistais</th><th>Su NVO</th><th>Su profesinėmis sąjungomis</th><th>Kiti</th></tr></thead>
                          <tbody>
                            <tr>
                              <td>{{ selectedElement.lobbyMeetings[el.dataPrefix+'_business'] }}</td>
                              <td>{{ selectedElement.lobbyMeetings[el.dataPrefix+'_registered_lobbyists'] }}</td>
                              <td>{{ selectedElement.lobbyMeetings[el.dataPrefix+'_NGO_local'] }}</td>
                              <td>{{ selectedElement.lobbyMeetings[el.dataPrefix+'_trade_unions'] }}</td>
                              <td>{{ selectedElement.lobbyMeetings[el.dataPrefix+'_others'] }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div v-show="selectedElement.agendas && selectedElement.agendasCount > 0" class="agendas-table-container">
                    <div class="details-line"><span class="details-line-title">Visi lrs.lt darbotvarkės įrašai: {{ selectedElement.agendasCount }}</span></div>
                      <table id="modalAgendasTable" class="agendas-table">
                        <thead>
                          <tr><th>Pradžia</th><th>pavadinimas</th><th>Pabaiga</th><th>vieta</th></tr>
                        </thead>
                      </table>
                    </div>
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
              <div class="filter-count">0</div>parlamentaras(-ė) iš <strong class="total-count">0</strong>
            </div>
            <div class="count-box count-box-agendas">
              <div class="filter-count nbagendas">0</div>iš <strong class="total-count">0</strong> darbotvarkės įrašų
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
        <button class="reset-btn"><i class="material-icons">settings_backup_restore</i><span class="reset-btn-text">Atnaujinti</span></button>
        <div class="footer-buttons-right">
          <button @click="downloadDataset"><i class="material-icons">cloud_download</i></button>
          <button class="btn-twitter" @click="share('twitter')"><img src="./images/twitter.png" /></button>
          <button class="btn-fb" @click="share('facebook')"><img src="./images/facebook.png" /></button>
        </div>
      </div>
      <!-- Scroll to Top Button -->
      <div class="scrolltotop-btn">
        <i class="material-icons">arrow_upward</i>
      </div>
      <!-- Loader -->
      <loader v-if="loader" :text="'Loading ...'" />
    </div>

    <script type="text/javascript" src="vendor/js/d3.v5.min.js"></script>
    <script type="text/javascript" src="vendor/js/d3.layout.cloud.js"></script>
    <script type="text/javascript" src="vendor/js/crossfilter.min.js"></script>
    <script type="text/javascript" src="vendor/js/dc.js"></script>
    <script src="static/tab_a.js"></script>

 
</body>
</html>
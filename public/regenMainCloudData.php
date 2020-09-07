<?php

ini_set('memory_limit','512M');
ini_set('max_execution_time', 600);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$mpsFile = file_get_contents("./data/tab_a/p2b_ad_seimo_nariai.json");
$agendasFile = file_get_contents("./data/tab_a/p2b_ad_sn_darbotvarkes.json");
$mps = json_decode($mpsFile, true);
$agendas = json_decode($agendasFile, true);

$agendasString = "";

foreach ($mps['SeimoInformacija']['SeimoKadencija']['SeimoNarys'] as $key => $value) {
	$mpId = $value['@asmens_id'];
	echo $mpId.', ';
	$mpAgendasString = "";
	foreach ($agendas['SeimoInformacija']['SeimoNarys'] as $keyAgendas => $valueAgendas) {
		if($valueAgendas['@asmens_id'] == $value['@asmens_id']) {
			foreach ($valueAgendas["SeimoNarioDarbotvarkėsĮvykis"] as $keyAgenda => $valueAgenda) {
				$mpAgendasString = $mpAgendasString.$valueAgenda['@pavadinimas']." ";
			}
				break;
		}
	}
	$agendasString = $agendasString.$mpAgendasString;
}

//Parse string
$maxWords = 70;
$blacklist = ['ir','o','bet','tačiau','dėl','nes','kad','jeigu','rytinis','vakarinis','su','prie','į','už','rugsėj','spal','lapkrit','gruod','saus','vasar','kov','baland','geguž','biržel','liep','rugpjū','k.','atšauktas','nuotoliniu','būdu','veiksmų','p.','m.','raj.','valanda','viešin','komit','posėd','plenar','frakc','Seim','komisij'];

$agendasStringClean = preg_replace('/[!\.,:;\'"\?]/', ' ', $agendasString);
$stringArray = explode(' ', $agendasStringClean);
$parsedWords = [];

foreach ($stringArray as $word) {
	if(!in_array($word, $blacklist)) {
		array_push($parsedWords,$word);
	}
}
$vals = array_count_values($parsedWords);
arsort($vals);
$finalWords = array_slice($vals, 0, $maxWords);
var_dump($finalWords);
$cloudData = [];
foreach ($finalWords as $key => $value) {
	$wordObj = array( 'word' => $key, 'size' => $value );
	array_push($cloudData, $wordObj);
}
file_put_contents('./data/tab_a/wordcloud.json', json_encode($cloudData));





?>
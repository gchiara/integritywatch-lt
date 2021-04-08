<?php
//MD5 encrypt id column in badges csv
$row = 0;
if (($handle = fopen("data/tab_b/badges_unencrypted.csv", "r")) !== FALSE) {
  //Encrypt id column
  if (($handle2 = fopen("data/tab_b/badges.csv", "w")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $num = count($data);
        if($row > 0) {
          $clean_id = trim(str_replace("  ", " ", $data[0]));
          $data[0] = md5($clean_id);
        }
        fputcsv($handle2, $data);
        $row++;
      }
      echo "<p> Encrypted ID column in badges file<br /></p>\n";
      fclose($handle2);
  }
  fclose($handle);
}
//MD5 encrypt id column in meetings csv
$row = 0;
if (($handle = fopen("data/tab_b/meetings_unencrypted.csv", "r")) !== FALSE) {
  if (($handle2 = fopen("data/tab_b/meetings.csv", "w")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $num = count($data);
        if($row > 0) {
          $clean_id = trim(str_replace("  ", " ", $data[0]));
          $data[0] = md5($clean_id);
        }
        fputcsv($handle2, $data);
        $row++;
      }
      echo "<p> Encrypted ID column in meetings file<br /></p>\n";
      fclose($handle2);
  }
  fclose($handle);
}
?>
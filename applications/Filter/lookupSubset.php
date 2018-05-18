<?php

 $key = "";
 $which = "";
 $project_name = "";
 $user_name = "";

 if (isset($_POST['project_name'])) {
   $project_name = $_POST['project_name'];
 } else {
   echo("did not get a project_name");
   return;
 }
 if (isset($_POST['user_name'])) {
   $user_name = $_POST['user_name'];
 } else {
   echo("did not get a user_name");
   return;
 }
 if (isset($_POST['key'])) {
   $key = $_POST['key'];
 } else {
   echo("did not get a key");
   return;
 }

 $fn = "data/filterSets_".$project_name."_".$user_name.".json";
 $data = array();
 if (is_readable($fn)) {
   $data = json_decode(file_get_contents($fn), TRUE);
 } else {
   // echo (json_encode(array( "message" => "could not read table")));   
 }

 foreach ($data as &$s) {
   if ($key === $s['key']) {
     echo(json_encode($s['set']));
     return;
   }
 }
 echo (json_encode(array( "message" => "unknown key \"".$key."\" in ".$fn)));
?>

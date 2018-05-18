<?php

 date_default_timezone_set('America/Los_Angeles');
 ini_set("memory_limit","128M");

 session_start(); /// initialize session
 include("AC.php");
 $user_name = check_logged(); /// function checks if visitor is logged.
 if (!$user_name)
    return; // do nothing

 $_file = "../../data/table.json";

 $projects = json_decode( file_get_contents($_file), true);
 $allowedProjects = array();
 foreach( $projects as $project ) {
    if ($user_name == "admin" || check_permission( $project['name'] )) {
       // add some more information about the project
       $fn = "../../applications/DataExploration/user_code/usercache_".$project['name']."_".$user_name."_stats.json";
       if (is_readable($fn)) {
          $columns = json_decode(file_get_contents($fn), TRUE);
          $project['numCols'] = $columns[1];
          $project['numRows'] = $columns[0];
          $project['numNAs']  = $columns[2];
          $project['male']    = $columns[3];
          $project['female']  = $columns[4];
          if ( array_key_exists( 5, $columns ) )
            $project['islongitudinal']  = $columns[5];
          else
            $project['islongitudinal']  = 'no';
       }
       $allowedProjects[] = $project;
    }
 }
 echo json_encode( $allowedProjects );
 return;

?>
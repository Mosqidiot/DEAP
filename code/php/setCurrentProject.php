<?php
 // call with ?project_name=Project01 to make that project the current project in the session
 // only projects that we have permissions for will work

 date_default_timezone_set('America/Los_Angeles');
 ini_set("memory_limit","128M");

 session_start(); /// initialize session

 include("AC.php");
 $user_name = check_logged(); /// function checks if visitor is logged.
 if (!$user_name) {
    echo(json_encode( array( "message" => "no user logged in" ) ) );
    return; // do nothing
 }

 if (isset($_GET['project_name'])) {
    $project_name = $_GET['project_name'];
 } else {
    // nothing to do
    echo(json_encode( array( "message" => "no project name specified" ) ) );
    return;
 }

 // we have to be logged in to be able to change the current project
 if (check_permission( $project_name ) ) {
   $_SESSION['project_name'] = $project_name; // make that project current in the session
 } else {
   echo(json_encode( array( "message" => "current user does not have permissions for this project" ) ) );
   return;
 }
 echo(json_encode( array( "message" => "done" ) ) );


?>
<?php

  session_start(); /// initialize session
  include("../../code/php/AC.php");
  $user_name = check_logged(); /// function checks if visitor is logged.
  if (!$user_name) {
     echo (json_encode ( array( "message" => "no user name" ) ) );
     return; // nothing
  }
  $project_name = "";
  if (isset($_SESSION['project_name']))
    $project_name = $_SESSION['project_name'];
  else {
     echo (json_encode ( array( "message" => "No project name in this session" ) ) );
     return; // no project name nothing to do
  }
  if (!check_permission_pair( "can-admin", $project_name )) {
     echo (json_encode ( array( "message" => "user has no permission for can-admin for this project (same role restriction)" ) ) );
     return;
  }


  if (isset($_POST['text']))
    $text = $_POST['text'];
  else
    $text = "";
  if (isset($_POST['project'])) {
    $project = $_POST['project'];
  } else {
     echo (json_encode ( array( "message" => "no project name provided" ) ) );
     return; // cannot do anything without a proper project name
  }
  
  if ($text != "") {
     // save the text as a new rules file (todo: guard this with git)
     $filename = "../../data/".$project."/data_uncorrected";
     if (!is_dir($filename)) {
         //echo "Error: ".$filename." does not exist";
        echo (json_encode ( array( "message" => $filename." does not exist" ) ) );
	    return;
     }
     $filename = $filename."/".$project."_datadictionary_rules.csv";
     if (!file_exists($filename)) {
        // try to save for the first time
  	    file_put_contents( $filename, $text );
        echo (json_encode ( array( "message" => "file has been created" ) ) );
        // echo "File has been created";
     } else {
 	    file_put_contents( $filename, $text );
        echo (json_encode ( array( "message" => "File has been overwritten" ) ) );
	    //echo "File has been overwritten.";
     }
  }
 ?>
 
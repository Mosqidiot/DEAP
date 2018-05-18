<?php

  // collect all results from scripts
  $dir = glob('datasources/*.php');
  $results = array();
  foreach ($dir as $filename) {
     $b = basename($filename, ".php");
     $p = '/^[0-9][0-9][0-9]_(.*)/';
     if (preg_match($p, $b, $matches) != 1)
       continue;
     $name = $matches[1];

     $res = json_decode( shell_exec('php '.$filename ), true);
     $res["name"] = $name;
     $results[] = $res;
  }
  echo(json_encode( $results ));

?>

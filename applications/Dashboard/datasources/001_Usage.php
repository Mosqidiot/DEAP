<?php

 function getSystemUsage() {
    $apps = array ( "applications/Ontology/translate" => 0, 
                    "applications/Ontology/hierarchy" => 0, 
		    "applications/DataExploration" => 0,
		    "applications/Overview" => 0,
		    "applications/OverviewMeasures" => 0,
		    "applications/Documents" => 0,
		    "applications/ImageViewerMPR" => 0,
		    "applications/TableView" => 0,
		    "applications/SNPs" => 0,
		    "applications/QC" => 0,
		    "Download: essential data file" => 0);

    $data = file_get_contents("/home/dataportal/www/logs/audit.log");
    $usageinfo = array();
    foreach ($apps as $key => $value) {
      $usageinfo[$key] = substr_count($data, $key);
    }
    return $usageinfo;
 }

 $usageinfo = getSystemUsage();
 function cmp($a, $b) {
    if ($a == $b) {
        return 0;
    }
    return ($a < $b) ? 1 : -1;
 }

 uasort($usageinfo, 'cmp');
 $ret = array();
 foreach ($usageinfo as $key => $value) {
   $ret[] = array( "text", $key." : ".$value );
 }
 $ret['info'] = "number of times an application has been called";
 echo( json_encode( $ret ) );

?>
<?php

 $dir = glob('/var/www/html/applications/NewDataExpo/usercache/*_*',GLOB_ONLYDIR);
 $ch = array();
 foreach ($dir as $d) {
    $vals = explode("_", basename($d));
    //$blob = array( "name" => $vals[0], "project" => $vals[1], "user" => $vals[0], "children" => array() );
    if(!array_key_exists($vals[0], $ch)){
        $ch[$vals[0]] = array("name" => $vals[0], "project" => "ABCD", "user" => $vals[0], "children" => array());
    }
    $json = json_decode(file_get_contents($d."/model_specification.json"),true);
    // parse all files for variables of interest, count up the number of times they are used
    $variables = array();
    $var_list = getListofID($json); 
    foreach($var_list as $v){
	$v_split = explode("+",$v);
	foreach($v_split as $v_split_item){
	    if (!array_key_exists( $v_split_item,$variables)) {
		$variables[$v_split_item] = 1;
	    }
	    else{
		$variables[$v_split_item] =$variables[$v_split_item] +1;
	    }
	}
    }

    
    foreach ($variables as $key => $v) {
      if(!array_key_exists($key, $ch[$vals[0]]["children"])){
          $ch[$vals[0]]["children"][$key] =  array( "name" => $key, "size" => $v );
      }
      else{
	  $ch[$vals[0]]["children"][$key]["size"] = $ch[$vals[0]]["children"][$key]["size"] + $v;  
      }
    }


 } 
 foreach($ch as $key => &$v){
    $ch[$key]["children"] = toArray($ch[$key]["children"]);  
 }
 $ch  = toArray($ch);

 // return data exploration state as json
 $ret = array( "users" => array("bar", array( "name" => "users", "children" => $ch  ) ), "info" => "utilization of measures" );
 
 echo( json_encode( $ret ) );

 // extaract variables from model specification
 function getListofID($json){
    $rt = array();
    foreach($json["nodes"] as $val){
        if(strpos($val["name"], "Measure") !== false){
            $state = $val["state"];
	    $id = ""; 
            $value = "";
            foreach($state as $s){
                if($s["name"] == "id"){
                    $id = $s["value"];
                }
                if($s["name"] == "value" && array_key_exists("value",$s) ){
                    $value = $s["value"];
                }
            }
            if($id != "" && $value != ""&&  $value != "undefined"){
                $rt[$id] = $value;
            }
        }
    }
    return $rt;
 }
 function toArray($obj){
    $rt = array();
    foreach($obj as $v){
	$rt[] = $v;
    }
    return $rt;
 }
?>

<?php

 function getSystemMemInfo() {       
    $data = explode("\n", file_get_contents("/proc/meminfo"));
    $meminfo = array();
    foreach ($data as $line) {
    	    list($key, $val) = explode(":", $line);
    	    $meminfo[$key] = trim($val);
    }
    return $meminfo;
 }

 // return machine state as json
 $sysmeminfo = getSystemMemInfo();
 $ar = sys_getloadavg();
 $ret = array( "load" => array("minmax", 2, 0, $ar[0], 'au'),
               "memory" => array("minmax", 0, intval($sysmeminfo["MemTotal"])/1024, intval($sysmeminfo["MemFree"])/1024, 'Mb'),
               "system" => array("minmax", 0, disk_total_space('/')/1024/1024, disk_free_space('/')/1024/1024, 'Mb'),
	       "data" => array("minmax", 0, disk_total_space('/home/dataportal/www/data/')/1024/1024, disk_free_space('/home/dataportal/www/data/')/1024/1024, 'Mb'),
	       "info" => "host system information");
 
 echo( json_encode( $ret ) );

?>
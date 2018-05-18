<?php
 // these scripts are executed on the machine, not with the context of the website

 $us = json_decode(file_get_contents('/home/dataportal/www/code/php/passwords.json'), TRUE);
 $ret = array();
 $ret[] = array( "text", "Registered users: ".count($us["users"]) );
 $signedlegal = 0;
 foreach ( $us["users"] as $user ) {
    if (array_key_exists( "legalok", $user )) {
      $signedlegal = $signedlegal + 1;
    }
 }
 $ret[] = array( "text", "Users agreed to T&C: ".$signedlegal );
 $snps = 0;
 foreach ( $us["users"] as $user ) {
    if (array_key_exists( "SNPNumDownloaded", $user )) {
       $snps = $user["SNPNumDownloaded"];
    }
 }
 $ret[] = array( "text", "Number of downloaded SNPs: ".$snps );
 $orga = array();
 foreach ( $us["users"] as $user ) {
    if (array_key_exists( "organization", $user )) {
       $orga[] = '<span class="label label-info">'.$user["organization"].'</span>';
    }
 }
 $orga = array_unique($orga);
 $ret[] = array( "text", "Organizations: ".implode( ", ", $orga) );


 $ret['info'] = "User info";
 echo( json_encode( $ret ) );

?>
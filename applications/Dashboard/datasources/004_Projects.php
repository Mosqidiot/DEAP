<?php

  $fn = "/home/dataportal/www/data/table.json";
  if (!is_readable($fn)) {
     return;
  }
  $projects = json_decode( file_get_contents($fn), TRUE );

  $ret = array();
  $ret["info"] = "existing projects";
  foreach ($projects as $project) {
    $moreInfo = "&nbsp;";
    $fn = "../../applications/DataExploration/user_code/usercache_".$project['name']."_admin_stats.json";
    if (is_readable($fn)) {
       $columns = json_decode(file_get_contents($fn), TRUE);
       $project['numCols'] = $columns[1];
       $project['numRows'] = $columns[0];
       $project['numNAs']  = $columns[2];
       $project['male']    = $columns[3];
       $project['female']  = $columns[4];
       $moreInfo = "measures: "
	 .number_format($project['numCols'])
	 .", sessions: "
	 .number_format($project['numRows'])
	 .", #NA: "
	 .number_format($project['numNAs'])
	 .", #male: "
	 .number_format($project['male'])
	 .", #female: "
	 .number_format($project['female']);
    }

    $ret[] = array( "text", '<div class="project"><span class="label label-info">'.$project["name"].'</span>&nbsp;<span class="details">'.$moreInfo."</span><p>".$project["description"]."</p></div>" );
    $ret[] = array( "minmax", 0, $project["numCols"]*$project["numRows"], $project["numNAs"], '#');
  }
  echo ( json_encode( $ret ) );

?>
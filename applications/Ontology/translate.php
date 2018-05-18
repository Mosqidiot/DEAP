<?php
  //
  // This service returns the long names for the column entries used in the project data tables.
  // The information is stored in a csv file that lists each column name as a string and a sentence
  // as a long description.
  // The output of the service is either the long name as a string, or a JSON array that lists
  // all known names and values.
  //
  // (Hauke, 09/2011)


  date_default_timezone_set('America/Los_Angeles');

   session_start(); /// initialize session

   include("../../code/php/AC.php");
   $user_name = check_logged(); /// function checks if visitor is logged.

   if (isset($_SESSION['project_name']))
      $project_name = $_SESSION['project_name'];
   else
      $project_name = "Project01";

   //echo('<script type="text/javascript"> user_name = "'.$user_name.'"; project_name = "'.$project_name.'"; </script>');

  if (!isset($SESSION['REMOTE_USER']))
    $user_name = "dataportal";
  else
    $user_name = $_SESSION['REMOTE_USER'];

  //$project_name = "Project01";

  // http://mmil-dataportal.ucsd.edu/code/Ontology/translate.php?column="CortThick-Mean"&query=long
  if (!empty($_GET['_v'])) {
    $version = $_GET['_v'];
  } else {
    $version = "";
  }
  if (!empty($_GET['column'])) {
    $column = $_GET['column'];
  } else {
    $column = "";
  }
  if (!empty($_GET['query'])) {
    $query = $_GET['query'];
  } else {
    $query = "";
  }


function json_encode_string($in_str) {
  mb_internal_encoding("UTF-8");
  $convmap = array(0x80, 0xFFFF, 0, 0xFFFF);
  $str = "";
  for($i=mb_strlen($in_str)-1; $i>=0; $i--)
    {
      $mb_char = mb_substr($in_str, $i, 1);
      if(mb_ereg("&#(\\d+);", mb_encode_numericentity($mb_char, $convmap, "UTF-8"), $match))
	{
	  $str = sprintf("\\u%04x", $match[1]) . $str;
	}
      else
	{
	  $str = $mb_char . $str;
	}
    }
  return $str;
}
function php_json_encode($arr) {
  $json_str = "";
  if(is_array($arr))
    {
      $pure_array = true;
      $array_length = count($arr);
      for($i=0;$i<$array_length;$i++)
	{
	  if(! isset($arr[$i]))
	    {
	      $pure_array = false;
	      break;
	    }
	}
      if($pure_array)
	{
	  $json_str ="[";
	  $temp = array();
	  for($i=0;$i<$array_length;$i++)       
	    {
	      $temp[] = sprintf("%s", php_json_encode($arr[$i]));
	    }
	  $json_str .= implode(",",$temp);
	  $json_str .="]";
	}
      else
	{
	  $json_str ="{";
	  $temp = array();
	  foreach($arr as $key => $value)
	    {
	      $temp[] = sprintf("\"%s\":%s", $key, php_json_encode($value));
	    }
	  $json_str .= implode(",",$temp);
	  $json_str .="}";
	}
    }
  else
    {
      if(is_string($arr))
	{
	  $json_str = "\"". json_encode_string($arr) . "\"";
	}
      else if(is_numeric($arr))
	{
	  $json_str = $arr;
	}
      else
	{
	  $json_str = "\"". json_encode_string($arr) . "\"";
	}
    }
  return $json_str;
}

  $d = array();
  $row = 1;
  // read the data dictionary
  $filename = "../../data/".$project_name."/data_uncorrected".$version."/".$project_name."_datadictionary01.csv";
  if (($handle = fopen($filename, "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      $num = count($data);
      $row++;
      if ($num == 2) {
	$d[trim($data[0])] = array(trim($data[1]),"");
      }
      if ($num >= 3) {
	$d[trim($data[0])] = array(trim($data[1]),trim($data[2]));
      }
    }
    fclose($handle);
  } 

  // read the behavior toolbox dictionary
  $filename = "../../data/".$project_name."/data_uncorrected".$version."/".$project_name."_datadictionary02.csv";
  if (($handle = fopen($filename, "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      $num = count($data);
      $row++;
      if ($num == 2) {
	$d[trim($data[0])] = array(trim($data[1]),"");
      }
      if ($num >= 3) {
	$d[trim($data[0])] = array(trim($data[1]),trim($data[2]));
      }
    }
    fclose($handle);
  }

  if ( $query == "" ) {
    $ret = array();
    foreach (array_keys($d) as $u) {
      $ret[$u] = htmlentities($d[$u][0]);
    }

    echo(php_json_encode( $ret) ) ;
    return;
  } else if ( $query == "long" ) {
    $column = str_replace("\"","", $column);
    if (array_key_exists($column, $d))
      echo $d[$column][0];
    else {
      $column = str_replace(".","-", $column);
      if (array_key_exists($column, $d)) {
        echo $d[$column][0];
      } else {
        echo "error: unknown column";
      }
      return false;
    }
  } else if ( $query == "short" ) {
    $column = str_replace("\"","", $column);
    if (array_key_exists($column, $d)) {
      if ($d[$column][1] != "") {
	echo $d[$column][1];
      } else { 
        echo $d[$column][0];
      }
    } else {
      $column = str_replace(".","-", $column);
      if (array_key_exists($column, $d)) {
        if ($d[$column][1] != "") {
  	  echo $d[$column][1];
        } else { 
          echo $d[$column][0];
        }
      } else {
        echo "error: unknown column";
      }
      return false;
    }
  } else if ( $query == "display" ) {
    // read the link rules file (local to Ontology folder)
    $rules = array();
    if ( file_exists( "link_rules.json" ) ) {
       $rules = json_decode(file_get_contents( "link_rules.json" ), true);
    }

    //
    // test rdfa by using: http://www.w3.org/2012/pyRdfa/#distill_by_upload
    //

    echo "<html  prefix=\"dc: http://purl.org/dc/elements/1.1/\" lang=\"en\">";
    echo "<head>";
    echo "  <title property=\"dc:title\">".$project_name." Data Dictionary</title>";
    echo "    <meta charset=\"UTF-8\">";
    //echo "  <meta href=\"".$_SERVER['REQUEST_URI']."\" property=\"dc:creator\" name=\"dc:creator\" content=\"Hauke Bartsch\" />";
    //echo "  <meta href=\"".$_SERVER['REQUEST_URI']."\" property=\"rdfs:comment\" name=\"rdfs:comment\" content=\"".$project_name."\" />";
    echo "  <style>";
#    echo " dl.border-around { margin: 2em 0; padding: 0; width: 25em; }";
#    echo " .border-around dt { background-color: #131210; color: #AAAAAA;padding: .5em;font-weight: 500;text-align: left;text-transform: none;border-left: 1px solid #131210;border-right: 1px solid #131210;border-top: 1px solid #131210;}";
#    echo " .border-around dd { margin: 0 0 1em 0;background: #DBD8D8;text-align: center;padding: 1em .5em;font-style: italic;border-left: 1px solid #131210;border-right: 1px solid #131210;border-bottom: 1px solid #131210; }";
    echo "   dl.event { margin: 2em 0; padding: 0; font-family: georgia, times, serif; }";
    echo "   .event dt { position: relative;left: 0;top: 1.1em;width: 25em;font-weight: bold;}";
    echo "   .event dd { border-left: 1px solid #000;margin: 0 0 0 26em;padding: 0 0 .5em .5em;}";
    echo "  </style>";
    echo "  <link href=\"/css/bootstrap.css\" rel=\"stylesheet\">";
    echo "  <link href=\"/css/bootstrap-responsive.css\" rel=\"stylesheet\">";

    echo "</head>";
    echo "<body>";

    echo "<div class=\"navbar navbar-inverse navbar-fixed-top\">";
    echo "  <div class=\"navbar-inner\">";
    echo "    <div class=\"container\">";
    echo "      <a class=\"btn btn-navbar\" data-toggle=\"collapse\" data-target=\".nav-collapse\">";
    echo "        <span class=\"icon-bar\"></span>";
    echo "        <span class=\"icon-bar\"></span>";
    echo "        <span class=\"icon-bar\"></span>";
    echo "      </a>";
    echo "      <a class=\"brand\" href=\"#\">Data Portal Dictionary</a>";
    echo "      <div class=\"nav-collapse collapse\">";
    echo "        <ul class=\"nav\">";
    echo "          <li class=\"active\"><a href=\"/index.php\">Home</a></li>";
    echo "        </ul>";
    echo "      </div><!--/.nav-collapse -->";
    echo "    </div>";
    echo "  </div>";
    echo "</div>";

    echo "<div class=\"container\">";
    echo "<p style=\"margin-top: 70px;\">This page contains RDFa labels in an effort to support the semantic web. Use an <a href=\"http://www.w3.org/2012/pyRdfa/#distill_by_upload\">RDFa 1.1 distiller</a> to extract this information.</p>";
    $count = 0;
    echo "<dl resource=\"http://www.w3.org/TR/2004/REC-rdf-syntax-grammar-20040210/\" about=\"".$_SERVER['REQUEST_URI']."\" class=\"event\">";
    foreach (array_keys($d) as $u) {
      $outsidelinks = "";
      if (count($rules) > 0) {
         // check if this applies to the current project
         foreach ( $rules as $rule) {
            //echo "print the rule name: ". $rule['name'];
            $validrule = False;
            if (array_key_exists( "projects", $rule) ) {
               foreach ( $rule["projects"] as $p ) {
                 if (preg_match("/".$p."/i", $project_name)) {
                   $validrule = True;
                   //echo("Yes, this projects matches!");
                   break;
                 }
               }
            } else {
               syslog(LOG_INFO, "no projects key in rule ".$rule['name']." for project: ".$project_name);
            }
            if ( $validrule ) {
               // does the current measure match the when-clause?
               if (array_key_exists( "when", $rule)) {
                  if (preg_match( "/".$rule["when"]["search"]."/i", $u)) {
                     // echo("Yes, this is a PhenX measure");
                     // replace any variables in the string
                     $v = $rule["what"]["value"];
                     preg_match('/\${column([0-9]+)}/i', $v, $matches);
                     //echo(" count is: ". count($matches). " for testing: ".$v);
                     for ($i = 1; $i < count($matches); $i++) {
                        $column = intval($matches[$i]);
                        //echo("found column: ".$column." to replace in string");
                        $v = preg_replace('/\${column'.$i.'}/', $d[$u][$column], $v);
                     }
                     $outsidelinks = $outsidelinks."<button property=\"rdfs:link\" resource=\"".htmlentities($v)."\" onclick=\"window.location.href = '".$v."'\">".$rule['name']."</button>";
                  } else {
                     //echo("No, no PhenX measure".$rule["when"]["search"]." compare with \"".$u."\"");
                  }
               } else {
                  syslog(LOG_INFO, "no 'when' array key in rule ".$rule['name']." for project: ".$project_name);
               }
            }
         }
      }

      if ($count > 0) {
	       if ($d[$u][1] != "") {
	          echo "<dt>".$count."<br/><span>".$u."</span></dt><dd xmlns:dc=\"http://purl.org/dc/elements/1.1/\" href=\"#".$u."\"><span style=\"display: none;\" property=\"dc:title\">".$u."</span><span id=\"".$u."\" property=\"dc:identifier\">\"".htmlentities($d[$u][1])."\"</span><br/><span property=\"dc:description\">".htmlentities($d[$u][0])."</span><br>".$outsidelinks."</dd>";
	       } else {
            echo "<dt>".$count."<br/>".$u."</dt><dd xmlns:dc=\"http://purl.org/dc/elements/1.1/\" href=\"#".$u."\"><span style=\"display: none;\" property=\"dc:identifier\">".$u."</span><span id=\"".$u."\" property=\"dc:description\">".htmlentities($d[$u][0])."</span><br>".$outsidelinks."</dd>";  
      	 }
      }
      $count = $count + 1;
    }
    echo "</dl>";
    echo "</container>";
    echo "</body>";
    return;
  } else {
    echo "error: Unknown query string. Only \"long\" is supported currently.";
  }
?>

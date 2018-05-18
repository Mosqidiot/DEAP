<?php
  //
  // This service returns the children of a node.
  //
  // (Hauke, 12/2012)

  // Ontology/hierarchy.php?entry="root"

  date_default_timezone_set('America/Los_Angeles');

   session_start(); /// initialize session

   include("../../code/php/AC.php");
   $user_name = check_logged(); /// function checks if visitor is logged.

   if (isset($_SESSION['project_name']))
      $project_name = $_SESSION['project_name'];
   else
      $project_name = "Project01";

   //echo('<script type="text/javascript"> user_name = "'.$user_name.'"; project_name = "'.$project_name.'"; </script>');

  if (!empty($_GET['entry'])) {
    $entry = $_GET['entry'];
  } else {
    $entry = "";
  }
  if (!empty($_GET['_v'])) {
    $version = $_GET['_v'];
  } else {
    $version = "";
  }
  //echo('<script type="text/javascript"> version = "'.$version.'"; </script>');

  $searchTerm = "";
  if (isset($_GET['search'])) {
    $searchTerm = $_GET['search'];
  }

function json_encode_string($in_str) {
  mb_internal_encoding("UTF-8"); // make this work by doing yum install php-mbstring
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


  $dictionaries = array(
	0 => "../../data/".$project_name."/data_uncorrected".$version."/".$project_name."_datadictionary01.csv",
	1 => "../../data/".$project_name."/data_uncorrected".$version."/".$project_name."_datadictionary02.csv"
  ); 
  $rules_files = array(
	0 => "../../data/".$project_name."/data_uncorrected".$version."/".$project_name."_datadictionary_rules.csv"
  );

  $d = array();
  $row = 1;
  foreach (array_keys($dictionaries) as $u) {
    if (($handle = fopen($dictionaries[$u], "r")) !== FALSE) {
      while (($data = fgetcsv($handle, 5000, ",")) !== FALSE) {
        $num = count($data);
        $row++;
        if ($num == 2) {  
  	       $d[$data[0]] = array( "0" => $data[1], "1" => "" ); // add short description
        } else {
           $d[$data[0]] = array( "0" => $data[1], "1" => $data[1] ); // add short description
        }
      }
      fclose($handle);
    }
  }

  $rules = array();
  $row = 1;
  foreach (array_keys($rules_files) as $u) {
    if (($handle = fopen($rules_files[$u], "r")) !== FALSE) {
      while (($data = fgetcsv($handle, 5000, ",")) !== FALSE) {
        $num = count($data);
        $row++;
        if ($num >= 3) {
    	    $rules[$data[0]] = array( "0" => $data[1], "1" => $data[2] );
        }
      }
      fclose($handle);
    }
  }

  if ( $entry == "" ) {
    $ret = array();
    foreach (array_keys($d) as $u) {
      if ($d[$u][1] != "")
        $ret[$u] = htmlentities($d[$u][1]);
      else
        $ret[$u] = htmlentities($d[$u][0]);
    }

    echo(php_json_encode( $ret) ) ;
    return;
   } else if ( $entry == "coverage" ) {
      // breath first search
      // compute the list of items that we cannot reach in the graph (todo: should be based on a root node)
      $allItems = array_keys($d);
      $doneItems = array();
      $testThese = array("root");
      while(count($testThese) > 0) {
          $entry = array_shift($testThese);
          if (in_array($entry, $doneItems)) {
              continue;
          }
          // ok, now us this to get what is underneath
          foreach ($d as $key => $value) {
              if (strlen($rules[$entry][0]) > 0 && preg_match($rules[$entry][0], $key)) {
                  // don't add leafs, only add more branches
                  $doneItems[] = $key;
              }
          }
          foreach ($rules as $key => $value) { // try once to look into the rules as well
              if (isset($rules[$entry]) && strlen($rules[$entry][0]) > 0 && preg_match($rules[$entry][0], $key)) {
                  $testThese[] = $key;
              }
          }
      }
      // hopefully we will end up here
      $dif = array_diff($allItems, $doneItems);
      echo("<h4>".count($dif)." items not covered in graph</h4><pre>".json_encode(array_values($dif),JSON_PRETTY_PRINT)."</pre>");
      return;
  } else if ( $entry != "display" && $entry != "" ) {
      // now look through each field in rules and d to see what entries fit, return them as list
    $result = array( "name" => $entry, "children" => array() );
    foreach ($d as $key => $value) {
     if (strlen($rules[$entry][0]) > 0 && preg_match($rules[$entry][0], $key)) {
       array_push($result['children'], array( "name"=> $key,
         "leaf" => "1", "key" => $key, "description" => $value[1] ) );
     }
   }
      foreach ($rules as $key => $value) { // try once to look into the rules as well
       if (strlen($rules[$entry][0]) > 0 && preg_match($rules[$entry][0], $key)) {
         array_push($result['children'], array( "name"=> $value[1],
           "leaf" => "0", "key" => $key, "description" => $value[1] ) );
       }
     }
     echo (php_json_encode( $result ));
     return false;
   } else if ( $entry == "display" ) {
    // write out the HTML portion of the page
    echo <<< EOT
<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">	
	
    <title>Ontology</title>

    <!-- <script src="js/jquery-ui.min.js"></script> -->
    <script src="js/jquery-1.10.2.min.js"></script>

    <script src="js/d3.v3.min.js"></script>
    <script type="text/javascript" src="/js/togetherjs-min.js"></script>
    <script src="/js/ace/src-min-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
    <link rel="stylesheet" href="js/pretty/prettify.css">
    <link rel="stylesheet" href="css/bootstrap.min.css" crossorigin="anonymous">
   <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    
  </head>
  <style>

  #histogram rect {
    fill: steelblue;
  }
  #histogram rect:hover {
      fill: #F56C4E;
  }
  #histogram tick {
    color: black;
    stroke-width: 1px;
  }
  #histogram .domain {
    opacity: 0;
  }
  #histogram text.white {
    fill: white;
    text-anchor: middle;
  }
  #histogram text {
    fill: black;
    font: 10px sans-serif;
    text-anchor: middle;
  }
      

    body {
      overflow: scroll;
      margin: 0;
      font-size: 14px;
      font-family: "Helvetica Neue", Helvetica;
    }
#chart, #header, #footer {
  position: absolute;
    top: 0px;
}
#header, #footer {
 z-index: 1;
 display: block;
 font-size: 36px;
 font-weight: 300;
 text-shadow: 0 1px 0 #fff;
}
#header.inverted, #footer.inverted {
 color: #fff;
 text-shadow: 0 1px 4px #000;
}
#header {
 top: 80px;
 left: 140px;
 width: 900px;
}
#footer {
    margin-top: 20px;
    margin-left: 20px;
    text-align: right;
}
rect {
 fill: none;
  pointer-events: all;
}
pre {
  //font-size: 18px;
}
line {
 stroke: #000;
  stroke-width: 1.5px;
}
.string, .regexp {
 color: #f39;
}
.keyword {
 color: #00c;
}
.comment {
 color: #777;
  font-style: oblique;
}
.number {
 color: #369;
}
.class, .special {
 color: #1181B8;
}
a:link, a:visited {
 color: #000;
  text-decoration: none;
}
a:hover {
 color: #666;
}
.hint {
 position: absolute;
    left: 0;
    top: 45px;
 width: 240px;
 font-size: 12px;
 color: #999;
}

.link {
 float: right;
 margin: 10px;
 font-size: 12px;
 color: #999;
}
    .node circle {
      cursor: pointer;
      fill: #fff;
      stroke: steelblue;
      stroke-width: 1.5px;
    }
    .node text {
      font-size: 11px;
    }
    path.link {
      fill: none;
      stroke: #ccc;
      stroke-width: 1.5px;
    }
    
    #body {
    //margin-top: 50px;
    }
    
    .highlight { background-color: yellow }
    dt {
	color: #337ab7;
	font-weight: 400;
	font-size: 1.2em;
    }
    dd { margin-bottom: 10px; }
    #search-summary {
	color: gray;
	font-size: 10pt;
	font-weight: 200;
	margin-bottom: 10px;
    }
    .search-results {
	padding-bottom: 20px;
    }
    .item-name {
	font-weight: 600;
    }
    #entries {
	border: 1px solid lightgrey;
	border-radius: 5px;
	margin-left: 20px;
	padding: 5px;
	margin-bottom: 10px;
	margin-top: 10px;
    }
    .entry {
	color: black;
    }



    .node {
        cursor: pointer;
	  }

  .overlay{
        //background-color:#FFF;
	  }

  .node circle {
      fill: #fff;
          stroke: steelblue;
	      stroke-width: 1.5px;
	        }

  .node text {
      font-size:10px;
          font-family:sans-serif;
	    }

  .link {
      fill: none;
          stroke: #ccc;
	      stroke-width: 1.5px;
	        }

  .templink {
      fill: none;
          stroke: red;
	      stroke-width: 3px;
	        }

  .ghostCircle.show{
        display:block;
	  }

  .ghostCircle, .activeDrag .ghostCircle{
         display: none;
	   }
	   
/*! Color themes for Google Code Prettify | MIT License | github.com/jmblog/color-themes-for-google-code-prettify */
.prettyprint{background:#efecf4;font-family:Menlo,Bitstream Vera Sans Mono,DejaVu Sans Mono,Monaco,Consolas,monospace;border:0!important}.pln{color:#19171c}ol.linenums{margin-top:0;margin-bottom:0;color:#7e7887}li.L0,li.L1,li.L2,li.L3,li.L4,li.L5,li.L6,li.L7,li.L8,li.L9{padding-left:1em;background-color:#efecf4;list-style-type:decimal}@media screen{.str{color:#2a9292}.kwd{color:#955ae7}.com{color:#7e7887}.typ{color:#576ddb}.lit{color:#aa573c}.pun{color:#19171c}.opn{color:#19171c}.clo{color:#19171c}.tag{color:#be4678}.atn{color:#aa573c}.atv{color:#398bc6}.dec{color:#aa573c}.var{color:#be4678}.fun{color:#576ddb}}

	.text-white {
	   font-weight: 300;
	   letter-spacing: 0.1em;
        }

    </style>
    <body style="overflow: hidden;">

      <header>
	<div class="collapse bg-dark" id="navbarHeader">
	  <div class="container-fluid" style="background-color: #222;">
	    <div class="row">
	      <div class="col-sm-8 col-md-7 py-4">
		<h4 class="text-white">About</h4>
		<p class="text-white">Explore the data provided by the NIDA/NIH funded Adolescent Brain Cognitive Development (ABCD) study. Currently we are sharing 131 instruments with 44,852 individual measures.</p>
	      </div>
	      <div class="col-sm-4 offset-md-1 py-4">
		<h4 class="text-white">Contact</h4>
		<p><a href="#" class="text-white">Data Analysis and Informatics Core of ABCD</a></p>
	      </div>
	    </div>
	    <div class="row">
	      <div class="col-sm-4">
	      	   <h4 class="text-white">Data Dictionary</h4>
	      	   <p class="text-white">A plain list of the data dictionary.</p>
		  <a style="margin-bottom: 10px;" class="btn btn-primary text-white" target="data_dictionary" href="/applications/Ontology/translate.php?query=display" title="List the entries of the data dictionary as a continous table.">Data Dictionary</a>
		  </div>
	      <div class="col-sm-4">
	      	   <h4 class="text-white">Structures</h4>
	      	   <p class="text-white">Change the structure displayed on the left.</p>
		  <a style="margin-bottom: 10px;" class="btn text-white btn-primary" href="#" id="open-edit-window" title="Show the rules used to define the hierarchy displayed. These rules are used to group entries from the data dictionary.">Edit Graph</a><br/>
	      </div>	    
	      <div class="col-sm-4">
	      	   <h4 class="text-white">Coverage</h4>
	      	   <p class="text-white">Some measures might not be reached from the graph.</p>
		  <a style="margin-bottom: 10px;" class="btn text-white btn-primary" href="hierarchy.php?entry=coverage" title="Show items that cannot be reached from the graph.">Coverage</a><br/>
	      </div>	    
	    </div>	    
	  </div>
	</div>
	<div class="navbar navbar-dark bg-dark box-shadow">
	  <div class="container-fluid d-flex justify-content-between">
	    <a href="#" class="navbar-brand d-flex align-items-center">
	      ABCD Ontology Viewer
	    </a>
	    <ul class="navbar-nav mr-auto">
	      <li class="nav-item" title="Back to report page">
	         <a class="nav-link text-white" target="report" href="/index.php">Home</a>
	      </li>
	    </ul>

<!-- 	    <div class="" id="navbarSupportedContent">
	      <ul class="navbar-nav mr-auto">
		<li class="nav-item">
		  <a class="nav-link text-white" target="data_dictionary" href="/applications/Ontology/translate.php?query=display" title="List the entries of the data dictionary as a continous table.">Data Dictionary</a>
		</li>
		<li class="nav-item">
		  <a class="nav-link text-white" href="#" id="open-edit-window" title="Show the rules used to define the hierarchy displayed. These rules are used to group entries from the data dictionary.">Edit</a>
		</li>
	      </ul>
	    </div> -->
	    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarHeader" aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
	      <span class="navbar-toggler-icon"></span>
	    </button>
	  </div>
	</div>
      </header>
      
<!--       
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="#">Data Portal Ontology Viewer</a>
          <div class="nav-collapse collapse">
            <ul class="nav">
              <li class="active"><a href="/index.php">Home</a></li>
              <li><a target="data_dictionary" href="/applications/Ontology/translate.php?query=display" title="List the entries of the data dictionary as a continous table.">Data Dictionary</a></li>
	      <li><a href="#" id="open-edit-window" title="Show the rules used to define the hierarchy displayed. These rules are used to group entries from the data dictionary.">Edit</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div> -->

    <div class="container-fluid bg-light">
      
      <div class="row">
	<div class="col-md-6 d-none d-md-block" id="left" style="background-color: #EEE;">
	  <div style="overflow-y:scroll;">
	    <div id="body">
	      <div id="footer">	
		<span id="project_name">ABCD</span> Ontology
		<div class="hint">click to expand or collapse, drag to pan, scroll-wheel to zoom</div>
	      </div>
	    </div>
	    <div id="tree-container" style="background-color: #FFF;"></div>
	  </div>
	</div>
	<div class="col-md-6" id="right" style="overflow-y: scroll;">
	  <div class="row-fluid" style="margin-top: 50px;">
	    <div class="col-md-11">		    
              <div class="form-group">
		<!-- <label for="search">Search</label> -->
        <div class="input-group">
	   	   <input class="form-control input-lg" id="search" type="text" autocomplete="off">
           <div class="input-group-append">
              <div class="input-group-text btn" id="search-help" data-toggle="modal" data-target="#help-dialog">?</div>
           </div>
        </div>
          <span style="color: gray; margin-left: 20px; font-weight: 200;">examples: intelligence, schizophrenia, ADHD</span>
	      </div>
	    </div>
	  </div>
	  <div class="row-fluid" style="position: relative;">
	    <div class="col-md-11">
	      <div id="search-summary"></div>
	    </div>
	  </div>
	  <div class="row-fluid" style="position: relative; margin-top: 10px;">
	    <div class="col-md-11" style="min-height: 80%;">
	      <dl class="search-results" id="results"></dl>
	    </div>
	  </div>	
	</div>
      </div>

    </div>
      
    <div id="edit-window" style="display: none;" class="modal fade">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Edit annotation rules</h4>
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          </div>
          <div class="modal-body">
	    <div id="editor" style="height: 600px;">Trying to load data for this project...<br/></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="overwriteRules();">Save changes (overwrites old file)</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <div class="modal" tabindex="-1" role="dialog" id="help-dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">How to search</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          <p>The search field supports text searches across all entries of the data dictionary. This includes element names and descriptions, instrument names, instrument short names, and alias entries.</p>
            <p>Special search options include:
              <ul>
                <li>If a search term could not be found as typed the word stem will be used instead. The search <i>Italians</i> will also search for <i>Italian</i>.</li>                
                <li>If a search term could not be found synonyms of the search term will be used. The search term <i>booze</i> will also search for <i>liquor</i>.</li>
                <li>Search using the wild-card ('*') character. The search term <i>fsv_*caudate</i> will find all freesurfer caudate measures.</li>
                <li>Search using regular expressions. The search term <i>_[0-9]+_</i> will find all terms that have numbers between underscore characters.</li>
              </ul>
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    
              
    <script src="js/jquery-3.2.1.min.js" crossorigin="anonymous"></script>
    <script src="js/popper.min.js" crossorigin="anonymous"></script>
    <script src="js/bootstrap.min.js" crossorigin="anonymous"></script>
    
   <script type="text/javascript">
	   var editor = null;
       searchTerm = "$searchTerm";
       
       jQuery(document).ready(function() {
           // open modal if user wants to edit the model
	   jQuery("#open-edit-window").click(function() {
	       // fill in text for ace
               jQuery.ajax({
		   url: '/data/'+"$project_name"+'/data_uncorrected/'+"$project_name"+'_datadictionary_rules.csv', 
		   data: {},
		   success: function(data) {
	               if (editor == null) {
			   editor = ace.edit("editor");
	               }
                       //jQuery('#editor').html(data);
	               editor.setValue(data);
                       editor.setTheme("ace/theme/monokai");
                       editor.getSession().setMode("ace/mode/plain_text");
		   },
		   error: function() {
	               if (editor == null) {
			   editor = ace.edit("editor");
	               }
	               editor.setValue('root,/(H_Suum|H_all)/,\"$project_name\"' +
                                       'H_Suum,/(mean|total)/i,\"summary measures\"' +
                                       'H_all,/.*/,\"all\"');
                       editor.setTheme("ace/theme/monokai");
                       editor.getSession().setMode("ace/mode/plain_text");                
		   },
		   cache: false
               });
	       
               jQuery('#edit-window').modal('show');
           });
	   if (typeof searchTerm !== 'undefined' && searchTerm != "") {
	       jQuery('#search').val(searchTerm);
	       setTimeout(function() {
	    	   var e = jQuery.Event('keyup');
	   	   e.which = 13;
	    	   jQuery('#search').trigger(e);
               }, 1000);
	   }
       });
       
       function overwriteRules() {
           jQuery.post('saveRules.php', { "project": "$project_name", "text": editor.getValue() }, function(data) {
	   // ignore the output, its visible in firebug, that should be enough for debugging
         });
	 jQuery('#edit-window').modal('hide');
      }

    </script>

    <script src="js/dnTree.js"></script>
    <script src="js/pretty/prettify.js"></script>
    <script src="js/highlight-js.js"></script>
    <script type="text/javascript" src="js/all4.js"></script>    
</body>
</html> 
EOT;
    
    return;
  } else {
    echo "error: Unknown query string. Only \"entry\" is supported currently.";
  }
?>

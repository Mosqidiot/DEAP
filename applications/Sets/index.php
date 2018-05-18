<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Sets of Variables</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    
    <!-- Le styles -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="css/fontawesome-all.min.css" rel="stylesheet">                          
    <!-- <link href="custom_styles.css" rel="stylesheet"> -->
    <!-- Latest compiled and minified CSS -->
    
    <!-- <link href="css/select2.min.css" rel="stylesheet" /> -->
    <link href="css/select2-bootstrap.css" rel ="stylesheet" type="test/css">
    
    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
    
    <!-- Fav and touch icons -->
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/img/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/img/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/img/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="/img/apple-touch-icon-57-precomposed.png">
    <link rel="shortcut icon" href="/img/favicon.png">
    <link href="css/bootstrap-toggle.min.css" rel="stylesheet">
    <link href="css/bootstrap-editable.css" rel="stylesheet"/>
    <!-- <link href="css/jquery-ui.min.css" rel="stylesheet"> -->
    <link rel="stylesheet" href="css/style.css">
    
<?php
session_start();
include("../../code/php/AC.php");
$user_name = check_logged();
if (isset($_SESSION['project_name']))
    $project_name = $_SESSION['project_name'];
else {
    $projs = json_decode(file_get_contents('/var/www/html/code/php/getProjectInfo.php'),TRUE);
    if ($projs)
        $project_name = $projs[0]['name'];
    else
        $project_name = "Project01";
}

$model = "";
if (isset($_GET['model'])){
    $model = $_GET['model'];
}

echo('<script type="text/javascript"> user_name = "'.$user_name.'";model_name = "'.$model.'"; project_name = "'.$project_name.'"; </script>');

?>


  </head>
  
  <body spellcheck="false">
    
    <nav class="navbar navbar-expand-lg  navbar-light bg-light">
      <a class="navbar-brand" href="#">Sets of Variables</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="/index.php">Home <span class="sr-only">(current)</span></a>
          </li>
        </ul>
      </div>
    </nav>
    
    
    <div class="container-fluid" style="margin-top: 10px;">
      <div class="row">
        <div class="col-md-12">
    <p class="tut-p">Define sets of variables that can be used in other DEAP applications. Start by searching for a measure of interest using the search field on the right. Highlight the set on the left you want to add the measure to and press the measures "+" button for that variable. If you attempt to change a set marked as "public", a copy of that set will be created. You can change entries in the copy but not in the "public" set.</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div>
            <button class="add-set" title="Add a new set">+</button>
            <div style="color: gray; margin-left: 20px; font-weight: 200; position: relative; left: 20px; top: 25px;">There are currently <span class="num-sets"></span> sets.</div>
          </div>
          <div id="cards" style="margin-left: 0px;"></div>
        </div>
        
        <div class="col-md-6" id="right">
          <div class="row" style="margin-top: 50px;">
            <div class="col-md-11">                 
              <div class="form-group">
                <input class="form-control input-lg" id="search" type="text" autocomplete="off">
                <span style="color: gray; margin-left: 20px; font-weight: 200;">examples: intelligence, schizophrenia</span>
              </div>
            </div>
          </div>
          <div class="row" style="position: relative;">
            <div class="col-md-12">
              <div id="search-summary"></div>
            </div>
          </div>
          <div class="row" style="position: relative; margin-top: 10px;">
            <div class="col-md-12" style="min-height: 80%;">
              <dl class="search-results" id="results"></dl>
            </div>
          </div>        
          
        </div>
      </div>
      <div class="row">
        <div class="col-md-12" style="margin-bottom: 20px;">
          <hr>
          <i>A service provided by the Data Analysis and Informatics Core of ABCD.</i>
        </div>
      </div>
    </div>
    
    <div id="contextMenu" class="dropdown clearfix">
      <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" style="display:block;position:static;margin-bottom:5px;">
        <li><a tabindex="-1" href="#" action="delete">Delete</a></li>
        <li class="divider"></li>
        <li><a tabindex="-1" href="#">Ignore</a></li>
      </ul>
    </div>
    
  </body>
  
  <script src="js/jquery-3.2.1.min.js"></script>
  <script src="js/jeditable.js"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/d3.v3.min.js"></script>
  <script type="text/javascript" src="/js/d3/d3.layout.js"></script>
  <script src="js/highlight-js.js"></script>
  <script src="js/all.js"></script>
  

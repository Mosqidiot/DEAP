<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Co-occurrence</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    
    <!-- Le styles -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <!-- <link href="css/fontawesome-all.min.css" rel="stylesheet">                           -->
    <link href="../NewDataExpo/css/fontawesome-all.min.css" rel="stylesheet">
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
    <link href="css/select2.min.css" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="css/style.css">
    
<?php
session_start();
include("../../code/php/AC.php");
$user_name = check_logged();
echo('<script type="text/javascript"> user_name = "'.$user_name.'";model_name = "'.$model.'"; project_name = "'.$project_name.'"; </script>');

?>
  </head>
  
  <body spellcheck="false">
    
    <nav class="navbar navbar-expand-lg  navbar-light bg-light">
      <a class="navbar-brand" href="#">Co-occurrence</a>
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
    <p class="tut-p">The co-occurrence matrix for sets list the combinations of variables present in the data. For factor variables we are using the factor levels, for continuous variables we use the lower and upper quartiles (.25, .75) to produce three categories. If less than 10 levels are found for a continuous variable it is treated as a factor variable. Select a set from the drop-down menu to start the algorithm. Co-occurrent entries between all variables in the selected set are displayed in a tree-view. Often occurring combinations of values use up more space.</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <select id="sets-list"></select>
          <div id="treemap" style="margin-left: 0px;margin-top: 20px;"></div>
        </div>        
      </div>
      <div class="row">
        <div class="col-md-12" style="margin-bottom: 20px;">
          <hr>
          <i>A service provided by the Data Analysis and Informatics Core of ABCD.</i>
        </div>
      </div>
    </div>
    
  </body>
  
  <script src="js/jquery-3.2.1.min.js"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/select2.full.min.js"></script>
  <script src="js/d3.v3.min.js"></script>
 <!--  <script type="text/javascript" src="/js/d3/d3.layout.js"></script> -->
 <!--  <script src="js/highlight-js.js"></script> -->
  <script src="js/all-cooccurrence.js"></script>
  
</html>
    

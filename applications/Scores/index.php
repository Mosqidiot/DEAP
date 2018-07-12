<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Score Calculation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/github.min.css" rel="stylesheet">
    <!-- <link href="css/highlight.min.css" rel="stylesheet"> -->
    <link href="css/school-book.css" rel="stylesheet">
    <link href="css/simplemde.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
    <link href="../NewDataExpo/css/fontawesome-all.min.css" rel="stylesheet">
    <style>
body {
    //padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
}
#editor { 
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}
.editor-wrapper {
    position: relative;
    height:350px;
    margin-top:10px;
}
.row-fluid{   
    margin-top:10px;
    margin-left:5px;
    margin-right:5px;
    
}
button.btn.active {
    background-color: lightgreen;
}
.list-unstyled {
    padding-left: 0;
    margin-left:0;
    list-style: none;
}
label {
    line-height: 0.5em;
}
h3 {
    margin-top: 10px;
}
.bar rect {
  shape-rendering: crispEdges;
}

.bar text {
  fill: #999999;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
text{
  font-size:0.75em
}
.recipe-block{
  background-color:#f8f9fa!important;
  padding-top:10px;
  margin-top:25px;
  padding-bottom:25px;
  margin-left: 0px;
  margin-right: 0px;
}
.recipe-block:focus-within{
    //background-color:#e8f9fa!important;
  border: 1px solid green;
    border-radius: 3px;
}
.delete-button, .save-button{
  margin-left: 10px;
  float:right;
}
.loader {
    margin:65px;
    border: 16px solid #f3f3f3; /* Light grey */
    border-top: 16px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
    <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="css/fontawesome-all.min.css" rel="stylesheet">                          
    <!-- Latest compiled and minified CSS -->
    
    <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/css/select2.min.css" rel="stylesheet" /> -->
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
    <!--             <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css" rel="stylesheet"> -->
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
      <a class="navbar-brand" href="#">Score Calculation</a>
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
      <div class="row" id="first-item">
        <div class="col-md-12">
    <p class="tut-p">This application allows the user to create and share new measures in DEAP. The computations are run in your web-browser and are written in the JavaScript language. This could be as simple as a different quantization of an existing continuous variable or as complex as a new t-score table used to map values to some standard sample. DEAP will store the new measures, which makes them available to the statistical analysis packages on DEAP.</p>
          <div style = "z-index:9; margin-top: -20px;">
             <i class="fa fa-plus-circle" onclick="add_new_recipe()" style="font-size:78px;color:red;margin:10px;cursor: pointer;"><span style="font-size: 12pt;">Add a new calculation</span></i>
          </div>
        </div>
      </div>
    </div>
    <!--
    <div class="row">
      <div class="col-md-12">
        <div>
	  <div class="input-group input-group-sm mb-3">
  	    <div class="input-group-prepend">
              <span class="input-group-text" id="inputGroup-sizing-sm">New variable name</span>
            </div>
            <input type="text" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value = "zero_mean_age">
          </div>
          <textarea id="display">
            ### Placeholder
            
            You will see this text if you have not done something here.
          </textarea>
	  
        </div>
      </div>
      
    </div> --!>
  </body>
  
  <script src="js/highlight.min.js"></script>
  <script src="js/simplemde.min.js"></script>
  <script type="text/javascript" src="js/MathJax-2.7.4/MathJax.js?config=TeX-AMS-MML_SVG-full"></script>
  <script src="js/jquery-3.3.1.min.js"></script>
  <!-- <script src="js/popper.min.js"></script> -->
  <script src="js/bootstrap.min.js"></script>
  <script src="js/dataframe-min.js"></script>
  <script src="js/all.js"></script>
  <script src="../../js/d3/d3.v3.min.js"></script>
  
</html>

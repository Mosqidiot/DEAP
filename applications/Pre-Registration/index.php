<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Pre-Registration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
            <link href="css/bootstrap.min.css" rel="stylesheet">
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
                      line-height: 1.1em;
                      }
            </style>
           <!--  <link href="/css/bootstrap-responsive.css" rel="stylesheet"> -->
            <link href="css/fontawesome-all.min.css" rel="stylesheet">                          
<!-- Latest compiled and minified CSS -->
               
            <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/css/select2.min.css" rel="stylesheet" /> -->
            <link href="https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-theme/0.1.0-beta.10/select2-bootstrap.css" rel ="stylesheet" type="test/css">

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
            <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css" rel="stylesheet">
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
      <a class="navbar-brand" href="#">Pre-Registration</a>
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


    <div class="container" style="margin-top: 40px;">
      <div class="row col-md-12 tut-p">
    In order to make hypothesis registration as easy as possible this platform supports the structured generation of hypothesis. This includes the definition of the hypothesis with variable selection and data transformations. Additionally, DEAP provides sample texts for the following sections that may be part of your hypothesis registration:
    <ul>
      <li class="intext">Sampling Plan</li>
      <li class="intext">Design Plan</li>
      <li class="intext">Analysis Plan</li>
      <li class="intext">Analysis Scripts</li>
    </ul>
    We suggest to use the Open Science Foundation (<a href="https://osf.io">OSF</a>) framework to register hypothesis.
      </div>
      <div class="row col-md-12 tut-p">
    The DEAP portal supports a two step approach for hypothesis pre-registration. In a restricted mode (I) users are able to explore the data and see the marginal data distributions across all data domains. This is sufficient to identify suitable data transformations and shows the effects of data transformation and censoring for each variable. It also allows users to specify a subset of the participants for the tested hypothesis. The users can specify the hypothesis for example in the generalized additive mixed model module by defining the dependent and independent variables and all covariates of non interest. In the restricted mode the actual hypothesis test cannot be performed as it would result in the display of scatter plots and the premature calculation of effect sizes and significance values. Users are able to save and bookmark their hypothesis together with the subsetting for later analysis.
      </div>
      <div class="row col-md-12 tut-p">
    In the unrestricted mode (II) users have all the abilities of the restricted mode I as well as they are able to run their saved statistical analysis to test hypothesis.
      </div>
      <div class="row col-md-12 tut-p">
	<center>
	  <div class="btn-group btn-group-toggle" data-toggle="buttons" id="mode-change">
	    <label class="btn btn-primary active mode-buttons">
	      <input type="radio" name="options" id="option1" autocomplete="off" checked>Restricted Mode I</br>Save for Pre-Registration</label>
	    <label class="btn btn-primary mode-buttons">
	      <input type="radio" name="options" id="option2" autocomplete="off">Unrestricted Mode II</br>Run hypothesis tests</label>
	  </div>
	</center>
      </div>
    </div>
</body>

<script src="js/jquery-3.2.1.min.js"></script>
<script src="js/popper.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script>
    jQuery(document).ready(function() {
	// read the current mode if it exists and set the initial value
	
	jQuery('#mode-change :input').change(function() {
	    // store the mode change globally for the user and the project
	    
	});
    });
</script>

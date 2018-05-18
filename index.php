<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Data Exploration and Analysis Portal</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link href="css/bootstrap.css" rel="stylesheet">
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

<?php 
    $status = session_status();
    if($status == PHP_SESSION_NONE){
       session_start();
    }
//$_SESSION['project_name'] = "ABCD";

  if (isset($_SESSION['project_name'])) {
     echo('<script type="text/javascript"> project_name = "ABCD";</script>'."\n");
  }

  include("code/php/AC.php");
  $user_name = check_logged(); /// function checks if visitor is logged.
  echo('<script type="text/javascript"> user_name = "'.$user_name.'"; </script>'."\n");
  // print out all the permissions
  $permissions = list_permissions_for_user($user_name);
  $p = '<script type="text/javascript"> permissions = [';
  foreach($permissions as $perm) {
    $p = $p."\"".$perm."\",";
  }
  echo ($p."]; </script>\n");

  $admin = false;
  if (check_role( "admin" )) {
     $admin = true;
  }
  $can_qc = false;
  if (check_permission( "can-qc" )) {
     $can_qc = true;
  }
  echo('<script type="text/javascript"> admin = '.($admin?"true":"false").'; can_qc = '.($can_qc?"true":"false").'; </script>');
?>

    <style>
      body {
      padding-bottom: 40px;
      color: #5a5a5a;
      }
      h1, h2 {
        font-weight: normal;
      }
      /* CUSTOMIZE THE NAVBAR
      -------------------------------------------------- */
      /* Special class on .container surrounding .navbar, used for positioning it into place. */
      .navbar-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      margin-top: 20px;
      margin-bottom: -90px; /* Negative margin to pull up carousel. 90px is roughly margins and height of navbar. */
      }
      .navbar-wrapper .navbar {
      }
      /* Remove border and change up box shadow for more contrast */
      .navbar .navbar-inner {
      border: 0;
      -webkit-box-shadow: 0 2px 10px rgba(0,0,0,.25);
      -moz-box-shadow: 0 2px 10px rgba(0,0,0,.25);
      box-shadow: 0 2px 10px rgba(0,0,0,.25);
      }
      /* Downsize the brand/project name a bit */
      .navbar .brand {
      padding: 14px 20px 16px; /* Increase vertical padding to match navbar links */
      font-size: 16px;
      font-weight: normal;
      text-shadow: 0 -1px 0 rgba(0,0,0,.5);
      }
      /* Navbar links: increase padding for taller navbar */
      .navbar .nav > li > a {
      padding: 15px 20px;
      }
      /* Offset the responsive button for proper vertical alignment */
      .navbar .btn-navbar {
      margin-top: 10px;
      }
      /* CUSTOMIZE THE NAVBAR
      -------------------------------------------------- */
      /* Carousel base class */
      .carousel {
      margin-bottom: 30px;
      }
      .carousel .container {
      position: relative;
      z-index: 9;
      }
      .carousel-control {
      height: 80px;
      margin-top: 0;
      font-size: 120px;
      text-shadow: 0 1px 1px rgba(0,0,0,.4);
      background-color: transparent;
      border: 0;
      }
      .carousel .item {
      height: 500px;
      }
      .carousel img {
      position: absolute;
      top: 0;
      left: 0;
      min-width: 100%;
      height: 500px;
      }
      .carousel-caption {
      background-color: transparent;
      position: static;
      max-width: 550px;
      padding: 0 20px;
      margin-top: 200px;
      }
      .carousel-caption h1,
      .carousel-caption .lead {
      margin: 0;
          margin-bottom: 20px;
      line-height: 1.25;
      color: #fff;
      text-shadow: 0 1px 1px rgba(0,0,0,.4);
      }
      .carousel-caption .btn {
      margin-top: 10px;
      }
      /* MARKETING CONTENT
      -------------------------------------------------- */
      /* Center align the text within the three columns below the carousel */
      .marketing .span4 {
      text-align: left;
      background-color: #EEEEEE;
      border-radius: 5px;
      margin-bottom: 5px;
      }
      .marketing h2 {
      font-weight: normal;
      padding-left: 10px;
      }
      .marketing .span4 p {
      margin-left: 10px;
      margin-right: 10px;
      }
      /* Featurettes
      ------------------------- */
      .featurette-divider {
      margin: 20px 0; /* Space out the Bootstrap <hr> more */
      }
      .featurette {
      padding-top: 120px; /* Vertically center images part 1: add padding above and below text. */
      overflow: hidden; /* Vertically center images part 2: clear their floats. */
      }
      .featurette-image {
      margin-top: -120px; /* Vertically center images part 3: negative margin up the image the same amount of the padding to center it. */
      }
      /* Give some space on the sides of the floated elements so text doesn't run right into it. */
      .featurette-image.pull-left {
      margin-right: 40px;
      }
      .featurette-image.pull-right {
      margin-left: 40px;
      }
      /* Thin out the marketing headings */
      .featurette-heading {
      font-size: 50px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: -1px;
      }
      /* RESPONSIVE CSS
      -------------------------------------------------- */
      @media (max-width: 979px) {
      .container.navbar-wrapper {
      margin-bottom: 0;
      width: auto;
      }
      .navbar-inner {
      border-radius: 0;
      margin: -20px 0;
      }
      .carousel .item {
      height: 500px;
      }
      .carousel img {
      width: auto;
      height: 500px;
      }
      .featurette {
      height: auto;
      padding: 0;
      }
      .featurette-image.pull-left,
      .featurette-image.pull-right {
      display: block;
      float: none;
      max-width: 40%;
      margin: 0 auto 20px;
      }
      }
      @media (max-width: 767px) {
      .navbar-inner {
      margin: -20px;
      }
      .carousel {
      margin-left: -20px;
      margin-right: -20px;
      }
      .carousel .container {
      }
      .carousel .item {
      height: 300px;
      }
      .carousel img {
      height: 300px;
      }
      .carousel-caption {
      width: 65%;
      padding: 0 70px;
      margin-top: 100px;
      }
      .carousel-caption h1 {
      font-size: 30px;
      }
      .carousel-caption .lead,
      .carousel-caption .btn {
      font-size: 18px;
      }
      .marketing .span4 + .span4 {
      margin-top: 40px;
      }
      .featurette-heading {
      font-size: 30px;
      }
      .featurette .lead {
      font-size: 18px;
      line-height: 1.5;
      }
      }

      .table-value {
        text-align: right;
      }
.btn {
        display: initial;
         }
   
    </style>
    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
	<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
    <!-- Fav and touch icons -->
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="img/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="img/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="img/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="img/apple-touch-icon-57-precomposed.png">
    <link rel="shortcut icon" href="img/favicon.png">

  </head>
  <body>
    <div id="change-password-box" class="modal hide fade" tabindex="-1" data-backdrop="static" data-keyboard="false">
      <div class="modal-header">
           <h4> Change Password </h4>
      </div>
      <div class="modal-body">
          <input type="password" id="password-field1" placeholder="*******" autofocus><br/>
          <input type="password" id="password-field2" placeholder="type again">
      </div>
      <div class="modal-footer">
          <button type="button" data-dismiss="modal" class="btn">Cancel</button>
          <button type="button" data-dismiss="modal" class="btn btn-primary" onclick="changePassword();">Submit</button>
      </div>
    </div>

    <div id="about-box-info" class="modal hide fade" tabindex="-1" data-backdrop="static" data-keyboard="false">
      <div class="modal-body">
        <p>The Data Exploration and Analysis Portal was developed as part of the Adolescent Brain, Cognitive Development Study (ABCD). For more information please visit <a href="//abcdstudy.org">abcdstudy.org</a>.
      </div>
      <div class="modal-footer">
          <button type="button" data-dismiss="modal" class="btn btn-primary">Close</button>
      </div>
    </div>

    <div id="contact-box-info" class="modal hide fade" tabindex="-1" data-backdrop="static" data-keyboard="false">
      <div class="modal-header">
           <h4> Contacts </h4>
      </div>
      <div class="modal-body">
          <p>Questions should be directed to Hauke Bartsch (hbartsch at ucsd.edu) at the Center for Multimodal Imaging Genetics (CMIG) at UC San Diego.</p>
          <p>UCSD Address:<br/>
             9500 Gilman Drive<br/>
             Mail code 0841<br/>
             La Jolla, CA 92093
          </p>
          <p>Street Address:<br/>
             9452 Medical Center Drive<br/>
             La Jolla, CA 92037
          </p>
      </div>
      <div class="modal-footer">
          <button type="button" data-dismiss="modal" class="btn btn-primary">Close</button>
      </div>
    </div>



    <!-- NAVBAR
	 ================================================== -->
    <div class="navbar-wrapper">
      <!-- Wrap the .navbar in .container to center it within the absolutely positioned parent. -->
      <div class="container">
	<div class="navbar navbar-inverse">
	  <div class="navbar-inner">
	    <!-- Responsive Navbar Part 1: Button for triggering responsive navbar (not covered in tutorial). Include responsive CSS to utilize. -->
	    <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
	      <span class="icon-bar"></span>
	      <span class="icon-bar"></span>
	      <span class="icon-bar"></span>
	    </a>
	    <a class="brand" href="#">ABCD DEAP v0.2</a>
	    <div class="nav-collapse collapse">
	      <ul class="nav">
		<li class="active"><a href="#">Home</a></li>
                <li class="dropdown">
                   <a href="#" class="dropdown-toggle" data-toggle="dropdown">Project: <span class="current-project">unknown</span><b class="caret"></b></a>
                   <ul class="dropdown-menu" id="swatch-menu">
                   </ul>
                </li>
		<li id="about-box"><a data-toggle="modal" href="#about-box-info">About</a></li>
		<li><a href="#contact-box-info" data-toggle="modal">Contact</a></li>
                <li id="current_user_name"></li>
		<!-- Read about Bootstrap dropdowns at http://twitter.github.com/bootstrap/javascript.html#dropdowns -->
		<li class="dropdown">
		  <a href="#" class="dropdown-toggle" data-toggle="dropdown">Installed Components <b class="caret"></b></a>
		  <ul class="dropdown-menu">
		    <li><a href="/applications/NewDataExpo/" title="single time point">Multi-level Regression using GAMM4</a></li>
		    <li><a href="/applications/Overview/">Overview</a></li>
		    <li><a href="/applications/OverviewMeasures/">Overview (Measures)</a></li>
		    <li><a href="/applications/Ontology/hierarchy.php?entry=display">Ontology Viewer</a></li>
		    <li><a href="/applications/Scores/index.php">Score Calculations</a></li>
		    <li><a href="/applications/Sets/index.php">Sub Setting Measures</a></li>
		    <li><a href="/applications/Filter/index.php">Sub Setting Participants</a></li>
		    <li><a href="/applications/ModelBuilder/index.php">Model Builder</a></li>
		    <li><a href="/applications/medications/index.php">Medications</a></li>
            <li><a href="/applications/dimensional-embedding/index.php">Multi-dimensional Embedding (t-SNE)</a></li>

<?php if ($admin) : ?>
		    <li class="divider"></li>
		    <li class="nav-header">Setup</li>
		    <li><a href="/applications/DataAdmin/">data administration</a></li>
		    <li><a href="/applications/User/admin.php">user administration</a></li>
		    <li><a href="/applications/Dashboard/">Dashboard</a></li>
<?php endif; ?>
		  </ul>
		</li>
                <li class="dropdown">
                   <a href="#" class="dropdown-toggle" data-toggle="dropdown">User: <span class="current_user">unknown</span><b class="caret"></b></a>
                   <ul class="dropdown-menu" id="user-menu">
                         <li><a href="#change-password-box" data-toggle="modal">change password</a></li>
                         <li><a href="#" onclick="logout();">logout</a></li>
                   </ul>
                </li>

	      </ul>

	    </div><!--/.nav-collapse -->
	  </div><!-- /.navbar-inner -->
	</div><!-- /.navbar -->
      </div> <!-- /.container -->
    </div><!-- /.navbar-wrapper -->
    <!-- Carousel
	 ================================================== -->
    <div id="myCarousel" class="carousel slide">
      <div class="carousel-inner">
	<div class="item active">
	  <img src="img/background06.jpg" alt="">
	  <div class="container">
	    <div class="carousel-caption">
	      <h1 class="current-project"></h1>
	      <p class="lead current-project-description"></p>
	    </div>
	  </div>
	</div>

	<div class="item">
	  <img src="img/background01.jpg" alt="">
	  <div class="container">
	    <div class="carousel-caption">
	      <h1>Statistical Analysis</h1>
	      <p class="lead">Online statistical analysis using the R-project and HTML5 based visualization.</p>
	      <a class="btn btn-large btn-primary" href="/FAQ.php#WhatIsR">What is R?</a>
	    </div>
	  </div>
	</div>
	<div class="item">
	  <img src="img/background02.jpg" alt="">
	  <div class="container">
	    <div class="carousel-caption">
	      <h1>Surface based statistics</h1>
	      <p class="lead">The statistical analysis can be performed on a vertex level with FDR correction. Surfaces can be manipulated in 3D.</p>
	      <a class="btn btn-large btn-primary" href="/FAQ.php#HowToWebGL">How to enable WebGL</a>
	    </div>
	  </div>
	</div>
	<div class="item">
	  <img src="img/background03.jpg" alt="">
	  <div class="container">
	    <div class="carousel-caption">
	      <h1>Statistical output</h1>
	      <p class="lead">Enriched R summary statistics available out of the box. Expert mode allows for interaction with R engine.</p>
	      <a class="btn btn-large btn-primary" href="/FAQ.php#WhatIsExpertMode">What is the Expert Mode?</a>
	    </div>
	  </div>
	</div>
	<div class="item">
	  <img src="img/background04.jpg" alt="">
	  <div class="container">
	    <div class="carousel-caption">
	      <h1>Image Viewer</h1>
	      <p class="lead">Show registered multi-modality image data to correlate gray and white matter anatomy.</p>
	      <a class="btn btn-large btn-primary" href="/FAQ.php#HowProvideData">How do I provide data?</a>
	    </div>
	  </div>
	</div>
	<div class="item">
	  <img src="img/background05.jpg" alt="">
	  <div class="container">
	    <div class="carousel-caption">
	      <h1>Development</h1>
	      <p class="lead">Build using web-technology like HTML5's WebGL and JavaScript.</p>
	      <a class="btn btn-large btn-primary" href="/FAQ.php#WhatIsHTML5">What is HTML5?</a>
	    </div>
	  </div>
	</div>
      </div>
      <a class="left carousel-control" href="#myCarousel" data-slide="prev">&lsaquo;</a>
      <a class="right carousel-control" href="#myCarousel" data-slide="next">&rsaquo;</a>
    </div><!-- /.carousel -->

    <div class="container marketing">
      <!-- Three columns of text below the carousel -->
       <div class="row">
	 <div class="span4" style="position: relative; overflow: hidden;">
	   <div style="position: absolute; top: 15px; right: -40px; transform: rotate(20deg); background-color: orange; color: white; width: 200px; text-align: center;">
	     <span>Work in Progress</span>
	   </div>
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Overview</h2>
	  <p class="lead">Key variables of <span class="current-project"></span></p>
	  <p><a class="btn" href="/applications/Overview" title="Show key variable of the study as linked histograms.">Study &raquo;</a>&nbsp;
	     <a class="btn" href="/applications/OverviewMeasures" title="Display summary statistics for single measurements.">Measurements &raquo;</a></p>
	</div><!-- /.span4 -->
	<!-- <div class="span4">
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Data Exploration</h2>
	  <p class="lead">Define your hypothesis</p>
	  <p><a class="btn" href="/applications/DataExploration" title="Generalized additive model with integrated smoothness estimation.">Go there &raquo;</a></p>
	</div> --><!-- /.span4 -->
	<!-- <div class="span4">
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Documents</h2>
	  <p class="lead">Downloads and data sharing</p>
	  <p><a class="btn" href="/applications/Documents">Go there &raquo;</a></p>
	</div> --><!-- /.span4 -->
    <!--   </div>  --><!-- /.row -->
    <!--   <div class="row"> -->
    
<!-- 	<div class="span4" style="position: relative; overflow: hidden;">
	   <div style="position: absolute; top: 15px; right: -40px; transform: rotate(20deg); background-color: orange; color: white; width: 200px; text-align: center;">
	     <span>Work in Progress</span>
	   </div>
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Table View</h2>
	  <p class="lead">Study level imaging data</p>
	  <p><a class="btn" href="/applications/TableView">Go there &raquo;</a></p>
        </div> -->

        <div class="span4" style="position: relative; overflow: hidden;">
	   <div style="position: absolute; top: 15px; right: -40px; transform: rotate(20deg); background-color: orange; color: white; width: 200px; text-align: center;">
	     <span>Work in Progress</span>
	   </div>
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Pre-Registration</h2>
	  <p class="lead">Register Hypothesis</p>
	   <p>
	     <a class="btn" href="/applications/Pre-Registration">Explain &raquo;</a>
	   </p>
	</div>


	
	<div class="span4" style="position: relative; overflow: hidden;">
	<!--    <div style="position: absolute; top: 15px; right: -40px; transform: rotate(20deg); background-color: orange; color: white; width: 200px; text-align: center;">
	     <span>Work in Progress</span>
	   </div> -->
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2><span class="current-project"></span> Dictionary</h2>
	  <p class="lead">Explore the data dictionary</p>
	  <p><a class="btn" href="/applications/Ontology/hierarchy.php?entry=display" title="Structure browser">Go there &raquo;</a>&nbsp;
             <!-- <a class="btn" href="/applications/Ontology/translate.php?query=display" title="Data dictionary with RDFa annotations">Dictionary &raquo;</a></p> -->
	</div><!-- /.span4 -->
<!-- 	<div class="span4">
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Genetics Browser</h2>
	  <p class="lead">Single nucleotide polymorphisms</p>
	  <p><a class="btn" href="/applications/SNPs/index.php" title="Download SNP values for all study participants">Go there &raquo;</a></p>
	</div> -->
    <!--  </div> -->
    <!--  <div class="row"> -->
	<div class="span4" style="position: relative; overflow: hidden;">
	   <div style="position: absolute; top: 15px; right: -40px; transform: rotate(20deg); background-color: orange; color: white; width: 200px; text-align: center;">
	     <span>Work in Progress</span>
	   </div>
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Score Calculation</h2>
	  <p class="lead">Create and share new scores</p>
	  <p><a class="btn link-to-scores" href="/applications/Scores/">Go there &raquo;</a></p>
	</div><!-- /.span4 -->
<?php if ($can_qc) : ?>
	<!-- <div class="span4">
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Quality Control</h2>
	  <p class="lead">Remove bad sessions</p>
	  <p><a class="btn" href="/applications/QC">Go there &raquo;</a></p>
	</div> --><!-- /.span4 -->
<?php endif; ?>
	<div class="span4">
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Model Builder</h2>
	  <p class="lead">Share statistical tools</p>
	  <p><a class="btn" href="/applications/ModelBuilder">Go there &raquo;</a></p>
	</div><!-- /.span4 -->
<!--      </div>
      <div class="row"> -->
	<div class="span4">
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>Multilevel Model</h2>
	  <p class="lead">GAMM4 Regression</p>
	  <p><a class="btn" href="/applications/NewDataExpo/index.php?model=GAMM4-FZ-CR">Go there &raquo;</a></p>
	</div><!-- /.span4 -->

	<div class="span4" style="position: relative; overflow: hidden;">
	  <!--<div style="position: absolute; top: 15px; right: -40px; transform: rotate(20deg); background-color: orange; color: white; width: 200px; text-align: center;">
	     <span>Work in Progress</span>
	  </div> -->
	  <img class="img-circle" data-src="holder.js/140x140">
	  <h2>SubSetting</h2>
	  <p class="lead">Limit your analysis</p>
	  <p><a class="btn" href="/applications/Filter/index.php">Participants &raquo;</a>
	  <a class="btn" href="/applications/Sets/index.php">Measures &raquo;</a></p>
	</div><!-- /.span4 -->

      </div>
       
      <!-- START THE FEATURETTES -->
      <hr class="featurette-divider">
 <!--     <div class="featurette">
	<img class="featurette-image pull-right" src="../assets/img/examples/browser-icon-chrome.png">
	<h2 class="featurette-heading">First featurette headling. <span class="muted">It'll blow your mind.</span></h2>
	<p class="lead">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>
      </div>
      <hr class="featurette-divider">
      <div class="featurette">
	<img class="featurette-image pull-left" src="../assets/img/examples/browser-icon-firefox.png">
	<h2 class="featurette-heading">Oh yeah, it's that good. <span class="muted">See for yourself.</span></h2>
	<p class="lead">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>
      </div>
      <hr class="featurette-divider">
      <div class="featurette">
	<img class="featurette-image pull-right" src="../assets/img/examples/browser-icon-safari.png">
	<h2 class="featurette-heading">And lastly, this one. <span class="muted">Checkmate.</span></h2>
	<p class="lead">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>
      </div>
      <hr class="featurette-divider"> -->
      <!-- /END THE FEATURETTES --> 
      <!-- FOOTER -->
      <footer>
	<p class="pull-right"><a href="#">Back to top</a></p>
	<p>&copy; 2018 Adolescent Brain Cognitive Development Study, a service provided by the DAIC  &middot; <!-- <a href="#">Privacy</a> &middot;--> <a href="#" data-toggle="modal" data-target="#legal">Terms</a></p>
      </footer>
    </div><!-- /.container -->

<?php
  include 'legal.php';
?>

    <!-- Le javascript
	 ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="js/bootstrap-transition.js"></script>
    <script src="js/bootstrap-alert.js"></script>
    <script src="js/bootstrap-modal.js"></script>
    <script src="js/bootstrap-dropdown.js"></script>
    <script src="js/bootstrap-scrollspy.js"></script>
    <script src="js/bootstrap-tab.js"></script>
    <script src="js/bootstrap-tooltip.js"></script>
    <script src="js/bootstrap-popover.js"></script>
    <script src="js/bootstrap-button.js"></script>
    <script src="js/bootstrap-collapse.js"></script>
    <script src="js/bootstrap-carousel.js"></script>
    <script src="js/bootstrap-typeahead.js"></script>
    <script src="/js/md5-min.js"></script>
    <script src="js/legal.js"></script>
    <script src="/js/togetherjs-min.js"></script>
    <script>
      !function ($) {
        $(function(){
          // carousel demo
          $('#myCarousel').carousel({
             interval: 15000
          })
        })
      }(window.jQuery)
    </script>

    <script type="text/javascript">
      projects = [];

      jQuery(document).ready(function() {
        checkLegal(); // should display dialog with legal information

        jQuery('.current_user').text(user_name);

        jQuery.getJSON('/code/php/getProjectInfo.php', function(data) {
          projects = data;
          use_this_project = 0;

          jQuery('#swatch-menu').find('a').each(function() {
            if (jQuery(this).attr('type') === "project")
              jQuery(this).parent().remove();
          });
          for (var i = 0; i < data.length; i++) {
            if (admin == true || jQuery.inArray(data[i].name, permissions) != -1) { // only show projects that you are allowed to see
              jQuery('#swatch-menu').append("<li><a type='project' href='#' onclick='switchProject(\"" + i + "\");'>" + data[i].name + "</a></li>");
            }
          }
          if (projects.length > 0) {
            if (typeof project_name == "undefined") {
              switchProject(use_this_project); // use first project by default
            } else {
              // a project is known, find it and make it the current
              for (var i = 0; i < projects.length; i++) {
                if (projects[i].name == project_name) {
                  switchProject(i);
                  break;
                }
              }
            }
          } else {
            console.log("Error: no project for the current user");
          }
        });
      });
      function roundNumber(number, digits) {
         var multiple = Math.pow(10, digits);
         var rndedNum = Math.round(number * multiple) / multiple;
         return rndedNum;
      }

      function switchProject(newProject) {
        current_project = newProject;
        current_project_name = projects[newProject].name;
        project_name = current_project_name;
        jQuery.getJSON('/code/php/setCurrentProject.php?project_name=' + project_name, function(data) {
          // it either worked or it did not
          //alert('changed project (' + data.message +')');
        });

        jQuery('.current-project').text(current_project_name);
        var str = projects[newProject].description;
        if (typeof projects[newProject].numCols != "undefined") {
          str += "<br>(" + (projects[newProject].islongitudinal=='yes'?"longitudinal study":"cross-sectional study") + ")";
          str += "<table class='simpleTable'>";
          str += " <tr><td>measures<sup title='includes user defined measures'>*</sup>:</td><td class='table-value'>" + projects[newProject].numCols + "</td></tr>";
          whatisthis = ((projects[newProject].islongitudinal == 'no')?"participants":"sessions");
          str += " <tr><td>" + whatisthis + "<sup title='includes user defined entries'>*</sup>:</td><td class='table-value'>" + projects[newProject].numRows + "</td></tr>";
          var per = 100 * (projects[newProject].numCols * projects[newProject].numRows - projects[newProject].numNAs) / (projects[newProject].numCols *
															 projects[newProject].numRows);
          //str += "<br>populated at: " + roundNumber(per, 2) + "&#37;";
          str += " <tr><td>male:</td><td class='table-value'>" + projects[newProject].male + "</td></tr>";
          str += " <tr><td>female:</td><td class='table-value'>" + projects[newProject].female + "</td></tr>";
          str += "</table>";
          str += "<br><small><sup>*</sup>includes user defined measures and " + whatisthis + "</small>";
        }
        jQuery('.current-project-description').html(str);

        // use the default values for patient and visit if they exist
        if (typeof projects[newProject] != "undefined" &&
            typeof projects[newProject]['applications'] != "undefined" &&
            typeof projects[newProject]['applications']['Main'] != "undefined" &&
            typeof projects[newProject]['applications']['Main']['default_subject'] != "undefined") {
           var subject = projects[newProject]['applications']['Main']['default_subject'];
           if (typeof projects[newProject]['applications']['Main']['default_visit'] != "undefined") {
              var visit = projects[newProject]['applications']['Main']['default_visit'];
              jQuery('.link-to-image-viewer').each(function(idx) {
                jQuery(this).attr('href', "/applications/ImageViewerMPR/index.php?patient="+subject
                + "&project=" + project_name + "&visit=" + visit );
              });
           }
        }

      }
      // logout the current user
      function logout() {
        jQuery.get('/code/php/logout.php', function(data) {
          if (data == "success") {
            // user is logged out, reload this page
            location.reload();
          } else {
            alert('something went terribly wrong during logout: ' + data);
          }
        });
      }

      // change the current user's password
      function changePassword() {
        var password = jQuery('#password-field1').val();
        var password2 = jQuery('#password-field2').val();
        if (password == "") {
          alert("Error: Password cannot be empty.");
          return; // no empty passwords
        }
        hash = hex_md5(password);
        hash2 = hex_md5(password2);
        if (hash !== hash2) {
          alert("Error: Rhe two passwords are not the same, please type again.");
          return; // do nothing
        }
        jQuery.getJSON('/code/php/getUser.php?action=changePassword&value=' + user_name + '&value2=' + hash, function(data) {

        });
      }
    </script>
    
  </body>
</html>

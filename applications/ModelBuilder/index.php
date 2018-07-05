<?php
//
// This first part is for authentication purposes (see github.com/ABCD-STUDY/FIONASITE/php/AC.php).
//
  session_start();

  include($_SERVER["DOCUMENT_ROOT"]."/code/php/AC.php");
  $user_name = check_logged(); /// function checks if visitor is logged.
  $admin = false;

  if ($user_name == "") {
    // user is not logged in
    return;
  } else {
    if ($user_name == "admin")
      $admin = true;
    echo('<script type="text/javascript"> user_name = "'.$user_name.'"; </script>'."\n");
    echo('<script type="text/javascript"> admin = '.($admin?"true":"false").'; </script>'."\n");
  }
  
  $permissions = list_permissions_for_user( $user_name );

  // find the first permission that corresponds to a site
  // Assumption here is that a user can only add assessment for the first site he has permissions for!
  $sites = [];
  foreach ($permissions as $per) {
     $a = explode("Site", $per); // permissions should be structured as "Site<site name>"

     if (count($a) > 1 && $a[1] != "" && !in_array($a[1], $sites)) {
        $sites[] = $a[1];
     }
  }

//
// Start here for page specific code.
//
$recipes = glob('viewer/recipes/*.json');
echo('<script type="text/javascript"> recipes = [');
foreach($recipes as $recipe) {
    // read this recipe
    $state = json_decode(file_get_contents($recipe),TRUE);
    $pathparts = pathinfo($recipe);
    $data = array( 'name' => $pathparts['filename'] );
    if (isset($state['envelope'])) {
        $data['envelope'] = $state['envelope'];
    }
    if (isset($state['description'])) {
        $data['description'] = $state['description'];
    }
    echo(json_encode($data).',');
}
echo(']; </script>');

?>

<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <meta name="author" content="">

  <title>Model-Builder</title>

  <!-- Bootstrap Core CSS -->
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/style.css">

</head>

<body>
  <nav class="navbar navbar-default navbar-expand-lg navbar-light bg-light">
    <!-- Brand and toggle get grouped for better mobile display -->
    <a class="navbar-brand" href="#">Model Builder</a>
      <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item" >
	   <a class="nav-link" href="/index.php" title="Back to home page">Home</a>
	</li>
<!--        <li class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	    User
	  </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <a class="dropdown-item" href="#" onclick="closeSession();">Close Session</a>
            <a class="dropdown-item" href="#" onclick="logout();">Logout</a>
          </div>
        </li> -->
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>

    <div class="container-fluid">
      <div class="row-fluid">
      <p></p>
         <p>Implementations of statistical methods are represented on this page as individual recipes. Each recipe describes how a particular set of statistics and graphs are derived from a set of input measures. The recipe abstracts from any particular dependend and independent variable. Those can be specified by the user at the time of analysis. Each recipe should specify the appropriate nesting structure and the list of fixed covariates.</p>
      </div>
      <div id="recipes" class="row-fluid">
      </div>      
    </div>


    <div class="container-fluid">
       <div class="row-fluid">
    <hr>
    <p><i>A service provided by the Data Analysis and Informatics Core of the ABCD study.</i></p>
       </div>
    </div>
    
    <div class="modal" tabindex="-1" role="dialog" id="recipe-explain">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
	  <div class="modal-header">
	    <h5 class="modal-title">Recipe</h5>
	    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
	      <span aria-hidden="true">&times;</span>
	    </button>
	  </div>
	  <div class="modal-body">
	    <div class="container-fluid">
	      <div class="row">
		<div class="col-md-6" style="border-right: 1px solid gray;">
		  <h2 id="recipe-explain-title"></h2>
		  <div id="recipe-explain-description"></div>
		</div>
		<div class="col-md-6">
		  <div>
		    <img id="recipe-explain-image" style="width: 300px;"/>
		  </div>
		  <p id="recipe-explain-details"></p>
		</div>	    
	      </div>
	    </div>
	  </div>
	  <div class="modal-footer">
	    <button type="button" class="btn btn-primary" id="recipe-explain-edit">Edit</button>
	    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
	  </div>
	</div>
      </div>
    </div>
    
    

  <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
  <script src="js/jquery.ui.touch-punch.min.js"></script>  
    
  <!-- Bootstrap Core JavaScript -->
  <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
  <script src="js/bootstrap.min.js"></script>
    
  <script type="text/javascript">
    jQuery(document).ready(function() {
        for (var i = 0; i < recipes.length; i++) {
            d = '';
            if (typeof recipes[i]['envelope'] !== 'undefined' && recipes[i]['envelope'].length > 0) {
                d = recipes[i]['envelope'][0]['lastSavedByUserName'];
            }
            dat = '';
            if (typeof recipes[i]['envelope'] !== 'undefined' && recipes[i]['envelope'].length > 0 && typeof recipes[i]['envelope'][0]['lastSaveAtDate'] !== 'undefined') {
                dat = '[' + recipes[i]['envelope'][0]['lastSaveAtDate'].slice(0,10) + ']';
            }
	    var description = "";
	    if (typeof recipes[i]['description'] !== 'undefined') {
	       description = encodeURIComponent(recipes[i]['description']);
	    }
            jQuery('#recipes').append('<div class="card panel panel-default block" recipe="'+ recipes[i]['name'] + '" description="' + description + '"><div class="panel-heading"><span class="recipe-counter">Recipe ' + i + '</span><span class="recipe-date float-right">'+ dat +'</span></div>' + '<div class="card-body panel-body image_container">' + '<img class="image" src="viewer/recipes/' + recipes[i]['name'] + '.png"/>' + '<div class="edit-icon"><i class="fa fa-pencil" aria-hidden="true"></i></div>' + '</div>' + '<div class="panel-footer"><span class="recipe-name">'+ recipes[i]['name'] +'</span><span class="recipe-user-name float-right">' + d + '</span></div>' +  '</div>');
        }// <i class="fa fa-pencil" aria-hidden="true"></i>
	
	jQuery('#recipes').on('click', '.card', function() {
	    console.log("click on card: " + jQuery(this).attr('recipe'));
	    var recipe_name = jQuery(this).attr('recipe');
	    recipe_name_readable = recipe_name.replace(/([A-Z])([a-z])/g," $1$2");
	    jQuery('#recipe-explain-image').attr('src', 'viewer/recipes/' + recipe_name + '.png');
	    jQuery('#recipe-explain-title').text(recipe_name_readable);
	    jQuery('#recipe-explain-edit').attr('destination', recipe_name);
	    jQuery('#recipe-explain').modal('show');
	    var description = jQuery(this).attr('description');
	    jQuery('#recipe-explain-description').text(decodeURIComponent(description));
	});
	jQuery('#recipe-explain-edit').on('click', function() {
	    console.log('hi');
	    window.open('viewer/index.php?load=' + jQuery('#recipe-explain-edit').attr('destination'));
	});
    });

jQuery('body').on('click', '.edit-icon', function() {
    var recipe = jQuery(this).parent().parent().attr('recipe');
    window.open('viewer/index.php?load=' + recipe, '_viewer');
});
jQuery('body').on('touchend', '.edit-icon', function() {
    var recipe = jQuery(this).parent().parent().attr('recipe');
    window.open('viewer/index.php?load=' + recipe, '_viewer');
});
</script>


</body>

</html>

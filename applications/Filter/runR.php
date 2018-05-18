<?php
// should check if we are logged in
$value = "";
if (isset($_GET['value'])) {
    $value = $_GET['value'];
} else {
    echo("{ \"message\": \"Error, no value specified\" }");
    return; // nothing to do
}
$output = array();
exec("cd /var/www/html/applications/Filter/; /usr/bin/nodejs ./runR.js ".$value, $output);
echo(implode(" ",$output));
?>
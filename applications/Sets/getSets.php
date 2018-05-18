<?php

// make sure user is logged in
session_start();
include("../../code/php/AC.php");
$user_name = check_logged();
if ($user_name == FALSE) {
  echo "no user name";
  return;
}

$action = "get";
if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

$project = "";
if (isset($_GET['project'])) {
    $project = $_GET['project'];
} else {
    $project = "ABCD";
}

$fn_all = "data/sets_".$project."_all.json";
$fn = "data/sets_".$project."_".$user_name.".json";

if (!file_exists($fn)) {
    file_put_contents($fn, json_encode(array()));
}
if (!file_exists($fn_all)) {
    file_put_contents($fn_all, json_encode(array()));    
}

function readData() {
    global $fn, $fn_all, $user_name;
    $data  = json_decode(file_get_contents($fn), true);
    foreach($data as $key=>$dat) {
        $data[$key]['owner'] = $user_name;
    }
    $data2 = json_decode(file_get_contents($fn_all), true);
    foreach($data2 as $key => $dat) {
        $data2[$key]['owner'] = "public";
        $data[] = $data2[$key];
    }
    return $data;
}
// only write data for the current user
function saveData($data) {
    global $fn, $fn_all, $user_name;

    $mine = array();
    $found = False;
    foreach($data as $key => $dat) {
        //syslog(LOG_EMERG, "compare this key: ".$dat['owner']. " with: \"".$user_name."\"");
        if ($dat['owner'] == $user_name) {
            unset($dat['owner']);
            $mine[] = $dat;
            $found = True;
        }
    }
    //syslog(LOG_EMERG,json_encode($mine));
    file_put_contents($fn, json_encode($mine));
}


if ($action == "get") {
    $id = ""; // return all of the names
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    }
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    if ($id != "") {
        $ret = array();
        foreach($data as $dat) {
            if ($id == $dat['id'])
                $ret[] = $dat;
        }
        echo(json_encode($ret));
        return;
    } else {
        echo(json_encode($data));
    }
} else if ($action == "save") {
    $id = "";
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        echo("{ \"message\": \"no id specified\" }");
        return; // no id specified, do nothing
    }
    
    $name = "";
    if (isset($_GET['name'])) {
        $name = $_GET['name'];
    }
    $variables = array();
    if (isset($_POST['variables'])) {
        $variables = $_POST['variables'];
    }
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    foreach($data as &$dat) {
        if ($dat['id'] == $id) {
            if ($name !== "") {
                $dat['name'] = $name;
            }
            break;
        }
    }
    saveData($data);
    return;
} else if ($action == "create") {
    $id = uniqid($project);
    $name = "";
    if(isset($_GET['name'])) {
        $name = $_GET['name'];
    }
    $variables = array();
    if(isset($_GET['variables'])) {
        $variables = $_GET['variables'];
    }
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    $ne = array( "name" => $name, "variables" => $variables, "id" => $id, "owner" => $user_name );
    $data[] = $ne;
    //file_put_contents($fn, json_encode($data));
    saveData($data);
    echo(json_encode($ne));
    return;
} else if ($action == "delete") {
    $id = "";
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        echo("{ \"message\": \"no id specified\" }");
        return; // no id specified, do nothing
    }
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    foreach($data as $key => $value) {
        if ($value['owner'] == $user_name && $value['id'] == $id) {
            unset($data[$key]);
        }
    }
    saveData($data);
    echo("{ \"message\": \"ok\" }");
    return;
} else if ($action == "duplicate") {
    $id = "";
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        echo("{ \"message\": \"no id specified\" }");
        return; // no id specified, do nothing
    }
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    $newid = "";
    foreach($data as $key => $value) {
        if ($value['id'] == $id) {
            $v = $value;
            $newid      = uniqid($project);
            $v['id']    = $newid;
            $v['owner'] = $user_name;
            $data[] = $v;
            //syslog(LOG_EMERG, "add a duplicate key to data". json_encode($data));
            break;
        }
    }
    if ($newid == "") {
        echo("{ \"id\": \"\", \"message\": \"could not find this id\" }");
        return;
    }
    saveData($data);
    echo("{ \"id\": \"".$newid."\", \"message\": \"ok\" }");
    return;
} else if ($action == "addMeasure") {
    $id = "";
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        echo ("{ \"message\": \"Error: no id found\" }");
        return;
    }
    $variable = "";
    if (isset($_GET['variable'])) {
        $variable = $_GET['variable'];
    } else {
        echo ("{ \"message\": \"Error: no variable found\" }");
        return;
    }
    // now check if that variable does not exist yet
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    foreach($data as &$dat) {
        if ($dat['id'] == $id) {
            $found = False;
            foreach($dat['variables'] as $v) {
                if ($v == $variable) {
                    $found = True;
                    break;
                }
            }
            if (!$found) {
                $dat['variables'][] = $variable;
            }
            break;
        }
    }
    saveData($data);
    //file_put_contents($fn, json_encode($data));
    echo("{ \"message\": \"ok\" }");
    return;
} else if ($action == "removeMeasure") {
    $id = "";
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        echo ("{ \"message\": \"Error: no id found\" }");
        return;
    }
    $variable = "";
    if (isset($_GET['variable'])) {
        $variable = $_GET['variable'];
    } else {
        echo ("{ \"message\": \"Error: no variable found\" }");
        return;
    }
    //$data = json_decode(file_get_contents($fn), true);
    $data = readData();
    //syslog(LOG_EMERG, "before remove: " .json_encode($data));
    foreach($data as &$dat) {
        if ($dat['id'] == $id) {
            $found = False;
            foreach($dat['variables'] as $key=>$v) {
                if ($v == $variable) {
                    $found = True;
                    // remove this variable again
                    unset($dat['variables'][$key]);
                    //syslog(LOG_EMERG, "after remove: " .json_encode($data));
                    
                    break;
                }
            }
            if (!$found) {
                echo("{ \"message\": \"could not find this variable".$variable."\" }");
                return;
            }
            $dat['variables'] = array_values($dat['variables']);
            break;
        }
    }
    file_put_contents($fn, json_encode($data));
    saveData($data);
    echo("{ \"message\": \"ok\" }");
    return;
}

?>
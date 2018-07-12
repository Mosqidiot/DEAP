var DataFrame = dfjs.DataFrame;
var data = null;
var disableLocalStorage = true;

// use data as a dataframe
MathJax.Hub.Config({
    tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
});
var QUEUE = MathJax.Hub.queue;

function customMarkdownParser( text) {
    return text;
}

// pull a new variable into the current workspace
function use(v) {
    var promisses = [];
    if (v.constructor !== Array) {
        v = [v];
    }
    // get list of real variables (if v contains a string, use that as the variable name, if it contains a regular expression, match and get a list of all matching items)
    var itemsToUse = matchInArray(analysis_names, v);
    if (itemsToUse.length > 100) {
        alert("Error: One of your use() calls matches more than 100 items in our data dictionary. Please reduce the number of matches.");
        return;
    }

    for ( m in itemsToUse ) {
        promisses.push(addOneMeasure(itemsToUse[m], compute_block_id));
    }
    return promisses;
}

var allMeasures = { "src_subject_id": [], "eventname": [] };
var header = [ "src_subject_id", "eventname" ];
var output_always_list = ["src_subject_id", "eventname"];
var output_vlist = {};
// some variables are not measures (like "M"), only try to pull those once and remember them to be bad
var noMeasureList = ["M", "F"];
var measuresPerBlock = {};
var analysis_names = []
var debug_deffered = null;
loadAnalysisNames();

// can we store data locally?
function storageAvailable(type) {
    if (disableLocalStorage)
        return false;
    
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}


// pull only the data we need (allMeasures as a dictionary of columns)
function addOneMeasure( meas, vname ) {

    if (typeof vname === 'undefined') {
        vname = "no-block";
    }
    
    console.log("Loading: " + meas);

    jQuery(document.getElementById(vname+'-table')).find(".loader").remove();
    if (jQuery(document.getElementById(vname+'-table')).find(".console").length == 0){
        jQuery(document.getElementById(vname+'-table')).append($("<div class = 'console'>"))
    }
    jQuery(document.getElementById(vname+'-table')).find(".console").append("loading variable: <span style='color:blue'>"+ meas +"</span><br>");


    // maybe this measure is already in allMeasures?
    if (Object.keys(allMeasures).indexOf(meas) > -1) {
        if (! (vname  in measuresPerBlock)) {
            measuresPerBlock[vname] = [];
        }
        measuresPerBlock[vname].push(meas);
        return Promise.resolve(); // nothing needs to be done, measure exists already
    }
    if (noMeasureList.indexOf(meas) > -1) {
        return Promise.resolve(); // nothing can be done, its a no-measure
    }

    // maybe this measure can be copied from the localStorage? In that case we don't have to transfer it to the client a second time
    if (storageAvailable('localStorage')) {
        var dataFromStore = localStorage.getItem(meas);
        if (dataFromStore) {
            allMeasures[meas] = JSON.parse(dataFromStore);
            if (! (vname  in measuresPerBlock)) {
                measuresPerBlock[vname] = [];
            }
            measuresPerBlock[vname].push(meas);
            
            // make sure we have src_subject_id and eventname as well
            if (Object.keys(allMeasures).indexOf('src_subject_id') == -1 || allMeasures['src_subject_id'].length == 0) {
                var dataFromStore = localStorage.getItem('src_subject_id');
                if (dataFromStore) {
                    allMeasures['src_subject_id'] = JSON.parse(dataFromStore);
                }            
            }
            if (Object.keys(allMeasures).indexOf('eventname') == -1 || allMeasures['eventname'].length == 0) {
                var dataFromStore = localStorage.getItem('eventname');
                if (dataFromStore) {
                    allMeasures['eventname'] = JSON.parse(dataFromStore);
                }
            }
            return Promise.resolve();
        }
    }

    // ask the system to return this measure and add it to allMeasures (if it does not exist already)
    return jQuery.getJSON('/applications/Filter/runR.php', { 'value': meas }, function(data) {
        console.log("compute_block_id in runR is : " + vname + " loading: " + meas);
        
        // add the current meas to compute_block_id in measuresPerBlock
        if (! (vname  in measuresPerBlock)) {
            measuresPerBlock[vname] = [];
        }
        measuresPerBlock[vname].push(meas);
        
        // got the values, now add to allMeasures (merge with existing)
        var k  = Object.keys(allMeasures);
        k.splice(k.indexOf('src_subject_id'),1);
        k.splice(k.indexOf('eventname'),1);
        var ids    = data[0]; // each of these are arrays
        var event  = data[1];
        var v = null;
        if (data.length > 2 && data[2] != null) {
            v = data[2];
        } else {
            noMeasureList.push(meas);
            return; // this is not a real variable, don't use this one
        }
        allMeasures[meas] = []; // empty, fill in the values
        header.push(meas);
        for (var i = 0; i < ids.length; i++) {
            var found = false;
            for (var j = 0; j < allMeasures['src_subject_id'].length; j++) {
                if (allMeasures['src_subject_id'][j] == ids[i]) {
                    if (allMeasures['eventname'][j] == event[i]) {
                        found = true;
                        // add the value here
                        allMeasures[meas][j] = v[i];
                        break;
                    }       
                }
            }
            if (!found) {
                // add a new entry to all keys at the end
                var lastidx = allMeasures['src_subject_id'].length;
                allMeasures['src_subject_id'][lastidx] = ids[i];
                allMeasures['eventname'][lastidx]      = event[i];
                allMeasures[meas][lastidx]             = v[i];
                for (var j = 0; j < k.length; j++) {
                    allMeasures[k[j]] = None;
                }
            }
        }
        // store this column in the localStorage
        if (storageAvailable('localStorage')) {
            if (typeof allMeasures['src_subject_id'] !== 'undefined')
                localStorage.setItem('src_subject_id', JSON.stringify(allMeasures['src_subject_id']));
            if (typeof allMeasures['eventname'] !== 'undefined')
                localStorage.setItem('eventname', JSON.stringify(allMeasures['eventname']));
            localStorage.setItem(meas, JSON.stringify(allMeasures[meas]));
        }
    })/*.done(function() {
        console.log( "second success "+meas );
    }).fail(function() {
        console.log( "error" );
    }).always(function() {
        console.log( "complete" );
    })*/;
}

function json_to_table(json,vname){
    if(!vname) return;
    var html = '<div style = "font-size: 0.75em;max-height: 250px;overflow:auto;"><table class="table-sm table table-striped">';
    html += '<thead><tr>';
    var flag = 0;
    //only display 100 rows for checking
    var rows = 100;
    //"src_subject_id", "eventname"
    var keys = Object.keys(json);
    for (var i = keys.length-1; i >= 0; i--) {
        var value = json[keys[i]];
        var index = keys[i];
        if (index == "src_subject_id" || index == "eventname" ||  (typeof measuresPerBlock[vname] !== 'undefined' && measuresPerBlock[vname].indexOf(index) >= 0) || index == vname) {
            html += '<th>'+index+'</th>';
        }
    }
    data = [];
    for (index = 0; index < rows; index++){
        temp = {};
        for (var i = keys.length-1; i >= 0; i--) {
            var k = keys[i];
            // for (keys in json) {
            temp[k] = json[k][index];
        }
        if(!$.isEmptyObject(temp))data.push(temp);
    }
    //console.log(data);
    if (data.length == 0)
        return "";  
    html += '</thead></tr><tbody>';
    $.each(data, function(index, value){
        html += '<tr>';
        $.each(value, function(index2, value2) {
            if (index2 == "src_subject_id" || index2 == "eventname" ||
                (typeof measuresPerBlock[vname] !== 'undefined' && measuresPerBlock[vname].indexOf(index2) >= 0) || index2 == vname  ){
                html += '<td>'+value2+'</td>';
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
}

function add_new_recipe(){
    insert_recipe_block( { "user": user_name, "permission": "public" }, true );
}

//save a measure during user code excution
function announce(vname,label,data){
    temp = {};
    temp["name"]        = vname; 
    //temp["description"] = bootstrap_texarea_description.find("input").val();
    temp["description"] = "";
    temp["permission"]  = "public";
    temp["content"] = "";
    //temp["content"]     = JSON.stringify(simplemde.value());
    temp["action"]      = "save";
    if (data.listColumns().indexOf(vname) > -1) {
        temp["data"]        = data.select("src_subject_id", "eventname", vname).toJSON();
    } else {
        alert("cannot find: " + vname);
        return;
    }
    priv = jQuery(document.getElementById(vname+"-input")).parent().parent().find('.private-public').is(':checked');
    if (priv) {
        temp['permission'] = "private";
    }

    //Missing the scores sit self;
    $.post("php/run.php",temp).done(function(data) {
        console.log(data)
    });

}


function _update(text, table_location, vname, hist_location) {
    'use strict';
    var ar = text.split(/[\#]+/);
    console.log("Excuting code (_update):"+vname); 

    // for each of the sections now evaluate the data
    for (var i = 0; i < ar.length; i++) {
        // find the code
        var code = ar[i].split(/```/g);
        //append code section
        var excute_code = "";
        var co = null;
        var retVal = 0;
        for (var j = 1; j < code.length; j+=2) {
            // parse code[j] to see what variables 
            excute_code = excute_code + code[j] + "\n";
        }
        var data = new DataFrame( allMeasures );
        var namesBefore = new Set(data.listColumns());
        //console.log("found some code here:" + JSON.stringify("compute_block_id = \"" + vname + "\";\n" + code[j]+"\n return data;"));
        // we can execute this code now to fill in the values (pull, compute, push)
        // Question: in co access for data as a 1-level-up variable is not working, must use a return structure, maybe there is a better way?
        try {
            co = new Function('data', "compute_block_id = \"" + vname + "\";\n" + excute_code+"\n return data;");
            console.log("var compute_block_id = \"" + vname + "\";\n" + excute_code+"\n return data;")
            data = co(data);
        } catch (err) {
            if (err instanceof EvalError) {
                alert("EvalError, incorrect syntax in " + execute_code);
            }
            console.log(err);
            console.log(vname);
            jQuery(document.getElementById(vname+'-table')).find(".loader").remove();
            jQuery(document.getElementById(vname+'-hist')).find(".loader").remove();
            if (jQuery(document.getElementById(vname+'-table')).find(".console").length == 0){
                jQuery(document.getElementById(vname+'-table')).append($("<div class = 'console'>"))
            }
            jQuery(document.getElementById(vname+'-table')).find(".console").append("<p style= 'color:red'>"+err+"</p>");
        }
        //Update data
        var difference = new Set(data.listColumns());
        var namesExisted = new Set(namesBefore);
        for (var elem of namesExisted) {
            difference.delete(elem);
        }
        var newVars = [...difference];
        for (var k = 0; k < newVars.length; k++) {
            // add the new variables to measuresPerBlock
            if (!(vname in measuresPerBlock)) {
                measuresPerBlock[vname] = []
            }
            measuresPerBlock[vname].push(newVars[k]);
        }
        console.log("got " + difference.size + " new variables (" + [...difference].join(",")+")");
        // does this evaluation create some variables?
        //console.log("data is now: " + JSON.stringify(data));
    }
    //"src_subject_id", "eventname"
    
    if (vname!= "" && vname && data.dim()[0] != 0){
        if (data.listColumns().indexOf(vname) > -1){
            var temp_json = JSON.parse(data.select("src_subject_id","eventname",vname).toJSON());
            output_vlist[vname] = temp_json;
        } else {
            return;
        }
    }
    
    if (table_location.html() != "")
        table_location.height( table_location.height());
    if (hist_location.html() != "")
        hist_location.height( hist_location.height());
    if (data.dim()[0] == 0 )
        return;
    table_location.html("");
    $(json_to_table(JSON.parse(data.toJSON()),vname)).appendTo(table_location);
    hist_location.html(""); // remove the timeout circle animation
    var hist_data = JSON.parse(data.toJSON())[vname];
    if (typeof hist_data === 'undefined')
        hist_location.html("<div class='error'>Warning: " + vname + " is not yet defined by this calculation.</div>");
    else
        histogram(hist_data,hist_location);
    //console.log("we found " + ar.length + " sections");
    //return data;
}

// this function is called by the users code and is supposed to create the variables that have been computed
//
// Problem might be that update cannot easily get the compute_block_id. That global variable might be changed by executing
// blocks in parallel.
//
function update(data, compute_block_id) {
    // find all variables to update this block: compute_block_id
    console.log("UPDATE: Compute_block_id is: " + compute_block_id);
    var vname          = compute_block_id;
    var table_location = jQuery(document.getElementById(vname+'-table'));
    var hist_location  = jQuery(document.getElementById(vname+'-hist'));
    var output_vlist   = [];


    if (vname !== "" && vname) {
        var temp_json = {};
        if (data.listColumns().indexOf(vname) > -1) {
            try {
                temp_json = JSON.parse(data.select("src_subject_id","eventname",vname).toJSON());
            } catch(e) {
                //if (e instanceof NoSuchColumnError) {
                console.log("GOT no such column error: " + e);
                //} else {
                //    console.log("GOT a different error: " + e);
                //}                
            }
        } else {
            // update?
            alert("(in update) cannot find: " + vname + " in this data, only:  " + data.listColumns().join(", "));
            return;
        }
        output_vlist[vname] = temp_json;
    }
    if (table_location.html() != "")
        table_location.height( table_location.height() );
    if (hist_location.html() != "")
        hist_location.height( hist_location.height() );

    table_location.html("");
    jQuery(json_to_table(JSON.parse(data.toJSON()),vname)).appendTo(table_location);
    hist_location.html(""); // remove the timeout circle animation
    var hist_data = JSON.parse(data.toJSON())[vname];
    if (typeof hist_data === 'undefined')
        hist_location.html("<div class='error'>Warning: " + vname + " is not yet defined by this calculation.</div>");
    else
        histogram(hist_data,hist_location);
    // console.log("UPDATE we found " + ar.length + " sections");
    //return data;
}

var wto = {};
function parse( text, table_location, vname, hist_location) {
    if (wto[vname])
        clearTimeout(wto[vname]);
    wto[vname] = setTimeout( function() {
        _update(text, table_location, vname, hist_location);
    },3000);
}

function histogram(values, hist_location) {
    if (typeof values == 'undefined') {
        // don't show the circle, show an error message
        return;
    }
    console.log(hist_location.attr("id"))
    var formatCount = d3.format(",.0f");
    var margin = {top: 20, right: 10, bottom: 30, left: 50},
        width = hist_location.width() - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
    var max = d3.max(values);
    var min = d3.min(values);
    var range = max-min;
    min = min - 0.05 * range;
    max = max + 0.05 * range;
    var x = d3.scale.linear()
        .domain([min, max])
        .range([0, width]);
    var data = d3.layout.histogram()
        .bins(x.ticks(20))
    (values);
    var yMax = d3.max(data, function(d){return d.length});
    var yMin = d3.min(data, function(d){return d.length});
    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    var svg = d3.select(hist_location.get(0)).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
    bar.append("rect")
        .attr("x", 1)
        .attr("width", (x(data[0].dx) - x(0)) - 1)
        .attr("height", function(d) { return height - y(d.y); })
        .attr("fill", "steelblue");
    /*
    bar.append("text")
             .attr("dy", ".75em")
             .attr("y", -12)
             .attr("x", (x(data[0].dx) - x(0)) / 2)
             .attr("text-anchor", "middle")
             .text(function(d) { return formatCount(d.y); });
             */
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
    //.attr("transform", "translate(0," + height +")")
        .call(yAxis);
}

/*
@input: an object contains title, description, and raw md code
        default input = {"name": "placeholder" , "description": "palcehoder", "content":"md code placeholder"}
        */
/*
   @Fangzhou: In order to add the new item to the Ontology use searchTerm2 and provide a GET variable scoresAdd with a uricomponet encoded json object that contains keys for name, description, notes, and aliases=[].
   */
function insert_recipe_block(input, top) {
    var variable_name = input["name"]? input["name"] : new Date().getTime();
    var simplemd_initialize_text = input["content"] && JSON.parse(input["content"]) ? JSON.parse(input["content"]) : "### Describe the new item\nWhy should the reader be interested in this new item? Describe your rationale to provide it and explain your sources. Start the computation of the new item by listing required existing items, for example age here:\n```\nuse([\"age\"]);\n```\n\nAdd the calculation of the new measure in another section delimited by three tick marks:\n```\ndata = data.map(row => row.set('age_years', row.get('age')/12));\n```\n";
    var div = $("<div class = 'recipe-block' tabindex='0' style = 'position:relative;'></div>");
    if (typeof top !== 'undefined' && top) {
        div.insertAfter("#first-item");
    } else {
        div.appendTo(".container-fluid");
    }
    var header = jQuery('<div class="header row"></div>').appendTo(div);
    
    var div_input = $("<div class = 'col-lg-4'></div>").appendTo(header);
    var div_table = $("<div class = 'col-lg-4' id = '"+variable_name+"-table"+"'></div>").appendTo(header);
    div_table.append('<div class="loader"></div>');
    var div_hist = $("<div class = 'col-lg-4' id = '"+variable_name+"-hist"+"'></div>").appendTo(header);
    div_hist.append('<div class="loader"></div>');

    //name
    var bootstrap_input_name = $(
        '<div class="mb-3 form-group">'+
        //'<div class="input-group-prepend">'+
        //  '<span class="input-group-text" id="inputGroup-sizing-sm">Name</span>'+
        //'</div>'+
        '<label>Element Name (user ' + input['user'] + " - " + input['permission'] + ' score)</label>' +
        '<input type="text" class="form-control element-name" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value = "'+(typeof variable_name == "number"?"":variable_name)+'">'+
        '</div>').appendTo(div_input);
    div_input.find("input").change(function(){
        var value_changed = $(this).val();
        div_table.attr("id", value_changed+"-table"); 
        div_hist.attr("id",  value_changed+"-hist");
    });
    //description
    var bootstrap_texarea_description = $(
        '<div class="mb-3 form-group">'+
        //'<div class="input-group-prepend">'+
        //  '<span class="input-group-text" id="inputGroup-sizing-sm">Axis label&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'+
        //'</div>'+
        '<label>Axis label</label>' + 
        '<input type="text" class="axis-label form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value = "'+input["description"]+'">'+
        '</div>').appendTo(div_input);


    bootstrap_texarea_description.find("input").val(input["description"]);
    //md
    var text_area = $('<textarea></textarea>').attr("id", variable_name );
    var text_area_wrapper = $('<div class="col-md-12" style="padding-top:10px;border-top: 1px solid #CCC;"></div>').append(text_area).appendTo(div);

    var div_operation = $("<div class = 'col-md-12'></div>").appendTo(div),
        del = $('<i style = "right:5px;top:5px;position:absolute;font-size:30px; margin:5px; color: gray;" class="fas fa-times"></i>').appendTo(div),
        save = $('<button type="button" class="btn btn-primary save-button">Save</button>').appendTo(div_input),
        checkbox = $('<div class="checkbox pull-right" style="margin-top: 7px;"><label><input type="checkbox" class="private-public" value="private"' + ((input['permission']=="private")?"checked":"") + '> Save as private</label></div>').appendTo(div_input);       

    //initialize md;
    var simplemde = new SimpleMDE({
        toolbar: false,
        autofocus: false,
        autosave: {
            enabled: true,
            uniqueId: variable_name+Math.random(),
            delay: 1000,
        },
        blockStyles: {
            bold: "__",
            italic: "___"
        },
        element: document.getElementById(variable_name),
        forceSync: true,
        hideIcons: ["guide", "heading"],
        indentWithTabs: false,
        initialValue: simplemd_initialize_text,
        insertTexts: {
            horizontalRule: ["", "\n\n-----\n\n"],
            image: ["![](http://", ")"],
            link: ["[", "](http://)"],
            table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
        },
        lineWrapping: false,
        parsingConfig: {
            allowAtxHeaderWithoutSpace: true,
            strikethrough: false,
            underscoresBreakWords: true,
        },
        placeholder: "Type here...",
        previewRender: function(plainText, preview) {
            preview.innerHTML = this.parent.markdown(plainText);
            var uniqid = Date.now();
            preview.setAttribute('id',uniqid);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub,''+uniqid]);
            return preview.innerHTML;
        },
        /* previewRender: function(plainText) {
            return customMarkdownParser(plainText); // Returns HTML from a custom parser
        },
        previewRender: function(plainText, preview) { // Async method
            setTimeout(function(){
                preview.innerHTML = customMarkdownParser(plainText);
            }, 250);

            return "Loading...";
        }, */
        promptURLs: true,
        renderingConfig: {
            singleLineBreaks: false,
            codeSyntaxHighlighting: true,
        },
        shortcuts: {
            drawTable: "Cmd-Alt-T"
        },
        showIcons: ["code", "table"],
        spellChecker: true,
        status: false,
        status: ["autosave", "lines", "words", "cursor"], // Optional usage
        status: ["autosave", "lines", "words", "cursor", {
            className: "keystrokes",
            defaultValue: function(el) {
                this.keystrokes = 0;
                el.innerHTML = "0 Keystrokes";
            },
            onUpdate: function(el) {
                el.innerHTML = ++this.keystrokes + " Keystrokes";
            }
        }, {
            className: "toggleDisplay",
            defaultValue: function(el) {
                this.displayMode = 0;
                el.innerHTML = "Cmd-P";
            },
            onUpdate: function(el) {
                if (this.displayMode == 0) {
                    el.innerHTML = 'Cmd-P';
                } else {
                    el.innerHTML = 'preview';
                }
                //simplemde.togglePreview();
                //this.displayMode = 1;
            }
        }], // Another optional usage, with a custom status bar item that counts keystrokes
        styleSelectedText: false,
        tabSize: 4,
    });

    simplemde.codemirror.on("change", function() {
        // at some point we should save what we have on the server --- if we are connected
        //console.log(simplemde.value());

        // lets parse the text, find out the groups that contain code
        setTimeout(function(){parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(),div_hist)},0);
    });
    jQuery('#display').on('click', 'span.toggleDisplay', function() {
        console.log("got a click on toggle display mode");
    });
    simplemde.codemirror.on("focus", function(){
        console.log("got a focus event to display the editor");
    });

    // start by showing it nicely
    simplemde.togglePreview();
    jQuery('.editor-preview').on('click', function() {
        simplemde.togglePreview();
    });
    // always ask for age first, that will fill in the participant names
    /*
    (function(){
        setTimeout(function() { parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(),div_hist)},0);       
    })(simplemde,div_table,bootstrap_input_name,div_hist);

    (function(){
        setTimeout(function() { parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(),div_hist)},3000);       
    })(simplemde,div_table,bootstrap_input_name,div_hist);
    */

    setTimeout((function() {
        parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(), div_hist);
    }),0);
    /*
    setTimeout((function() {
        parse(simplemde.value(),div_table,bootstrap_input_name.find("input").val(), div_hist);
    }),3500);
    */
    save.on("click",function(){
        temp = {};
        temp["name"]        = bootstrap_input_name.find("input").val();
        temp["description"] = bootstrap_texarea_description.find("input").val();
        temp["permission"]  = "public";
        temp["content"]     = JSON.stringify(simplemde.value());
        temp["action"]      = "save";
        temp["data"]        = JSON.stringify(output_vlist[bootstrap_input_name.find("input").val()]);
        priv = jQuery(this).parent().find('.private-public').is(':checked');
        if (priv) {
            temp['permission'] = "private";
        }

        temp_data = {};
        //Missing the scores sit self;
        $.post("php/run.php",temp).done(function(data) {
            console.log(data)
        });
    });
    del.on("click",function() {
        if (!confirm("Are you sure you want to delete scores calculation for " + bootstrap_input_name.find("input").val() ))
            return;
        temp = {};
        temp["name"] = bootstrap_input_name.find("input").val();
        temp["action"] = "delete";

        //Missing the scores sit self;
        $.post("php/run.php",temp).done(function(data){
            console.log(data);
            div.remove();
        });
    });
    if (typeof top !== 'undefined' && top) {
        jQuery(bootstrap_input_name).find('input').focus();
    }
}

var simplemde;
jQuery(document).ready(function() {
    $.post("php/run.php", {action : "load"}).done(function(data){
        recipes = JSON.parse(data);
        console.log(recipes);
        for (recipe in recipes) {
            insert_recipe_block(recipes[recipe], false);
        }
    });
    setTimeout(function() { addOneMeasure('age'); }, 0);    
});

function loadAnalysisNames() {
    dataMRIRead = false // we have to read them and afterwards add the entries to the ontology field
    dataBehaviorRead = false
    version = ""
    var inputData =
        "../../data/" +
        "ABCD" +
        "/data_uncorrected" +
        "/" +
        "ABCD" +
        "_datadictionary01.csv"
    jQuery.get(
        inputData,
        {
            cache: true,
        },
        function(tsv) {
            var lines = [],
                listen = false

            try {
                // split the data return into lines and parse them
                tsv = tsv.split(/\r?\n/)
                jQuery.each(tsv, function(i, line) {
                    if (line == "" || line.charAt(0) == "#") {
                        listen = false
                    }
                    // extract the header line from the first comment line
                    line = line.split(/,/)
                    var name = line[0]
                    name = name.replace(/["']/g, "")
                    analysis_names.push(name)
                })

                dataMRIRead = true
                //if (dataMRIRead && dataBehaviorRead)
                //addToOntology(analysis_names);
            } catch (err) {}
        }
    )

    var inputData =
        "../../data/" +
        "ABCD" +
        "/data_uncorrected" +
        "/" +
        "ABCD" +
        "../../data/" +
        "_datadictionary02.csv"
    jQuery.get(
        inputData,
        {
            cache: true,
        },
        function(tsv) {
            var lines = [],
                listen = false

            try {
                tsv = tsv.split(/\r?\n/)
                jQuery.each(tsv, function(i, line) {
                    if (
                        line == "" ||
                        line.charAt(0) == "#" ||
                        analysis_names.length == 0
                    ) {
                        listen = false
                    }
                    line = line.split(/,/)
                    analysis_names.push(line[0])
                })

                dataBehaviorRead = true
                //if (dataMRIRead && dataBehaviorRead)
                //addToOntology(analysis_names);
            } catch (err) {}
        }
    )
}


// return list of variables in ar that match expressions array
function matchInArray(ar, expressions) {
    var len = expressions.length,
        rt = [], // expressions that are strings
        i = 0;
    // create a copy of ar, remove the strings, keep regular expressions
    var newexpressions = []; // expressions that are regular expressions

    // remove strings from the regular expression array
    for (i = 0; i < expressions.length; i++) {
        if (expressions[i].constructor.name == "String") {
            rt.push(expressions[i])
        } else { // assumption is that an expression that is not a string is a regular expression (not a number etc..)
            newexpressions.push(expressions[i]);
        }
    }
    expressions = newexpressions; // remove old expressions
    for (var si in ar) {
        var str = ar[si];

        for (var i = 0; i < expressions.length; i++) {
            if (str.match(expressions[i])) {
                rt.push(str);
            }
        }
    }
    return rt;
};

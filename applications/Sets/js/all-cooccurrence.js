var sets = [];
// some variables are not measures (like "M"), only try to pull those once and remember them to be bad
var noMeasureList = ["M", "F"];
var participants = []; // empty mean use all participants
var allMeasures = { "src_subject_id": [], "eventname": [] };
var header = [ "src_subject_id", "eventname" ];
var allMeasuresStat = {}; // find out the type of the column and calculate quantile

function getAllSets() {
    jQuery.getJSON('../Sets/getSets.php', { "action": "get" }, function(data) {
	sets = data;
        jQuery('#sets-list').append("<option item=''></option>");
	for (var i = 0; i < data.length; i++) {
	    jQuery('#sets-list').append('<option item="' + data[i]['id'] + '">' + data[i]['name'] + ' (' + data[i]['variables'].length + ' variables)</option>');
	}
        //jQuery('#sets-list').selectpicker({ 'header': "Select a set" });
    });
}

// pull only the data we need (allMeasures as a dictionary of columns)
function addOneMeasure( meas ) {
    // maybe this measure is already in allMeasures?
    if (Object.keys(allMeasures).indexOf(meas) > -1) {
        return null; // nothing needs to be done, measure exists already
    }
    if (noMeasureList.indexOf(meas) > -1) {
        return null; // nothing can be done, its a no-measure
    }
    
    // ask the system to return this measure and add it to allMeasures (if it does not exist already)
    return jQuery.getJSON('runR.php', { 'value': meas }, function(data) {
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
        var levels = {};
        for (var i = 0; i < ids.length; i++) {
            var found = false;
            levels[v[i]] = 1;
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
        // compute the statistics of this column
        // first find out if this column is numeric or factor (look at levels)
        var lev = Object.keys(levels);
        var isNumber = true;
        for (var i = 0; i < lev.length; i++) {
            if (!isNumber)
                break; // give up
            if (lev[i] === 'NA' || lev[i] === "" || (!isNaN(parseFloat(lev[i])) && isFinite(lev[i]))) { // isNumber
                // ok
            } else {
                //console.log("detected a non-number: " + lev[i]);
                isNumber = false;
            }
        }
        if (isNumber && lev.length < 10) { // if we have this few levels we should use them as levels
            isNumber = false;
        }
        
        console.log("measure : " + meas + " is a " + (isNumber?"Number":"Factor") + " variable.");
        allMeasuresStat[meas] = { "type": (isNumber?"Continuous":"Categorical"), "factors": (isNumber?[]:v), "levels": (isNumber?[]:lev) };
        // calculate the levels for each continuous variable and put in factors
        if (isNumber) {
            var lev2 = lev;
            lev2.sort(d3.ascending); // to calculate quantiles we have to sort first
            quantile1 = d3.quantile(lev2, 0.25);
            quantile3 = d3.quantile(lev2, 0.75);
            console.log("quantiles are: " + quantile1 + " , " + quantile3);
            allMeasuresStat[meas]['factors']   = v;
            allMeasuresStat[meas]['quantiles'] = [ quantile1, quantile3 ];
            allMeasuresStat[meas]['levels']    = [ "q<.25", "q>=.25<.75", "q>=.75" ];
            for (var i = 0; i < v.length; i++) {
                if (!isNaN(parseFloat(v[i])) && isFinite(v[i])) {
                    if (parseFloat(v[i]) < quantile1) {
                        allMeasuresStat[meas]['factors'][i] = "q<.25";
                    } else if (parseFloat(v[i]) < quantile3) {
                        allMeasuresStat[meas]['factors'][i] = "q>=.25<.75";
                    } else {
                        allMeasuresStat[meas]['factors'][i] = "q>=.75";
                    }
                }
            }
        }
    });
}

function createGraph() {
    // add the display to the #treeview location on the page

    // calculate all combinations of factors from allMeasuresStat[meas]['factors']
    var meas = Object.keys(allMeasuresStat);
    var data = { "name": "ABCD", "children": [] };
    var combinations = {};
    //var combinationsKeys = {};
    
    var numEntries = allMeasuresStat[meas[0]]['factors'].length;
    var names = [];
    for (var i = 0; i < numEntries; i++) {
        var comb = [];
        var valid = true;
        for (var j = 0; j < meas.length; j++) {
            if (i === 0)
                names.push(meas[j] + " ["+ allMeasuresStat[meas[j]]['type'] +"]");
            // add a combination if it does not exist yet
            if (allMeasuresStat[meas[j]]['levels'].indexOf(''+allMeasuresStat[meas[j]]['factors'][i]) > -1) {
                comb.push( allMeasuresStat[meas[j]]['factors'][i] );
            } else {
                valid = false;
            }
        }
        if (!valid) {
            continue; // ignore this entry
        }
        var key = comb.join("|");
        //combinationsKeys[key] = comb;
        if (!(key in combinations)) {
            combinations[key] = 1;
        } else {
            combinations[key]++;
        }
    }
    console.log("Found " + Object.keys(combinations).length + " different combinations of values");
    for (var key in combinations) {
        var entry = { "name": key, "total": combinations[key]+1, 'children': [] };
        //for(var k in combinationsKeys[key]) {
        //    entry['children'].push({ "name": k, 'total': 1 });
        //}
        data['children'].push(entry);
    }
    // now render the treeview
    createTreemap(data, names);
}

function createTreemap(percentages, names) {
    var dw = jQuery(window).width();
    var w = dw - 80,
        h = 600 - 180,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]),
        color = d3.scale.category20c(),
        root,
        node;

    var treemap = d3.layout.treemap()
        .round(false)
        .size([w, h])
        .sticky(true)
        .value(function(d) { return d.total; });

    jQuery('#treemap').children().remove();
    var svg = d3.select("#treemap").append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(.5,.5)");

    var last = names.pop();
    jQuery('#treemap').append("<div><center style='font-size: 11pt;'><i>Co-occurrence of values in the variables " + names.join(", ") + " and " + last + ". There are " + percentages['children'].length + " unique combinations of values in the data.</i></center></div>");

    //d3.json("kinoko_takenoko.json", function(data) {
    //d3.json("party_asset.json", function(data) {
    node = root = percentages;
    // console.log(data);
    var nodes = treemap.nodes(root)
        .filter(function(d) {return !d.children; });

    var cell = svg.selectAll("g")
        .data(nodes)
        .enter().append("svg:g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });

    cell.append("svg:rect")
        .attr("width", function(d) { return d.dx - 1; })
        .attr("height", function(d) { return d.dy - 1; })
        .style("fill", function(d) {return color(d.total-1); });

    cell.append("svg:text")
        .attr("x", function(d) { return d.dx / 2; })
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr('class', 'perc-text')
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; })
        .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    cell.append("svg:text")
        .attr("x", function(d) { return 2; })
        .attr("y", function(d) { return 6; })
        .attr("dy", ".35em")
        .attr('class', 'tinytext')
        .text(function(d) { return numberWithCommas(d.total-1); })
        .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    d3.select(window).on("click", function() { zoom(root); });

    d3.select("select").on("change", function() {
        //treemap.value(this.value == "size" ? size : count).nodes(root);
        treemap.value(total).nodes(root);
        zoom(node);
    });

    function total(d) {
        return d.total;
    }

    function zoom(d) {
        var kx = w / d.dx, ky = h / d.dy;
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        var t = svg.selectAll("g.cell").transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        t.select("rect")
            .attr("width", function(d) { return kx * d.dx - 1; })
            .attr("height", function(d) { return ky * d.dy - 1; })

        t.select("text")
            .attr("x", function(d) { return kx * d.dx / 2; })
            .attr("y", function(d) { return ky * d.dy / 2; })
            .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

        node = d;
        d3.event.stopPropagation();
    }
}


jQuery(document).ready(function() {
    getAllSets();

    jQuery('#sets-list').on('change', function() {
	var s = jQuery(this).find('option:selected').attr('item');

	var vars = [];
	var promises = [];
	for(se_idx in sets) {
	    var se = sets[se_idx];
	    if (se['id'] == s) {
		for(var i = 0; i < se['variables'].length; i++) {
		    var p = addOneMeasure(se['variables'][i]);
		    if (p !== null)
			promises.push(p);
		}
		break;
	    }
	}
	jQuery.when.apply(jQuery, promises).then(function() {
	    // ok, all variable values are now in allMeasures
	    var s = jQuery('#sets').find('option:selected').attr('item');
	    var data = { "src_subject_id": allMeasures["src_subject_id"], "eventname": allMeasures['eventname'], "site": '' };
	    for (se_idx in sets) {
		var se = sets[se_idx];
		if (se['id'] == s) {
		    for (var i = 0; i < se['variables'].length; i++)
			data[se['variables'][i]] = allMeasures[se['variables'][i]];
		}
	    }
	    // start the rendering
            jQuery('svg').children().remove();
	    createGraph(data);
	});	
    });

});

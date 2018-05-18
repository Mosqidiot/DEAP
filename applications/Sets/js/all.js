
function displaySet( s ) {
    jQuery("#cards").append("<div class='card' id='"+s['id']+"' owner='" + s['owner'] + "'><h1 class='card-title'>" + s['name'] + "</h1><div class='owner'>" + s['owner'] + "</div><div class='variables'></div></div>");
    for (var i = 0; i < s['variables'].length; i++) {
	jQuery("#"+s['id']+" .variables").append("<div class='var-entry' item='"+s['variables'][i]+"'>"+ (i+1) + ") "+s['variables'][i]+"<div class='pull-right'><button class='btn remove-variable' item='"+s['variables'][i]+"'>x</div></div></div>");
    }
}

function update( id ) {
    // get the values for this card and update the display
    jQuery.getJSON('getSets.php', { "action": "get", "id": id }, function(data) {
        data = data[0];
        console.log(JSON.stringify(data));
        // in case we don't have this id yet, create a new one
        if (!jQuery('#'+data['id']).length) {
            jQuery('#cards').append("<div class='card' id='" + data['id'] + "' owner='" + data['owner'] + "'><h1 class='card-title'>" + data['name'] + "</h1><div class='owner'>" + data['owner'] + "</div><div class='variables'></div></div>");
        }
        jQuery('#'+id).find('h1.card-title').text(data['name']);
        jQuery('#'+id).find('div.owner').text(data['owner']);
        var vars = jQuery('#'+id).find('div.variables');
        vars.children().remove();
        for (var i = 0; i < data['variables'].length; i++) {
            jQuery(vars).append("<div class='var-entry'>" + (i+1) + ") " +
                                data['variables'][i] + "<div class='pull-right'>" +
                                "<button class='btn remove-variable' item='" +
                                data['variables'][i]+"'>x</div></div></div>");
        }
    });
}

function getSets() {
    jQuery.getJSON('getSets.php', function(data) {
	if (data == null)
	    return;
	jQuery('.num-sets').text(data.length);
	for (var i = 0; i < data.length; i++) {
	    displaySet(data[i]);
	}
	// make card editable
	jQuery('.card-title').editable(function(value, settings) {
	    console.log("got a changed value");
	    console.log(value);
	    console.log(settings);
	    jQuery.getJSON('getSets.php', { "action": "save", "name": value, "id": jQuery(this).parent().attr("id") }, function(data) {
		console.log("got back: " + data);
	    });
	    return value;
	}, {
	    type: 'textarea',
	    method: 'GET',
	    submit: 'OK'
	});
    });
}

var lastSearch = "";
var startTime = "";
var endTime = "";
function search( t ) {
    if (t == lastSearch) {
	return; // do nothing
    }
    // time the search
    startTime = performance.now();
    jQuery.get('/applications/Ontology/searchTerm2.php', { 'search': t }, function(data) {
	//console.log("got data back from search");
	endTime = performance.now();
	populate_results(JSON.parse(data));
	lastSearch = t;
    });
}

function populate_results(data) {
    // time this took
    var t = endTime - startTime;
    if (data.length < 100) {
	jQuery('#search-summary').text(data.length + " result" + (data.length==1?"":"s") + " (" + (t*0.001).toFixed(2) + " seconds)");
    } else if(data == null || data.length == undefined) {
	jQuery('#search-summary').text("No results");
    } else {
	jQuery('#search-summary').text("More than " + data.length + " results (" + (t*0.001).toFixed(2) + " seconds)");
    }
    jQuery('#results').children().remove();    
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
	var no = d['notes'];
	if (no === null || no === 'Required field') {
	    no = "";
	} else {
	    no = "<br/>" + no;
	}
        jQuery('#results').append('<dt class="comment-slider" item="'+ d['name'] +'" instrument="'+d['instrument']+'"><button class="btn btn-pm" item="' + d['name'] + '">+</button> <span class="item-name">' + d['name'] + '</span> in ' + d['title'] + " / " + d['instrument'] +
				  ' [' + d['categories'].join(",") + ']' +
				  '</dt><dd>search term: ' + d['marker'] +
				  '<br/><span id="result-' + i + '">'+d['description'] + no + '</span></dd>');
	if (typeof d['marker'] !== 'undefined' && d['marker'].length > 0) {
	    //for (var j = 0; j < d['marker'].length; j++){
	    console.log("marker is now: " + d['marker']);
	    jQuery('#result-' + i).highlight(d['marker']);
	    jQuery('#result-' + i).parent().prev().highlight(d['marker']);
	    //}
	}
    }
}

jQuery(document).ready(function() {
    // start by getting the sets
    getSets();

    var $contextMenu = $("#contextMenu");
    $("body").on("contextmenu", ".card", function(e) {
	$contextMenu.css({
	    display: "block",
	    left: e.pageX,
	    top: e.pageY
	});
	jQuery($contextMenu).attr("target", jQuery(this).attr('id'));
	return false;
    });

    $contextMenu.on("click", "a", function() {
	var action = jQuery(this).attr('action');
	var id     = jQuery(this).parent().parent().parent().attr('target')

	console.log("got action: " + action + " for: " + id);
	if (action == "delete") {
	    console.log('got id' + id + " to delete");
	    jQuery.getJSON('getSets.php', { 'action': "delete", "id": id }, function(data) {
		console.log("done: " + data['message']);
	    });
	}
	$contextMenu.hide();
    });
    
    jQuery('#cards').on('click', '.remove-variable', function(data) {
	console.log("remove this variable again");
        var id       = jQuery(this).parent().parent().parent().parent().attr('id');
        var owner    = jQuery(this).parent().parent().parent().parent().attr('owner');
        var variable = jQuery(this).attr('item');
        if (owner == "public") {
            // make a copy of this entry first before changing it
            jQuery.getJSON('getSets.php', { 'action': 'duplicate', 'id': id }, (function(item) {
                return function(data) {
                    id = data['id'];
                    if (id !== "") {
 	                jQuery.getJSON('getSets.php', { "action": "removeMeasure", "id": id, "variable": item }, function(data) {
		            console.log("data: " + data['message']);
                            update( id );
                            jQuery('#card').children().removeClass('card-active');
                            jQuery("#card.cards[id='" + id + "']").addClass('card-active');
	                });
                    }
                };
            })(variable));
        } else {
 	    jQuery.getJSON('getSets.php', { "action": "removeMeasure", "id": id, "variable": jQuery(this).attr('item') }, function(data) {
		console.log("data: " + data['message']);
                update(id);
                jQuery('#card').children().removeClass('card-active');
                jQuery("#card.cards[id='" + id + "']").addClass('card-active');
	    });
        }
    });
    
    jQuery('#cards').on('click', '.var-entry', function() {
	var v = jQuery(this).attr('item');
	jQuery('#search').val(v);
	jQuery('#search').focus();
	var e = jQuery.Event('keyup');
	e.which = 13;
	jQuery('#search').trigger(e);
    });
    
    jQuery('.search-results').on('click', '.btn-pm', function() {
	var activeCard = jQuery('#cards .card-active').attr('id');
        var owner      = jQuery('#cards .card-active').attr('owner');
        var item       = jQuery(this).attr('item');
	if (activeCard == null) {
	    alert('Select a set to add this measure to first.');
	    return false;
	}
	console.log("got click on PLUS " + jQuery(this).attr('item') + " active panel is : " + activeCard);
        if (owner == "public") {
            jQuery.getJSON('getSets.php', { 'action': 'duplicate', 'id': activeCard }, (function(item) {
                return function(data) {
                    id = data['id'];
                    if (id !== "") {
                        jQuery.getJSON('getSets.php', { "action": "addMeasure", "id": id, "variable": item }, function(data) {
	                    console.log("got: " + data['message']);
	                    update(activeCard);
                            jQuery('#card').children().removeClass('card-active');
                            jQuery("#card.cards[id='" + activeCard + "']").addClass('card-active');
	                });
                    }
                };
            })(item));
        } else {
            jQuery.getJSON('getSets.php', { "action": "addMeasure", "id": activeCard, "variable": jQuery(this).attr('item') }, function(data) {
	        console.log("got: " + data['message']);
	        update(activeCard);
	    });
        }
	return false;
    });
    
    jQuery('#cards').on('click', '.card', function() {
	jQuery('#cards').children().removeClass('card-active');
	jQuery(this).addClass('card-active');
    });
    
    jQuery('.add-set').on('click', function() {
	// add another card
	jQuery.getJSON('getSets.php', { "action": "create", "name": "unnamed", "variables": [] }, function(data) {
	    displaySet(data);
            jQuery('#card').children().removeClass('card-active');
            jQuery("#card.cards[id='" + data['id'] + "']").addClass('card-active');
	});
    });
    
    jQuery('#right').css('height', jQuery(window).height()-55);
    jQuery(window).on('resize', function() {
	jQuery('#right').css('height', jQuery(window).height()-55);
    });
    
    jQuery('#search').focus();
    jQuery('#search').on('keyup', function(event) {
	var t = jQuery('#search').val();
	//jQuery('#results').children().remove();
	if (event.keyCode === 13) {
	    //console.log('do you want to tell me something?');
	    var tt = t.split(' is a ');
	    if (tt.length == 2) {
		//console.log("Detected: " + tt[0] + " => " + tt[1]);
		// send to the searchEngine
		jQuery('#results').children().remove();
		jQuery.get('/applications/Ontology/searchTerm2.php', { 'teach': JSON.stringify(tt) }, function(data) {
		    //console.log("send teaching information " + JSON.stringify(tt) + " to searchServer...");
		    jQuery('#results').append("<div>You taught the system to associate " + tt[0] + " with " + tt[1] + ". To see what is known enter \"what have you learned\".</div>");
		});
		return;
	    }
	    var tt = t.split(' is not a ');
	    if (tt.length == 2) {
		console.log("Detected: " + tt[0] + " => " + tt[1]);
		// send to the searchEngine
		jQuery('#results').children().remove();		
		jQuery.get('/applications/Ontology/searchTerm2.php', { 'unteach': JSON.stringify(tt) }, function(data) {
		    console.log("send un-teaching information " + JSON.stringify(tt) + " to searchServer...");
		    jQuery('#results').append("<div>I try to forget to associate " + tt[0] + " with " + tt[1] + "</div>");
		});
		return;
	    }
	    if (t.match(new RegExp("what have (you|I|i) learned")) !== null) {
		jQuery('#results').children().remove();
		jQuery.get('/applications/Ontology/searchTerm2.php', { 'whathaveyoulearned': 1 }, function(data) {
		    if (data.length == 0)
			return;
		    data = JSON.parse(data);
		    jQuery('#results').append("<div>You taught me:<br/><pre class='prettyprint lang-go linenums'>" + JSON.stringify(data, null, 4) + "</pre><br/> Want to un-learn something? Enter: [Groot] is not a [plant]</div>");
		    PR.prettyPrint();
		});
		return;
	    }
	    
	}	
	search(t);
    });
    
    jQuery('#results').on('click', '.comment-slider', function() {
	var item = jQuery(this).attr('item');
	var instrument = jQuery(this).attr('instrument');
	var elem = jQuery(this);
	if (elem.next().is('#entries')) { // click on the same element a second time
	    jQuery('#entries').slideUp("slow", function() { jQuery(this).remove(); });
	    return false; // do nothing else
	}
	var step2 = jQuery.Deferred();
	var step1 = jQuery.getJSON('/applications/Ontology/searchTerm2.php?getComments=' + item, function(data) {
	    str = '<div id="entries">';
	    var keys = Object.keys(data);
	    for (var i = 0; i < keys.length; i++) {
		str = str + '<div class="entry"><p><b>' + keys[i] + ':</b> ' + data[keys[i]] + '</p>'+
		    '</div>';
	    }
	    str = str + '<div id="stats"></div><div style="text-align: right;"><a href="https://ndar.nih.gov/data_structure.html?short_name=' + instrument + '" target="_NDA">[Open NDA for ' + instrument+ ' (new tab)]</a></div></div>';
	    if (jQuery('#entries').length == 0) {
   		jQuery(elem).after(str);
		step2.resolve("done");
		//jQuery('#entries').hide().slideDown("slow");
	    } else {
		jQuery('#entries').slideUp("fast", function() {
		    jQuery(this).remove();
   		    jQuery(elem).after(str);
		    // only start the next step if this one finishes (set another promise to resolved)
		    step2.resolve("done");
		    //jQuery('#entries').hide().slideDown("slow");
		});
	    }
	    return true;
	});
	jQuery.when(step1, step2).done(function() {
	    jQuery.getJSON("/applications/Ontology/searchTerm2.php?getStats=" + item, function(data) {
		// add stats to #entries
		var d = [];
		if (typeof data['histograms'] !== 'undefined' && data['histograms'] !== "") {
		    // pick the correct histogram
		    histogram = undefined;
		    for (var i = 0; i < data['histograms'].length; i++) {
			if (data['histograms'][i]['transform'].length == 0) {
			    histogram = data['histograms'][i];
			    break;
			}
		    }
		    if (histogram !== undefined && typeof histogram['histogram'] !== 'undefined') {
			for (var i = 0; i < histogram['histogram']['counts'].length; i++) {
			    d.push({ 'frequency': histogram['histogram']['counts'][i], 'x': histogram['histogram']['mids'][i] });
			}
		    }
		}
		var sumstr = "<table><tbody style='font-size: 10pt; line-height: 1.1em;'>";
		var obj = Object.keys(data['summary']);
		for (var i = 0; i < obj.length; i++) {
		    // sanitize the text (remove html and ##)
		    var str = obj[i]; //jQuery(obj[i]).text();
		    str = str.replace("##en##","").replace("##/en##", "&nbsp;").replace("##es##","").replace("##/es##","");
		    sumstr = sumstr + '<tr><td style="text-align: right;">' + (obj[i]==""?"''":str) +'</td><td style="text-align: left; padding-left:5px;">' + data['summary'][obj[i]].toLocaleString() + "</td></tr>";
		}
		sumstr = sumstr + "</tbody></table>";
		
		jQuery('#stats').html("<div>"+ sumstr + "</div>" + (d.length>0?"<svg id='histogram' height='280'></svg>":""));
		jQuery('svg#histogram').attr('width', jQuery('#stats').width());
		jQuery('span[lang="es"]').hide();
		// now draw the histogram if it exists
		if (d.length == 0) {
		    jQuery('#entries').hide().slideDown("slow");
		    console.log("nothing else to be done...");
		    return; // nothing to do here
		}
		data = d;
		
		var svg = d3.select("#histogram"),
		    margin = {top: 20, right: 40, bottom: 30, left: 40},
		    width  = +svg.attr("width") - margin.left - margin.right,
		    height = +svg.attr("height") - margin.top - margin.bottom;
		
		var x = d3.scale.linear().range([0-0.1, width+0.1]), //.padding(0.1),
		    y = d3.scale.linear().rangeRound([height, 0]);
		
		var g = svg.append("g")
	            .attr("transform", "translate(" + (margin.left/1.5) + "," + margin.top + ")");
		
		var barWidth = width / (data.length);
		var mi = d3.min(data, function(d) { return d.x; });
		var ma = d3.max(data, function(d) { return d.x; });
		//x.domain([mi-(ma-mi)/(data.length-1), ma+(ma-mi)/(data.length-1)]);
		x.domain([mi, ma]);
		y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
		
		g.append("g")
		    .attr("class", "axis axis--x")
		    .attr("transform", "translate(0," + height + ")")
		    .call(d3.svg.axis().scale(x).orient("bottom"));
		
		g.selectAll(".bar")
		    .data(data)
		    .enter().append("rect")
		    .attr("class", "bar")
		    .attr("x", function(d) {
			return x(d.x)-(barWidth/2);
		    })
		    .attr("y", function(d) {
			return y(d.frequency);
		    })
		    .attr("width", function(d) {
			return barWidth - 1;
		    })
		    .attr("height", function(d) {
			var h = height - y(d.frequency);
			if (h < 1 && d.frequency > 0)
			    h = 1;
			return h;
		    });
		
		g.selectAll(".label")
		    .data(data)
		    .enter().append("text")
		    .attr("x", function(d) { return x(d.x); })
		    .attr("y", function(d) {
			if ( y(d.frequency) > (height-30))
			    return y(d.frequency) - 10;
			return y(d.frequency) + 3;
		    })
		    .attr("dy", ".75em")
		    .attr('class', function(d) {
			if (y(d.frequency) > (height-30))
			    return 'black';
			return 'white';
		    })
		    .text(function(d) { if (d.frequency < 1) return ""; return d.frequency; });
		
		console.log("now slide down again to show stats");
		jQuery('#entries').hide().slideDown("slow");
	    });	    
	});
    });
});


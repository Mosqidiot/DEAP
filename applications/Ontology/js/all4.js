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
        jQuery('#results').append('<dt class="comment-slider" item="'+ d['name'] +'" instrument="'+d['instrument']+'"><span class="item-name">' + d['name'] + '</span> in ' + d['title'] + " / " + d['instrument'] +
				  ' [' + d['categories'].join(",") + ']' +
				  '</dt><dd>search term: ' + d['marker'][0] + (d['marker'].length > 1?(" - " + d['marker'][1]):"") + 
				  '<br/><span id="result-' + i + '">'+d['description'] + no + '</span></dd>');
	if (typeof d['marker'] !== 'undefined' && d['marker'].length > 1 && d['marker'][0].length > 0) {
	    console.log("marker is now: " + d['marker'][0]);
	    jQuery('#result-' + i).highlight(d['marker'][0]);
	    jQuery('#result-' + i).parent().prev().highlight(d['marker'][0]);
	}
    }
}

jQuery(document).ready(function() {
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

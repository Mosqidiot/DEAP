var lastSearch = "";
var startTime = "";
var endTime = "";
var mode = "Normal";
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
				  '</dt><dd>search term: ' + d['marker'] +
				  '<br/><span id="result-' + i + '">'+d['description'] + no + '</span></dd>');
	if (typeof d['marker'] !== 'undefined' && d['marker'].length > 0) {
	    //for (var j = 0; j < d['marker'].length; j++) {
		jQuery('#result-' + i).highlight(d['marker']);
	    //}
	}
    }
}

function switchMode( name ) {
    mode = name; // set the global variable to remember what mode we are in
    jQuery('#mod-name').text(name);
    if (name == "Tutorial") {
        // move the tutorial-mode blocks to the correct location
        jQuery('.tutorial-mode').each(function(index, element) {
            // do we have an attribute called tutafter?
            var a = jQuery(element).attr('tutafter');
            var b = jQuery(element).attr('tutbefore');
            var show = false;
            if (a != undefined && jQuery(a).length > 0) {
                jQuery(element).insertAfter(jQuery(a));
                show = true;
            }
            
            if (b != undefined && jQuery(b).length > 0) {
                jQuery(element).insertBefore(jQuery(b));
                show = true;
            }
            if (show)
                jQuery(element).fadeIn();
        });
    } else if(name == "Normal") {
        jQuery('.tutorial-mode').fadeOut();
    } else if (name == "Expert") {
        jQuery('.tutorial-mode').fadeOut();
    }
}

jQuery(document).ready(function() {
    jQuery('.page-mode').on('click', function() {
	var name = "";
	if (jQuery(this).hasClass('active')) {
	    name = "Normal";
  	    jQuery(this).removeClass('active');
	} else {
	    name = "Tutorial";
  	    jQuery(this).addClass('active');
	}
	// jQuery(this).siblings().removeClass('active');
	switchMode(name);
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
	if(jQuery(".ui-dialog-buttonpane").find("button").length <= 5){
	    if(jQuery(".ui-dialog-buttonpane").find("button[value="+item+"]").length == 0){
	        jQuery(".ui-dialog-buttonpane").prepend(
		    jQuery("<button>")
		        .attr("class","variable-button-tag btn-sm btn btn-outline-secondary")
		        .attr("value", item)
		        .html(item+' &times;')
		        .button()
		    .click(function(){jQuery(this).remove()})
	        );	
	    }
	}
	if (elem.next().is('#entries')) {
	    jQuery('#entries').slideUp("slow", function() { jQuery(this).remove(); });
	    return; // do nothing else
	}
	jQuery.getJSON('/applications/Ontology/searchTerm2.php?getComments=' + item, function(data) {
	    str = '<div id="entries">';
	    var keys = Object.keys(data);
	    for (var i = 0; i < keys.length; i++) {
		str = str + '<div class="entry"><p><b>' + keys[i] + ':</b> ' + data[keys[i]] + '</p>'+
		    '</div>';
	    }
	    str = str + '<div id="stats"></div><div style="text-align: right;"><a href="https://ndar.nih.gov/data_structure.html?short_name=' + instrument + '" target="_NDA">[Open NDA for ' + instrument+ ' (new tab)]</a></div></div>';
	    if (jQuery('#entries').length == 0) {
   		jQuery(elem).after(str); 
		jQuery('#entries').hide().slideDown("slow");
	    } else {
		jQuery('#entries').slideUp("slow", function() {
		    jQuery(this).remove();
   		    jQuery(elem).after(str); 
		    jQuery('#entries').hide().slideDown("slow");
		});
	    }
	    jQuery.getJSON("/applications/Ontology/searchTerm2.php?getStats=" + item, function(data) {
		// add stats to #entries
		var d = [];
		if (typeof data['histograms'] !== 'undefined' && data['histograms'] !== "") {
		    var temp;
		    for(var vh in data['histograms']){
			temp = data['histograms'][vh];
	                if(temp.transform.length == 0) break;
		    }
	            if(temp){
		    for (var i = 0; i < temp['histogram']['counts'].length; i++) {
			d.push({ 'frequency': temp['histogram']['counts'][i], 'x': temp['histogram']['mids'][i] });
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
		jQuery("#histogram").attr('width', jQuery('#stats').width());
		jQuery('span[lang="es"]').hide();
		// now draw the histogram if it exists
		if (d.length == 0) {
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
		

		jQuery('#entries').hide().slideDown();
	    });
	    
	});
    });
});


 function getAllFilters(default_value) {
   jQuery.getJSON('/applications/Filter/getFilter.php', function(data) {
       filters = data;
       jQuery('select.existingFilters').children().remove();
       
       // add the null filter first
       for (var i = 0; i < filters.length; i++) {
           var optGrp = document.createElement('optgroup');
           jQuery(optGrp).attr('label', filters[i]["name"]);
           jQuery('select.existingFilters').append(optGrp);
           for (var j = 0; j < filters[i]["rules"].length; j++) {
		var mdcode = hex_md5(project_name + filters[i]["rules"][j]["func"].replace(/\s/g,'') + "YES").slice(-4);	       
               jQuery(optGrp).append('<option value = "'+ '/var/www/html/applications/Filter/data/filterSets_'+project_name +'_'+ mdcode+'.json">' + filters[i]["rules"][j]["name"] + '</option>');     
           }
       }
       jQuery('select.existingFilters').val(default_value)
       .select2({placeholder: "",  allowClear: false });
   });
 }

 function changeSearch() {
    jQuery('.loading').show();
    // do a partial load of only the variables of interest (overwrite allMeasures)
    var requiredVariables = [ "gender", "src_subject_id", "eventname" ];
    
    // get the variables from the searchTerm
    var search = jQuery('.inputmeasures').val();
    var searchTerms = [];
    try {
        searchTerms = search.match(/[\"$]*[A-Za-z0-9_\.]+[\"\ ]*?/g).map(function(v){ return v.replace(/[\"\$]/g,''); });
    } catch(e) {};
    // create unique list of variables
    searchTerms = searchTerms.sort();
    for (var i = 1; i < searchTerms.length; i++) {
        if (searchTerms[i] == searchTerms[i-1]) {
            searchTerms.splice(i,1);
            i--;
        }
    }
    
    var languageKeywords = [ "has", "not", "and", "or", "visit", "numVisits" ];
    for (var i = 0; i < searchTerms.length; i++) {
        var idx = languageKeywords.indexOf(searchTerms[i]);
        if ( idx !== -1 || searchTerms[i] == +searchTerms[i] ) {
            searchTerms.splice(i, 1);
            i--; // check same position again because we removed one entry
        }
    }
    
    searchTermsAll = searchTerms.slice(0);
    searchTermsAll.push.apply(searchTermsAll, requiredVariables);
    // make sure we load all of them
    var promises = [];
    for (var i = 0; i < searchTermsAll.length; i++) {
        if (typeof allMeasures[searchTermsAll[i]] === 'undefined') {
            var p = addOneMeasure(searchTermsAll[i]);
            if (p !== null)
                promises.push(p);
        }
    }
    // wait for all the measures to come back before we continue
    jQuery.when.apply(jQuery, promises).then(function() {
        console.log("now we can continue with our work");
        // now we know what variables are known, lets filter searchTerms again
        var nst = [];
        for (var i = 0; i < searchTerms.length; i++) {
            if (typeof allMeasures[searchTerms[i]] !== 'undefined')
                nst.push(searchTerms[i]);
        }
        searchTerms = nst;
        
        parse();
        jQuery('.spot').remove();
        try {
            createTermInfo(searchTerms);
        } catch(e) {};
        // create the output for this stage
        // check if output exists?
        if (jQuery('#start div .dataHere').parent().next().next().children(':first').find('.yes').length == 0) {
            var newDParent = jQuery('#start div .dataHere').parent().parent();
            var newDiv = document.createElement("div");
            jQuery(newDiv).addClass("row-fluid").css('margin-top', '-10px');
            if (jQuery('.yes').length == 0) {
                var yes = document.createElement("div");
                jQuery(yes).addClass("col-xs-6");
                jQuery(yes).addClass("yes");
                //createBlock(yes);
                // fill this block
                
                jQuery(newDiv).append(yes);
                var no = document.createElement("div");
                jQuery(no).addClass("col-xs-6");
                 jQuery(no).addClass("no");
                //createBlock(no);
                // fill this block
                
                jQuery(newDiv).append(no);
                jQuery(newDParent).append("<div class=\"row-fluid\"><div class=\"sectionTitle col-xs-12\">Result of the current restriction</div></div>");
                jQuery(newDParent).append(newDiv);
            }
        }
        jQuery('.loading').hide();
        
    }, function() {
        console.log("Error waiting for promises...");
    });     
}
function createTermInfo( searchTerms ) {
   // look through allMeasures
   var infoStr = "";
   jQuery('#info').html(infoStr);
   searchTerms.forEach( function(t) {

     var idWhat = -1;
     for (var i = 0; i < header.length; i++) {
       if (t == header[i]) {
         idWhat = i;
         break;
       }
     }
     if (idWhat == -1) {
       infoStr = infoStr + "<div class=\"info\"><span>"+t+" is unknown</span></div>";      
       return;
     }

     var min = +allMeasures[header[idWhat]][0];
     var max = min;
     if (isNaN(min)) {
        min = allMeasures[header[idWhat]][0];
        max = "";
        // search for the next entry
        for (var i = 1; i < allMeasures['src_subject_id'].length; i++) {
          if (allMeasures[header[idWhat]][i] !== "" && allMeasures[header[idWhat]][i] !== min) {
              max = allMeasures[header[idWhat]][i]; // just show the first two as examples 
              break;
          }
        }
     } else {
         for (var i = 0; i < allMeasures['src_subject_id'].length; i++) {
             if (!isNaN(allMeasures[header[idWhat]][i])) {
                 if (min > allMeasures[header[idWhat]][i])
                     min = +allMeasures[header[idWhat]][i];
                 if (max < allMeasures[header[idWhat]][i])
                     max = +allMeasures[header[idWhat]][i];
             }
         }
         min = parseFloat(min).toFixed(2);
         max = parseFloat(max).toFixed(2);
     }
     infoStr = infoStr + "<div class=\"info\"><span>" + t + "</span> <span> " + min.toString() + "</span>...<span>" + max.toString() + "</span></div>";
   });
   jQuery('#info').html(infoStr);
 }


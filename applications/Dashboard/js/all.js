jQuery(document).ready(function() {
    updateData();
    setInterval(changeData, 10000);
});


function changeData(){
    jQuery.getJSON('getData.php', function(data) {
	var d = new Date();
	jQuery('.time').text( "at " + d.getHours() + ":" + d.getMinutes() );
	for ( var i = 0; i < data.length; i++) {
	    for (var key in data[i]) { // each key is a tupel of min, max, val, unit
		if (key == 'name')
		    continue;
		if (data[i][key][0] == "minmax") {
		    var perc = 100 - (data[i][key][3]-data[i][key][1])/(data[i][key][2]-data[i][key][1])*100;
                    dat = [];
		    dat.push( { label: key+' used', value: 100-perc, color: "#3366CC" } );
		    dat.push( { label: key+' free', value: perc, color: "#FF9900" } );
		    
		    gradPie.transition('svg'+data[i].name+'_'+key, dat, 20);
		}
		if (data[i][key][0] == "bar" ) {
		    // doBarPlot( data[i][key][1] );
		}
		if (data[i][key][0] == "text" ) {
		    // doPrintText( data[i][key][1] );
		    jQuery('#'+data[i].name+'_'+key).html( data[i][key][1] );
		}
	    }
	}
    });
}

function updateData() {
    jQuery.getJSON('getData.php', function(data) {
	for ( var i = 0; i < data.length; i++) {
   	    jQuery('#graphs').append('<div id=' + data[i].name + '><h3>'+ data[i].name +'<small>&nbsp;['+data[i].info+']</small><h3></div>');
	    for (var key in data[i]) { // each key is a tupel of min, max, val, unit
		if (key == 'name')
		    continue;
		if (data[i][key][0] == "minmax") {
		    var perc = 100 - (data[i][key][3]-data[i][key][1])/(data[i][key][2]-data[i][key][1])*100;
 	            jQuery('#'+data[i].name).append('<span id="'+data[i].name+'_'+key+'">' + key + ' ' + perc.toFixed(1) + '%' + '</span>' );
                    dat = [];
		    dat.push( { label: key+' used', value: 100-perc, color: "#3366CC" } );
		    dat.push( { label: key+' free', value: perc, color: "#FF9900" } );
		    var svg = d3.select('#'+data[i].name+'_'+key).append("svg").attr("width", 50).attr("height", 60);
		    svg.append("g").attr("id",'svg'+data[i].name+'_'+key);
		    gradPie.draw('svg'+data[i].name+'_'+key, dat, 20, 20, 20);
		}
		if (data[i][key][0] == "bar" ) {
		    doBarPlot( data[i][key][1] );
		}
		if (data[i][key][0] == "text" ) {
		    jQuery('#'+data[i].name).append('<div id="'+data[i].name+'_'+key+'">'+data[i][key][1]+'</div>');
		}
	    }
	}
    });
}

function doBarPlot( data ) {
    var w = jQuery(document).width()-160;
    var m = [20, 100, 0, 160], // top right bottom left
    w = w - m[1] - m[3], // width
    h = 800 - m[0] - m[2], // height
    x = d3.scale.linear().range([0, w]),
    y = 25, // bar height
    z = d3.scale.ordinal().range(["steelblue", "#aaa"]); // bar color

    var hierarchy = d3.layout.partition()
	.value(function(d) { return d.size; });

    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("top");
    
    var svg = d3.select("#graphs").append("svg:svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
	.append("svg:g")
	.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    svg.append("svg:rect")
	.attr("class", "background")
	.attr("width", w)
	.attr("height", h)
	.on("click", up);

    svg.append("svg:g")
	.attr("class", "x axis");

    svg.append("svg:g")
	.attr("class", "y axis")
	.append("svg:line")
	.attr("y1", "100%");

    /* d3.json("flare.json", function(root) {
	hierarchy.nodes(root);
	x.domain([0, root.value]).nice();
	down(root, 0);
    });*/
    hierarchy.nodes(data);
    x.domain([0, data.value]).nice();
    down(data, 0);

    function down(d, i) {
	if (!d.children || this.__transition__) return;
	var duration = d3.event && d3.event.altKey ? 7500 : 750,
	delay = duration / d.children.length;

	// Mark any currently-displayed bars as exiting.
	var exit = svg.selectAll(".enter").attr("class", "exit");
	
	// Entering nodes immediately obscure the clicked-on bar, so hide it.
	exit.selectAll("rect").filter(function(p) { return p === d; })
	    .style("fill-opacity", 1e-6);
	
	// Enter the new bars for the clicked-on data.
	// Per above, entering bars are immediately visible.
	var enter = bar(d)
	    .attr("transform", stack(i))
	    .style("opacity", 1);
	
	// Have the text fade-in, even though the bars are visible.
	// Color the bars as parents; they will fade to children if appropriate.
	enter.select("text").style("fill-opacity", 1e-6);
	enter.select("text").style("fill", '#AAAAAA');
	enter.select("rect").style("fill", z(true));
	
	// Update the x-scale domain.
	x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();
	
	// Update the x-axis.
	svg.selectAll(".x.axis").transition()
	    .duration(duration)
	    .call(xAxis);
	
	// Transition entering bars to their new position.
	var enterTransition = enter.transition()
	    .duration(duration)
	    .delay(function(d, i) { return i * delay; })
	    .attr("transform", function(d, i) { return "translate(0," + y * i * 1.2 + ")"; });
	
	// Transition entering text.
	enterTransition.select("text").style("fill-opacity", 1);
	
	// Transition entering rects to the new x-scale.
	enterTransition.select("rect")
	    .attr("width", function(d) { return x(d.value); })
	    .style("fill", function(d) { return z(!!d.children); });
	
	// Transition exiting bars to fade out.
	var exitTransition = exit.transition()
	    .duration(duration)
	    .style("opacity", 1e-6)
	    .remove();
	
	// Transition exiting bars to the new x-scale.
	exitTransition.selectAll("rect").attr("width", function(d) { return x(d.value); });
	
	// Rebind the current node to the background.
	svg.select(".background").data([d]).transition().duration(duration * 2); d.index = i;
    }
    
    function up(d) {
	if (!d.parent || this.__transition__) return;
	var duration = d3.event && d3.event.altKey ? 7500 : 750,
	delay = duration / d.children.length;
	
	// Mark any currently-displayed bars as exiting.
	var exit = svg.selectAll(".enter").attr("class", "exit");
	
	// Enter the new bars for the clicked-on data's parent.
	var enter = bar(d.parent)
	    .attr("transform", function(d, i) { return "translate(0," + y * i * 1.2 + ")"; })
	    .style("opacity", 1e-6);
	
	// Color the bars as appropriate.
	// Exiting nodes will obscure the parent bar, so hide it.
	enter.select("rect")
	    .style("fill", function(d) { return z(!!d.children); })
	    .filter(function(p) { return p === d; })
	    .style("fill-opacity", 1e-6);
	
	// Update the x-scale domain.
	x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();
	
	// Update the x-axis.
	svg.selectAll(".x.axis").transition()
	    .duration(duration * 2)
	    .call(xAxis);
	
	// Transition entering bars to fade in over the full duration.
	var enterTransition = enter.transition()
	    .duration(duration * 2)
	    .style("opacity", 1);
	
	// Transition entering rects to the new x-scale.
	// When the entering parent rect is done, make it visible!
	enterTransition.select("rect")
	    .attr("width", function(d) { return x(d.value); })
	    .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });
	
	// Transition exiting bars to the parent's position.
	var exitTransition = exit.selectAll("g").transition()
	    .duration(duration)
	    .delay(function(d, i) { return i * delay; })
	    .attr("transform", stack(d.index));
	
	// Transition exiting text to fade out.
	exitTransition.select("text")
	    .style("fill-opacity", 1e-6);
	
	// Transition exiting rects to the new scale and fade to parent color.
	exitTransition.select("rect")
	    .attr("width", function(d) { return x(d.value); })
	    .style("fill", z(true));
	
	// Remove exiting nodes when the last child has finished transitioning.
	exit.transition().duration(duration * 2).remove();
	
	// Rebind the current parent to the background.
	svg.select(".background").data([d.parent]).transition().duration(duration * 2);
    }
    
    // Creates a set of bars for the given data node, at the specified index.
    function bar(d) {
	var bar = svg.insert("svg:g", ".y.axis")
	    .attr("class", "enter")
	    .attr("transform", "translate(0,5)")
	    .selectAll("g")
	    .data(d.children)
	    .enter().append("svg:g")
	    .style("cursor", function(d) { return !d.children ? null : "pointer"; })
	    .on("click", down);

	bar.append("svg:text")
	    .attr("x", -6)
	    .attr("y", y / 2)
	    .attr("dy", ".35em")
	    .attr("text-anchor", "end")
	    .text(function(d) { return d.name + (typeof d.project !== 'undefined'? " - " + d.project:""); });

	bar.append("svg:rect")
	    .attr("width", function(d) { return x(d.value); })
	    .attr("height", y);

	return bar;
    }

// A stateful closure for stacking bars horizontally.
    function stack(i) {
	var x0 = 0;
	return function(d) {
	    var tx = "translate(" + x0 + "," + y * i * 1.2 + ")";
	    x0 += x(d.value);
	    return tx;
	};
    }

}

!function(){
    var gradPie={};
    
    var pie = d3.layout.pie().sort(null).value(function(d) {return d.value;});
    
    createGradients = function(defs, colors, r){	
	var gradient = defs.selectAll('.gradient')
	    .data(colors).enter().append("radialGradient")
	    .attr("id", function(d,i){return "gradient" + i;})
	    .attr("gradientUnits", "userSpaceOnUse")
	    .attr("cx", "0").attr("cy", "0").attr("r", r).attr("spreadMethod", "pad");
	
	gradient.append("stop").attr("offset", "0%").attr("stop-color", function(d){ return d;});
	
	gradient.append("stop").attr("offset", "30%")
	    .attr("stop-color",function(d){ return d;})
	    .attr("stop-opacity", 1);
	
	gradient.append("stop").attr("offset", "70%")
	    .attr("stop-color",function(d){ return "black";})
	    .attr("stop-opacity", 1);
    }
    
    gradPie.draw = function(id, data, cx, cy, r){
	var gPie = d3.select("#"+id).append("g")
	    .attr("transform", "translate(" + cx + "," + cy + ")");
	
	createGradients(gPie.append("defs"), data.map(function(d){ return d.color; }), 2.5*r);
	
	gPie.selectAll("path").data(pie(data))
	    .enter().append("path").attr("fill", function(d,i){ return "url(#gradient"+ i+")";})
	    .attr("d", d3.svg.arc().outerRadius(r))
	    .each(function(d) { this._current = d; });
    }
    
    gradPie.transition = function(id, data, r) {
	function arcTween(a) {
	    var i = d3.interpolate(this._current, a);
	    this._current = i(0);
	    return function(t) { return d3.svg.arc().outerRadius(r)(i(t));  };
	}
	
	d3.select("#"+id).selectAll("path").data(pie(data))
	    .transition().duration(750).attrTween("d", arcTween); 
    }					  
    
    this.gradPie = gradPie;
}();

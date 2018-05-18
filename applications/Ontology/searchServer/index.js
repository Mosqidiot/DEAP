// testing:
//    curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "search=iq" http://127.0.0.1:8001/
// check if port is open:
//     lsof -i:8001

var fs         = require('fs')
var http       = require('http');
var io         = require('socket.io')();
var formidable = require('formidable');
var jQuery     = require('jquery');
var request    = require('request');
var async      = require('async');
var synonyms   = require('synonyms');
var stemmer    = require('stemmer');
var stopword   = require('stopword');
var addin_data = {};
var addins     = require('path').dirname(require.main.filename) + "/../teach.json";
var local_data = {};
var locals     = require('path').dirname(require.main.filename) + "/../local_data.json";
var alias_data = {};
var aliases    = require('path').dirname(require.main.filename) + "/../alias_mapping.json"; // use npm's csv2json to convert

console.log('Starting search server...');
var maxNumberResults = 100;

function search( what, longsearch ) {
    // check in the description or in the element name if that item exists
    var keys = Object.keys(instruments);
    var results = [];
    var mres = maxNumberResults;
    if (longsearch) {
	mres = maxNumberResults * 20;
    } 

    // break long queries
    for (var i = 0; i < keys.length; i++) {
	var instr = instruments[keys[i]];
	for (var j = 0; j < instr.length; j++) {
	    found = false;
	    // we would want to use the name and the alias names here, any one of those could match
	    if (typeof instr[j]['name'] !== 'undefined' && instr[j]['name'].indexOf(what) > -1) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what, "matches element name"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	    // look at instrument description
	    if (!found && instrumentTitles[keys[i]]['title'].toLowerCase().indexOf(what) > -1) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what, "matches instrument name"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }	    
	    // look at instrument short name
	    if (!found && keys[i].toLowerCase().indexOf(what) > -1) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what,"matches element name"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	    // look for aliases
	    if (!found && typeof instr[j]['aliases'] !== 'undefined' && instr[j]['aliases'].length > 0) {
		for (var k = 0; k < instr[j]['aliases'].length; k++) {
		    if (instr[j]['aliases'][k].indexOf(what) > -1) {
			var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
			entry['marker'] = [what,"matches alias"];
			entry['instrument'] = keys[i];
			entry['title'] = instrumentTitles[keys[i]]['title'];
			entry['categories'] = instrumentTitles[keys[i]]['categories'];
			results.push(entry);
			found = true;
			break; // one is sufficient
		    }
		}
	    }
	    if (!found && typeof instr[j]['description_lower_case'] !== 'undefined' && instr[j]['description_lower_case'].indexOf(what) > -1) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what,"matches description"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	    if (!found && typeof instr[j]['notes_lower_case'] !== 'undefined' &&
		instr[j]['notes_lower_case'] !== null &&
		instr[j]['notes_lower_case'].indexOf(what) > -1) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['marker'] = [what,"matches notes"];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	}
	if (results.length > mres)
	    break;
    }
    
    return results;
}

function removeDuplicates(res) {
    var seen = {};
    return res.filter(function(x) {
	xx = x['instrument'] + x['name'];
	if (seen[xx])
	    return
	seen[xx] = true;
	return x;
    });
}

function searchSynonyms(result, what) {
    what = what.trim();
    var syns = synonyms(what);
    if (typeof syns === 'undefined' || typeof syns['n'] === 'undefined') {
	console.log("Error: synonym search failed for " + what);
	return result;
    }
    console.log("Synonym:" + JSON.stringify(syns));
    for (var i = 0; i < syns['n'].length; i++) {
	if (syns['n'][i] == what) {
	    continue;
	}
	console.log("search with synonym: " + syns['n'][i]);
	var res2 = search(syns['n'][i],false);
	result = result.concat(res2);
	if (result.length > maxNumberResults) {
	    break;
	}
    }; 

    return result;
}

// add entries found using regular expression matching
function searchRegExp(results, what) {
    var reg;
    try {
        reg = new RegExp(what.split("*").join(".*"));
    } catch(e) {
        // got an error, ignore this one and try next iteration
        return results;
    }
    // check in the description or in the element name if that item exists
    var keys = Object.keys(instruments);
    var mres = maxNumberResults;
    var longsearch = true;
    if (longsearch) {
	mres = maxNumberResults * 20;
    }
    console.log("search by wild card expression...");

    // break long queries
    for (var i = 0; i < keys.length; i++) {
	var instr = instruments[keys[i]];
	for (var j = 0; j < instr.length; j++) {
	    found = false;
	    // we would want to use the name and the alias names here, any one of those could match
	    if (typeof instr[j]['name'] !== 'undefined' && reg.test(instr[j]['name']) ) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what,"matches element name"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	    // look at instrument description
	    if (!found && reg.test(instrumentTitles[keys[i]]['title'])) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what,"matches instrument title"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }	    
	    // look at instrument short name
	    if (!found && reg.test(keys[i]) ) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what,"matches element name"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	    // look for aliases
	    if (!found && typeof instr[j]['aliases'] !== 'undefined' && instr[j]['aliases'].length > 0) {
		for (var k = 0; k < instr[j]['aliases'].length; k++) {
		    if (reg.test(instr[j]['aliases'][k])) {
			var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
			entry['marker'] = [what,"matches alias"];
			entry['instrument'] = keys[i];
			entry['title'] = instrumentTitles[keys[i]]['title'];
			entry['categories'] = instrumentTitles[keys[i]]['categories'];
			results.push(entry);
			found = true;
			break; // one is sufficient
		    }
		}
	    }
	    if (!found && typeof instr[j]['description'] !== 'undefined' && reg.test(instr[j]['description'])) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['marker'] = [what,"matches description"];
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	    if (!found && typeof instr[j]['notes'] !== 'undefined' &&
		instr[j]['notes'] !== null && reg.test(instr[j]['notes']) ) {
		var entry = { name: instr[j]['name'], description: instr[j]['description'], notes: instr[j]['notes'] };
		entry['instrument'] = keys[i];
		entry['title'] = instrumentTitles[keys[i]]['title'];
		entry['marker'] = [what,"matches notes"];
		entry['categories'] = instrumentTitles[keys[i]]['categories'];
		results.push(entry);
		found = true;
	    }
	}
	if (results.length > mres)
	    break;
    }
    
    return results;
}

function searchKeywords(result, what) {
    what = what.trim();
    var l = stopword.removeStopwords(what.split(' '));
    if (typeof l === 'undefined' || l.length == 0) {
	console.log("Error: stopword removal failed for " + what);
	return result;
    }
    console.log("Keywords:" + JSON.stringify(l));
    var finds = {}; // we need to use both the shortName and the element name here as a key
    for (var i = 0; i < l.length; i++) {
	console.log("search with keyword: " + l[i]);
	var res2 = search(l[i],true);
	for (var j = 0; j < res2.length; j++) {
	    var uname = res2[j]['name'] + res2[j]['instrument'];
	    //console.log('uname:' + uname);
	    if (Object.keys(finds).indexOf(uname) == -1)
		finds[uname] = [];
	    finds[uname].push(res2[j]);
	}
    }
    // now sort the different measures by length (number of matching entries)
    var ks = Object.keys(finds);
    var sks = ks.sort(function(a,b) { return finds[b].length - finds[a].length; });
    for (var i = 0; i < sks.length; i++) {
	// merge all the marker
	var marker = finds[sks[i]].reduce(function(a,b) { return a.concat(b['marker'][0]); },[]);
	marker = marker.filter((v, i, a) => a.indexOf(v) === i); 
	var dd = finds[sks[i]][0];
	dd['marker'] = marker;
	result.push(dd);
	if (result.length > 100)
	    break;
    }

    return result;
}

var server = http.createServer(function(req, res) {
    if (res.socket.remoteAddress.indexOf('127.0.0.1') != -1) {
	if(req.method == 'POST') {
	    // The server is trying to send us an activity message
	    var form = new formidable.IncomingForm();
	    form.parse(req, function(err, fields, files) {
		if (typeof fields['search'] === 'undefined' || fields['search'] === null) {
		    console.log("did not find fields['search']");
		    return;
		}
		var lc = fields['search'].toLowerCase();
		var result = search(lc,false);
		if (result.length < 100) {
		    var stemmed = stemmer(lc);
		    console.log('Stemmer suggested search: ' + JSON.stringify(stemmed) + " for " + fields['search']);
		    if (stemmed !== fields['search'] && stemmed.length > 0)
			result = result.concat(search(stemmed,false));
		}
		if (result.length < 100) {
		    // lets check if we can search by teached values
		    console.log("check for teached value " + lc + " in " + JSON.stringify(addin_data));
		    if (typeof addin_data[lc] !== 'undefined') {
			for (var j = 0; j < addin_data[lc].length; j++) {
			    console.log("search by teached value: " + addin_data[lc][j]);
			    result = result.concat(search(addin_data[lc][j],false));
			    if (result.length > 100)
				break;
			}
		    }
		}
		if (result.length < 100) {
		    result = searchSynonyms(result, lc);
		}
		if (result.length < 100) {
		    result = searchKeywords(result, lc);
		}
                if (result.length < 100) {
                    result = searchRegExp(result, fields['search']);
                }
		
		result = removeDuplicates(result);		
		var aa = JSON.stringify(result);
		res.writeHead(200, [[ "Content-Type", "application/json"], ["Content-Length", Buffer.byteLength(aa) ]]);
		res.end(aa);
		
	    });
	}
    }
});
let data = [];

function pullData() {
    console.log('start pulling data from NDA');
    getInstrumentNames(); // this will pull all instruments - will take some time to finish
}

let instrument_names = [];
function getInstrumentNames() {

    request({
	method: 'get',
	url: 'https://ndar.nih.gov/api/datadictionary/v2/datastructure?source=ABCD',
	headers: {
	    "content-type": "application/json"
	},
	json: true
    }, function(error, response, data) {
	if (error || response.statusCode !== 200) {
	    console.log("Error: Was not able to contact ndar: " + error + " code: " + response.statusCode);
	    return;
	}
	instrument_names = data;
	instrument_list = [];
	for (var i = 0; i < instrument_names.length; i++) {
	    name  = instrument_names[i]['shortName'];
	    title = instrument_names[i]['title'];
	    // now get the instrument
	    instrument_list.push({ name: name, title: title });
	}
	getInstrumentList( instrument_list );
    });
}

let instruments = {};
let instrumentTitles = {};
// pull the instruments from NDA and append to instrument (replace existing entries)
function getInstrumentList( names ) {
    console.log('request: ' + names.length + ' instruments for download from NDA');
    var queue = async.queue(function(name, callback) {
	request({
	    url: 'https://ndar.nih.gov/api/datadictionary/v2/datastructure/' + name['name'],
	    headers: {
		"Accept": "application/json"
	    },
	    json: true
	}, function(error, response, data) {
	    if (error || response.statusCode !== 200) {
		console.log("Error: Was not able to contact ndar: " + error);
		return;
	    }
	    // reduce the memory footprint here by only including elements we actually want
	    var t = [];
	    for (var i = 0; i < data['dataElements'].length; i++) {
		// lets check if the name should be changed to one of the alias names
		var aname = data['dataElements'][i]['name'];
		if (typeof alias_data[aname] !== 'undefined') {
		    aname = alias_data[aname]['abcd'];
		}
		
		t.push( { name: aname,
			  description: data['dataElements'][i]['description'],
			  description_lower_case: (data['dataElements'][i]['description']!== null?data['dataElements'][i]['description'].toLowerCase():""),
			  notes: data['dataElements'][i]['notes'],
			  notes_lower_case: (data['dataElements'][i]['notes']!== null?data['dataElements'][i]['notes'].toLowerCase():""),
			  aliases: data['dataElements'][i]['aliases']
			});
	    }
	    instruments[name['name']] = t;
	    instrumentTitles[name['name']] = { title: name['title'], categories: data['categories'] };
	    callback("ok");
	});
    }, 2);

    queue.drain = function() {
	var numItems = 0;
	var ks = Object.keys(instruments);
	for (var i = 0; i < ks.length; i++) {
	    numItems += Object.keys(instruments[ks[i]]).length;
	}
	console.log('finished getting data from NDA ' + ks.length + ' instruments and ' + numItems + ' items.');
    }
    for (var i = 0; i < names.length; i++) {
	queue.push(names[i], (function(counter, maxCounter) {
	    return function(err) {
		console.log("data " + counter + "/" + maxCounter);
	    };
	})(i, names.length));
    }
}

setTimeout(function() {
    if (!fs.existsSync(addins)) {
	console.log("addins file does not exist in " + addins);
	return; // todo: call this function in a while again
    }
    fs.watch(addins, function(eventType, filename) {
	if (eventType == "rename" || eventType == "change") {
	    // reload this file again
	    if (fs.existsSync(addins)) {
		// wait a little bit for the file to finish writing before we try to read it
		setTimeout(function() {
		    addin_data = JSON.parse(fs.readFileSync(addins, 'utf8'));
		}, 100);
		console.log("reading teaching files again, got: " + JSON.stringify(addin_data));
	    }
	}
    });
}, 200);
if (fs.existsSync(addins)) {
    addin_data = JSON.parse(fs.readFileSync(addins, 'utf8'));
}
if (fs.existsSync(locals)) {
    // read in the list of local variables created from data on NDA
    local_data = JSON.parse(fs.readFileSync(locals, 'utf8'));
    // lets add the DEAP defined variables as well
    console.log("Add local data read from file..." + JSON.stringify(local_data))
    instruments["DEAP"] = local_data;
    instrumentTitles["DEAP"] = { title: "DEAP", categories: ["non-NDA"] };    
}
alias_data = {};
if (fs.existsSync(aliases)) {
    tmpdata = JSON.parse(fs.readFileSync(aliases, 'utf8'));
    for(var i = 0; i < tmpdata.length; i++) {
	//console.log("add " + tmpdata[i]['nda'] + " " + tmpdata[i]['abcd']);
	alias_data[tmpdata[i]['nda']] = tmpdata[i];
    }
    console.log("Imported local alias file... ")
}

// populate the from redcap
setTimeout(pullData, 100);

//var server = http.createServer(function(req, res) {});
server.listen(8001).on('error', function(err) {
    console.log(err);
    process.exit(75); // EX_TEMPFAIL     75      /* temp failure; user is invited to retry */
});
var io = io.listen(server, { transports: ['websocket', 'flashsocket', 'xhr-polling'] });


//
// load the data in R and extract some values
//
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var rserve = require('rserve-client');


var DataNDA17 = function (state) {
    this._measures = [];
    this._done = false;
    this._outputs = {}; // cache the output
    this._code = "";
    this._path = "/tmp/";
};

// gets a notification if a new epoch started - not used for this node
DataNDA17.prototype.startEpoch = function () { }

// we only need a single epoch in this module to get everything done
DataNDA17.prototype.endEpoch = function () {
    this._done = true;
}

DataNDA17.prototype.readyForEpoch = function ( path ) {
    // we are born ready
    this._path = path;
    return true;
}

DataNDA17.prototype.doneDone = function () {
    return this._done;
}


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

// inputs and state are read only, outputs can be written
DataNDA17.prototype.work = function (inputs, outputs, state) {
    console.log(inputs);
    var RonlyMode = true; // if true we will only work with RData files on disk - no translation into JSON for data transfer

    if (Object.keys(this._outputs).length >0) {
        console.log("data-nda17: return cached outputs");
        outputs = this._outputs; // use the cached result
        return;
    }
    console.log("data-nda17: import data");
    var code = (Math.random() * 10000).toFixed(0);
    this._code = code;

    // collect the values from the atached inputs (look at the 'value' key to get the string identifying the measure)
    var R = "# DEAP model 2017\n\nlibrary(rjson)\n";
    // start by reading in the current cache
    R = R + "#data <- readRDS('../../../data/ABCD/data_uncorrected/userdata_cache.RDS')\n";
    R = R + "output <- list()\n";

    var obj = Object.keys(inputs);
    var results = {};
    for (var i = 0; i < obj.length; i++) {
        if (typeof inputs[obj[i]] === 'undefined' || inputs[obj[i]] === undefined || ("" + inputs[obj[i]]).trim() === "") {
            continue;
        }
        var slot = obj[i].split("in")[1]; // should be the number for out
        var outname = "out" + slot;

        var entry = inputs[obj[i]];
        if (!Array.isArray(inputs[obj[i]])) {
            entry = [ entry ]; // everything could be an array, so pretend its one
        }
        var columns = "";
        var variables = [ "SubjID", "VisitID" ];
        for (var k = 0; k < entry.length; k++) {
            var e = entry[k];
            // an entry could be disabled by passing empty string 
            if(e == ""){
                if(k == entry.length-1){
                    columns = columns.substring(0,columns.length-1);
                }
                continue;
            }
            var name = ("" + e).trim();

            // todo: a name could be a list of names separated by '+', in that case split and create a larger data frame
            var parts = name.split("+");
            for (var j = 0; j < parts.length; j++) {
                var n = parts[j].trim();
                columns = columns + n + "=data$" + n;
                variables.push(n);
                if (j < parts.length - 1) {
                    columns = columns + ",";
                }
            }
            if (k < entry.length-1) {
                columns = columns + ",";
            }
        }
        R = R + "o = data.frame(SubjID=data$SubjID,VisitID=data$VisitID," + columns + ")\n";
        results[outname] = this._path + "/temp_" + code + "_" + outname;
        if (RonlyMode) {
            results[outname] = { "type": "DataTransferFile", "value": results[outname] + ".RDS", "columns": variables };
            // Instead of writing these as JSON, lets keep them as separate RData files. We want
            // to read those into R again in the next module.
            R = R + "saveRDS(o, file=\"" + results[outname]['value'] + "\")\n";
        } else {
            results[outname] = results[outname] + ".json";
            R = R + "write(toJSON(o), file=\"" + results[outname] + "\")\n";
        }
    }
    console.log(results)
    //R = R + "q()\n";
    // do we expect a result here? If not we should just skip the execution
    if (Object.keys(results).length == 0) {
        console.log("  -> nothing to import");
        return; // nothing to do here
    }

    // execute R
    filename = this._path + code + '.R';
    fs.writeFileSync(filename, R);
    var spawnSync = require('child_process').spawnSync;
        
       //# rserve listener 
       rserve.connect('localhost', 6311, function(err, client) {
            client.evaluate(R, function(err, ans) {
                console.log("something");
                client.end();
            });
       });
      

       
    //var out = spawnSync('/usr/bin/R', ['--no-restore', '--no-save', '-q', '-f', filename]);
    //console.log("what we got back is: " + JSON.stringify(out));
    res = Object.keys(results);
    for (var i = 0; i < res.length; i++) {
        // only add data for something that has been generated
        if (RonlyMode) {
            
            //ignoring the existence of the .RDS output, the whole data RDS should be loaded in Rserve
            if (true||fs.existsSync(results[res[i]]['value'])) {
                console.log("result -> " + results[res[i]]['value']);
                // Instead of writing the real data, just write the filename. Use that filename in the next module to load the data
                // All modules would have to support both formats... which will not work always... so we need a new type for a connection.... (todo)
                outputs[res[i]] = results[res[i]]; // don't parse, only provide a structure that references the content
            }
        } else {
            if (fs.existsSync(results[res[i]])) {
                console.log("result -> " + res[i]);
                outputs[res[i]] = JSON.parse(fs.readFileSync(results[res[i]], 'utf8'));
            }
        }
    }
    this._outputs = clone(outputs); // add this output to the cache
    console.log(outputs);
};

module.exports = DataNDA17;

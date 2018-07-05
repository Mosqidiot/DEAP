var fs = require('fs');
var path = require('path');
var rserve = require('rserve-client');
var GAMM4 = function (env) { 
    this._path = "/tmp";
};

GAMM4.prototype.readyForEpoch = function(path) {
    this._path = path;
    return true;
}

GAMM4.prototype.work = function (inputs, outputs, state) {
    var RonlyMode = true; // instead of JSON use R save data (RDS)
    
    console.log("GAMM4: run this model:\n" + JSON.stringify(inputs));
    if (typeof state[0]['value'] === 'undefined' || ("" + state[0]['value']).trim() === "") {
        // nothing to do
        return;
    }

    var R = "# DEAP model 2017\n\nlibrary(rjson)\n";
    var keys = Object.keys(inputs);
    // before the merge we have to remove duplicates from the different data frames (don't count SubjID and VisitID here)
    var uniques = {};
    var removes = {};
    for (var i = 0; i < keys.length; i++) {
        if (inputs[keys[i]] === undefined)
           continue;
        var ks = [];
        if (typeof inputs[keys[i]]['columns'] !== 'undefined') {
            ks = inputs[keys[i]]['columns'];
        } else {
            ks = Object.keys(inputs[keys[i]]);
        }
        for (var j = 0; j < ks.length; j++) {
            if (ks[j] === "SubjID" || ks[j] === "VisitID") {
                continue; // don't count these as duplicates
            }
            if (typeof uniques[ks[j]] === 'undefined' ) {
                uniques[ks[j]] = 1;
            } else {
                removes[ks[j]] = keys[i];
            }
        }
    }
    if (Object.keys(removes).length > 0) {
        console.log("Warning: duplicate values in inputs. Need to remove the duplicates to prevent problems after merge " + JSON.stringify(removes));
    }

    // store the handles for the input variables
    function sanitize(str) {
        str = str.replace(" ", "");
        str = str.trim()
        return str;
    }
    var RonlyMode = false;

    var code = (Math.random()*10000).toFixed(0);
    //R = R + "setwd(tempdir())\n";
    R = R + "output_file = file(\""+this._path + "/" + code + "_output.txt"+"\", open = \"wt\")\n";
    R = R + "sink(output_file, type=\"message\")\n";
    R = R + "inputs = list(" + keys.map(function(x) {
        var listvars = [];
        if (inputs[x] !== undefined) {

            if(typeof inputs[x] == "string"){
                listvars= [inputs[x]];
            }
            // if we don't have real data we will just find a filename here and the list of variables in columns
            else if (typeof inputs[x]['type'] !== 'undefined' && inputs[x]['type'] == "DataTransferFile") {
                RonlyMode = true;
                listvars = inputs[x]['columns'].filter(function(x) {
                    if ( x !== 'SubjID' && x !== "VisitID" )
                        return true;
                    return false;                     
                })
            } else {
                listvars = Object.keys(inputs[x]).filter(function (x) {
                    if (x !== 'SubjID' && x !== "VisitID")
                        return true;
                    return false;
                })
            }
        }
        console.log(listvars.map(function(x) { return "\"" + x + "\""; }).join(",") );
        return (sanitize(x) + "=list(" + listvars.map(function(x) { return "\"" + x + "\""; }).join(",") + ")"); 
    }).join(",") + ")\n";
    
    /*
    R = R + "data <- data.frame()\nframes <- list()\n";
    var count = 0;
    for (var i = 0; i < keys.length; i++) {
        // inputs[keys[i]] is a data.frame as json { "SubjID": [ "NDAR_INV...", ... ], "VisitID": [ "baseline...", ], "Age": [ "123", ...] }
        if (inputs[keys[i]] === undefined)
            continue; // no value provided
        if (RonlyMode) {
            R = R + "frames = c(frames, list(readRDS(\"" + inputs[keys[i]]['value'] + "\")))\n";
        } else {
            R = R + "frames = c(frames, list(data.frame(";
            frame = inputs[keys[i]];
            var columns = Object.keys(frame);
            for (var j = 0; j < columns.length; j++) {
                // skip columns of variables that should be removed because they are duplicates and merge would break the data-frame
                if (Object.keys(removes).indexOf(columns[j]) !== -1) {
                    if (removes[columns[j]] === keys[i])
                        continue; // should not be added
                }
                if (j > 0) {
                    R = R + ",\n";
                }
                R = R + columns[j] + "=c(" + frame[columns[j]].map(function (x) { return "\"" + ("" + x).trim() + "\""; }).join(",") + ")";
            }
            R = R + ")))\n"
        }
        count = count + 1;
    }
    R = R + "\n\n";
    R = R + "# merge all frames\n";
    R = R + "#data <- Reduce(function(dtf1, dtf2) merge(dtf1, dtf2, by = c(\"SubjID\",\"VisitID\"), all=TRUE), frames)\n";
    */
    R = R + "\n";
    R = R + "# User defined model code\n\n" + state[0]['value'] + "\n\n";

    // export scatter and statistics
    R = R + "\n# export scatter now\n";
    var fname_scatter = this._path + "/" + code + "_scatter.json";
    R = R + "if (exists(\"scatter\")) write(toJSON(scatter),file=\"" + fname_scatter + "\")\n";
    var fname_lineplot = this._path + "/" + code + "_lineplot.json";
    R = R + "if (exists(\"lineplot\")) write(toJSON(lineplot),file=\"" + fname_lineplot + "\")\n";
    var fname_tunnel = this._path + "/" + code + "_tunnel.json";
    R = R + "if (exists(\"tunnel\")) write(toJSON(tunnel),file=\"" + fname_tunnel + "\")\n";
    var fname_statistics = this._path + "/" + code + "_statistics.json";
    R = R + "if (exists(\"statistics\")) write(toJSON(statistics),file=\"" + fname_statistics + "\")\n";

    R = R + "sink(type = \"message\")\n";
    R = R + "close(output_file)\n"; 

    // what do we do with the output of R? Save as json?
    //R = R + "q()\n";
    // execute R
    filename = this._path + '/gamm4_' + code + '.R';
    fs.writeFileSync(filename, R);
    var spawnSync = require('child_process').spawnSync;
    //var out = spawnSync('/usr/bin/R', ['--no-restore', '--no-save', '-q', '-f', filename]);

       //# rserve listener 
       rserve.connect('localhost', 6311, function(err, client) {
           client.evaluate(R, function(err, ans) {
               console.log("gamm4");
               if(err) console.log(err);
               if(ans) console.log(ans);
               client.end();
           });
       });


    // now read in the files if they exist and attach them to the output
    if (fs.existsSync(fname_scatter)) {
        console.log('result -> ' + fname_scatter);
        outputs['scatter'] = JSON.parse(fs.readFileSync(fname_scatter, 'utf8'));
    }
    if (fs.existsSync(fname_statistics)) {
        console.log("result -> " + fname_statistics);
        outputs['statistics'] = JSON.parse(fs.readFileSync(fname_statistics, 'utf8'));
    }
    if (fs.existsSync(fname_lineplot)) {
        console.log("result -> " + fname_lineplot);
        outputs['lineplot'] = JSON.parse(fs.readFileSync(fname_lineplot, 'utf8'));
    }
    if (fs.existsSync(fname_tunnel)) {
        console.log("result -> " + fname_tunnel);
        outputs['tunnel'] = JSON.parse(fs.readFileSync(fname_tunnel, 'utf8'));
    }

};

module.exports = GAMM4;


var glob = require('glob');
var fs   = require('fs');

var RModel = function (env) { 
    this._path = "/tmp/";
};

RModel.prototype.readyForEpoch = function(path) {
    this._path = path;
    return true;
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


RModel.prototype.work = function (inputs, outputs, state) {
    var R = "# DEAP model 2017\n\nlibrary(rjson)\n";
    R = R + "inputs <- list()\n";
    var keys = Object.keys(inputs);
    for (var i = 0; i < keys.length; i++) {
        // inputs[keys[i]] is a data.frame as json { "SubjID": [ "NDAR_INV...", ... ], "VisitID": [ "baseline...", ], "Age": [ "123", ...] }
        if (inputs[keys[i]] === undefined)
            continue; // no value provided
        R = R + "inputs = c(inputs, list(" + keys[i] + ")\n";
        R = R + keys[i] + " = data.frame("
        frame = inputs[keys[i]];
        var columns = Object.keys(frame);
        for (var j = 0; j < columns.length; j++) {
            R = R + columns[j] + "=c(" + frame[columns[j]].map(function(x) { return "\"" + (""+x).trim() + "\""; }).join(",") + ")";
            if (j < columns.length - 1) {
                R = R + ",\n";
            }
        }
        R = R + ")\n"
    }
    R = R + "\n\n";
    R = R + "# User defined model code\n\n" + state[0]['value'] + "\n\n";

    R = R + "# now save all variables that match the out<number> pattern\n";
    R = R + "outnames = as.list(.GlobalEnv)\n";
    var code = (Math.random()*10000).toFixed(0);
    R = R + "for (i in grep(\"out[0-9]*\", names(outnames), value=TRUE))\n";
    R = R + "    write(toJSON(outnames[[i]]),file=paste(\"" + this._path + "data_export_" + code + "_\",i,\".json\")\n";
    R = R + "q()\n";

    // execute R
    filename = this._path + "/" + 'gamm4_' + code + '.R';
    fs.writeFileSync(filename, R);
    var spawnSync = require('child_process').spawnSync;
    var out = spawnSync('/usr/bin/R', ['--no-restore', '--no-save', '-q', '-f', filename]);

    // now import everything with that file name pattern and attach to the output
    var files = glob.sync(this._path + "/data_export_" + code + "_*.json")
    for (var i = 0; i < files.length; i++) {
        // now read in the files if they exist and attach them to the output
        if (fs.existsSync(files[i])) {
            console.log('result -> ' + files[i]);
            var name = fs.path(files[i]).basename(files[i],'.json');
            outputs[name] = JSON.parse(fs.readFileSync(files[i], 'utf8'));
        }
    }
};

module.exports = RModel;

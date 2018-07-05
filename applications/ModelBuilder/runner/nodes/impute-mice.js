
var glob = require('glob');
var fs   = require('fs');

var ImputeMice = function (env) { 
    this._path = "/tmp/";
};

ImputeMice.prototype.readyForEpoch = function(path) {
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


ImputeMice.prototype.work = function (inputs, outputs, state) {
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

    R = R + "# Initial model\n";
    R = R + "library(mice)\n";

    R = R + "ini <- mice( dat0, m = 1, maxit = 0 )\n";
    R = R + "meth = ini$meth\n";
    R = R + "#####################\n";
    R = R + "# Imputation models #\n";
    R = R + "#####################\n";
    R = R + "meth[\"age10\"]      <- \"logreg\"\n";
    R = R + "meth[\"female\"]     <- \"logreg\"\n";
    R = R + "meth[\"hh.married\"] <- \"logreg\"\n";
    R = R + "meth[\"race.eth\"]   <- \"polyreg\"\n";
    R = R + "meth[\"hhinc\"]      <- \"polr\"\n";
    R = R + "meth[\"high.educ\"]  <- \"polr\"\n";
    R = R + "################################\n";
    R = R + "# Specifying imputation models #\n";
    R = R + "################################\n";

    R = R + "pred = ini$pred\n";
    R = R + "# Excluding predictors from the imputation models\n";
    R = R + "pred[, c(\"id.num\") ] <- 0\n";
    R = R + "pred\n";

    R = R + "# Specifying parameters for the imputation\n";
    R = R + "post <- mice( dat0, meth = meth, pred = pred, seed = 111,\n";
    R = R + "   m = 1, maxit = 0)$post\n";

    R = R + "dat.imp <- mice( dat0, meth = meth, pred = pred, post = post,\n";
    R = R + "        seed = 1111,\n";
    R = R + "        m = n.imp, maxit = n.iter)\n";
    R = R + "rm(dat0)\n";

    R = R + "# Convert imputed data to long format\n";
    R = R + "dat.mi <- complete(dat.imp, action = \"long\", include = TRUE\n";
    R = R + "rm(dat.imp)\n";

    R = R + "dat.mi <- data.table(dat.mi)\n";
    R = R + "names(dat.mi)[1:2] <- c(\"imp\", \"id\")\n";
    R = R + "dat.mi\n";

    R = R + "# now save all variables that match the out<number> pattern\n";
    R = R + "outnames = as.list(.GlobalEnv)\n";
    var code = (Math.random()*10000).toFixed(0);
    R = R + "for (i in grep(\"out[0-9]*\", names(outnames), value=TRUE))\n";
    R = R + "    write(toJSON(outnames[[i]]),file=paste(\"" + this._path + "/mice_export_" + code + "_\",i,\".json\")\n";
    R = R + "q()\n";

    // execute R
    filename = this._path + "/" + 'mice_' + code + '.R';
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

module.exports = ImputeMice;

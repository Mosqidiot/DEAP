var fs = require('fs');

var DisplayScatter = function (env) { 
    this._result = {};
    this._path = "/tmp/";
};

// this is an endpoint function, produce an output if the current epoch is done
DisplayScatter.prototype.endEpoch = function() {
    // whatever is in this._result is the output
    console.log("Text Output:\n" + JSON.stringify(this._result));
    var code = (Math.random() * 100000).toFixed(0);
    var filename = this._path + "/displayscatter_" + code + ".json";
    
    fs.writeFileSync(filename, JSON.stringify(this._result));
    //temp addtess for graphical testing 
    //fs.writeFileSync("/var/www/html/applications/NewDataExpo/user_display/displayscatter_" + code + ".json", JSON.stringify(this._result));
}

DisplayScatter.prototype.readyForEpoch = function(path) {
    this._path = path;
    return true;
}

DisplayScatter.prototype.work = function (inputs, outputs, state) {
    // does not produce any outputs, has only side effects
    if (typeof inputs['input'] === 'undefined')
        return; // do nothing

    console.log("called DisplayScatter.work");
    this._result = inputs['input'];
    // should we save the result to the drive?
};

module.exports = DisplayScatter;

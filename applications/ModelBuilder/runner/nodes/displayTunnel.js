var fs = require('fs');

var DisplayTunnel = function (env) { 
    this._result = {};
    this._path = "/tmp/";
};

// this is an endpoint function, produce an output if the current epoch is done
DisplayTunnel.prototype.endEpoch = function() {
    // whatever is in this._result is the output
    console.log("Text Output:\n" + JSON.stringify(this._result));
    var code = (Math.random() * 100000).toFixed(0);
    var filename = this._path + "/displaytunnel_" + code + ".json";
    
    fs.writeFileSync(filename, JSON.stringify(this._result));
}

DisplayTunnel.prototype.readyForEpoch = function(path) {
    this._path = path;
    return true;
}

DisplayTunnel.prototype.work = function (inputs, outputs, state) {
    // does not produce any outputs, has only side effects
    if (typeof inputs['input'] === 'undefined')
        return; // do nothing

    console.log("called DisplayTunnel.work");
    this._result = inputs['input'];
    // should we save the result to the drive?
};

module.exports = DisplayTunnel;

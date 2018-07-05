var fs = require('fs');

var DisplayText = function (env) { 
    this._result = "";
    this._path = "/tmp/";
};

// this is an endpoint function, produce an output if the current epoch is done
DisplayText.prototype.endEpoch = function() {
    // whatever is in this._result is the output
    console.log("Text Output:\n" + this._result);
    var code = (Math.random() * 100000).toFixed(0);
    var filename = this._path + "/displaytext_" + code + ".json";
    fs.writeFileSync(filename, JSON.stringify(this._result));
}

DisplayText.prototype.readyForEpoch = function(path) {
    this._path = path;
    return true;
}

DisplayText.prototype.work = function (inputs, outputs, state) {
    // does not produce any outputs, has only side effects
    if (typeof inputs['input'] === 'undefined')
        return; // do nothing
        
    console.log("store an output in DisplayText");
    this._result = JSON.stringify(inputs);
};

module.exports = DisplayText;

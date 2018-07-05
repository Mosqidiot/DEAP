var TransformLog = function (env) { };


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


TransformLog.prototype.work = function (inputs, outputs, state) {
	//console.log("log-transform: calculate now: " + JSON.stringify(inputs));
	if (typeof inputs['input'] === 'undefined')
		return; // done

	// ignore the state variable here, only used for the interface

	// just transform the input with a log
	outputs['output'] = clone(inputs['input']);
	// this would be a json object with keys for columns
	var keys = Object.keys(inputs['input']);
	for (var i = 0; i < keys.length; i++) {
		if (keys[i] === 'SubjID' || keys[i] === "VisitID") {
			continue;
		}
		// everything else gets transformed
		for (var j = 0; j < outputs['output'][keys[i]].length; j++) {
			if (outputs['output'][keys[i]][j] !== "NA")
				outputs['output'][keys[i]][j] = Math.log(outputs['output'][keys[i]][j]);
		}
	}
};

module.exports = TransformLog;

var Measure = function (env) { };

Measure.prototype.work = function (inputs, outputs, state) {
    // the third state entry for this module has the value
    if (typeof state[3] !== 'undefined' && typeof state[3]['value'] !== 'undefined') {
        outputs['out'] = state[3]['value'].trim();
    }
};

module.exports = Measure;

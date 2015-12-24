// Internal Modules
var Hybrid = require('./HybridSort.js');
// Optimization levels
var ST_O0 = 0, ST_O1 = 1, ST_O2 = 2, ST_O3 = 3;
// Optimization flags (note that reversed flags are flipped with ~)
var ST_O_TIME_ASC = 1,
    ST_O_TIME_DSC = ~ST_O_TIME_ASC,
    ST_O_PRIORITY_ASC = 2,
    ST_O_PRIORITY_DSC = ~ST_O_PRIORITY_ASC,
    ST_O_SORT_BUCKETONLY = 4,
    ST_O_SORT_QUICKONLY = ~ST_O_SORT_BUCKETONLY;
// Properties to Extract (Numbers only)
/* - Property n represents name
   - Property i represents importance in decimal range 0.00 to 1.00
*/
var ST_O_PROPERTIES = [
    { n: "averageExecutionTime", i: 0.80 },
    { n: "executionRounds", i: 0.20 }
];

var Optimizer = function ST_OPTIMIZER(array, O_LEVEL, O_MASK) {
    var MAX_STORE = {}, MIN_STORE = {};
    // Set Min/Max
    array.forEach(function ST_OPTIMIZER_ARRAY_MIN_MAX_SETTER(o) {
        /* Precalculte (max - min) to save cycles */
        /* Replace Foreach with for */
        var i = 0;
        for (i = 0; i < ST_O_PROPERTIES.length; i++) {
            if ((!MAX_STORE[ST_O_PROPERTIES[i].n]) || (MAX_STORE[ST_O_PROPERTIES[i].n] < o[ST_O_PROPERTIES[i].n])) {
                MAX_STORE[ST_O_PROPERTIES[i].n] = o[ST_O_PROPERTIES[i].n] * 1;
            } else if ((!MIN_STORE[ST_O_PROPERTIES[i].n]) || (MIN_STORE[ST_O_PROPERTIES[i].n] > o[ST_O_PROPERTIES[i].n])) {
                MIN_STORE[ST_O_PROPERTIES[i].n] = o[ST_O_PROPERTIES[i].n] * 1;
            }
        }
    });
    // Map Array to Reduce Objects
    var OPTIMIZER_MAPPED_ARRAY = array.map(function ST_OPTIMIZER_ARRAY_MAPPER(o, index) {
        // Rounding Operation (4 decimal points)
        // Math.round(n * 10000) / 10000;
        // Reduce Objects by Mapping the array
        var REDUCED_VALUE = 0;
        var i = 0;
        for (i = 0; i < ST_O_PROPERTIES.length; i++) {
            // Find position in max/min range (value - min)/(max - min) * ST_O_PROPERTIES[i].i
            REDUCED_VALUE += (((o[ST_O_PROPERTIES[i].n] * 1 - MIN_STORE[ST_O_PROPERTIES[i].n]) / (MAX_STORE[ST_O_PROPERTIES[i].n] - MIN_STORE[ST_O_PROPERTIES[i].n])) * ST_O_PROPERTIES[i].i) || 0;
        }
        o.value = REDUCED_VALUE;
        return o;
    });
    // Sort
    OPTIMIZER_MAPPED_ARRAY = Hybrid.sort(OPTIMIZER_MAPPED_ARRAY, function ST_OPTIMIZER_SORTING_FUNC(a, b) {
        /* Add Flag Checks to Sort function */
        return (a.value < b.value);
    });

    return OPTIMIZER_MAPPED_ARRAY;
};

module.exports = {
    optimize: Optimizer,
    properties: ST_O_PROPERTIES
};
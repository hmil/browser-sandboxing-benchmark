(function() {

const tasks = {
    prime: ['candidate', `const factors = [];
let current = candidate;
function checkValue() {
    const bound = Math.sqrt(current);
    for (let i = 2 ; i <= bound ; i++) {
        const div = current / i;
        if (div === Math.floor(div)) {
            factors.push(i);
            current = div;
            return checkValue();
        }
    }
    factors.push(current);
}
checkValue()
return factors`]
};

window.baselineJS = function(task) {
    const payload = tasks[task];
    if (payload == null) {
        throw new Error(task + ' not implemented for baselineJS');
    }

    return new Function(...payload);
}

})();
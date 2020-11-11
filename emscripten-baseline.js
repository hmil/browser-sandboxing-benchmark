(function() {

    const tasks = {
        'prime': (runtime) => (n) => {
            runtime.factorize(n);
            const nResults = runtime.getResultsCount();
            const results = [];
            for (let i = 0 ; i < nResults ; i++) {
                results.push(runtime.getResult(i));
            }
            return results;
        }
    }

    async function loadRuntime() {
        const module = await ModuleBaseline();
        return {
            factorize: module.cwrap('factorize', null, ['number']),
            getResultsCount: module.cwrap('getResultsCount', 'number', []),
            getResult: module.cwrap('getResult', 'number', ['number']),
        };
    }


const runtimeInterface = loadRuntime();


window.emscriptenBaseline = async function(task) {
    const payload = tasks[task];
    if (payload == null) {
        throw new Error(task + ' not implemented for baselineJS');
    }
    
    const runtime = await runtimeInterface;
    return payload(runtime);
}

})();
(function() {

    const tasks = {
        prime: (rt) => (arg) => {
            const size = rt.factorize(arg);
            return Array.from(memView.slice(0, size));
        }
    };

    var memory = new WebAssembly.Memory({ initial: 1 });
    var memView = new Int32Array(memory.buffer);

    const runtime = fetch("assemblyscript/build/optimized.wasm")
        .then((response) => response.arrayBuffer())
        .then((ab) => loader.instantiate(ab, {
            env: {
                memory
            }
        }))
        .then((module) => module.exports);

    window.assemblyScript = async function(task) {
        const payload = tasks[task];
        if (payload == null) {
            throw new Error(task + ' not implemented for AssemblyScript');
        }
    
        return payload(await runtime);
    }
})();
const solutions = [{
    name: 'Baseline (JavaScript)',
    language: 'JavaScript',
    description: 'unsandboxed JavaScript',
    entry: baselineJS
},{
    name: 'lua wasm VM (via emscripten)',
    lanuage: 'lua',
    description: 'lua compiled with emscripten',
    entry: luaEmscripten
},/* {
    name: 'moonshine',
    language: 'lua',
    description: 'lua in moonshine engine',
    // entry: luaMoonshine
},*/ {
    name: 'fengari (lua JS VM)',
    language: 'lua',
    description: 'lua in fengari engine',
    entry: luaFengari
},/* {
    name: 'mujs',
    language: 'JavaScript',
    description: 'JavaScript in mujs',
    // entry: jsMujs
},*/ {
    name: 'C to wasm (via emscripten)',
    language: 'C',
    description: 'C compiled with emscripten',
    entry: emscriptenBaseline
}, {
    name: 'AssemblyScript (wasm)',
    language: 'AssemblyScript',
    description: 'AOT compiled AssemblyScript',
    entry: assemblyScript
}];

const benchmarks = [{
    id: 'prime',
    name: 'Prime Factors',
    description: 'Find the prime number factorization of large numbers.',
    exercises: 'CPU-instensive load',
    run: (exec) => {
        expect(exec(1000004119)).toEqual([1000004119]);
        expect(exec(100003599)).toEqual([3,3,3,811,4567]);
        expect(exec(1515181523)).toEqual([19553, 77491]);
    }
}, {
    id: 'guestToHostString',
    name: 'Guest to host (string)',
    description: 'Calls a function on the host to check whether a string is ascii. If yes, return the length of the string, else return 0.',
    exercises: 'Context switching cost with string argument',
    run: (exec) => {
        function isAscii(a) {
            for (var i = 0 ; i < a.length ; i++) {
                if (a[i] < 0x20 || a[i] > 0xe7) {
                    return false;
                }
            }
            return true;
        }
        expect(exec(isAscii, lorem)).toEqual(lorem.length);
    }
}, {
    id: 'guestToHostNumber',
    name: 'Guest to host (number)',
    description: 'Calls a function on the host to find the length of sides of a triangle by brute force.',
    exercises: 'Context switching cost with number argument',
    run: (exec) => {
        function pythagores(a, b) {
            return Math.sqrt(a*a + b*b);
        }
        exec(pythagores);
    }
}, {
    id: 'hostToGuest',
    name: 'Host to guest (number)',
    description: 'Calls a function on the host to find the length of sides of a triangle by brute force.',
    exercises: 'Context switching cost with number argument',
    run: (exec) => {
        for (let i = 0 ; i < 100 ; i++) {
            for (let j = 0 ; i < 100 ; j++) {
                expect(exec(i, j)).toEqual(Math.sqrt(i*i, j*j));
            }
        }
    }
}]

const lorem = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";

function main() {
    const anchor = document.getElementById('main');
    const tb = document.createElement('table');
    anchor.appendChild(tb);
    const head = document.createElement('thead');
    tb.appendChild(head);
    const tr = document.createElement('tr');
    head.appendChild(tr);
    const th = document.createElement('th');
    th.innerText = 'Solution';
    tr.appendChild(th);
    benchmarks.forEach(bench => {
        const th = document.createElement('th');
        th.innerText = bench.name;
        tr.appendChild(th);
    });

    const body = document.createElement('tbody');
    tb.appendChild(body);

    solutions.forEach(solution => {
        const tr = document.createElement('tr');
        body.appendChild(tr);
        const nameCell = document.createElement('th');
        nameCell.innerText = solution.name;
        tr.appendChild(nameCell);
        benchmarks.forEach(bench => {
            const cell = document.createElement('td');
            tr.appendChild(cell);
            getImplementation(solution.entry, bench.id)
                .then(impl => {
                    const btn = document.createElement('button');
                    btn.onclick = () => {
                        const report = runBenchmark(bench.run, impl);
                        btn.innerText = report;
                    }
                    btn.innerText = 'Run';
                    cell.appendChild(btn);
                })
                .catch(err => {
                    console.error(err);
                    cell.innerText = 'N/A';
                });
        });
    });

    async function getImplementation(entry, benchmark) {
        return await entry(benchmark);
    }

    function runBenchmark(run, impl) {
        let samples = 0;
        let total = 0;
        while (total < 4000) {
            samples++;
            const start = performance.now();
            run(impl);
            total += performance.now() - start;
        }
        return (total / samples).toFixed(3) + 'ms/op (' + samples + ' samples)';
    }
}

function expect(value) {
    const check = compareFunc(value);
    return {
        toEqual: function(ref) {
            const result = check(ref);
            if (result !== true) {
                throw new Error('Expected ' + value + ' to equal ' + ref + ' : ' + result);
            }
        }
    }
}

function compareFunc(value) {
    if (Array.isArray(value)) {
        return (ref) => {
            if (ref.length !== value.length) {
                return 'array length differ';
            }
            for (var i = 0 ; i < ref.length ; i++) {
                if (ref[i] !== value[i]) {
                    return `value at index ${i} differ`;
                }
            }
            return true;
        }
    }

    return (ref) => ref === value || 'values are not identical';
}

window.addEventListener('load', main);
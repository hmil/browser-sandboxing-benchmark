// The entry file of your WebAssembly module.

let nFactors: i32 = 0;

function checkValue(current: i32): void {
    const bound = Math.sqrt(current);
    for (let i = 2 ; i <= bound ; i++) {
        const div: f64 = f64(current) / i;
        if (div == Math.floor(div)) {
            store<i32>(nFactors << 2, i);
            nFactors++;
            checkValue(i32(div))
            return;
        }
    }
    store<i32>(nFactors << 2, current);
    nFactors++;
}

export function factorize(candidate: i32): i32 {
    nFactors = 0;
    checkValue(candidate)
    return nFactors;
}

export function add(a: i32, b: i32): i32 {
    return a + b;
}

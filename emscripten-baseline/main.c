#include <stdlib.h>
#include <stdio.h>
#include <math.h>

int acc[100] = {0};
int accCount = 0;

/**
 * Returns the number of factors
 */
void checkValue(const double current) {
    const int bound = sqrt(current);
    int i;

    for (i = 2 ; i <= bound ; i++) {
        double div = current / i;
        if (div == floor(div)) {
            acc[accCount] = i;
            accCount++;
            // i = 2;
            // current = div;
            // bound = sqrt(current);
            return checkValue(div);
        }
    }
    acc[accCount] = current;
    accCount++;
}

extern void factorize(const int candidate) {
    accCount = 0;
    checkValue(candidate);
    // printf("Account %d\n", accCount);
    // printf("Account %d\n", acc[0]);
}

extern int getResultsCount() {
    return accCount;
}

extern int getResult(int n) {
    return acc[n];
}

// let current = candidate;
// function checkValue() {
//     const bound = Math.sqrt(current);
//     for (let i = 2 ; i <= bound ; i++) {
//         const div = current / i;
//         if (div === Math.floor(div)) {
//             factors.push(i);
//             current = div;
//             return checkValue();
//         }
//     }
//     factors.push(current);
// }
// checkValue()
// return factors
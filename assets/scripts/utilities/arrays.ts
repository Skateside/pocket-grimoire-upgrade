// import {
//     random,
// } from "./numbers";

export function unique<T = any>(array: T[]) {
    return [...new Set(Array.from(array))];
};

// export function shuffle<T = any>(array: T[]) {

//     // Schwartzian transform.
//     // return Array
//     //     .from(array, (item) => ({
//     //         item,
//     //         order: random(),
//     //     }))
//     //     .sort((a, b) => a.order - b.order)
//     //     .map(({ item }) => item);

//     // Fisher-Yates (aka Knuth) Shuffle.
//     const shuffled = [...array];
//     let index = shuffled.length;

//     while (index > 1) {

//         const randomIndex = Math.floor(random() * index);
//         index -= 1;

//         [shuffled[index], shuffled[randomIndex]] = [
//             shuffled[randomIndex],
//             shuffled[index],
//         ];

//     }

//     return shuffled;

// }

export type ILayoutsNode = keyof HTMLElementTagNameMap;

export type ILayoutsCalc = `calc(${string})`;
export type ILayoutsVar = `var(--${string})`;
export type ILayoutsZero = 0 | "0";
export type ILayoutsGlobal = "inherit" | "initial" | "revert" | "revert-layer" | "unset";
export type ILayoutsBase = ILayoutsCalc | ILayoutsVar | ILayoutsGlobal;
export type ILayoutsNumeric = ILayoutsBase | ILayoutsZero;

export type ILayoutsUnits = (
    "cap" | "ch" | "em" | "ex" | "ic" | "lh"
    | "rcap" | "rch" | "rem" | "rex" | "ric" | "rlh"
    | "vh" | "vw" | "vmax" | "vmin" | "vb" | "vi"
    | "cqw" | "cqh" | "cqi" | "cqb" | "cqmin" | "cqmax"
    | "px" | "cm" | "mm" | "Q" | "in" | "pc" | "pt"
);

export type ILayoutsColour = ILayoutsBase | string;
export type ILayoutsLength = ILayoutsNumeric | `${number}${ILayoutsUnits}`;
export type ILayoutsLengthPercentage = ILayoutsNumeric | `${number}${ILayoutsUnits}` | `${number}%`;
export type ILayoutsNumber = ILayoutsNumeric | number | `${number}`;
export type ILayoutsPercentage = ILayoutsNumeric | `${number}%`;

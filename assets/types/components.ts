export type ISelectEditionEvents = {
    (e: "error", message: string): void,
    (e: "invalid"): void,
    (e: "success"): void,
};

import type { ComputedRef, HTMLAttributes } from "vue";

export type IBaseFormExpose = {
    getData: () => FormData,
};

export type IBaseLabelAttributes = {
    "id"?: HTMLAttributes["id"],
};

export type IBaseLabelLayouts = (
    "cluster"
    | "cluster-reverse"
    | "sidebar"
    | "sidebar-inverse"
    | "sidebar-reverse"
    | "stack"
    | "stack-reverse"
);

export type IBaseLabelProvide = {
    id?: ComputedRef<string>,
};

export type IBaseInputTypes = (
    "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week"
    | "textarea"
);

export type IBaseChoice = {
    text: string,
    value: string,
};

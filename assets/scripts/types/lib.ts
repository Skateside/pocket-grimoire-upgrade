export type AnyFunction<TParameters extends any[] = any[], TReturn = any> = (
    (...args: TParameters) => TReturn
);

export type AnyObject<
    TKeys extends PropertyKey = PropertyKey,
    TValues = any
> = Record<TKeys, TValues> | Readonly<Record<TKeys, TValues>>;

export type AnyArray<TValues> = Array<TValues> | ReadonlyArray<TValues>;

export type RequireOnly<Type, Keys extends keyof Type> = (
    Partial<Type> & Pick<Type, Keys>
);

export type FieldElement = (
    HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement
);

export type DeepWritable<TObject = any> = {
    -readonly [Property in keyof TObject]: DeepWritable<TObject[Property]>
};


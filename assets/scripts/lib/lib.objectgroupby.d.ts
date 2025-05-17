export {}

// This shouldn't be needed, Typescript should just use es2022/es2024, but it
// wants to be awkward so I to define these manually.
declare global {

    interface ObjectConstructor {

        /**
         * Groups the given objects by a key taken from the object values.
         * @param items Items to group.
         * @param callbackFn Function identifying the key for the groups.
         */
        groupBy<T, K extends PropertyKey>(
            items: Iterable<T>,
            callbackFn: (element: T, index: number) => K
        ): Record<K, T[]>;

        /**
         * Determines whether an object has a property with the specified name.
         * @param o An object.
         * @param v A property name.
         */
        hasOwn(o: object, v: PropertyKey): boolean;

    }

}

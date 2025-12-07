import type {
    ICoordinates,
} from "../scripts/types/data";
import {
    type Ref,
    type Reactive,
    ref,
    toValue,
    watchEffect,
} from "vue";
import {
    times,
} from "../scripts/utilities/numbers";

// TODO: move this into the "types" folder - taken from GrimoirePad.vue
type IPad = Pick<DOMRect, "left" | "top" | "right" | "bottom">;

type ILayoutData = {
    width: number,
    height: number,
    tokenWidth: number,
    tokenHeight: number,
    total: number,
};

type ILayouts = Record<
    "diagonal" | "ellipse" | "horizontal" | "vertical",
    (data: ILayoutData) => ICoordinates[]
>;

export default function usePositioner(
    padReference: Reactive<IPad>,
    tokensReference: Ref<HTMLElement[]>,
    layout: keyof ILayouts = "ellipse",
) {

    const coordinates = ref<ICoordinates[]>([]);

    watchEffect(() => {
        getCoordinates(coordinates, padReference, tokensReference, layout);
    });

    return {
        coordinates,
    };

};

const getCoordinates = (
    coordinates: Ref<ICoordinates[]>,
    padReference: Reactive<IPad>,
    tokensReference: Ref<HTMLElement[]>,
    layout: keyof ILayouts,
) => {

    coordinates.value.length = 0;
    const pad = toValue(padReference);
    const tokens = toValue(tokensReference);

    if (!pad || !tokens?.length) {
        return;
    }

    const tokenRects = tokens[0].getBoundingClientRect();
    const data: ILayoutData = {
        width: pad.right - pad.left,
        height: pad.bottom - pad.top,
        tokenWidth: tokenRects.width,
        tokenHeight: tokenRects.height,
        total: tokens.length,
    };

    coordinates.value.push(...layouts[layout](data));

};

const layouts: ILayouts = {

    diagonal({ width, height, tokenWidth, tokenHeight, total }) {

        const xIncrement = (width - tokenWidth) / total;
        const yIncrement = (height - tokenHeight) / total;
        const tokenDeltaX = (tokenWidth / 2) / width;
        const tokenDeltaY = (tokenHeight / 2) / height;

        return times(total, (index) => ({
            x: (xIncrement * index) / width + tokenDeltaX,
            y: (yIncrement * index) / height + tokenDeltaY,
        }));

    },

    // https://stackoverflow.com/a/6972434
    ellipse({ width, height, tokenWidth, tokenHeight, total }) {

        const coordinates: ICoordinates[] = [];
        const radiusX = (width - tokenWidth) / 2;
        const radiusY = (height - tokenHeight) / 2;
        const precision = 0.001;
        const offset = Math.PI * -0.5;
        const tokenDeltaX = (tokenWidth / 2) / width;
        const tokenDeltaY = (tokenHeight / 2) / height;

        const dp = (radians: number) => Math.sqrt(
            (radiusX * Math.sin(radians)) ** 2
            + (radiusY * Math.cos(radians)) ** 2
        );

        let circumference = 0;

        for (
            let radians = 0 + offset;
            radians < (Math.PI * 2 + offset);
            radians += precision
        ) {
            circumference += dp(radians);
        }

        let nextPoint = 0;
        let run = 0;

        for (
            let radians = 0 + offset;
            radians < (Math.PI * 2 + offset);
            radians += precision
        ) {

            if ((total * run / circumference) >= nextPoint) {

                nextPoint += 1;
                coordinates.push({
                    x: (
                        ((radiusX + (Math.cos(radians) * radiusX)) / width)
                        + tokenDeltaX
                    ),
                    y: (
                        ((radiusY + (Math.sin(radians) * radiusY)) / height)
                        + tokenDeltaY
                    ),
                });

            }

            run += dp(radians);

        }

        return coordinates;

    },

    horizontal(data) {

        return layouts.diagonal(data).map((coords) => ({
            x: coords.x,
            y: 0,
        }));

    },

    vertical(data) {

        return layouts.diagonal(data).map((coords) => ({
            x: 0,
            y: coords.y,
        }));

    },

};

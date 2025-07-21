import type {
    II18nData,
    IInfoToken,
    IRole,
    IRoleScript,
} from "./data";

declare global {
    interface Window {
        PG: {
            i18n: II18nData,
            infoTokens: IInfoToken[],
            roles: IRole[],
            scripts: Record<string, IRoleScript>,
        },
    }
}

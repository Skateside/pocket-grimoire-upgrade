import type {
    II18nData,
    IInfoToken,
    IRole,
    IScriptImport,
} from "./data";

declare global {
    interface Window {
        PATHS: Record<string, string>,
        PG: {
            i18n: II18nData,
            infoTokens: IInfoToken[],
            roles: IRole[],
            scripts: Record<string, IScriptImport>,
        },
    }
}

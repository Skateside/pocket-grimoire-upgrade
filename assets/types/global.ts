import type {
    II18nData,
    IInfoTokenRaw,
    IRole,
    IScriptImport,
} from "./data";

declare global {
    interface Window {
        PATHS: Record<string, string>,
        PG: {
            i18n: II18nData,
            infoTokens: IInfoTokenRaw[],
            roles: IRole[],
            scripts: Record<string, IScriptImport>,
        },
    }
}

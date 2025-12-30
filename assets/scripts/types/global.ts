import type { DeepReadonly } from "vue";
import type {
    II18nData,
    IInfoToken,
    IRole,
    IRoleScript,
} from "./data";

declare global {
    interface Window {
        PG: DeepReadonly<{
            i18n: II18nData,
            infoTokens: IInfoToken[],
            roles: IRole[],
            scripts: Record<string, IRoleScript>,
        }>,
    }
}

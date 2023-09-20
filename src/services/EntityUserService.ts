import { Configuration } from "@/types/Configuration";
import { RoleItem } from "@/types/items/RoleItem";
import { SPFI } from "@pnp/sp";

export const EntityUserService = {
    getRoles: async (sp: SPFI, configuration: Configuration) => {
        const listTitle = configuration?.entityMemberRoleList;
        if (!listTitle) {
            return;
        }

        try {
            const items: Array<RoleItem> = await sp?.web.lists.getByTitle(listTitle).items();
            items.sort((a, b) => a.Order0 - b.Order0);
            return items;
        } catch (error: any) {
            if (error?.status === 404) {
                return [];
            }
            throw error;
        }
    }
};

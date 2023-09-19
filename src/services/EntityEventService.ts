import { Configuration } from "@/types/Configuration";
import { SPFI } from "@pnp/sp";

export const EntityEventService = {
    getEntityEvents: async (sp: SPFI, configuration: Configuration, entityId: number) => {
        if (!configuration.entityMeetingList) {
            return undefined;
        }
        const now = new Date().toISOString();

        try {
            const list = sp.web.lists.getByTitle(configuration.entityMeetingList);
            const filter = "EntityNameId eq " + entityId + " and Start ge datetime'" + now + "'";
            const items = await list.items.filter(filter).orderBy("Start", true)();
            return items;
        } catch (error: any) {
            if (error?.status === 404) {
                return [];
            }
            throw error;
        }
    }
};
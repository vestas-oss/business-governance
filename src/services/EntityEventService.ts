import { Configuration } from "@/types/Configuration";
import { EventItem } from "@/types/items/EventItem";
import { SPFI } from "@pnp/sp";

export const EntityEventService = {
    getEntityEvents: async (sp: SPFI, configuration: Configuration, entityId: number): Promise<Array<EventItem> | undefined> => {
        if (!configuration.entityEventsList) {
            return undefined;
        }
        const now = new Date().toISOString();

        try {
            const list = sp.web.lists.getByTitle(configuration.entityEventsList);

            const fields = await list.fields.select("InternalName")();

            const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
            const entityField = entityFieldInfo?.InternalName || "Entity";

            const filter = `${entityField} eq ${entityId} and Start ge datetime'${now}'`;
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
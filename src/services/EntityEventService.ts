import { Configuration } from "@/types/Configuration";
import { Event } from "@/types/Event";
import { SPFI } from "@pnp/sp";

export const EntityEventService = {
    getEntityEvents: async (sp: SPFI, configuration: Configuration, entityId: number): Promise<Array<Event> | undefined> => {
        if (!configuration.entityEventsList) {
            return undefined;
        }
        const now = new Date().toISOString();

        try {
            const list = sp.web.lists.getByTitle(configuration.entityEventsList);

            const fields = await list.fields.select("InternalName")();

            const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
            const entityField = entityFieldInfo?.InternalName || "Entity";

            const startFieldInfo = fields.find(f => f.InternalName === "EventDate" || f.InternalName === "Start");
            const startField = startFieldInfo?.InternalName || "Start";
            const endFieldInfo = fields.find(f => f.InternalName === "EndDate" || f.InternalName === "End");
            const endField = endFieldInfo?.InternalName || "End";

            const filter = `${entityField} eq ${entityId} and ${startField} ge datetime'${now}'`;
            const items = await list.items.filter(filter).orderBy(startField, true)();
            return items.map(item => {
                const event = {
                    title: item.Title,
                    start: item[startField],
                    end: item[endField],
                };

                return event;
            });
        } catch (error: any) {
            if (error?.status === 404) {
                return [];
            }
            throw error;
        }
    }
};
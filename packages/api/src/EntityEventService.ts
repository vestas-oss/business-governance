import { type SPFI } from "@pnp/sp";
import { ConfigurationService } from "./ConfigurationService.js";
import { type Configuration } from "./Configuration.js";
import "@pnp/sp/items/index.js";
import "@pnp/sp/fields/index.js";
import { Event } from "./types/Event.js";

export class EntityEventService {
    private readonly configurationService: ConfigurationService;

    constructor(private readonly sp: SPFI, configurationPreset?: Configuration) {
        this.configurationService = new ConfigurationService(sp, configurationPreset);
    }

    public getEntityEvents = async (entityId?: number): Promise<Array<Event> | undefined> => {
        const configuration = await this.configurationService.getConfiguration();

        if (!configuration.entityEventsList) {
            return undefined;
        }
        const now = new Date().toISOString();

        try {
            const list = this.sp.web.lists.getByTitle(configuration.entityEventsList);

            const fields = await list.fields.select("InternalName")();

            const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
            const entityField = entityFieldInfo?.InternalName || "Entity";

            const startFieldInfo = fields.find(f => f.InternalName === "EventDate" || f.InternalName === "Start");
            const startField = startFieldInfo?.InternalName || "Start";
            const endFieldInfo = fields.find(f => f.InternalName === "EndDate" || f.InternalName === "End");
            const endField = endFieldInfo?.InternalName || "End";

            var items: Array<any>;
            if (!entityId) {
                const filter = `${startField} ge datetime'${now}'`;
                items = await list.items.filter(filter).orderBy(startField, true)();
            } else {
                const filter = `${entityField} eq ${entityId} and ${startField} ge datetime'${now}'`;
                items = await list.items.filter(filter).orderBy(startField, true)();
            }

            return items.map(item => {
                const event = {
                    title: item.Title,
                    start: item[startField],
                    end: item[endField],
                    entityId: item[`${entityField}Id`],
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
}
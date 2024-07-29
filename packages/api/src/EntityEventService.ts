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

    public getEntityEvents = async (filter?: number | { entityId?: number, from?: Date, to?: Date }): Promise<Array<Event> | undefined> => {
        let entityId: number | undefined = undefined;
        let from: Date = new Date();
        let to: Date | undefined = undefined;
        if (typeof filter === "number") {
            entityId = filter;
        } else {
            entityId = filter?.entityId;
            from = filter?.from ?? from;
            to = filter?.to;
        }

        const configuration = await this.configurationService.getConfiguration();

        if (!configuration.entityEventsList) {
            return undefined;
        }

        try {
            const list = this.sp.web.lists.getByTitle(configuration.entityEventsList);

            const fields = await list.fields.select("InternalName")();

            const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
            const entityField = entityFieldInfo?.InternalName || "Entity";

            const startFieldInfo = fields.find(f => f.InternalName === "EventDate" || f.InternalName === "Start");
            const startField = startFieldInfo?.InternalName || "Start";
            const endFieldInfo = fields.find(f => f.InternalName === "EndDate" || f.InternalName === "End");
            const endField = endFieldInfo?.InternalName || "End";

            const isoString = (date: Date) => date.toISOString().split(".").shift() + "Z";
            const filters = new Array<string>();
            if (entityId) {
                filters.push(`${entityField} eq ${entityId}`);
            }
            if (from && to) {
                // Starts or ends within period
                const start = `(${startField} ge datetime'${isoString(from)}' and ${startField} le datetime'${isoString(to)}')`;
                const end = `(${endField} ge datetime'${isoString(from)}' and ${endField} le datetime'${isoString(to)}')`;
                filters.push(`(${start} or ${end})`);
            } else if (to) {
                // Start or end before to
                filters.push(`(${startField} le datetime'${isoString(to)}' or ${endField} le datetime'${isoString(to)}')`);
            } else if (from) {
                // Start or end after from
                filters.push(`(${startField} ge datetime'${isoString(from)}' or ${endField} ge datetime'${isoString(from)}')`);
            }

            const items = await list.items.
                top(5000).
                filter(filters.join(" and ")).
                orderBy(startField, true)();

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
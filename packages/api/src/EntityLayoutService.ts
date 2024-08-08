import { SPFI } from "@pnp/sp";
import { ConfigurationService } from "./ConfigurationService.js";
import { EntityLayoutItem } from "./types/items/EntityLayoutItem.js";
import { evalExpression } from "sp-formatting";
import { type Configuration } from "./Configuration.js";

export type EntityDetailsLayout = {
    header: Array<EntityDetailsHeader>;
    sections: Array<EntityDetailsSection>;
}

export type EntityDetailsSection = {
    title: string;
    rows: Array<EntityDetailsRow>;
}

export type EntityDetailsHeader = {
    title: string;
}

export type FilesEntityDetailsRow = {
    title: string;
    description?: string;
    type: "Files";
    value: string;
    fields?: Array<string>;
};

export type EntityDetailsRow = {
    title: string;
    description?: string;
    type: "MembersProvider" | "MeetingInfo" | "DetailsProvider";
    // TODO: rename?
    value: string;
} | FilesEntityDetailsRow;

export type EntityDetailsRowType = "MembersProvider" | "MeetingInfo" | "Files" | "DetailsProvider";

export type EntityLayout = {
    icon: string;
    color: string;
    contentType?: string;
    condition?: string;

    id: number;
    plural?: string;
    title: string;
    order?: number;
    description?: string;

    layout?: EntityDetailsLayout;
}

export type EntityLayoutSchema = {
    field: string;
    mappings: {
        key: string,
        value: string,
        type: EntityDetailsRowType,
        description?: string,
        fields?: Array<string>,
    }[];
    type: "HeaderItalic" | "Section";
}

export class EntityLayoutService {
    private readonly configurationService: ConfigurationService;

    constructor(private readonly sp: SPFI, configurationPreset?: Configuration) {
        this.configurationService = new ConfigurationService(sp, configurationPreset);
    }

    public getLayouts = async (): Promise<Array<EntityLayout>> => {
        const configuration = await this.configurationService.getConfiguration();

        if (!configuration?.entityLayoutListTitle) {
            return [];
        }

        // Get layouts
        const items = this.sp.web.lists.getByTitle(configuration.entityLayoutListTitle).items;
        const layoutItems = await items.orderBy("bgOrder")() as Array<EntityLayoutItem>;

        const entityLayouts = new Array<EntityLayout>();
        for (let i = 0; i !== layoutItems.length; i++) {
            const layoutItem = layoutItems[i];

            // Parse layout
            const layoutDetails = JSON.parse(layoutItem.Layout) as Array<EntityLayoutSchema>;
            let layout: EntityDetailsLayout | undefined = undefined;
            if (Array.isArray(layoutDetails)) {
                layout = {
                    sections: [],
                    header: [],
                };

                const entityMappingsHeader = layoutDetails.filter((layoutDetail) => layoutDetail.type === "HeaderItalic");

                for (let j = 0; j < entityMappingsHeader.length; j++) {
                    const entityDetailsLayoutHeader = {
                        title: entityMappingsHeader[j].field,
                    };
                    layout.header.push(entityDetailsLayoutHeader);
                }

                const sections = layoutDetails.filter((layoutDetail) => layoutDetail.type === "Section");
                if (sections.length > 0) {
                    for (let s = 0; s < sections.length; s++) {
                        const section = sections[s];

                        const sectionTitle = section.field;

                        const rows = new Array<EntityDetailsRow>();
                        for (let i = 0; i < section.mappings.length; i++) {
                            const row = section.mappings[i];
                            const title = row.key;
                            const value = row.value;
                            const description = row.description;
                            const fields = row.fields;

                            rows.push({
                                title,
                                type: row.type,
                                description,
                                value,
                                fields,
                            });
                        }

                        layout.sections.push({
                            title: sectionTitle,
                            rows: rows,
                        });
                    }
                }
            }

            const entityLayout: EntityLayout = {
                id: layoutItem.Id,
                icon: layoutItem.Icon || "TaskGroup",
                color: layoutItem.Color || "#1F4477",
                contentType: layoutItem.ContentTypeId0 || layoutItem.bgContentTypeId,
                condition: layoutItem.Condition,
                plural: layoutItem.Plural,
                title: layoutItem.Title,
                order: layoutItem.bgOrder,
                description: layoutItem.Description,
                layout,
            };

            entityLayouts.push(entityLayout);
        }

        return entityLayouts;
    }

    public getLayout = (entity: any, layouts: Array<EntityLayout>) => {
        if (!layouts || !entity) {
            return undefined;
        }
        return layouts?.find((layout) => {
            // Check content type condition
            const contentType = layout.contentType;
            if (
                contentType &&
                (entity.ContentTypeId.indexOf(contentType) === 0 ||
                    entity.ContentType === contentType)
            ) {
                return true;
            }

            // Check custom condition
            let condition = layout.condition;
            if (condition) {
                if (condition.indexOf("=") !== 0) {
                    condition = `=${condition}`;
                }

                if (evalExpression(condition, { item: entity }) === "true") {
                    return true;
                }
            }

            return false;
        });
    }
};
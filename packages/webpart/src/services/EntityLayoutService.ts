import { EntityDetailsLayout, EntityDetailsRow, EntityDetailsRowType, EntityLayout } from "@/contexts/EntityLayoutsContext";
import { Configuration } from "api";
import { EntityLayoutItem } from "@/types/items/EntityLayoutItem";
import { SPFI } from "@pnp/sp";

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

export const EntityLayoutService = {
    getLayouts: async (sp: SPFI, configuration?: Configuration): Promise<Array<EntityLayout>> => {
        if (!configuration?.entityLayoutListTitle) {
            return [];
        }

        // Get layouts
        const items = sp.web.lists.getByTitle(configuration.entityLayoutListTitle).items;
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
};
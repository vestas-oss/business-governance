import { Configuration } from "@/types/Configuration";
import { Entity } from "@/types/Entity";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/fields";
import { IFieldInfo } from "@pnp/sp/fields/types";
import "@pnp/sp/items/get-all";
import { Services } from "./Services";

export const EntityService = {
    getEntityList: (sp: SPFI, configuration?: Configuration) => {
        if (!configuration?.entityListTitle) {
            throw new Error("business-governance: configuration entity list not set");
        }

        const title = configuration.entityListTitle;
        return sp.web.lists.getByTitle(title);
    },

    getEntities: async (sp: SPFI, configuration?: Configuration) => {
        let selects = ["Id", "Title", "ContentTypeId"];
        if (configuration?.parentColumn) {
            selects.push(`${configuration?.parentColumn}Id`);
        }
        if (configuration?.select) {
            selects = selects.concat(configuration.select.split(",").map(s => s.trim()));
        }
        const entityList = EntityService.getEntityList(sp, configuration);
        const items: Array<any> | undefined = await entityList?.items.
            top(5000).
            filter(configuration?.filter || "").
            select(...selects)();

        items?.sort((a, b) => b.ContentTypeId.localeCompare(a.ContentTypeId) || a.Title?.localeCompare(b.Title));

        return items;
    },

    getEntity: async (sp: SPFI, configuration: Configuration, id: number | string): Promise<Entity | undefined> => {
        const entityList = EntityService.getEntityList(sp, configuration);
        // Item
        const getItem = async () => {
            const item = await entityList.items.getById(parseInt(id.toString()))();
            return item;
        };

        const getContentTypeItem = async () => {
            const expands = ["ContentType"];
            const selects = ["ContentType/Name"];
            const item = await entityList.items.getById(parseInt(id.toString())).expand(...expands).select(...selects)();
            return item;
        };

        const [item, users, contentTypeItem] = await Promise.all([
            getItem(),
            Services.entityUserService.getUsers(sp, configuration, id),
            getContentTypeItem(),
        ]);

        item.ContentType = contentTypeItem.ContentType?.Name;

        const entity = new Entity(item);
        if (users) {
            entity.memberRoles = users;
        }

        return entity;
    },

    /**
     * Get extra columns from the entity
     */
    getEntityDetails: async (sp: SPFI, configuration: Configuration, entityId: number, selects?: Array<string>, expands?: Array<string>): Promise<any | undefined> => {
        const entityList = EntityService.getEntityList(sp, configuration);
        let item = entityList.items.getById(entityId);
        if (selects) {
            item = item.select(...selects);
        }
        if (expands) {
            item = item.expand(...expands);
        }
        const entity = await item();
        return entity;
    },

    getEntityFields: async (sp: SPFI, configuration: Configuration): Promise<Array<IFieldInfo>> => {
        const entityList = EntityService.getEntityList(sp, configuration);
        return entityList.fields();
    }
};
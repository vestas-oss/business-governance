import { Configuration } from "@/types/Configuration";
import { Entity } from "@/types/Entity";
import { EntityMember } from "@/types/EntityMember";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/fields";
import { IFieldInfo } from "@pnp/sp/fields/types";
import "@pnp/sp/items/get-all";

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

        // Members
        const getMembers = async () => {
            try {
                if (configuration.entityMemberList) {
                    const selects = ["Member/Title", "Member/Name", "Role/Order0", "Role/KeyId", "Role/Title", "Role/Id", "Role/Category", "ID", "EntityName/Title", "EntityName/Id", "Member/Name", "Member/JobTitle", "Modified", "EditorId"];
                    const expands = ["Member", "Role", "EntityName"];
                    const order = "Member/Title";

                    const memberItems = await sp.web.lists.getByTitle(configuration.entityMemberList).items.
                        expand(...expands).
                        select(...selects).
                        orderBy(order).filter(`EntityName/Id eq ${id}`).getAll();
                    const members = memberItems.map(m => new EntityMember(m));

                    return members.filter(member => member.entityId.toString() === id.toString());
                    // entity.members = members.filter(member =>
                    //     member.entityId.toString() === id.toString() &&
                    //     member.roleCategory === "Active")?.length;
                }
            } catch (e) {
                console.log(`business governance: failed to get ${configuration.entityMemberList} for entity ${id} (${e?.toString()})`);
            }
        };

        const [item, members, contentTypeItem] = await Promise.all([
            getItem(),
            getMembers(),
            getContentTypeItem(),
        ]);

        item.ContentType = contentTypeItem.ContentType?.Name;

        const entity = new Entity(item);
        if (members) {
            entity.memberRoles = members;
        }

        return entity;
    },

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
import { Configuration } from "@/types/Configuration";
import { Entity } from "@/types/Entity";
import { EntityUser } from "@/types/EntityUser";
import { RoleItem } from "@/types/items/RoleItem";
import { SPFI } from "@pnp/sp";

export const EntityUserService = {
    getRoles: async (sp: SPFI, configuration: Configuration) => {
        const listTitle = configuration?.entityRolesList;
        if (!listTitle) {
            return;
        }

        try {
            const items: Array<RoleItem> = await sp?.web.lists.getByTitle(listTitle).items();
            if (items.length === 0) {
                return items;
            }
            items.sort((a, b) =>
                ("bgOrder" in a ? a.bgOrder : a.Order0) -
                ("bgOrder" in b ? b.bgOrder : b.Order0));
            return items;
        } catch (error: any) {
            if (error?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    getUsers: async (sp: SPFI, configuration: Configuration, id: number | string) => {
        if (!configuration.entityUserRolesList) {
            return undefined;
        }

        try {
            const list = sp.web.lists.getByTitle(configuration.entityUserRolesList);
            const fields = await list.fields.select("InternalName")();

            const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
            const entityField = entityFieldInfo?.InternalName || "Entity";

            const userFieldInfo = fields.find(f => f.InternalName === "Member" || f.InternalName === "User");
            const userField = userFieldInfo?.InternalName || "User";

            const rolesList = sp.web.lists.getByTitle(configuration.entityRolesList!);
            const rolesListFields = await rolesList.fields.select("InternalName")();
            const roleIdFieldInfo = rolesListFields.find(f => f.InternalName === "KeyId" || f.InternalName === "RoleId");
            const roleIdField = roleIdFieldInfo?.InternalName || "RoleId";

            const selects = [
                "ID", "Modified", "EditorId", "isDeleted",
                `${userField}/Title`, `${userField}/Name`, `${userField}/JobTitle`, `${userField}/Name`,
                `Role/${roleIdField}`, `Role/Title`,
            ];
            const expands = [
                userField,
                "Role",
            ];
            const order = `${userField}/Title`;

            const userItems = await list.items.
                expand(...expands).
                select(...selects).
                orderBy(order).
                filter(`${entityField}/Id eq ${id}`).
                getAll();
            const users = userItems.map(m => new EntityUser(m));

            return users;
        } catch (e) {
            console.log(`business governance: failed to get ${configuration.entityUserRolesList} for entity ${id} (${e?.toString()})`);
        }
    },

    removeUsers: async (sp: SPFI, configuration: Configuration, entity: Entity, role: RoleItem, users: Array<string>) => {
        if (!configuration.entityUserRolesList) {
            return;
        }
        for (let i = 0; i !== users.length; i++) {
            const user = entity.users?.find(
                (user) =>
                    user.roleId === ("RoleId" in role ? role.RoleId.toString() : role.KeyId.toString()) &&
                    user.name === users[i]
            );
            if (!user) {
                continue;
            }
            // Mark as deleted
            await sp.web.lists
                .getByTitle(configuration.entityUserRolesList)
                .items.getById(user.id)
                .update({ isDeleted: true });
        }
    },

    addUsers: async (sp: SPFI, configuration: Configuration, entity: Entity, role: RoleItem, users: Array<string>) => {
        if (!configuration.entityUserRolesList) {
            return;
        }
        const list = sp.web.lists.getByTitle(configuration.entityUserRolesList);
        const fields = await list.fields.select("InternalName")();

        const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
        const entityField = entityFieldInfo?.InternalName || "Entity";

        const userFieldInfo = fields.find(f => f.InternalName === "Member" || f.InternalName === "User");
        const userField = userFieldInfo?.InternalName || "User";

        for (let i = 0; i !== users.length; i++) {
            const user = entity.users?.find(
                (user) =>
                    user.roleId === ("RoleId" in role ? role.RoleId.toString() : role.KeyId.toString()) &&
                    user.name === users[i]
            );
            if (!user) {
                // Add new
                const user = await sp.web.ensureUser(users[i]);
                const itemProperties = {
                    // MemberId: user.data.Id,
                    RoleId: role.Id,
                    // EntityNameId: entity.id,
                } as any;
                itemProperties[`${userField}Id`] = user.data.Id;
                itemProperties[`${entityField}Id`] = entity.id;

                await list.items.add(itemProperties);
                continue;
            }

            // Mark as not deleted
            await list
                .items.getById(user.id)
                .update({ isDeleted: false });
        }
    },
};

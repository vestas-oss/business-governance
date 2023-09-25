import { Configuration } from "@/types/Configuration";
import { Entity } from "@/types/Entity";
import { EntityMember } from "@/types/EntityMember";
import { RoleItem } from "@/types/items/RoleItem";
import { SPFI } from "@pnp/sp";

export const EntityUserService = {
    getRoles: async (sp: SPFI, configuration: Configuration) => {
        const listTitle = configuration?.entityMemberRoleList;
        if (!listTitle) {
            return;
        }

        try {
            const items: Array<RoleItem> = await sp?.web.lists.getByTitle(listTitle).items();
            items.sort((a, b) => a.Order0 - b.Order0);
            return items;
        } catch (error: any) {
            if (error?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    getUsers: async (sp: SPFI, configuration: Configuration, id: number | string) => {
        if (!configuration.entityMemberList) {
            return undefined;
        }

        try {
            const selects = [
                "ID", "Modified", "EditorId", "isDeleted",
                "Member/Title", "Member/Name", "Member/JobTitle", "Member/Name",
                "Role/Order0", "Role/KeyId", "Role/Title", "Role/Id",
            ];
            const expands = [
                "Member",
                "Role",
            ];
            const order = "Member/Title";

            const memberItems = await sp.web.lists.getByTitle(configuration.entityMemberList).items.
                expand(...expands).
                select(...selects).
                orderBy(order).
                filter(`EntityName/Id eq ${id}`).
                getAll();
            const members = memberItems.map(m => new EntityMember(m));

            return members;
        } catch (e) {
            console.log(`business governance: failed to get ${configuration.entityMemberList} for entity ${id} (${e?.toString()})`);
        }
    },

    removeUsers: async (sp: SPFI, configuration: Configuration, entity: Entity, role: RoleItem, users: Array<string>) => {
        if (!configuration.entityMemberList) {
            return;
        }
        for (let i = 0; i !== users.length; i++) {
            const member = entity.memberRoles?.find(
                (memberRole) =>
                    memberRole.roleId === role.KeyId.toString() && memberRole.name === users[i]
            );
            if (!member) {
                continue;
            }
            // Mark as deleted
            await sp.web.lists
                .getByTitle(configuration.entityMemberList)
                .items.getById(member.id)
                .update({ isDeleted: true });
        }
    },

    addUsers: async (sp: SPFI, configuration: Configuration, entity: Entity, role: RoleItem, users: Array<string>) => {
        if (!configuration.entityMemberList) {
            return;
        }
        for (let i = 0; i !== users.length; i++) {
            const member = entity.memberRoles?.find(
                (memberRole) =>
                    memberRole.roleId === role.KeyId.toString() && memberRole.name === users[i]
            );
            if (!member) {
                // Add new
                const user = await sp.web.ensureUser(users[i]);
                const itemProperties = {
                    MemberId: user.data.Id,
                    RoleId: role.Id,
                    EntityNameId: entity.id,
                };

                await sp.web.lists.getByTitle(configuration.entityMemberList).items.add(itemProperties);
                continue;
            }

            // Mark as not deleted
            await sp.web.lists
                .getByTitle(configuration.entityMemberList)
                .items.getById(member.id)
                .update({ isDeleted: false });
        }
    },
};

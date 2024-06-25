import { Configuration } from "./Configuration.js";
import { Entity } from "./types/Entity.js";
import { EntityUser } from "./types/EntityUser.js";
import { RoleItem } from "./types/items/RoleItem.js";
import { SPFI } from "@pnp/sp";
import { ConfigurationService } from "./ConfigurationService.js";
import "@pnp/sp/items/get-all.js";
import "@pnp/sp/site-users/index.js";

export class EntityUserService {
    private readonly configurationService: ConfigurationService;

    constructor(private readonly sp: SPFI, configurationPreset?: Configuration) {
        this.configurationService = new ConfigurationService(sp, configurationPreset);
    }

    public getRoles = async () => {
        const configuration = await this.configurationService.getConfiguration();

        const listTitle = configuration?.entityRolesList;
        if (!listTitle) {
            return;
        }

        try {
            const items: Array<RoleItem> = await this.sp.web.lists.getByTitle(listTitle).items();
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
    }

    public getUsers = async (entityId?: number | string) => {
        const configuration = await this.configurationService.getConfiguration();

        if (!configuration.entityUserRolesList || !configuration.entityRolesList) {
            return undefined;
        }

        try {
            const list = this.sp.web.lists.getByTitle(configuration.entityUserRolesList);
            const fields = await list.fields.select("InternalName")();

            const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
            const entityField = entityFieldInfo?.InternalName || "Entity";

            const userFieldInfo = fields.find(f => f.InternalName === "Member" || f.InternalName === "User");
            const userField = userFieldInfo?.InternalName || "User";

            const rolesList = this.sp.web.lists.getByTitle(configuration.entityRolesList);
            const rolesListFields = await rolesList.fields.select("InternalName")();
            const roleIdFieldInfo = rolesListFields.find(f => f.InternalName === "KeyId" || f.InternalName === "RoleId");
            const roleIdField = roleIdFieldInfo?.InternalName || "RoleId";

            const selects = [
                "ID", "Modified", "EditorId", "isDeleted", `${entityField}Id`,
                `${userField}/Title`, `${userField}/Name`, `${userField}/JobTitle`, `${userField}/Name`,
                `Role/${roleIdField}`, `Role/Title`,
            ];
            const expands = [
                userField,
                "Role",
            ];
            const order = `${userField}/Title`;

            const items = list.items.
                expand(...expands).
                select(...selects).
                orderBy(order);

            let userItems: Array<any>;
            if (!entityId) {
                // Get all users
                userItems = await items.getAll();
            } else {
                userItems = await items.
                    filter(`${entityField}/Id eq ${entityId}`).
                    getAll();
            }
            const users = userItems.map(m => new EntityUser(m));

            return users;
        } catch (e: any) {
            console.log(`business governance: failed to get ${configuration.entityUserRolesList} for entity ${entityId} (${e?.toString()})`);
        }
    }

    public removeUsers = async (entity: Entity, role: RoleItem, users: Array<string>) => {
        const configuration = await this.configurationService.getConfiguration();

        if (!configuration.entityUserRolesList) {
            return;
        }
        for (let i = 0; i !== users.length; i++) {
            const removeUsers = entity.users?.filter(
                (user) =>
                    user.roleId === ("RoleId" in role ? role.RoleId.toString() : role.KeyId.toString()) &&
                    user.name === users[i] &&
                    !user.isDeleted
            );
            if (!removeUsers || removeUsers.length === 0) {
                continue;
            }
            // Mark as deleted
            for (const removeUser of removeUsers) {
                await this.sp.web.lists
                    .getByTitle(configuration.entityUserRolesList)
                    .items.getById(removeUser.id)
                    .update({ isDeleted: true });
            }
        }
    }

    public addUsers = async (entity: Entity, role: RoleItem, users: Array<string>) => {
        const configuration = await this.configurationService.getConfiguration();
        if (!configuration.entityUserRolesList) {
            return;
        }
        const list = this.sp.web.lists.getByTitle(configuration.entityUserRolesList);
        const fields = await list.fields.select("InternalName")();

        const entityFieldInfo = fields.find(f => f.InternalName === "EntityName" || f.InternalName === "Entity");
        const entityField = entityFieldInfo?.InternalName || "Entity";

        const userFieldInfo = fields.find(f => f.InternalName === "Member" || f.InternalName === "User");
        const userField = userFieldInfo?.InternalName || "User";

        for (let i = 0; i !== users.length; i++) {
            // NOTE: there can exist duplicate users (eg. when two users added the same users
            // at the same time).
            const user = entity.users?.find(
                (user) =>
                    user.roleId === ("RoleId" in role ? role.RoleId.toString() : role.KeyId.toString()) &&
                    user.name === users[i]
            );
            if (!user) {
                // Add new
                const user = await this.sp.web.ensureUser(users[i]);
                const itemProperties = {
                    RoleId: role.Id,
                } as any;
                itemProperties[`${userField}Id`] = user.data.Id;
                itemProperties[`${entityField}Id`] = entity.id;

                await list.items.add(itemProperties);
                continue;
            }

            // Mark as not deleted
            await list
                .items
                .getById(user.id)
                .update({ isDeleted: false });
        }
    }
};

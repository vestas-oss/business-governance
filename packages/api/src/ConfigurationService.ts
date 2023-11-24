import type { SPFI } from "@pnp/sp";
import type { Configuration } from "./Configuration.js";
import "@pnp/sp/webs/index.js";
import "@pnp/sp/lists/index.js";

export class ConfigurationService {
    constructor(private readonly sp: SPFI, private configurationPreset?: Configuration) {

    }

    public getConfiguration = async (): Promise<Configuration> => {
        // Generic or Events and not Hidden
        const listInfos = await this.sp.web.lists.filter(
            "(BaseTemplate eq 100 or BaseTemplate eq 106) and Hidden eq false"
        )();

        const getEntityList = async () => {
            const title = this.configurationPreset?.entityListTitle;
            if (title) {
                return title;
            }
            // Try to guess the list
            let lists = listInfos.filter((listInfo) => listInfo.ItemCount > 0);

            lists = lists.filter(
                (list) =>
                    list.Title !== "EntityType" &&
                    list.Title !== "Configuration" &&
                    list.Title !== "Entity Layouts" &&
                    list.Title !== "Meetings" &&
                    list.Title !== "Events" &&
                    list.Title !== "Roles" &&
                    list.Title !== "User Roles"
            );

            if (lists.length > 0) {
                lists = lists.sort((a, b) => b.ItemCount - a.ItemCount);
                const title = lists[0].Title;

                console.log(
                    `business-governance: Warning entity list not set, guessed '${title}'`
                );
                return title;
            }
        };

        const configuration: Configuration = {
            select: this.configurationPreset?.select,
            entityListTitle: await getEntityList(),
            entityLayoutListTitle: listInfos.find(
                (l) =>
                    l.Title === "Entity Layouts" ||
                    l.Title === "EntityType" ||
                    l.Title === "EntityTypes"
            )?.Title,
            entityEventsList: listInfos.find((l) => l.Title === "Meetings")?.Title ||
                listInfos.find((l) => l.Title === "Events")?.Title,
            entityUserRolesList: listInfos.find((l) => l.Title === "Roles")?.Title,
            entityRolesList: listInfos.find((l) => l.Title === "MemberRoles")?.Title,
            filter: this.configurationPreset?.filter,
            search: this.configurationPreset?.search,
            startNode: this.configurationPreset?.startNode,
        };

        const rolesExists = listInfos.find((l) => l.Title === "Roles");
        const userRolesExists = listInfos.find((l) => l.Title === "User Roles");
        if (rolesExists && userRolesExists) {
            configuration.entityUserRolesList = "User Roles";
            configuration.entityRolesList = "Roles";
        }

        const getParentColumn = async () => {
            if (this.configurationPreset?.parentColumn) {
                return this.configurationPreset?.parentColumn;
            }

            if (configuration.entityListTitle) {
                // Guess parent column
                try {
                    const list = this.sp.web.lists.getByTitle(configuration.entityListTitle);
                    const listInfo = await list();
                    const lookupFields = await list.fields.filter(
                        `TypeAsString eq 'Lookup' and (LookupList eq '${listInfo.Id}' or LookupList eq '{${listInfo.Id}}')`
                    )();

                    if (lookupFields?.length > 0) {
                        const name = lookupFields[0].InternalName;
                        console.log(`business-governance: Guessed parent column  to '${name}'`);
                        return name;
                    }
                } catch {
                    // Ignore
                }
            }

            console.log(
                "business-governance: Warning parent column not set, fallback to 'Parent'"
            );
            return "Parent";
        };

        configuration.parentColumn = await getParentColumn();

        return await Promise.resolve(configuration);
    }
}
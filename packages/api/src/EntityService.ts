import { type SPFI } from "@pnp/sp";
import { ConfigurationService } from "./ConfigurationService.js";
import { type Configuration } from "./Configuration.js";
import "@pnp/sp/items/index.js";
import type { IFieldInfo } from "@pnp/sp/fields/types";
import "@pnp/sp/fields/index.js";
import { Entity } from "./types/Entity.js";
import { EntityUserService } from "./EntityUserService.js";

export class EntityService {
    private readonly configurationService: ConfigurationService;

    constructor(private readonly sp: SPFI, configurationPreset?: Configuration) {
        this.configurationService = new ConfigurationService(sp, configurationPreset);
    }

    private readonly getEntityList = (configuration: Configuration) => {
        if (!configuration?.entityListTitle) {
            throw new Error("business-governance: configuration entity list not set");
        }

        const title = configuration.entityListTitle;
        return this.sp.web.lists.getByTitle(title);
    }

    public getEntities = async () => {
        const configuration = await this.configurationService.getConfiguration();
        let selects = ["Id", "Title", "ContentTypeId", "ContentType/Name"];
        if (configuration?.parentColumn) {
            selects.push(`${configuration?.parentColumn}Id`);
        }
        if (configuration?.select) {
            selects = selects.concat(configuration.select.split(",").map(s => s.trim()));
        }
        const entityList = this.getEntityList(configuration);
        const items: Array<any> | undefined = await entityList?.items.
            top(5000).
            filter(configuration?.filter || "").
            expand("ContentType").
            select(...selects)();

        items?.forEach(item => {
            item.ContentType = item.ContentType?.Name;
        });

        items?.sort((a, b) => b.ContentTypeId.localeCompare(a.ContentTypeId) || a.Title?.localeCompare(b.Title));

        return items;
    }

    public getEntity = async (id: number | string): Promise<Entity | undefined> => {
        const configuration = await this.configurationService.getConfiguration();
        const entityList = this.getEntityList(configuration);
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

        const userService = new EntityUserService(this.sp);
        const [item, users, contentTypeItem] = await Promise.all([
            getItem(),
            userService.getUsers(id),
            getContentTypeItem(),
        ]);

        item.ContentType = contentTypeItem.ContentType?.Name;

        const entity = new Entity(item);
        if (users) {
            entity.users = users;
        }

        return entity;
    }

    /**
     * Get extra columns from the entity
     */
    public getEntityDetails = async (entityId: number, selects?: Array<string>, expands?: Array<string>): Promise<any | undefined> => {
        const configuration = await this.configurationService.getConfiguration();

        const entityList = this.getEntityList(configuration);
        let item = entityList.items.getById(entityId);
        if (selects) {
            item = item.select(...selects);
        }
        if (expands) {
            item = item.expand(...expands);
        }
        const entity = await item();
        return entity;
    }

    public getEntityFields = async (): Promise<Array<IFieldInfo>> => {
        const configuration = await this.configurationService.getConfiguration();

        const entityList = this.getEntityList(configuration);
        return entityList.fields();
    }
}
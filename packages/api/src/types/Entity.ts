import { EntityUser } from "./EntityUser.js";

export class Entity {
    public id: number;
    public title: string;
    public item: any = undefined;
    public users: Array<EntityUser> = [];

    constructor(item: any) {
        this.item = item;
        this.id = item.ID;
        this.title = item.Title;
    }
}

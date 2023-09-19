import { EntityMember } from "./EntityMember";

export class Entity {
    public id: number;
    public title: string;
    public item: any = undefined;
    public memberRoles: Array<EntityMember> = [];

    constructor(item: any) {
        this.item = item;
        this.id = item.ID;
        this.title = item.Title;
    }
}

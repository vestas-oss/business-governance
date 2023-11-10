import { EntityUserItem } from "./items/EntityUserItem.js";

export class EntityUser {
    public name: string;
    public title: string;
    public role: string;
    public roleId: string;
    public id: number;
    public entityId?: number;
    public userName: string;
    public jobTitle: string;
    public modified: string;
    public editorId: string;
    public isDeleted: boolean;

    constructor(item: EntityUserItem) {
        this.id = item.Id;

        if ("User" in item) {
            this.name = item.User.Name;
            this.title = item.User.Title;
            this.userName = item.User.Name;
            this.jobTitle = item.User.JobTitle;
        } else {
            this.name = item.Member.Name;
            this.title = item.Member.Title;
            this.userName = item.Member.Name;
            this.jobTitle = item.Member.JobTitle;
        }

        if ("EntityNameId" in item) {
            this.entityId = item.EntityNameId;
        } else {
            this.entityId = item.EntityId;
        }

        this.roleId = "RoleId" in item.Role ? item.Role.RoleId : item.Role.KeyId;
        this.role = item.Role.Title;

        this.modified = item.Modified;
        this.editorId = item.EditorId;
        this.isDeleted = item.isDeleted;
    }
}
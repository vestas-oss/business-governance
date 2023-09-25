import { EntityUserItem } from "./items/EntityUserItem";

export class EntityMember {
    public name: string;
    public title: string;
    public role: string;
    public roleId: string;
    public id: number;
    public memberRoleId: number;
    public roleOrder: number;
    public userName: string;
    public jobTitle: string;
    public modified: string;
    public editorId: string;
    public isDeleted: boolean;

    constructor(item: EntityUserItem) {
        this.name = item.Member.Name;
        this.title = item.Member.Title;
        this.roleId = item.Role.KeyId;
        this.role = item.Role.Title;
        this.id = item.Id;
        this.memberRoleId = item.Role.Id;
        this.roleOrder = item.Role.Order0;
        this.userName = item.Member.Name;
        this.jobTitle = item.Member.JobTitle;
        this.modified = item.Modified;
        this.editorId = item.EditorId;
        this.isDeleted = item.isDeleted;
    }
}
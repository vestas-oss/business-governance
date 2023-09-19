export class EntityMember {
    public name: string;
    public title: string;
    public role: string;
    public roleId: string;
    public id: number;
    public memberRoleId: number;
    public roleOrder: number;
    public roleCategory: string;
    public entityId: number;
    public userName: string;
    public jobTitle: string;
    public modified: string;
    public editorId: string;

    constructor(item?: any) {
        this.name = item.Member.Name;
        this.title = item.Member.Title;
        this.roleId = item.Role.KeyId;
        this.role = item.Role.Title;
        this.id = item.ID;
        this.memberRoleId = item.Role.Id;
        this.roleOrder = item.Role.Order0;
        this.roleCategory = item.Role.Category;
        this.entityId = item.EntityName.Id;
        this.userName = item.Member.Name;
        this.jobTitle = item.Member.JobTitle;
        this.modified = item.Modified;
        this.editorId = item.EditorId;
    }
}
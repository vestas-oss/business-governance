export type EntityUserItem = {
    Id: number;
    Modified: string;
    EditorId: string;
    isDeleted: boolean;

    Role: {
        Title: string;
    } & ({ KeyId: string } | { RoleId: string })
} & ({
    Member: {
        Title: string;
        Name: string;
        JobTitle: string;
    }
} | {
    User: {
        Title: string;
        Name: string;
        JobTitle: string;
    }
}) & ({ EntityNameId: number } | { EntityId: number });

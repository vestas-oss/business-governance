export type EntityUserItem = {
    Id: number;
    Modified: string;
    EditorId: string;
    isDeleted: boolean;

    Member: {
        Title: string;
        Name: string;
        JobTitle: string;
    }

    Role: {
        Id: number;
        Title: string;
        KeyId: string;
        Order0: number;
    }

    EntityName: {
        Id: number;
    }
}
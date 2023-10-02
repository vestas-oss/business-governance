
export type RoleItem = {
    Id: number,
    Title: string
    Description?: string,
} & ({
    KeyId: string
    Order0: number,
} | {
    RoleId: string
    bgOrder: number,
})
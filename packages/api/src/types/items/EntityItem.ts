export type EntityItem = {
    Id: number,
    Title: string,
    ContentType: string,
    ContentTypeId: string
} & Record<string, any>;
import { SPFI } from "@pnp/sp";
import { IFieldInfo } from "@pnp/sp/fields";
import "@pnp/sp/sites";
import "@pnp/sp/webs";

type ListModel = {
    title: string

    fields?: Array<{
        title: string,
        internalName?: string,
    } & (
            { type?: "Text" | "Number" } |
            { type: "Note", richText?: boolean } |
            { type: "Lookup" }
        )>;

    items?: Array<Record<string, any>>;
}

export const ImportService = {
    import: async (sp: SPFI, listModel: ListModel) => {
        const result = await sp.web.lists.ensure(listModel.title);
        const list = result.list;
        await list.update({
            EnableAttachments: false,
            EnableVersioning: true,
        });

        // Fields
        if (listModel.fields) {
            for (let f = 0; f !== listModel.fields.length; f++) {
                const fieldModel = listModel.fields[f];

                const internalName = fieldModel.internalName || fieldModel.title;
                const field = list.fields.getByInternalNameOrTitle(internalName);

                let fieldInfo: IFieldInfo | undefined = undefined;
                try {
                    fieldInfo = await field();

                    // Check internalName
                    if (fieldModel.internalName && fieldModel.internalName !== fieldInfo?.InternalName) {
                        const fields = await list.fields();
                        fieldInfo = fields.find(f => f.InternalName === fieldModel.internalName);
                    }
                } catch {
                    // Ignore, assume 404
                }

                if (!fieldInfo) {
                    switch (fieldModel.type) {
                        case "Number":
                            await list.fields.addNumber(internalName);
                            break;
                        case "Note":
                            await list.fields.addMultilineText(internalName, {
                                RichText: fieldModel.richText || false,
                            });
                            break;
                        case "Lookup": {
                            // NOTE: assume lookup to current list
                            const webInfo = await sp.web();
                            const listInfo = await list();
                            await list.fields.addLookup(internalName, {
                                LookupListId: listInfo.Id,
                                LookupWebId: webInfo.Id,
                                LookupFieldName: "Title",
                            });
                            break;
                        }
                        case "Text":
                        default:
                            await list.fields.addText(internalName);
                            break;
                    }
                }

                fieldInfo = await field();

                if (fieldInfo?.Title !== fieldModel.title) {
                    await field.update({ Title: fieldModel.title });
                }
            }
        }

        // Items
        if (listModel.items) {
            const fieldInfos = await list.fields();

            for (let i = 0; i !== listModel.items.length; i++) {
                const itemModel = listModel.items[i];

                const keys = Object.keys(itemModel);
                for (let i = 0; i !== keys.length; i++) {
                    const key = keys[i];
                    const value = itemModel[key];

                    const field = fieldInfos.find(fi => fi.InternalName === key);
                    if (field?.TypeAsString === "Lookup") {
                        const {
                            LookupList: lookupListId,
                            LookupField: lookupField
                        } = field as any;
                        const items = await sp.web.lists.getById(lookupListId).items.filter(`${lookupField} eq '${value}'`)();
                        if (items.length > 0) {
                            delete itemModel[key];
                            itemModel[`${key}Id`] = items[0].Id;
                        }
                    }
                }

                await list.items.add(itemModel);
            }
        }
    }
};
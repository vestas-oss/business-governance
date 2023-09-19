import * as React from "react";
import { EntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { useSP } from "@/hooks/useSP";
import { Entity } from "@/types/Entity";
import "@pnp/sp/folders";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useQuery } from "react-query";
import { DetailsRow } from "../DetailsRow";
import { ListView } from "./files/ListView";
dayjs.extend(utc);

type Props = {
    entity: Entity;
    row: EntityDetailsRow;
};

export const FilesRow = (props: Props) => {
    const { row, entity } = props;
    const { sp } = useSP();

    const folder = entity.item[row.value];
    const { data } = useQuery({
        queryKey: ["list", folder],
        queryFn: async () => {
            const list = sp?.web.getList(folder);

            const fields = await list.fields();

            // TODO: add view configuration support
            const viewFields = await list.defaultView.fields();

            const expands = [
                "Folder/ItemCount",
                "FileLeafRef",
                "FileRef",
                "FileDirRef",
                "FieldValuesAsText",
                "DocIcon",
                "EncodedAbsUrl",
                "BaseName",
                "UniqueId",
                "File_x0020_Size",
            ];

            const selects: Array<string> = [
                "Id",
                "FileRef",
                "ContentTypeId",
                "FileLeafRef",
                "FileDirRef",
                "Modified",
                "UniqueId",
                "BaseName",
                "CheckoutUserId",
                "DocIcon",
                "File_x0020_Type",
                "SMTotalFileStreamSize",
                "EncodedAbsUrl",
                "Editor/Title",
                "Folder/ItemCount",
            ]
                .concat(viewFields.Items)
                .filter((value, index, array) => array.indexOf(value) === index);

            const camlViewFields = selects.map((s) => `<FieldRef Name='${s}'/>`).join("");

            const items = await list.getItemsByCAMLQuery(
                {
                    ViewXml: `<View>
                            <Query>
                                <ViewFields>${camlViewFields}</ViewFields>
                            </Query>
                            <RowLimit>5000</RowLimit>
                        </View>`,
                    FolderServerRelativeUrl: folder,
                },
                ...expands
            );

            return {
                fields,
                viewFields: viewFields.Items.filter((i) => i !== "Edit").map((i) =>
                    i === "LinkFilename" ? "Title" : i
                ),
                items,
            };
        },
        useErrorBoundary: false,
        enabled: !!folder,
    });

    if (!folder || !data?.items) {
        return null;
    }

    return (
        <DetailsRow {...row}>
            <ListView
                compact={true}
                items={data?.items}
                viewFields={data?.viewFields.map((vf) => {
                    return {
                        name: vf,
                        displayName: data?.fields.find((f) => f.InternalName === vf)?.Title || vf,
                    };
                })}
                iconFieldName={"Title"}
            />
        </DetailsRow>
    );
};

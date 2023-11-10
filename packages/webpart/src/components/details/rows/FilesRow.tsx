import * as React from "react";
import { FilesEntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { useSP } from "@/hooks/useSP";
import { Entity } from "@/types/Entity";
import { Breadcrumb, IBreadcrumbItem } from "@fluentui/react";
import { isUrlAbsolute } from "@pnp/core";
import "@pnp/sp/folders";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { DetailsRow } from "../DetailsRow";
import { ListView } from "./files/ListView";
dayjs.extend(utc);

type Props = {
    entity: Entity;
    row: FilesEntityDetailsRow;
};

export const FilesRow = (props: Props) => {
    const { row, entity } = props;
    const { sp } = useSP();

    const [folder, setFolder] = useState<string>(() => {
        let folder: string = entity.item[row.value];
        if (!folder) {
            return folder;
        }
        // Get server relative url
        if (isUrlAbsolute(folder)) {
            const url = new URL(folder);
            folder = url.pathname;
        }

        if (folder.lastIndexOf("/") === folder.length - 1) {
            folder = folder.substring(0, folder.length - 1);
        }
        return folder;
    });

    const [originalFolder] = useState(folder);

    const { data } = useQuery({
        queryKey: ["files", folder],
        queryFn: async () => {
            const list = sp?.web.getList(folder);

            const fields = await list.fields();

            let viewFields = row.fields;
            if (!viewFields) {
                const defaultViewFields = await list.defaultView.fields();
                viewFields = defaultViewFields.Items;
            }

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
                .concat(viewFields)
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
                viewFields: viewFields
                    .filter((i) => i !== "Edit")
                    .map((i) => (i === "LinkFilename" ? "FileLeafRef" : i)),
                items,
            };
        },
        useErrorBoundary: false,
        enabled: !!folder,
    });

    const onBreadcrumbItemClicked = (
        _: React.MouseEvent<HTMLElement> | undefined,
        item?: IBreadcrumbItem
    ) => {
        if (!item) {
            return;
        }
        setFolder(item.data!);
    };

    const breadcrumb = useMemo<Array<IBreadcrumbItem>>(() => {
        if (!originalFolder) {
            return [];
        }
        const index = originalFolder.lastIndexOf("/");
        const root = originalFolder.substring(index + 1);

        const path = folder.replace(originalFolder, "");
        const paths = path.split("/").filter((p) => p);

        let serverRelativeUrl = originalFolder;
        return [root, ...paths].map((item, index) => {
            if (index > 0) {
                serverRelativeUrl += `/${item}`;
            }
            return {
                text: item,
                key: `breadcrumb-${index}`,
                onClick: onBreadcrumbItemClicked,
                data: serverRelativeUrl,
            };
        });
    }, [folder, originalFolder]);

    if ((!folder || !data?.items || data.items.length === 0) && folder === originalFolder) {
        return null;
    }

    return (
        <DetailsRow {...row} fullWidth={true}>
            <Breadcrumb items={breadcrumb} maxDisplayedItems={2} />
            <ListView
                compact={true}
                items={data?.items}
                viewFields={data?.viewFields.map((vf) => {
                    const field = data?.fields.find((f) => f.InternalName === vf);

                    const render = (item?: any) => {
                        if (!field) {
                            return null;
                        }
                        if (item?.FieldValuesAsText) {
                            return item?.FieldValuesAsText?.[field.InternalName];
                        }
                        return item[field.InternalName]?.toString();
                    };

                    return {
                        name: vf,
                        displayName: data?.fields.find((f) => f.InternalName === vf)?.Title || vf,
                        render,
                    };
                })}
                iconFieldName="FileLeafRef"
                onClick={(item) => {
                    // Document
                    if (item.FileSystemObjectType === 0) {
                        window.location.href = item.EncodedAbsUrl;
                        return;
                    }
                    // Folder
                    if (item.FileSystemObjectType === 1) {
                        setFolder(item.FileRef);
                        return;
                    }
                    console.log(
                        "business-governance: Warning item not recognized (FileSystemObjectType)"
                    );
                    console.dir(item);
                }}
            />
        </DetailsRow>
    );
};

import React from "react";
import { Dialog, DialogType } from "@fluentui/react";
import { useSP } from "@/hooks/useSP";
import "@pnp/sp/files";
import "@pnp/sp/sharing";
import { useQuery } from "react-query";

export const CopyLinkDialog = (props: { fileRef: string; onDismiss: () => void }) => {
    const { sp } = useSP();

    const { isFetched } = useQuery({
        queryKey: [props.fileRef, "getSharingInformation"],
        queryFn: async () => {
            const sharingInformation = await sp.web
                .getFileByServerRelativePath(props.fileRef)
                .getSharingInformation();

            navigator.clipboard.writeText(sharingInformation.directUrl);
        },
    });

    if (!isFetched) {
        return null;
    }

    return (
        <Dialog
            hidden={false}
            onDismiss={props.onDismiss}
            dialogContentProps={{
                type: DialogType.normal,
                title: "Linked copied",
                closeButtonAriaLabel: "Close",
                subText: "People with existing access can use the link.",
            }}
            modalProps={{ isBlocking: false }}
        />
    );
};

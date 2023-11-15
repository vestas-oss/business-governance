import React from "react";
import { IconButton, IContextualMenuItem, ContextualMenu } from "@fluentui/react";
import { useState } from "react";
import { CopyLinkDialog } from "./CopyLinkDialog";

export const FileMenu = (props: { fileRef: string }) => {
    const [hidden, setHidden] = useState(false);
    const [event, setEvent] = useState<MouseEvent>();
    const onHideContextualMenu = React.useCallback(() => setHidden(true), []);

    const [showCopyLink, setShowCopyLink] = useState(false);

    const menuItems: Array<IContextualMenuItem> = [
        {
            key: "copy-link",
            text: "Copy link",
            onClick: () => {
                setShowCopyLink(true);
            },
        },
    ];

    return (
        <div>
            <IconButton
                className="text-black h-5"
                iconProps={{ iconName: "More" }}
                title="More"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setHidden(false);
                    setEvent(e.nativeEvent);
                }}
            />
            <ContextualMenu
                items={menuItems}
                hidden={hidden}
                target={event}
                onItemClick={onHideContextualMenu}
                onDismiss={onHideContextualMenu}
            />
            {showCopyLink ? (
                <CopyLinkDialog fileRef={props.fileRef} onDismiss={() => setShowCopyLink(false)} />
            ) : null}
        </div>
    );
};

import * as React from "react";
import { IconButton } from "@fluentui/react";

type Props = React.ComponentProps<typeof IconButton>;

export function CloseButton(props: Props) {
    return (
        <IconButton
            onClick={props.onClick}
            iconProps={{ iconName: "Cancel" }}
            ariaLabel="Close"
            title="Close"
            {...props}
        />
    );
}

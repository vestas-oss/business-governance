import * as React from "react";
import { IconButton } from "@fluentui/react";

export function Back() {
    const urlSearchParams = new URLSearchParams(document.location.search);
    if (!urlSearchParams.has("back")) {
        return null;
    }
    return (
        <IconButton
            iconProps={{ iconName: "Back" }}
            title="Back"
            onClick={() => (window.location.href = urlSearchParams.get("back") || "#/")}
        />
    );
}

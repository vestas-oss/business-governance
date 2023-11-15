import * as React from "react";
import { IconButton } from "@fluentui/react";
import { useCallback } from "react";

export function Back() {
    const onBack = useCallback(() => {
        const urlSearchParams = new URLSearchParams(document.location.search);
        window.location.href = urlSearchParams.get("back") || "#/";
    }, []);

    const urlSearchParams = new URLSearchParams(document.location.search);
    if (!urlSearchParams.has("back")) {
        return null;
    }
    
    return (
        <IconButton
            iconProps={{ iconName: "Back" }}
            title="Back"
            onClick={onBack}
        />
    );
}

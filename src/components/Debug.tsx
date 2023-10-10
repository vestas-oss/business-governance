import * as React from "react";
import { useMemo } from "react";

type Props = {
    title: string;
    data: any;
};

export function Debug(props: Props) {
    const debug = useMemo(() => {
        const urlSearchParams = new URLSearchParams(document.location.search);

        if (urlSearchParams.has("debug")) {
            return true;
        }
        return false;
    }, []);

    if (!debug) {
        return null;
    }

    return (
        <div>
            {props.title}:
            <br />
            <div>{JSON.stringify(props.data)}</div>
        </div>
    );
}

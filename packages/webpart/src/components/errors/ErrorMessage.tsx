import * as React from "react";
import { ErrorInfo } from "react";

type Props = {
    error?: Error;
    errorInfo?: ErrorInfo;
};

export function ErrorMessage(props: Props) {
    const { error } = props;

    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <div className="text-red-500">{error?.message}</div>
        </div>
    );
}

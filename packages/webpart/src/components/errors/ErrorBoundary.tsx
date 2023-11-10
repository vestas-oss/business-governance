import * as React from "react";
import { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorMessage } from "./ErrorMessage";

type Props = {
    children?: ReactNode;
    resetKeys: Array<any> | undefined;
};

export const ErrorBoundary = (props: Props) => {
    const { children, resetKeys } = props;

    return (
        <ReactErrorBoundary
            FallbackComponent={({ error }) => {
                return <ErrorMessage error={error} />;
            }}
            onError={(error) => {
                console.error(error);
            }}
            resetKeys={resetKeys}>
            {children}
        </ReactErrorBoundary>
    );
};

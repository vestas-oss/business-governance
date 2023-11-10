import * as React from "react";
import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
    className?: string;
};

export function DetailsSection(props: Props) {
    const { title, children, className } = props;

    return (
        <div
            className={clsx(
                "w-full",
                // Note: reverse order used so we can use sibling state (peer)
                "flex flex-col-reverse",
                className
            )}>
            <div className="peer">{children}</div>
            <div className="peer-empty:hidden">
                <div className="font-bold pt-[1px] pb-[2px] align-top w-full mt-[20px]">
                    {title}
                </div>
                <div className="border-t-0 border-x-0 border-b-[1px] border-solid border-b-black" />
            </div>
        </div>
    );
}

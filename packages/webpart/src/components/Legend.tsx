import * as React from "react";
import { useEntityLayouts } from "@/hooks/useEntityLayouts";
import { Icon, IconButton, Modal } from "@fluentui/react";
import { useState } from "react";

export function Legend() {
    const [isOpen, setIsOpen] = useState(false);
    const { layouts } = useEntityLayouts();

    if (!layouts || layouts.length === 0) {
        return null;
    }

    return (
        <>
            <IconButton
                iconProps={{ iconName: "Info" }}
                title="Legend"
                onClick={() => setIsOpen(true)}
            />
            <Modal isOpen={isOpen} isBlocking={false} onDismiss={() => setIsOpen(false)}>
                <div className="p-4 flex flex-col gap-4">
                    {layouts.map((layout, index) => {
                        return (
                            <div key={`layout-${index}`}>
                                <div
                                    className="flex flex-row gap-2 items-center font-bold"
                                    style={{ color: layout.color }}>
                                    <Icon iconName={layout.icon} className={`text-lg`} />
                                    {layout.title}
                                </div>
                                {layout.description ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: layout.description,
                                        }}
                                    />
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </>
    );
}

import * as React from "react";
import { EntityDetailsRow } from "@/contexts/EntityLayoutsContext";
import { Entity } from "@business-governance/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useQuery } from "react-query";
import { DetailsRow } from "../DetailsRow";
import { useBusinessGovernance } from "@/hooks/useBusinessGovernance";
dayjs.extend(utc);

type Props = {
    entity: Entity;
    row: EntityDetailsRow;
};

export const EventRow = (props: Props) => {
    const { row, entity } = props;
    const bg = useBusinessGovernance();

    const { data: event } = useQuery({
        queryKey: ["events", entity.id],
        queryFn: async () => {
            const events = await bg.entityEventService.getEntityEvents(entity.id);

            if (!events || events.length === 0) {
                return undefined;
            }

            const event = events[0];

            const format = "DD-MM-YYYY HH:mm";
            let startDate = event.start ? dayjs(event.start).format(format) : "";
            let endDate = event.end ? dayjs(event.end).format(format) : "";

            if (event.isAllDay) {
                const start = new Date(event.start);
                const end = new Date(event.end);

                const options = {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                } as any;
                const format = new Intl.DateTimeFormat("en-US", options);

                const isOneDay = new Date(start).setDate(start.getDate() + 1) === end.getTime();
                if (isOneDay) {
                    startDate = format.format(start);
                    endDate = "All day";
                } else {
                    startDate = format.format(start);
                    // NOTE: on all day events the end date is exclusive
                    endDate = format.format(new Date(end).setDate(end.getDate() - 1));
                }
            }

            return {
                title: event.title,
                startDate,
                endDate,
            };
        },
    });

    if (!event) {
        return null;
    }

    return (
        <DetailsRow {...row}>
            <div className="flex flex-row gap-5 text-[smaller]">
                <div>
                    <div className="font-bold">Title</div>
                    <div>{event.title}</div>
                </div>
                <div>
                    <div className="font-bold">Start</div>
                    <div>{event.startDate}</div>
                </div>
                <div>
                    <div className="font-bold">End</div>
                    <div>{event.endDate}</div>
                </div>
            </div>
        </DetailsRow>
    );
};

import { SPFx, spfi } from "@pnp/sp";
import { setupServer } from 'msw/node';
import * as assert from "node:assert";
import { describe, test } from "node:test";
import { handlers } from 'msw-sp';
import { EntityService } from "../EntityService.js";
import { ConfigurationService } from "../ConfigurationService.js";
import { EntityEventService } from "../EntityEventService.js";
import { EntityLayoutService } from "../EntityLayoutService.js";
import { EntityLayoutItem } from "../types/items/EntityLayoutItem.js";

void describe('business-governance', async () => {
    const url = "https://tenant.sharepoint.com";
    const server = setupServer(...handlers({
        title: "tenant",
        url,
        sites: {
            "bg": {
                users: [
                    {
                        id: 1,
                        title: "Admin",
                        loginName: "i:0#.f|membership|admin@tenant.com",
                    }
                ],
                rootWeb: {
                    title: "Web",
                    serverRelativeUrl: "/",
                    lists: [
                        {
                            title: "Entities",
                            url: "lists/entities",
                            id: "34e3d5bf-2f58-4044-9692-fef00ec0cbb3",
                            baseTemplate: 100,
                            hidden: false,
                            contentTypes: [
                                {
                                    name: "Entity",
                                    id: {
                                        stringValue: "0x0100432290886DFF294EA373EEC55DD64049",
                                    },
                                },
                            ],
                            fields: [
                                {
                                    title: "Content Type",
                                    internalName: "ContentType",
                                    typeAsString: "Computed",
                                },
                                {
                                    title: "Parent",
                                    internalName: "Parent",
                                    typeAsString: "Lookup",
                                    lookupField: "Title",
                                    lookupList: "34e3d5bf-2f58-4044-9692-fef00ec0cbb3"
                                },
                            ],
                            items: [
                                {
                                    ContentTypeId: "0x0100432290886DFF294EA373EEC55DD64049",
                                    Id: 1,
                                    Title: "Entity #1",
                                    Modified: new Date(),
                                    EditorId: 1,
                                },
                                {
                                    ContentTypeId: "0x010079C32922ED9C41A5BD01EF7927E9604F",
                                    Id: 2,
                                    Title: "Entity #2",
                                    ParentId: 1,
                                    Modified: new Date(),
                                    EditorId: 1,
                                },
                            ],
                        },
                        {
                            title: "Events",
                            url: "lists/events",
                            id: "4dd59dd8-2005-45f8-9d1c-41b966e31672",
                            baseTemplate: 106,
                            hidden: false,
                            items: [
                                {
                                    Id: 1,
                                    Title: "Event",
                                    EntityId: 1,
                                    Start: new Date(new Date().getTime() + 3600000).toISOString(),
                                    End: new Date(new Date().getTime() + 3600000 * 2).toISOString()
                                }
                            ],
                            fields: [
                            ],
                        },
                        {
                            title: "Entity Layouts",
                            url: "lists/entity-layouts",
                            id: "d99408a7-4032-4ebf-83e4-28ecdfc9eee9",
                            baseTemplate: 100,
                            hidden: false,
                            items: [
                                {
                                    Id: 1,
                                    Title: "Layout #1",
                                    Layout: "[]",
                                    bgContentTypeId: "0x0100432290886DFF294EA373EEC55DD64049",
                                    Color: "#00FF00",
                                }
                            ] as Array<EntityLayoutItem>
                        },
                    ],
                },
            },
        },
    }));
    server.listen();

    const getContext = (serverRelativeUrl: string) => {
        return {
            pageContext: {
                web: {
                    absoluteUrl: `${url}${serverRelativeUrl}`,
                },
                legacyPageContext: {
                    formDigestTimeoutSeconds: 60,
                    formDigestValue: "digest",
                },
            },
        };
    };

    await test("getEntities", async () => {
        const sp = spfi().using(SPFx(getContext("/sites/bg")));

        const configurationService = new ConfigurationService(sp);
        const configuration = await configurationService.getConfiguration();

        const entityService = new EntityService(sp);
        const entities = await entityService.getEntities();

        assert.equal(entities.length, 2);
        const entity1 = entities.find(e => e.Title === "Entity #1");
        const entity2 = entities.find(e => e.Title === "Entity #2");
        assert.ok(entity1);
        assert.ok(entity2);
        assert.equal(entity2[`${configuration.parentColumn}Id`], entity1.Id);
    });

    await test("getEntityEvents", async () => {
        const sp = spfi().using(SPFx(getContext("/sites/bg")));

        const entityService = new EntityEventService(sp);
        const events = await entityService.getEntityEvents();

        assert.ok(events)
        assert.equal(events.length, 1);
        const event = events.find(e => e.title === "Event");
        assert.ok(event);
        assert.ok(new Date(event.start) > new Date());
        assert.ok(new Date(event.end) > new Date(event.start));
    });

    await test("getEntityEvents from, to", async () => {
        const sp = spfi().using(SPFx(getContext("/sites/bg")));

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextDay = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        const entityService = new EntityEventService(sp);

        let events = await entityService.getEntityEvents({ from: now });
        assert.ok(events)
        assert.equal(events.length, 1);

        events = await entityService.getEntityEvents({ from: today, to: tomorrow });
        assert.ok(events)
        assert.equal(events.length, 1);

        events = await entityService.getEntityEvents({ from: tomorrow, to: nextDay });
        assert.ok(events)
        assert.equal(events.length, 0);
    });

    await test("getLayouts", async () => {
        const sp = spfi().using(SPFx(getContext("/sites/bg")));

        const entityLayoutService = new EntityLayoutService(sp);
        const layouts = await entityLayoutService.getLayouts();

        assert.ok(layouts);
        assert.equal(layouts.length, 1);

        const layout = layouts[0];
        assert.equal(layout.title, "Layout #1");
    });

    await test("getLayout", async () => {
        // Arrange
        const sp = spfi().using(SPFx(getContext("/sites/bg")));

        const entityService = new EntityService(sp);
        const entities = await entityService.getEntities();
        const entity = entities.find(e => e.Id === 1);

        const entityLayoutService = new EntityLayoutService(sp);
        const layouts = await entityLayoutService.getLayouts();

        // Act
        const layout = entityLayoutService.getLayout(entity, layouts);

        // Assert
        assert.ok(layout);
        assert.equal(layout.title, "Layout #1");
        assert.equal(layout.color, "#00FF00");
    });
});
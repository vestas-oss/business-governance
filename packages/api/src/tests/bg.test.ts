import { SPFx, spfi } from "@pnp/sp";
import { setupServer } from 'msw/node';
import * as assert from "node:assert";
import test from "node:test";
import { handlers } from 'msw-sp';
import { EntityService } from "../EntityService.js";
import { ConfigurationService } from "../ConfigurationService.js";

void test('web', async (t) => {
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
                                    Latin: "Sol",
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
                            ]
                        }
                    ]
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

    await t.test("bg", async () => {
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
});
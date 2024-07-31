import { SPFI } from "@pnp/sp";
import { Configuration } from "./Configuration.js";
import { EntityService } from "./EntityService.js";
import { EntityUserService } from "./EntityUserService.js";
import { EntityEventService } from "./EntityEventService.js";
import { EntityLayoutService } from "./EntityLayoutService.js";

export class BusinessGovernanceService {
    public entityService: EntityService;
    public entityUserService: EntityUserService;
    public entityEventService: EntityEventService;
    public entityLayoutService: EntityLayoutService;

    constructor(sp: SPFI, configurationPreset?: Configuration) {
        this.entityService = new EntityService(sp, configurationPreset);
        this.entityUserService = new EntityUserService(sp, configurationPreset);
        this.entityEventService = new EntityEventService(sp, configurationPreset);
        this.entityLayoutService = new EntityLayoutService(sp, configurationPreset);
    }
}
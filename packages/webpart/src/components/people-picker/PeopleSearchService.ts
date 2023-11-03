import { extractWebUrl, SPFI } from "@pnp/sp";
import "@pnp/sp/profiles";
import { IClientPeoplePickerQueryParameters, IPeoplePickerEntity } from "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/sputilities";
import "@pnp/sp/webs";

enum PrincipalType {
  User = 1,
}

export interface IPeoplePickerUserItem {
  /**
   * LoginName or Id of the principal in the site.
   */
  id: string;
  /**
   * LoginName of the principal.
   */
  loginName: string;
  imageUrl: string;
  imageInitials: string;
  text: string; // name
  secondaryText: string; // role
  tertiaryText: string; // status
  optionalText: string; // anything
}

/**
 * Service implementation to search people in SharePoint
 */
export class PeopleSearchService {
  private absoluteUrl: string;

  /**
   * Service constructor
   */
  constructor(private sp: SPFI) {
    this.absoluteUrl = extractWebUrl(sp.web.toUrl());
  }

  /**
   * Generate the user photo link using SharePoint user photo endpoint.
   *
   * @param value
   */
  private generateUserPhotoLink(value: string): string {
    return `${this.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${encodeURIComponent(value)}&size=M`;
  }

  /**
   * Search person by its email or login name
   */
  public async searchPersonByEmailOrLogin(email: string): Promise<IPeoplePickerUserItem | undefined> {
    if (email.indexOf("|") > -1) {
      email = email.split("|")[2];
    }

    const userResults = await this.searchTenant(email, 1);

    if (userResults && userResults.length > 0) {
      return userResults[0];
    }
    return undefined;
  }

  /**
   * Search All Users from the SharePoint People database
   */
  public async searchPeople(query: string, maximumSuggestions: number): Promise<IPeoplePickerUserItem[]> {
    return await this.searchTenant(query, maximumSuggestions);
  }

  /**
   * Tenant search
   */
  private async searchTenant(query: string, maximumSuggestions: number): Promise<IPeoplePickerUserItem[]> {
    try {
      const searchBody = {
        queryParams: {
          AllowEmailAddresses: true,
          AllowMultipleEntities: false,
          AllUrlZones: false,
          MaximumEntitySuggestions: maximumSuggestions,
          PrincipalSource: 15,
          PrincipalType: PrincipalType.User + 0,
          QueryString: query
        } as IClientPeoplePickerQueryParameters
      };

      const result = await this.sp.profiles.clientPeoplePickerSearchUser(searchBody.queryParams);
      const userDataResp = result;
      if (!userDataResp || userDataResp.length === 0) {
        return [];
      }

      let values: Array<IPeoplePickerEntity & { LoginName: string, Key: any }> = userDataResp as any;

      // Filter out "UNVALIDATED_EMAIL_ADDRESS"
      values = values.filter(v => !(v.EntityData && v.EntityData.PrincipalType && v.EntityData.PrincipalType === "UNVALIDATED_EMAIL_ADDRESS"));

      // Filter out NULL keys
      values = values.filter(v => v.Key !== null);
      const userResults = values.map(element => {
        switch (element.EntityType) {
          case "User": {
            const accountName: string = element.Description || "";
            const email: string = element.EntityData?.Email || element.Description;
            return {
              id: element.Key,
              loginName: element.LoginName ? element.LoginName : element.Key,
              imageUrl: this.generateUserPhotoLink(accountName),
              imageInitials: this.getFullNameInitials(element.DisplayText),
              text: element.DisplayText, // name
              secondaryText: email, // email
              tertiaryText: "", // status
              optionalText: "" // anything
            } as IPeoplePickerUserItem;
          }
          case "SecGroup": {
            const secondaryText = element.EntityData?.Email || element.ProviderName;
            return {
              id: element.Key,
              loginName: element.LoginName ? element.LoginName : element.Key,
              imageInitials: this.getFullNameInitials(element.DisplayText),
              text: element.DisplayText,
              secondaryText,
            } as IPeoplePickerUserItem;
          }
          case "FormsRole":
            return {
              id: element.Key,
              loginName: element.LoginName ? element.LoginName : element.Key,
              imageInitials: this.getFullNameInitials(element.DisplayText),
              text: element.DisplayText,
              secondaryText: element.ProviderName
            } as IPeoplePickerUserItem;
          default:
            return {
              id: element.EntityData.SPGroupID,
              loginName: element.EntityData.AccountName,
              imageInitials: this.getFullNameInitials(element.DisplayText),
              text: element.DisplayText,
              secondaryText: element.EntityData.AccountName
            } as IPeoplePickerUserItem;
        }
      });

      return userResults;

    } catch (e) {
      console.error("PeopleSearchService::searchTenant: error occured while fetching the users.", e);
      return [];
    }
  }

  /**
   * Generates Initials from a full name
   */
  private getFullNameInitials(fullName: string): string {
    if (fullName === null) {
      return fullName;
    }

    const words: string[] = fullName.split(" ");
    if (words.length === 0) {
      return "";
    } else if (words.length === 1) {
      return words[0].charAt(0);
    } else {
      return (words[0].charAt(0) + words[1].charAt(0));
    }
  }
}

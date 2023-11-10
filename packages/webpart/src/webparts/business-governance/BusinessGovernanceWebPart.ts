import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { BusinessGovernanceComponent } from './BusinessGovernanceComponent';
import '../../../assets/dist/tailwind.css';
import { Properties } from "@/types/Properties";

export default class BusinessGovernanceWebPart extends BaseClientSideWebPart<Properties> {
  public render(): void {
    const element = React.createElement(
      BusinessGovernanceComponent,
      {
        context: this.context,
        displayMode: this.displayMode,
        properties: this.properties,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Setup the webpart in the main editor."
          },
          groups: [
          ]
        }
      ]
    };
  }
}

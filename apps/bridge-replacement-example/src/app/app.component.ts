import { Component } from '@angular/core';
import { BridgeServerService } from '@cricut/bridge-server';
import { MayRespondServerPlugin } from './server/plugins/may-respond';
import { RandomServerPlugin } from './server/plugins/random.plugin';
import { TimeServerPlugin } from './server/plugins/time.plugin';

@Component({
  selector: 'bridge-replacement-example-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'bridge-replacement-example';

  constructor(private _bridgeServer: BridgeServerService) {
      this._bridgeServer.registerPlugin(new MayRespondServerPlugin());
      this._bridgeServer.registerPlugin(new TimeServerPlugin());
      this._bridgeServer.registerPlugin(new RandomServerPlugin());
  }
}

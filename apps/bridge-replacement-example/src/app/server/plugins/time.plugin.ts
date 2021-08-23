import { BridgeServerService, IServerPlugin } from '@cricut/bridge-server';
import { HTTPResponse, IHTTPRequest } from '@cricut/transport-layer';

export class TimeServerPlugin implements IServerPlugin {
    public onRegister(inBridge: BridgeServerService) {
        inBridge.addHttpMatchers(
            {
                path: '/time',
                handler: this.onTimeRequest.bind(this)
            }
        );
    }

    private onTimeRequest(inRequest: IHTTPRequest, inResponse: HTTPResponse) {
        inResponse.status = 200;
        inResponse.data = new Date();
        inResponse.send();
    }
}
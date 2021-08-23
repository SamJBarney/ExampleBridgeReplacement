import { BridgeServerService, IServerPlugin, WebsocketChannel } from '@cricut/bridge-server';
import { Subscription } from 'rxjs';

export class MayRespondServerPlugin implements IServerPlugin {
    private _subscription: Subscription | undefined;

    public onRegister(inBridge: BridgeServerService) {
        const lChannel = inBridge.channel('may-respond');
        inBridge.addHttpMatchers(
            {
                path: '/may-respond/subscribe',
                handler: (_, inResponse) => {
                    this.subscribe(lChannel);
                    inResponse.status = 200;
                }
            },
            {
                path: '/may-respond/unsubscribe',
                handler: (_, inResponse) => {
                    this.unsubscribe();
                    inResponse.status = 200;
                }
            }
        );
    }

    public subscribe(inChannel: WebsocketChannel) {
        this._subscription = inChannel.subscribe<number>(inValue => {
            inChannel.send(Math.floor(Math.random() * 1000));
        });
    }

    public unsubscribe() {
        this._subscription?.unsubscribe();
    }
}
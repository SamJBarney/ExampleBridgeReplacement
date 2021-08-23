import { BridgeServerService, IServerPlugin } from '@cricut/bridge-server';

export class RandomServerPlugin implements IServerPlugin {
    public onRegister(inBridge: BridgeServerService) {
        const lChannel = inBridge.channel('random');
        setInterval(() => lChannel.send(Math.random()), 2000);
    }
}
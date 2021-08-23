import { Injectable } from "@angular/core";
import { BridgeClientService } from '@cricut/bridge-client';
import { Subject } from "rxjs";


@Injectable()
export class ExampleClientConsumer {
    private _randomSubject: Subject<number> = new Subject();
    private _mayRespondSubject: Subject<number> = new Subject();

    public readonly random = this._randomSubject.asObservable();
    public readonly mayRespond = this._mayRespondSubject.asObservable();

    constructor(private _bridgeClient: BridgeClientService) {
        this._bridgeClient.on('random', inNumber => this._randomSubject.next(inNumber));
        this._bridgeClient.on('may-respond', inResponse => this._mayRespondSubject.next(inResponse));
    }

    public subscribeTransitory(): Promise<void> {
        return this._bridgeClient.request('/may-respond/subscribe').then(() => {});
    }

    public unsubscribeTransitory(): Promise<void> {
        return this._bridgeClient.request('/may-respond/unsubscribe').then(() => {});
    }

    public async requestTime(): Promise<Date | null> {
        const response = await this._bridgeClient.request('/time');
        if (response.status == 200) {
            return response.data;
        } else {
            console.error(`Received HTTP status ${response.status} from '/time' endpoint`);
            return null;
        }
    }

    public async sendWebsocketMessage() {
        this._bridgeClient.send('may-respond');
    }
}
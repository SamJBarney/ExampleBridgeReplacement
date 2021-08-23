import { Injectable } from "@angular/core";

import { HttpClient, IHTTPResponse, IWebsocketMessage, TransportLayer, WebsocketConnection } from '@cricut/transport-layer';
import { Subject, Subscription } from "rxjs";
import { filter, map } from "rxjs/operators";
type WebsocketHandler = (inData: any) => void;

interface IMapValue {
    subscription: Subscription,
    handler: WebsocketHandler
}

@Injectable({
    providedIn: 'root'
})
export class BridgeClientService {
    private _httpClient: HttpClient;
    private _websocketClient: WebsocketConnection;

    private _subject = new Subject<IWebsocketMessage>();
    private _observable = this._subject.asObservable();

    private _subscriptions = new Map<string, IMapValue[]>();

    constructor() {
        this._httpClient = TransportLayer.createHttpClient();
        this._websocketClient = TransportLayer.createWebsocketClient();
        this._websocketClient.listen(inData => this._subject.next(inData));
    }

    public request(path: string, data: any = null): Promise<IHTTPResponse> {
        return this._httpClient.send(path, data);
    }

    public send(inChannel: string, inData?: any): void {
        const lMessage: IWebsocketMessage = {
            channel: inChannel
        };
        if (inData) {
            lMessage.data = inData;
        }
        this._websocketClient.send(lMessage)
    }

    public on(inChannel: string, inHandler: WebsocketHandler): void {
        const lSubscription = this._observable.pipe(
                filter(inMessage => inMessage.channel == inChannel),
                map(inMessage => inMessage.data)
            ).subscribe(inHandler);
        const lValues = this._subscriptions.get(inChannel) ?? [];
        lValues.push({subscription: lSubscription, handler: inHandler });
        this._subscriptions.set(inChannel, lValues);
    }

    public off(inChannel: string, inHandler?: WebsocketHandler): void {
        const lValues = this._subscriptions.get(inChannel) ?? [];
        if (inHandler) {
            const lIdx = lValues.findIndex(inHandler);

            if (lIdx != -1) {
                const lValue = lValues.splice(lIdx, 1)[0];
                lValue.subscription.unsubscribe();
                this._subscriptions.set(inChannel, lValues);
            }
        } else if (lValues.length) {
            for (const lValue of lValues) {
                lValue.subscription.unsubscribe();
            }
            this._subscriptions.delete(inChannel);
        }
    }
}
import { Injectable } from "@angular/core";
import { HTTPResponse, HttpServer, IHTTPRequest, IWebsocketMessage, TransportLayer, WebsocketConnection } from '@cricut/transport-layer';
import { Observable, Subject, Subscription } from "rxjs";

export interface IHttpMatcher {
    path: string,
    handler: (_: IHTTPRequest, _1: HTTPResponse) => void;
};

export interface IServerPlugin {
    onRegister(inBridge: BridgeServerService): void;
}

export class WebsocketChannel {
    constructor(private _channel: string, private _observable: Observable<any>, private _websocket: WebsocketConnection) {}

    public send(inValue?: any): void {
        const lMessage: IWebsocketMessage = {
            channel: this._channel,
        };

        if (inValue !== undefined) {
            lMessage.data = inValue;
        }

        this._websocket.send(lMessage);
    }

    public subscribe<T>(inHandler: (_:T) => void): Subscription {
        return this._observable.subscribe(inHandler);
    }
}

@Injectable({
    providedIn: 'root'
})
export class BridgeServerService {
    private _plugins: Map<string, IServerPlugin> = new Map();

    private _server: HttpServer;
    private _httpMatchers: IHttpMatcher[] = [];

    private _websocket: WebsocketConnection;
    private _subject: Subject<any> = new Subject();
    private _observable: Observable<any> = this._subject.asObservable();
    private _channels: Map<string, WebsocketChannel> = new Map();

    constructor() {
        this._server = TransportLayer.createHttpServer();
        this._server.listen(this.onRequest.bind(this));

        this._websocket = TransportLayer.createWebsocketServer();
        this._websocket.listen(inValue => {
            this._subject.next(inValue.data);
        });
    }

    public registerPlugin(inPlugin: IServerPlugin): void {
        const lName = inPlugin.constructor.name;
        const lAvailable = !this._plugins.has(lName)
        if (lAvailable) {
            console.log(`Registering Plugin: ${lName}`);
            inPlugin.onRegister(this);
        } else {
            console.log(`Unable To Register Plugin: ${lName}`);
        }
    }

    public addHttpMatchers(...inMatchers: IHttpMatcher[]): void {
        this._httpMatchers = this._httpMatchers.concat(inMatchers);
    }

    public channel(inChannel: string): WebsocketChannel {
        let lChannel = this._channels.get(inChannel);

        if (!lChannel) {
            lChannel = new WebsocketChannel(inChannel, this._observable, this._websocket);
            this._channels.set(inChannel, lChannel);
        }

        return lChannel;
    }

    private async onRequest(inRequest: IHTTPRequest, inResponse: HTTPResponse): Promise<void> {
        await this._httpMatchers.find(matcher => matcher.path == inRequest.path)?.handler?.(inRequest, inResponse);
    }

}
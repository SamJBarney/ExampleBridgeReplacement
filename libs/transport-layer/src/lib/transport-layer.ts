import { Observable, Subject, Subscription } from "rxjs";

import { filter, take } from 'rxjs/operators';

export interface IPacket {
    id: number
}

export interface IRequest extends IPacket {
    path: string,
    data?: any
}

export interface IResponse extends IPacket {
    status: number,
    data?: any
}

export type IHTTPResponse = Omit<IResponse, 'id'>;
export type IHTTPRequest = Omit<IRequest, 'id'>;

export interface IWebsocketMessage {
    channel: string,
    data?: any
}


export class HttpClient {
    private _currentId: number = 0;

    constructor(private _in: Observable<IResponse>, private _out: Subject<IRequest>) {}

    public async send(inPath: string, inData?: any): Promise<IHTTPResponse> {
        const lRequest: IRequest = {
            id: this._currentId++,
            path: inPath
        };

        if (inData) {
            lRequest.data = inData;
        }

        setTimeout(() => this._out.next(lRequest));
        
        return new Promise(res => {
            const lSubscription = this._in.pipe(filter((inResponse) => inResponse.id == lRequest.id), take(1)).subscribe((inResponse => {
                lSubscription.unsubscribe();
                res(inResponse);
            }))
        })
    }
    
}

export class HTTPResponse {
    private _sent: boolean = false;
    public status: number =  404;
    public data?: any;

    public get isSent() {
        return this._sent;
    }

    constructor(private _id: number, private _sender: (id: number, inStatus: number, inData?: any) => void) { }

    public send(): void {
        if (!this.isSent) {
            setTimeout(() => this._sender(this._id, this.status, this.data));
            this._sent = true;
        }
    }
}

export class HttpServer {
    constructor(private _in: Observable<IRequest>, private _out: Subject<IResponse>) {}
    public listen(handler: (inRequest: IRequest, inResponse: HTTPResponse) => Promise<void>): Subscription {
        return this._in.subscribe(async inRequest => {
            const lResponse = new HTTPResponse(inRequest.id, this.send.bind(this));
            await handler(inRequest, lResponse);
            if (!lResponse.isSent) {
                lResponse.send();
            }
        });
    }

    private send(inId: number, inStatus: number, inData?: any): void {
        const lResponse: IResponse = {
            id: inId,
            status: inStatus
        };

        if (inData) {
            lResponse.data = inData;
        }
        
        this._out.next(lResponse);
    }
}

export class WebsocketConnection {
    constructor(private _in: Observable<IWebsocketMessage>, private _out: Subject<IWebsocketMessage>) {}

    public send(data: IWebsocketMessage) {
        setTimeout(() => this._out.next(data));
    }

    public listen(inHandler: (inData: IWebsocketMessage) => void): Subscription {
        return this._in.subscribe(inHandler);
    }
}

export class TransportLayer {
    private static _serverHTTPOut = new Subject<IResponse>();
    private static _clientHTTPOut = new Subject<IRequest>();

    private static _clientHTTPIn = TransportLayer._serverHTTPOut.asObservable();
    private static _serverHTTPIn = TransportLayer._clientHTTPOut.asObservable();

    private static _clientWebsocketIn = new Subject<IWebsocketMessage>();
    private static _serverWebsocketIn = new Subject<IWebsocketMessage>();

    private static _serverWebsocketOut = TransportLayer._clientWebsocketIn.asObservable();
    private static _clientWebsocketOut = TransportLayer._serverWebsocketIn.asObservable();

    public static createHttpClient(): HttpClient {
        return new HttpClient(TransportLayer._clientHTTPIn, TransportLayer._clientHTTPOut);
    }

    public static createHttpServer(): HttpServer {
        return new HttpServer(TransportLayer._serverHTTPIn, TransportLayer._serverHTTPOut);
    }

    public static createWebsocketClient(): WebsocketConnection {
        return new WebsocketConnection(TransportLayer._serverWebsocketOut, TransportLayer._serverWebsocketIn);
    }

    public static createWebsocketServer(): WebsocketConnection {
        return new WebsocketConnection(TransportLayer._clientWebsocketOut, TransportLayer._clientWebsocketIn);
    }
}
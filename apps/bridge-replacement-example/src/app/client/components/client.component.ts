import { Component } from "@angular/core";
import { ExampleClientConsumer } from "../services/example-client-consumer";


@Component({
    selector: 'client',
    templateUrl: './client.component.html'
})
export class ClientComponent {
    public time: string = '';
    public response: number = 0;
    public randomResponse: number = 0;

    public isSubscribed: boolean = false;

    constructor(private _clientConsumer: ExampleClientConsumer) {
        this.time = (new Date()).toISOString();
        this._clientConsumer.random.subscribe(inValue => this.randomResponse = inValue);
        this._clientConsumer.mayRespond.subscribe(inValue => this.response = inValue);
    }

    public async requestTime() {
        const lTime = await this._clientConsumer.requestTime();
        if (lTime != null) {
            this.time = lTime.toISOString();
        }
    }

    public subscribeWebsocket() {
        this._clientConsumer.subscribeTransitory().then(() => {
            this.isSubscribed = true;
        });
    }

    public unsubscribeWebsocket() {
        this._clientConsumer.unsubscribeTransitory().then(() => {
            this.isSubscribed = false;
        });
    }

    public async sendWebsocketMessage() {
        this._clientConsumer.sendWebsocketMessage()
    }
}
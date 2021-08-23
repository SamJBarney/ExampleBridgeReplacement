import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ClientComponent } from './client/components/client.component';
import { ExampleClientConsumer } from './client/services/example-client-consumer';

@NgModule({
  declarations: [AppComponent, ClientComponent],
  imports: [BrowserModule],
  providers: [ExampleClientConsumer],
  bootstrap: [AppComponent],
})
export class AppModule {}

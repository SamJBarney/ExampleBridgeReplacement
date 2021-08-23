import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BridgeClientService } from './services/bridge-client/bridge-client.service';

@NgModule({
  imports: [CommonModule],
  providers: [BridgeClientService]
})
export class ClientModule {}

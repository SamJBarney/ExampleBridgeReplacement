import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BridgeServerService } from './services/bridge-server/bridge-server.service';

@NgModule({
  imports: [CommonModule],
  providers: [BridgeServerService]
})
export class ServerModule {}

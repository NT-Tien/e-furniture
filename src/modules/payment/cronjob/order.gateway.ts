import { UseGuards } from "@nestjs/common";
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { DstaffGuard } from "src/modules/auth/guards/dstaff.guard";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'socket/order',
})
export class OrderGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor(
        // add servies
    ) { }

    @UseGuards(DstaffGuard)
    handleConnection(client: Socket, ...args: any[]) {
        var ip = client.handshake.headers['x-forwarded-for'] || client.handshake.address;
        var token = client.handshake.headers['x-auth-token'];
        console.log(ip, token, 'connected at', new Date().toLocaleString());
    }

    // @SubscribeMessage('message')
    // async handleMessage(@MessageBody() body: any) {
    //     console.log(body);
    //     setTimeout(() => {  
    //         this.server.emit('message', { message: 'Hello from server' });
    //     }, 1000)
    // }

    afterInit(server: any) {
        console.log('init');
    }

    handleDisconnect(client: any) {
        var ip = client.handshake.headers['x-forwarded-for'] || client.handshake.address;
        var token = client.handshake.headers['x-auth-token'];
        console.log(ip, token, 'disconnected at', new Date().toLocaleString());
    }

}
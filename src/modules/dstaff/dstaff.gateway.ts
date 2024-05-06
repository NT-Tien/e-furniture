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

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'socket/dstaff',
})
export class DstaffGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor(
        // add servies
    ) { }

    handleConnection(client: Socket, ...args: any[]) {
        this.writeLog(client);
    }

    @SubscribeMessage('message')
    async handleMessage(@MessageBody() body: any) {
        console.log(body);
        setTimeout(() => {  
            this.server.emit('message', { message: 'Hello from server' });
        }, 1000)
    }


    writeLog(client: Socket) {
        var ip = client.handshake.headers['x-forwarded-for'] || client.handshake.address;
        var token = client.handshake.headers['x-auth-token'];
        console.log(ip, token, 'connected at', new Date().toLocaleString());
        return { ip, token };
    }

    afterInit(server: any) {
        console.log('init');
    }

    handleDisconnect(client: any) {
        // console.log(client.id);
    }

}
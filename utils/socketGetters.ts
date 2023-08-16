import TServer from "Backend/Models/TServer";
import TUser from "Backend/Models/TUser";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export function getUser(socket:Socket<DefaultEventsMap, DefaultEventsMap>, userId:string) {
    return new Promise((resolve, reject) => {
        socket.emit("getUser", userId, (user:TUser) => {
                resolve(user)
            }
        );
    });
}

export function getServer(socket:Socket<DefaultEventsMap, DefaultEventsMap>, serverId:string) {
    return new Promise((resolve, reject) => {
        socket.emit("getUser", serverId, (server:TServer) => {
                resolve(server)
            }
        );
    });
}
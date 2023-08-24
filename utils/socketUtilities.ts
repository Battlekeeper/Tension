import TChannel from "Backend/Models/TChannel";
import TMessage from "Backend/Models/TMessage";
import TServer from "Backend/Models/TServer";
import TUser from "Backend/Models/TUser";
import { server } from "process";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export function getUser(socket:Socket<DefaultEventsMap, DefaultEventsMap>, userId:string) {
    return new Promise((resolve, reject) => {
        socket.emit("getUser", userId, (user:TUser) => {
            resolve(user)
        });
    });
}
export function getUserServers(socket:Socket<DefaultEventsMap, DefaultEventsMap>, user:TUser)
{
    return new Promise<Array<TServer>>(async (resolve, reject) => {
        var servers:Array<TServer> = []

        for (var serverId of user.servers)
        {
            var server:TServer = await getServer(socket, serverId)
            servers.push(server)
        }
        resolve(servers)
    });
}
export function getServer(socket:Socket<DefaultEventsMap, DefaultEventsMap>, serverId:string) {
    return new Promise<TServer>((resolve, reject) => {
        socket.emit("getServer", serverId, (server:TServer) => {
                resolve(server)
            }
        );
    });
}
export function getChannel(socket:Socket<DefaultEventsMap, DefaultEventsMap>, channelId:string) {
    return new Promise<TChannel>((resolve, reject) => {
        socket.emit("getChannel", channelId, (channel:TChannel) => {
                resolve(channel)
            }
        );
    });
}

export function getServerChannels(socket:Socket<DefaultEventsMap, DefaultEventsMap>, server:TServer) {
    return new Promise<Array<TChannel>>(async (resolve, reject) => {
        var channels:Array<TChannel> = []
        if (server == undefined){
            return channels
        }
        for (var channelId of server.channels)
        {
            var channel:TChannel = await getChannel(socket, channelId)
            channels.push(channel)
        }
        resolve(channels)
    });
}

export function getChannelMessages(socket:Socket<DefaultEventsMap, DefaultEventsMap>, channel:TChannel, startIndex:number, endIndex:number) {
    return new Promise<{ messages: TMessage[]; users: TUser[]; }>(async (resolve, reject) => {
        if (channel == undefined){
            resolve({ messages: [], users: [] })
            return
        }
        socket.emit("getChannelMessages", channel._id, startIndex, endIndex, (messages:Array<TMessage>, users:Array<TUser>) => {
                resolve({'messages': messages, 'users': users})
            }
        );
    });
}

export function sendMessage(socket:Socket<DefaultEventsMap, DefaultEventsMap>, channel:TChannel, message:string) {
    if (channel == undefined){
        return
    }
    socket.emit("sendMessage", channel._id.toString(), message);
}

export function getServerMembersArray(socket:Socket<DefaultEventsMap, DefaultEventsMap>, channel:TChannel) {
    return new Promise<Array<TUser>>(async (resolve, reject) => {
        if (channel == undefined){
            resolve([])
            return
        }
        socket.emit("getServerMembers", channel._id.toString(), (members:Array<TUser>) => {
                resolve(members)
            }
        );
    })
}

export function deleteServerChannel(socket:Socket<DefaultEventsMap, DefaultEventsMap>, server:TServer, channel:TChannel) {
        socket.emit("deleteServerChannel", server._id.toString(), channel._id.toString());
}

export function renameServerChannel(socket:Socket<DefaultEventsMap, DefaultEventsMap>, channel:TChannel) {
    socket.emit("renameServerChannel", channel._id.toString(), channel.name);
}

export function addServerChannel(socket:Socket<DefaultEventsMap, DefaultEventsMap>, server:TServer, name:string) {
    socket.emit("addServerChannel", server._id.toString(), name);
}

export function setServerName(socket:Socket<DefaultEventsMap, DefaultEventsMap>, server:TServer, serverName:string){
    socket.emit("setServerName", server._id.toString(), serverName);

}

export function leaveUserServer(socket:Socket<DefaultEventsMap, DefaultEventsMap>, server:TServer){
    socket.emit("leaveUserServer", server._id.toString());
}

export function setUserDisplayName(socket:Socket<DefaultEventsMap, DefaultEventsMap>, newName:string)
{
    socket.emit('setUserDisplayName', newName)
}
export function joinUserServer(socket:Socket<DefaultEventsMap, DefaultEventsMap>, serverId:string){
    socket.emit('joinUserServer', serverId)
}
export function createUserServer(socket:Socket<DefaultEventsMap, DefaultEventsMap>, serverName:string)
{
    socket.emit('createUserServer', serverName)
}
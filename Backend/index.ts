import express, { Express, Request, Response } from 'express';
import http from 'http'
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import cors from 'cors'
import TDatabase from './Database';
import TUser from './Models/TUser';
import { ObjectId } from 'mongodb';
import bodyParser from "body-parser"
import { v4 as uuidv4 } from 'uuid';
import cookieParser from "cookie-parser"
import TServer from './Models/TServer';
import TChannel from './Models/TChannel';
import TMessage from './Models/TMessage';
import * as fs from 'fs';
import { channel } from 'diagnostics_channel';

const opusscript = require('opusscript');

const app: Express = express();
const port = 3001;
const server = http.createServer(app);
new TDatabase

app.use(cors({
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200,
	credentials:true
}))
app.use(bodyParser.json())
app.use(cookieParser());



app.get('/user', async (req: Request, res: Response) => {
   res.send(await TUser.get(req.query.id as string))
});

app.post('/user/authenticate', async (req: Request, res: Response) => {
    var user: TUser | undefined
    var body = req.body
    user = await TUser.get("", {username: body.username})
    if (!user)
    {
        res.status(404)
        res.send()
        return
    }
    if (user.authPassword(body.password as string)){
        var token = await user.genToken()
        await user.update()
        res.status(200)
        res.cookie('token', token)
        res.send()
        return
    }
    res.status(401)
    res.send()
    return
});

app.post('/user/create', async (req: Request, res: Response) => {
    var body = req.body

    if (!body.username && !body.password && !body.displayName){
        res.status(400)
        res.send()
        return
    }
    

    if (await TUser.get("", {username: body.username}) != undefined){
        res.status(406)
        res.send()
        return
    }

    var user = new TUser(new ObjectId(), body.username, body.password, body.displayName, {}, [])
    user.create()
    var token = await user.genToken()
    await user.update()
    res.status(200)
    res.cookie('token', token)
    res.send()
    return
});

const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io", 'http://localhost:3000'],
        credentials: true
    }
});
instrument(io, {
    auth: {
        type: "basic",
        username: "admin",
        password: "$2a$12$QhnvivG8actfqZaISb2Hs.DPAaej/gDuYsMN/ZKUthn1SRkbqiFPq" // "password" encrypted with bcrypt (https://bcrypt-generator.com/)
    },
});



io.on('connection', (socket) => {
    var token:string
    var user:TUser
    var messageRoom:string;
    var listenServerUpdate:string
    socket.on("auth", async (tokenTemp, callback) => {
        if (!token){
            var tempUser = await TUser.get("", {[`tokens.${tokenTemp}`]: {'$exists': true}})
            if (tempUser)
            {
                tempUser.tokens = {}
                tempUser.passwordHash = ""
                user = tempUser
                token = tokenTemp
                callback(true, user)
            } else {
                callback(false, undefined)
            }
        }
    });
    socket.on("getUser",async (userId, callback) => {
        if (!token)
        {
            return
        }
        callback(await TUser.get(userId))
    })
    socket.on("getServer",async (serverId, callback) => {
        if (!token)
        {
            return
        }
        callback(await TServer.get(serverId))
    })
    socket.on("getChannel",async (channelId, callback) => {
        if (!token)
        {
            return
        }
        callback(await TChannel.get(channelId))
    })
    socket.on("getChannelMessages", async (channelId, startIndex, endIndex, callback) => {
        if (!token)
        {
            return
        }
        var channel = await TChannel.get(channelId)
        if (channel == undefined){
            return
        }
        callback(await channel.getMessages(startIndex, endIndex))
    })
    socket.on("roomMessageListen", async (channelId:string) => {
        if (messageRoom != undefined){
            socket.leave(messageRoom)
        }
        messageRoom = channelId
        socket.join(channelId)
    })
    socket.on("registerServerUpdate", async (channelId:string) => {
        if (listenServerUpdate != undefined){
            socket.leave(listenServerUpdate)
        }
        listenServerUpdate = channelId
        socket.join(channelId)
    })
    socket.on("sendMessage", async (channelId:string, messageString:string) => {
        var channel = await TChannel.get(channelId)
        if (channel == undefined){
            return
        }
        var message:TMessage = new TMessage(new ObjectId(), user._id.toString(), Date.now(), messageString)
        TDatabase.Messages.insertOne(message)
        channel.addMessage(message)
        io.to(channelId).emit("reciveMessage", message)
    })
    socket.on("getServerMembers", async (channelId:string, callback) => {
        var server = await TServer.get(channelId) as TServer
        var members:Array<TUser> = await server.getServerMembers()
        callback(members)
    })
    socket.on("deleteServerChannel", async (serverId:string, channelId:string) => {
        var server = await TServer.get(serverId)
        if (server == undefined){
            return
        }
        server.channels = server.channels.filter(x => x != channelId)
        server.update()
        var channel = await TChannel.get(channelId)
        if (channel) {
            await channel.delete()
            io.to(listenServerUpdate).emit("serverUpdate")
        }
    })
    socket.on("renameServerChannel", async (channelId:string, newChannelName:string) => {
        var channel = await TChannel.get(channelId)
        if (channel) {
            channel.name = newChannelName
            await channel.update()
            io.to(listenServerUpdate).emit("serverUpdate")
        }
    })
    socket.on("addServerChannel", async (serverId:string, name:string) => {
        var channel = new TChannel(new ObjectId(), [], name, false, [])
        await channel.create()
        var server = await TServer.get(serverId)
        if (server){
            server.channels.push(channel._id.toString())
            await server.update()
            io.to(listenServerUpdate).emit("serverUpdate")
        }
    })
    socket.on("setServerName", async (serverId:string, name:string) => {
        var server = await TServer.get(serverId)
        if (server) {
            server.name = name
            await server.update()
            io.to(listenServerUpdate).emit("serverUpdate")
        }
    })
    socket.on("leaveUserServer", async (serverId:string) => {
        var tempUser = await TUser.get(user._id)
        if (tempUser)
        {
            tempUser.servers = tempUser.servers.filter(x => x != serverId)
            await tempUser.update()
            tempUser.tokens = {}
            tempUser.passwordHash = ""
            user = tempUser
            socket.emit("userUpdate", user)
            io.to(listenServerUpdate).emit("serverUpdate")
        }
    })
    socket.on('setUserDisplayName', async (newName:string) => {
        var tempUser = await TUser.get(user._id)
        if (newName && tempUser){
            tempUser.displayName = newName
            await tempUser.update()
            tempUser.tokens = {}
            tempUser.passwordHash = ""
            user = tempUser
            socket.emit("userUpdate", user)
            for (let index = 0; index < user.servers.length; index++) {
                const server = user.servers[index]
                io.to(server).emit("serverUpdate")
            }
        }
    })
});

server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
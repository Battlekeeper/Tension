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
import TChannel from './Models/TMessage';


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
        var token = user.genToken()
        user.update()
        res.status(200)
        res.cookie('token', token)
        res.send()
        return
    }
    res.status(401)
    res.send()
    return
});

app.get('/user/create', (req: Request, res: Response) => {
    var user = new TUser(new ObjectId(),"1","2","3", {}, [])
    user.create()
    res.send(user)
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
    socket.on("auth", async (tokenTemp, callback) => {
        if (!token){
            var tempUser = await TUser.get("", {[`tokens.${tokenTemp}`]: {'$exists': true}})
            if (tempUser)
            {
                token = tokenTemp
                callback(true)
            } else {
                callback(false)
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
});

server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
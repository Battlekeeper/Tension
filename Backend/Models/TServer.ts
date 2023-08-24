import { v4 as uuidv4 } from 'uuid';
import TChannel from './TChannel';
import { ObjectId } from 'mongodb';
import TDatabase from '../Database';
import TUser from "./TUser"

export default class TServer
{
    _id:ObjectId
    channels:Array<string>
    name:string
    constructor(_id:ObjectId, channels:Array<string>, name:string){
        this._id = _id
        this.channels = channels
        this.name = name
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Servers.findOne(filter)
        if (document?._id != undefined){
            return new TServer(document?._id, document?.channels, document?.name)
        } else {
            return undefined
        }
    }
    public async update(){
        await TDatabase.Servers.replaceOne({_id: this._id}, this)
    }
    public async getServerMembers(){
        var documents = await (await TDatabase.Users.find({servers: {$all: [this._id.toString()]}})).toArray();
        var members:Array<TUser> = [];

        for (let index = 0; index < documents.length; index++) {
            const doc = documents[index];
            var user = await TUser.get(doc._id)
            user!.tokens = {}
            user!.passwordHash = ""
            user!.username = ""
            members.push(user as TUser)
        }
        return members
    }
}
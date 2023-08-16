import { v4 as uuidv4 } from 'uuid';
import TChannel from './TChannel';
import { ObjectId } from 'mongodb';
import TDatabase from '../Database';

export default class TServer
{
    _id:ObjectId
    channels:Array<TChannel>
    constructor(_id:ObjectId, channels:Array<TChannel>){
        this._id = _id
        this.channels = channels
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Servers.findOne(filter)
        if (document?._id != undefined){
            return new TServer(document?._id, document?.messages)
        } else {
            return undefined
        }
    }
}
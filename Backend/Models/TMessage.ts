import { ObjectId } from "mongodb"
import TDatabase from "../Database"

export default class TChannel
{
    _id:ObjectId
    authorId:string
    timestamp:number
    constructor(_id:ObjectId, authorId:string, timestamp:number){
        this._id = _id
        this.authorId = authorId
        this.timestamp = timestamp
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Channels.findOne(filter)
        if (document?._id != undefined){
            return new TChannel(document?._id, document?.messages, document?.timestamp)
        } else {
            return undefined
        }
    }
}
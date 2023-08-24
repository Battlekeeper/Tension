import { ObjectId } from "mongodb"
import TDatabase from "../Database"

export default class TMessage
{
    _id:ObjectId
    authorId:string
    timestamp:number
    content:string
    constructor(_id:ObjectId, authorId:string, timestamp:number, content:string){
        this._id = _id
        this.authorId = authorId
        this.timestamp = timestamp
        this.content = content
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Messages.findOne(filter)
        if (document?._id != undefined){
            return new TMessage(document?._id, document?.authorId, document?.timestamp, document?.content)
        } else {
            return undefined
        }
    }
}
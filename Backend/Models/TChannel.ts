import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import TDatabase from '../Database';
import TMessage from './TMessage';

export default class TChannel
{
    _id:ObjectId
    messages:Array<TMessage>
    name:string
    constructor(_id:ObjectId, messages:Array<TMessage>, name:string){
        this._id = _id
        this.messages = messages
        this.name = name
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Users.findOne(filter)
        if (document?._id != undefined){
            return new TChannel(document?._id, document?.messages, document?.name)
        } else {
            return undefined
        }
    }
}
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import TDatabase from '../Database';
import TMessage from './TMessage';

export default class TChannel
{
    _id:ObjectId
    messages:Array<TMessage>
    constructor(_id:ObjectId, messages:Array<TMessage>){
        this._id = _id
        this.messages = messages
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Users.findOne(filter)
        if (document?._id != undefined){
            return new TChannel(document?._id, document?.messages)
        } else {
            return undefined
        }
    }
}
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import TDatabase from '../Database';
import TMessage from './TMessage';

export default class TChannel
{
    _id:ObjectId
    messages:Array<string>
    members:Array<string>
    name:string
    isVoice:boolean
    constructor(_id:ObjectId, messages:Array<string>, name:string, isVoice:boolean, members:Array<string>){
        this._id = _id
        this.messages = messages
        this.name = name
        this.isVoice = isVoice
        this.members = members
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Channels.findOne(filter)
        if (document?._id != undefined){
            return new TChannel(document?._id, document?.messages, document?.name, document?.isVoice, document?.members)
        } else {
            return undefined
        }
    }
    public async update(){
        await TDatabase.Channels.replaceOne({_id: this._id}, this)
    }
    public async create(){
        await TDatabase.Channels.insertOne(this)
    }
    public async delete(){
        await TDatabase.Channels.deleteOne({_id: this._id})
    }
    public async getMessages(startIndex:number, endIndex:number){
        var messages:Array<TMessage> = []
        if (startIndex < 0 || startIndex >= endIndex )
        {
            return messages
        }
        if (endIndex > this.messages.length){
            endIndex = this.messages.length
        }
        for (let index = startIndex; index < endIndex; index++) {
            messages.push(await TMessage.get(this.messages[index]) as TMessage)
        }
        return messages
    }
    public async addMessage(message:TMessage){
        this.messages.unshift(message._id.toString())
        await this.update()
    }
    public async getServer(){
        var server = await TDatabase.Servers.findOne({channels: this._id.toString()})
        return server
    }
}
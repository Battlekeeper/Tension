import { v4 as uuidv4 } from 'uuid';
import TChannel from './TChannel';
import { ObjectId } from 'mongodb';

export default class TServer
{
    _id:ObjectId
    channels:Array<TChannel>
    constructor(){
        this._id = new ObjectId()
        this.channels = new Array<TChannel>
    }
}
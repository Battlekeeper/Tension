import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

export default class TChannel
{
    _id:ObjectId
    constructor(){
        this._id = new ObjectId()
    }
}
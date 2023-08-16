import { v4 as uuidv4 } from 'uuid';
import Bcrypt from "bcrypt"
import { MongoClient, ObjectId} from "mongodb"
import TDatabase from '../Database';

export default class TUser
{
    _id:ObjectId
    username:string
    passwordHash:string
    displayName:string
    tokens:Record<string, number>
    servers:Array<string>

    constructor(_id:ObjectId, username:string, password:string, displayName:string, tokens:Record<string, number>, servers:Array<string>){
        this._id = _id;
        this.username = username
        this.passwordHash = password;
        this.displayName = displayName
        this.tokens = tokens
        this.servers = servers
    }
    public create(){
        this.passwordHash = Bcrypt.hashSync(this.passwordHash,  10)
        TDatabase.Users.insertOne(this)
    }
    public async update(){
        await TDatabase.Users.replaceOne({_id: this._id}, this)
    }
    public static async get(id:string | number | ObjectId | Uint8Array | undefined, filter:any = {_id: new ObjectId(id)})
    {
        var document = await TDatabase.Users.findOne(filter)
        if (document?._id != undefined){
            return new TUser(document?._id, document?.username, document?.passwordHash, document?.displayName, document?.tokens, document?.servers)
        } else {
            return undefined
        }
    }
    public authPassword(password:string){
        return Bcrypt.compareSync(password, this.passwordHash)
    }
    public static async authToken(token:string){
        token = token.replace("Bearer ", '')
        var user = await TUser.get("", {[`tokens.${token}`]: {'$exists': true}})
        if (user)
        {
            if (user.tokens[token] > Date.now())
            {
                return true
            } else {
                delete user.tokens[token]
                user.update()
                return false
            }
        }
        return false;
    }
    public genToken(){
        var token:string = uuidv4()
        this.tokens[token] = Date.now() + 86400000
        this.update()
        return token
    }
}
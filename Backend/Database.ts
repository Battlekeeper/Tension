import { MongoClient, Collection } from 'mongodb'

export default class TDatabase
{
    static Client:MongoClient = new MongoClient("mongodb://192.168.1.49:2727")
    static Users:Collection
    constructor() {
        TDatabase.Client.connect();
        TDatabase.Users = TDatabase.Client.db("Tension").collection("Users")
    }
}
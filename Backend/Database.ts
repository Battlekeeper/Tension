import { MongoClient, Collection } from 'mongodb'

export default class TDatabase
{
    static Client:MongoClient = new MongoClient("mongodb://73.159.99.69:2727")
    static Users:Collection
    static Channels:Collection
    constructor() {
        TDatabase.Client.connect();
        TDatabase.Users = TDatabase.Client.db("Tension").collection("Users")
        TDatabase.Channels = TDatabase.Client.db("Tension").collection("Channels")
    }
}
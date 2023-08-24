import { MongoClient, Collection } from 'mongodb'

export default class TDatabase
{
    static Client:MongoClient = new MongoClient("mongodb://73.159.99.69:2727")
    static Users:Collection
    static Servers:Collection
    static Channels:Collection
    static Messages:Collection
    constructor() {
        TDatabase.Client.connect();
        TDatabase.Users = TDatabase.Client.db("Tension").collection("Users")
        TDatabase.Servers = TDatabase.Client.db("Tension").collection("Servers")
        TDatabase.Channels = TDatabase.Client.db("Tension").collection("Channels")
        TDatabase.Messages = TDatabase.Client.db("Tension").collection("Messages")
    }
}
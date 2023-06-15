//create mongodb connection
import mongodb, { MongoClient, Collection } from 'mongodb';
import Config from './Config';
import { Item } from './models/Item';
import ModMail from './models/ModMail';
import User from './models/User';
import Logger from './utils/Logger';

export const collections : {users?: Collection<User>, items?: Collection<Item>, shops?: Collection, modmails?: Collection<ModMail>} = {};

export async function connectToDatabase() {
    const client: MongoClient = new MongoClient(Config.MONGO_URI);
            
    await client.connect();
        
    const db: mongodb.Db = client.db(Config.DB_NAME);

    const usersCollection = db.collection<User>("user");
    const itemsCollection = db.collection<Item>("items");
    const shopsCollection = db.collection("shops");
    const mailsCollection = db.collection<ModMail>("modmails");
 
    collections.users = usersCollection;
    collections.items = itemsCollection;
    collections.shops = shopsCollection;
    collections.modmails = mailsCollection;
       
    new Logger("DEBUG", "Database").info(`Successfully connected to database: ${db.databaseName}`);
}
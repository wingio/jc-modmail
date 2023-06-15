import { collections } from "../Database";
import User from "../models/User";

export async function getUser(id: string) {
    let user = await collections.users.findOne({id})
    if(!user) {
        let newUser = new User([], id, false)
        await collections.users.insertOne(newUser)
        return newUser
    }
    return user
}
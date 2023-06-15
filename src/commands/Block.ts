import { Client, Message } from "discord.js";
import { collections } from "../Database";
import User from "../models/User";

export async function run(client: Client, msg: Message, args: string[]) {
    if(!args[0]) return msg.reply("No user argument provided.")
    let target = msg.mentions.users.first() || await client.users.fetch(args[0])

    let user = await collections.users.findOne({id: target.id})
    if(!user) {
        await collections.users.insertOne(new User([], target.id, true))
    } else {
        await collections.users.updateOne({id: target.id}, {$set: {blocked: true}})
    }

    await msg.reply({
        content: `${target} blocked from sending modmail.`,
        allowedMentions: {repliedUser: true, users: [target.id]}
    })
    
}

export const names = ["block"];
export const description = "Blocks a user from sending modmail.";
export const dev = false;
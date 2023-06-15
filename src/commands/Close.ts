import {Client, Message, EmbedBuilder, User} from "discord.js";
import Config from "../Config";
import { collections } from "../Database";
import { getModmail } from "../utils/modmail/ModMailManager";
import * as fs from "fs"
import Logger from "../utils/Logger";

export async function run(client: Client, msg: Message, args: string[]) {
    if(msg.channel.isDMBased()) return
    let ticket = await getModmail(msg.channelId)

    if(!ticket) return

    let ticketUser = await client.users.fetch(ticket.user)

    const embed = new EmbedBuilder()
        .setTitle("Closed Modmail Ticket")
        .addFields(
            {
                name: "ModMail Channel",
                value: ticket.channelId.toString()
            },
            {
                name: "Moderator",
                value: msg.author.toString()
            },
            {
                name: "User",
                value: ticket.anon ? "Anonymous" : `${ticketUser.toString()}\n${ticketUser.id}`
            }
        )
        .setThumbnail(ticketUser.displayAvatarURL())
        .setTimestamp(new Date())

    let transcript = ""
    let userCache = new Map<string, User>()
    for (const m of ticket.log) {
        if(!userCache.has(m.sender)) { // Cache users to prevent ratelimits
            let msgSender = await client.users.fetch(m.sender);
            userCache.set(m.sender, msgSender)
        }
        let msgSender = userCache.get(m.sender)
        let msgSenderUsername: string;
        if (msgSender.discriminator === "0") {
            msgSenderUsername = `@${msgSender.username}`
        } else {
            msgSenderUsername = `${msgSender.username}#${msgSender.discriminator}`
        }
        transcript += `[${m.fromMod ? `<Mod> ${msgSenderUsername}` : `<User> ${ticket.anon && !m.fromMod ? "<Anon>" : msgSenderUsername}`}] ${ticket.anon && !m.fromMod ? "" : `<${m.sender}>`} - ${m.content}\n\n`
    }

    msg.channel.delete().then(async () => {
        await collections.modmails?.updateOne({_id: ticket._id}, {$set: {closed: true}})

        client.channels.fetch(Config.logChannelId).then(ch => {
            try { fs.mkdirSync("../transcripts") } catch(e) {}
            fs.writeFile(`../transcripts/transcript-${ticket._id.toString()}.txt`, transcript, (err) => {
                if(err) return
                if(ch.isTextBased()) {
                    ch.send( {
                        embeds: [embed],
                        files: [{
                            attachment: `../transcripts/transcript-${ticket._id.toString()}.txt`,
                            name: `${ticket.anon ? "anon" : ticket.user}-transcript.txt`
                        }]
                    } )
                }
            })
        }).catch(e => {
            msg.react("❌")
            new Logger("DEBUG", "Logging").error("Failed to log transcript:", e)
        })
    })

}

export const names = ["close"];
export const description = "Close the current modmail channel.";
export const dev = false;
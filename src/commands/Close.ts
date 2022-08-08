import { Client, Message, EmbedBuilder } from "discord.js";
import Config from "../Config";
import { collections } from "../Database";
import { getModmail } from "../utils/modmail/ModMailManager";
import * as fs from "fs"

export async function run(client: Client, msg: Message, args: string[]) {
    if(msg.channel.isDMBased()) return
    let ticket = await getModmail(msg.channelId)

    if(!ticket) return

    const embed = new EmbedBuilder()
        .setTitle("Closed Modmail Ticket")
        .addFields(
            {
                name: "ModMail Channel",
                value: ticket.anon ? "Anonymous" : ticket.user,
                inline: true
            },
            {
                name: "Moderator",
                value: msg.author.toString()
            }
        )
    
    let transcript = ""
    ticket.log.forEach(m => {
        transcript += `[${m.fromMod ? "Mod" : "User"}] ${ticket.anon && !m.fromMod ? "<Anon>" : m.sender} - ${m.content}\n\n`
    })
    
    msg.channel.delete().then(async () => {
        collections.modmails?.updateOne({_id: ticket._id}, {$set: {closed: true}})

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
        })
    })

}

export const names = ["close"];
export const description = "View commands.";
export const dev = false;
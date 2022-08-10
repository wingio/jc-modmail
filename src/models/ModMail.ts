import { Channel, TextChannel, Message as DMessage, JSONEncodable, AttachmentPayload, EmbedBuilder, APIEmbed, GuildTextBasedChannel } from "discord.js";
import { bot } from "../bot";
import { collections } from "../Database";
import { Document, WithId } from "mongodb";

export default class ModMail implements Document {
    constructor (
       public user: string,
       public anon: boolean,
       public log: Message[],
       public channelId: string,
       public closed: boolean,
       public webhookId: string,
       public webhookToken: string
    ) {}

    public static async sendMail(modmail: ModMail, msg: DMessage) {
        let user = await collections.users.findOne({id: msg.author.id})
        if(user && user.blocked) return msg.react("❌")
        bot.fetchWebhook(modmail.webhookId, modmail.webhookToken).then(hook => {

            let content = msg.content
            if(content.trim() === "" && msg.attachments.size == 0) return

            hook.send({
                content: msg.content,
                embeds: (msg.embeds),
                files: msg.attachments.map(a => a)
            }).catch(e => {
                msg.react("❌")
            }).then(() => {
                msg.react("☑")
                collections.modmails.updateOne({channelId: modmail.channelId}, {$push: { log: new Message(msg.author.id, msg.content, new Date(), false) }})
            })
        })
    }

    public static reply(modmail: ModMail, msg: DMessage) {
        bot.users.fetch(modmail.user).then(user => {
            let embed = new EmbedBuilder()
                            .setTitle("Reply")
                            .setFooter({
                                text: (msg.channel as TextChannel).guild.name,
                                iconURL: (msg.channel as TextChannel).guild.iconURL()
                            })
                            .setTimestamp(Date.now())
            if(!msg.content && msg.attachments.size > 0) 
                embed.setDescription("[Media Attached]");
            else if(msg.content)
                embed.setDescription(msg.content)
            user.send({
                embeds: [embed],
                files: msg.attachments.map(a => a)
            }).catch(e => {
                msg.react("❌")
            }).then(() => {
                msg.react("☑")
                collections.modmails.updateOne({channelId: modmail.channelId}, {$push: { log: new Message(msg.author.id, msg.content, new Date(), true) }})
            })
        }).catch(e => {
            msg.react("❌")
        })
    }

}

export class Message {
    constructor(
        public sender: string,
        public content: string,
        public createdAt: Date,
        public fromMod: boolean
    ) {}
}
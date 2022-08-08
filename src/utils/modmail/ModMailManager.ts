import { CategoryChannel, Channel, ChannelType, Client, Message, PermissionFlagsBits, PermissionOverwrites, TextChannel } from "discord.js";
import { WithId } from "mongodb";
import Config from "../../Config";
import { collections } from "../../Database";
import ModMail, { Message as MMessage } from "../../models/ModMail";
import User from "../../models/User";
import { checkPermissions } from "../PermissionUtils";

export async function getModmail(channelId: string): Promise<WithId<ModMail>> {
    return collections.modmails.findOne({channelId})
}

export async function hasOpenConvo(userId: string) {
    return !!await collections.modmails.findOne({user: userId, closed: false})
}

export async function createConvo(user: User, client: Client, msg: Message) {
    let anon = msg.content.toLowerCase().startsWith("/anon ")
    let channel = await createMailChannel(client, msg.author.tag, anon)

    let hook = await channel.createWebhook(
        {
            avatar: anon ? `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 1000) % 5}.png` : msg.author.avatarURL(),
            name: anon ? "Anon" : `${msg.author.tag} (${msg.author.id})`
        }
    )

    let mail = new ModMail(
        user.id,
        msg.content.toLowerCase().startsWith("/anon "),
        [],
        channel.id,
        false,
        hook.id,
        hook.token
    )
    collections.modmails.insertOne(mail).then(()=> {
        ModMail.sendMail(mail, msg)
    })
    
}

async function createMailChannel(client: Client, tag: string, anon: boolean): Promise<TextChannel> {
    let category = await client.channels.fetch(Config.modmailCategoryId) as CategoryChannel
    if(!category) throw Error
    if(!category.manageable) throw Error
    if(!checkPermissions(category.guild.members.me, PermissionFlagsBits.ManageChannels)) throw Error
    return await category.children.create({
        type: ChannelType.GuildText,
        name: anon ? "Anonymous-0000" : `${tag.slice(0, -4)}-${tag.slice(-4, tag.length)}`,
        permissionOverwrites: [{
            id: category.guildId,
            deny: ['SendMessages', 'ViewChannel'],
        }, {
            id: Config.modRoleId,
            allow: ['SendMessages', 'ViewChannel'],
        }, {
            id: client.user.id,
            allow: ['SendMessages', 'ViewChannel'],
        }]
    })
}
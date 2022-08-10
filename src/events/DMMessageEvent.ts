import { Client, Message, PermissionFlagsBits } from "discord.js";
import { commands } from "../bot";
import Config from "../Config";
import { collections } from "../Database";
import ModMail from "../models/ModMail";
import User from "../models/User";
import Logger from "../utils/Logger";
import { createConvo, getModmail, hasOpenConvo } from "../utils/modmail/ModMailManager";
import { checkPermissions } from "../utils/PermissionUtils";
import Event from "./Event";

export default class DMMessageEvent extends Event {
    public static eventName: string = "messageCreate";
    static log: Logger = new Logger("DEBUG", "ModMail");

    public static async handle(client: Client, msg : Message) {
        if(msg.author.bot) return;

        let mail = await getModmail(msg.channelId)
        if(mail && !msg.content.startsWith(Config.prefix)) {
            ModMail.reply(mail, msg)
        }

        if(!msg.channel.isDMBased()) return;

        this.log.info(`[DM] (${msg.author.id}) ${msg.author.tag} >> ${msg.content}`)
        let hasMail = await hasOpenConvo(msg.author.id);

        let user = await collections.users.findOne({id: msg.author.id})
        if(!user) collections.users.insertOne(new User([], msg.author.id)).then(() => {
            collections.users.findOne({id: msg.author.id}).then(u => user = u)
        })

        if(user.blocked) return msg.react("❌")

        if(!hasMail) createConvo(user, client, msg) ;else {

            let modmail = await collections.modmails.findOne( { user: msg.author.id, closed: false } )
            if(!modmail) return
            ModMail.sendMail(modmail, msg)

        }

    }
}
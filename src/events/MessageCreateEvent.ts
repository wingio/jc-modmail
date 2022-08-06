import { Client, Message, PermissionFlagsBits } from "discord.js";
import { commands } from "../bot";
import Config from "../Config";
import Logger from "../utils/Logger";
import { checkPermissions } from "../utils/PermissionUtils";
import Event from "./Event";

export default class MessageCreateEvent extends Event {
    public static eventName: string = "messageCreate";
    static log: Logger = new Logger("DEBUG", "MessageCreateEvent");

    public static handle(client: Client, msg : Message) {
        if(msg.author.bot) return;

        if(!msg.channel.isDMBased()) this.log.info(`[${msg.guild.name}/#${msg.channel.name}] (${msg.author.id}) ${msg.author.tag} >> ${msg.content}`)

        if(msg.content.startsWith(Config.prefix)) {
            let args = msg.content.split(/ +/);
            let commandName = args.shift().slice(Config.prefix.length).toLowerCase();
            let command = commands.find((r, n) => n.includes(commandName));
            if(!command) return;
            try {
                if(command.dev && msg.author.id !== Config.devId) return;
                if(!checkPermissions(msg.guild.members.me, PermissionFlagsBits.SendMessages, msg.channel.id)) return;
                command.run(client, msg, args);
            } catch(e) {
                this.log.error("Error while running: " + Config.prefix + commandName, e);
            }
        }
    }
}
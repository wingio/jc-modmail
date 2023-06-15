import { Client, Message, EmbedBuilder } from "discord.js";
import { commands } from "../bot";
import Config from "../Config";

export function run(client: Client, msg: Message, args: string[]) {
    const embed = new EmbedBuilder()
        .setTitle("Commands")
        .setColor(0x00FF00)
        .setDescription("Here are all the commands you can use.");
    commands.each(cmd => {
        if(!cmd.dev) embed.addFields({ name: Config.prefix + cmd.names[0], value: cmd.description + "\n\n*Aliases: " + (cmd.names.length > 1 ? cmd.names.slice(1).join(", ") + "*" : "None*")});
    });
    msg.channel.send({embeds: [embed.data]});
}

export const names = ["help", "h"];
export const description = "View commands.";
export const dev = false;
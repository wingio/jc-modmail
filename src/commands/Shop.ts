import { Client, Message, EmbedBuilder } from "discord.js";
import { WithId } from "mongodb";
import { commands } from "../bot";
import { collections } from "../Database";
import { ItemFlags, ItemType, RoleItem } from "../models/Item";

export async function run(client: Client, msg: Message, args: string[]) {

    var pagenumber = (args[0]) ? parseInt(args[0], 10) : 1

    let shop = await (await collections.shop.find().toArray()).sort((a,b) => a.price - b.price)
    if (pagenumber < 1 || pagenumber > Math.ceil(shop.length / 6)) pagenumber = 1

    var e = new EmbedBuilder()
        .setTitle('Shop')
        .setDescription('Use `mm!buy [id]` to add it to your inventory')
        .setFooter({
            text: `Page ${pagenumber}/${Math.ceil(shop.length / 6)}`
        })
        .setColor(16721726)
    for (let itind = (pagenumber * 6) - 6; itind < pagenumber * 6; itind++) {
        const item = shop[itind] as WithId<RoleItem>;
        if (item) {
            if (item.stock != Infinity && item.stock < 1) return
            var flags = ''
            if (item.flags.length > 0) {
                if (item.flags.includes(ItemFlags.levelrequirement) || item.flags.includes(ItemFlags.itemrequirement)) {
                    flags += `**Requires:**`

                    if (item.flags.includes(ItemFlags.levelrequirement)) flags += ` Level ${item.level}+`
                    if(item.flags.includes(ItemFlags.levelrequirement) && item.flags.includes(ItemFlags.itemrequirement)){
                        flags += ' and'
                    }
                    if (item.flags.includes(ItemFlags.itemrequirement)) {
                        var itm = await collections.shop.findOne({ id: item.itemneeded })
                        flags += ` ${itm.name}`
                    }
                }
            }
            e.addFields({
                name: `${item.name} - <:JawshCoin:820839077493735484> ${numberWithCommas(item.price)}`,
                value: `${item.description}\nID: \`${item.id}\`\nType: \`${Object.getOwnPropertyNames(ItemType)[item.type + 2]}\`     Stock: ${item.stock}\n${flags}`,
                inline: true
            })
        }
    }
    msg.channel.send({
        embeds: [e]
    })
}

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

export const names = ["shop"];
export const description = "View roles you can buy";
export const dev = false;
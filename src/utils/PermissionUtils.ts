import { GuildChannelResolvable, GuildMember, PermissionResolvable } from "discord.js";

export function checkPermissions(member: GuildMember, permissions: PermissionResolvable, channel?: GuildChannelResolvable): boolean {
    if (!member.permissions.has(permissions)) return false;
    if(channel){
        if(!member.permissionsIn(channel).has(permissions)) return false;
    }
    return true;
}
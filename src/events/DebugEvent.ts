import { Client, Message } from "discord.js";
import Logger from "../utils/Logger";
import Event from "./Event";

export default class DebugEvent extends Event {
    public static eventName: string = "debug";
    static log: Logger = new Logger("DEBUG");

    public static handle(client: Client, msg : string) {
        this.log.debug(msg);
    }
}
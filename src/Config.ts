import * as dotenv from "dotenv"

dotenv.config({
    path: "../.env"
})

export default class Config {

    public static token: string = process.env.TOKEN

    public static devId: string = process.env.DEV_USER_ID

    public static MONGO_URI: string = "mongodb://127.0.0.1:27017/";

    public static DB_NAME: string = "modmail";

    public static prefix: string = "mm?";

    public static currency: string = "<:JawshCoin:820839077493735484>"

    public static modmailCategoryId = process.env.MODMAIL_CATEGORY_ID

    public static modRoleId = process.env.MOD_ROLE_ID
    
    public static logChannelId = process.env.LOG_CHANNEL

}
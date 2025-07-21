import { steamAPI } from "../steamAPI.ts"
import {writeFile} from "node:fs/promises"
import { isDeepType,Shape } from "../../utils/typeGuards.ts"
import { steamid } from "../../../config.js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFilePath = path.join(__dirname,'..','..','..','client','src', 'data','ownedGames.json');

const shape_ownedgames_response:Shape={
    response:{
        game_count:"number",
        games:[
            {
                appid: "number",
                name: "string",
                playtime_forever: "number",
                img_icon_url: "string",
                "has_community_visible_stats?": "boolean",
                playtime_windows_forever: "number",
                playtime_mac_forever: "number",
                playtime_linux_forever: "number",
                playtime_deck_forever: "number",
                rtime_last_played: "number",
                playtime_disconnected: "number",
                "playtime_2weeks?":"number",
                "has_leaderboards?":"boolean",
                "content_descriptorids?":["number"]

            }
        ]
    }
}

export async function s_ownedgames() {
    try{
        const res_ownedgames = await steamAPI.getOwnedGames(steamid)

        if(isDeepType(res_ownedgames,shape_ownedgames_response)){
            console.log("拥有的游戏列表数据结构验证通过")
            await writeFile(targetFilePath,JSON.stringify(res_ownedgames,null,2))
            console.log("成功将文件写入目标")
        }else{
            console.error("拥有的游戏列表数据结构验证失败")
        }
    }catch(error){
        console.error("执行拥有的游戏列表脚本时出错",error)
        throw new Error("执行拥有的游戏列表脚本时出错")
    }
}

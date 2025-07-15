import { steamAPI } from "../steamAPI.ts"
import {writeFile} from "node:fs/promises"
import { isDeepType,Shape } from "../../utils/typeGuards.ts"
import { steamid } from "../../config.ts"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFilePath = path.join(__dirname,'..','..','data','recentGames.json');

const shape_recentgames_response:Shape={
    response:{
        total_count:"number",
        games:[
            {
                appid: "number",
                name: "string",
                playtime_2weeks: "number",
                playtime_forever: "number",
                img_icon_url: "string",
                playtime_windows_forever: "number",
                playtime_mac_forever: "number",
                playtime_linux_forever: "number",
                playtime_deck_forever: "number"
            }
        ]
    }
}

export async function s_recentgames() {
    try{
        const res_recentgames = await steamAPI.getRecentlyPlayedGames(steamid)

        if(isDeepType(res_recentgames,shape_recentgames_response)){
            console.log("最近玩过的游戏列表数据结构验证通过")
            await writeFile(targetFilePath,JSON.stringify(res_recentgames,null,2))
            console.log("成功将文件写入目标")
        }else{
            console.error("最近玩过的游戏列表数据结构验证失败")
        }
    }catch(error){
        console.error("执行最近玩过的游戏列表脚本时出错",error)
        throw new Error("执行最近玩过的游戏列表脚本时出错")

    }
}

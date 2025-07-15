import { steamAPI } from "../steamAPI.ts"
import {writeFile} from "node:fs/promises"
import { isDeepType,Shape } from "../../utils/typeGuards.ts"
import { steamid } from "../../config.ts"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFilePath = path.join(__dirname,'..','..','data','steamLevel.json');

const shape_steamlevel_response:Shape={
    response:{
        player_level:"number"
    }
}

export async function s_steamlevel() {
    try{
        const res_steamlevel = await steamAPI.getSteamLevel(steamid)

        if(isDeepType(res_steamlevel,shape_steamlevel_response)){
            console.log("Steam等级数据结构验证通过")
            await writeFile(targetFilePath,JSON.stringify(res_steamlevel,null,2))
            console.log("成功将文件写入目标")
        }else{
            console.error("Steam等级数据结构验证失败")
        }
    }catch(error){
        console.error("执行Steam等级脚本时出错",error)
        throw new Error("执行Steam等级脚本时出错")

    }
}

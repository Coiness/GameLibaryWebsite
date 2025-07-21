import * as pojo from "../../pojo/friendlist.ts"
import { steamAPI } from "../steamAPI.ts"
import {writeFile,mkdir} from "node:fs/promises"
import { isDeepType,Shape } from "../../utils/typeGuards.ts"
import { steamid } from "../../../config.js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);   //文件名
const __dirname = path.dirname(__filename);          //目录名
//双下划线开头，表明这是一个由运行环境提供的、具有特殊含义的“魔法”或“内部”变量

const targetFilePath = path.join(__dirname,'..','..','..','client','src', 'data', 'friendList.json');

const shape_friendlists_response:Shape={
    friendslist:{
        friends:[
            {steamid:"string",
            relationship:"string",
            friend_since:"number"    
            }
        ]
    }
}

export async function s_friendlists() {
    try{
        const res_friendlist = await steamAPI.getFriendList(steamid)
        //await mkdir(path.dirname(targetFilePath), { recursive: true });

        await writeFile(targetFilePath,JSON.stringify(res_friendlist,null,2))
        

        if(isDeepType(res_friendlist,shape_friendlists_response)){
            console.log("好友列表数据结构验证通过")
            await writeFile(targetFilePath,JSON.stringify(res_friendlist,null,2))
            console.log("成功将文件写入目标")
        }else{
            console.error("好友列表数据结构验证失败")
        }
    }catch(error){
        console.error("执行好友列表脚本时出错",error)
        throw new Error("执行好友列表脚本时出错")
    }
}

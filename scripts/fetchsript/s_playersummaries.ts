import { steamAPI } from "../steamAPI.ts"
import {writeFile, readFile} from "node:fs/promises"
import { isDeepType,Shape } from "../../utils/typeGuards.ts"
import { steamid } from "../../config.ts"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { GetFriendListResponse } from "../../pojo/friendlist.ts"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const friendListPath = path.join(__dirname, '..', '..', 'data', 'friendList.json');
const targetFilePath = path.join(__dirname,'..','..','data','playerSummaries.json');

const shape_playersummaries_response:Shape={
    response:{
        players:[
            {
                steamid: "string",
                communityvisibilitystate: "number",
                profilestate: "number",
                personaname: "string",
                profileurl: "string",
                avatar: "string",
                avatarmedium: "string",
                avatarfull: "string",
                avatarhash: "string",
                lastlogoff: "number",
                personastate: "number",
                personastateflags: "number"
            }
        ]
    }
}

export async function s_playersummaries() {
    try{
        // // 1. 读取好友列表
        // const friendListData = await readFile(friendListPath, 'utf-8');
        // const friendListResponse: GetFriendListResponse = JSON.parse(friendListData);
        // const friendSteamIds = friendListResponse.friendlist.friends.map(friend => friend.steamid);

        // // 2. 将自己的 steamid 添加到列表中
        // const allSteamIds = [steamid, ...friendSteamIds];

        // 3. 获取所有人的玩家摘要
        const res_playersummaries = await steamAPI.getPlayersSummaries([steamid])

        if(isDeepType(res_playersummaries,shape_playersummaries_response)){
            console.log("玩家摘要数据结构验证通过")
            await writeFile(targetFilePath,JSON.stringify(res_playersummaries,null,2))
            console.log("成功将文件写入目标")
        }else{
            console.error("玩家摘要数据结构验证失败")
        }
    }catch(error){
        console.error("执行玩家摘要脚本时出错",error)
        throw new Error("执行玩家摘要脚本时出错")
    }
}

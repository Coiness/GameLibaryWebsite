var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { steamAPI } from "../steamAPI.js";
import { writeFile } from "node:fs/promises";
import { isDeepType } from "../../utils/typeGuards.js";
import { steamid } from "../../config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFilePath = path.join(__dirname, '..', '..', '..', '..', 'client', 'src', 'data', 'playerSummaries.json');
const shape_playersummaries_response = {
    response: {
        players: [
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
};
export function s_playersummaries() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // // 1. 读取好友列表
            // const friendListData = await readFile(friendListPath, 'utf-8');
            // const friendListResponse: GetFriendListResponse = JSON.parse(friendListData);
            // const friendSteamIds = friendListResponse.friendlist.friends.map(friend => friend.steamid);
            // // 2. 将自己的 steamid 添加到列表中
            // const allSteamIds = [steamid, ...friendSteamIds];
            // 3. 获取所有人的玩家摘要
            const res_playersummaries = yield steamAPI.getPlayersSummaries([steamid]);
            if (isDeepType(res_playersummaries, shape_playersummaries_response)) {
                console.log("玩家摘要数据结构验证通过");
                yield writeFile(targetFilePath, JSON.stringify(res_playersummaries, null, 2));
                console.log("成功将文件写入目标");
            }
            else {
                console.error("玩家摘要数据结构验证失败");
            }
        }
        catch (error) {
            console.error("执行玩家摘要脚本时出错", error);
            throw new Error("执行玩家摘要脚本时出错");
        }
    });
}

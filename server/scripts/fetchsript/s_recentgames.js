var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { steamAPI } from "../steamAPI.ts";
import { writeFile } from "node:fs/promises";
import { isDeepType } from "../../utils/typeGuards.ts";
import { steamid } from "../../config.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFilePath = path.join(__dirname, '..', '..', 'data', 'recentGames.json');
const shape_recentgames_response = {
    response: {
        total_count: "number",
        games: [
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
};
export function s_recentgames() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res_recentgames = yield steamAPI.getRecentlyPlayedGames(steamid);
            if (isDeepType(res_recentgames, shape_recentgames_response)) {
                console.log("最近玩过的游戏列表数据结构验证通过");
                yield writeFile(targetFilePath, JSON.stringify(res_recentgames, null, 2));
                console.log("成功将文件写入目标");
            }
            else {
                console.error("最近玩过的游戏列表数据结构验证失败");
            }
        }
        catch (error) {
            console.error("执行最近玩过的游戏列表脚本时出错", error);
            throw new Error("执行最近玩过的游戏列表脚本时出错");
        }
    });
}

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
const targetFilePath = path.join(__dirname, '..', '..', 'data', 'steamLevel.json');
const shape_steamlevel_response = {
    response: {
        player_level: "number"
    }
};
export function s_steamlevel() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res_steamlevel = yield steamAPI.getSteamLevel(steamid);
            if (isDeepType(res_steamlevel, shape_steamlevel_response)) {
                console.log("Steam等级数据结构验证通过");
                yield writeFile(targetFilePath, JSON.stringify(res_steamlevel, null, 2));
                console.log("成功将文件写入目标");
            }
            else {
                console.error("Steam等级数据结构验证失败");
            }
        }
        catch (error) {
            console.error("执行Steam等级脚本时出错", error);
            throw new Error("执行Steam等级脚本时出错");
        }
    });
}

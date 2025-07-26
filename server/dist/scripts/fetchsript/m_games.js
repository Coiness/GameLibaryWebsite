var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..', '..', '..', 'client', 'src', 'data');
const ownedGamesPath = path.join(dataDir, 'ownedGames.json');
const recentGamesPath = path.join(dataDir, 'recentGames.json');
const targetFilePath = path.join(dataDir, 'allGames.json');
/**
 * 合并拥有的游戏和最近玩过的游戏数据。
 * 以拥有的游戏列表为基础，用最近玩过的游戏数据进行更新。
 */
export function m_games() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // 1. 读取两个JSON文件
            const ownedGamesContent = yield readFile(ownedGamesPath, 'utf-8');
            const recentGamesContent = yield readFile(recentGamesPath, 'utf-8');
            const ownedGamesJson = JSON.parse(ownedGamesContent);
            const recentGamesJson = JSON.parse(recentGamesContent);
            // 2. 使用Map进行高效合并，以appid为键
            const gamesMap = new Map();
            // 首先将所有拥有的游戏放入Map
            for (const game of ownedGamesJson.response.games) {
                gamesMap.set(game.appid, {
                    appid: game.appid,
                    name: game.name,
                    playtime_forever: game.playtime_forever,
                    img_icon_url: game.img_icon_url,
                    // ownedGames中的playtime_2weeks可能是undefined，正好符合GameInfo接口
                    playtime_2weeks: game.playtime_2weeks,
                });
            }
            // 然后用最近玩过的游戏数据更新Map
            for (const game of recentGamesJson.response.games) {
                const existingGame = gamesMap.get(game.appid);
                // 无论是否存在，都进行更新/添加，以最近游戏数据为准
                gamesMap.set(game.appid, Object.assign(Object.assign({}, existingGame), { appid: game.appid, name: game.name, img_icon_url: game.img_icon_url, playtime_2weeks: game.playtime_2weeks, 
                    // 如果游戏是最近玩的，但不在拥有列表（例如免费周末），也会被添加进来
                    playtime_forever: (_a = existingGame === null || existingGame === void 0 ? void 0 : existingGame.playtime_forever) !== null && _a !== void 0 ? _a : game.playtime_forever }));
            }
            // 3. 将Map的值转换为数组并写入新文件
            const mergedGames = Array.from(gamesMap.values());
            mergedGames.sort((a, b) => {
                var _a, _b;
                const aPlaytime2Weeks = (_a = a.playtime_2weeks) !== null && _a !== void 0 ? _a : 0;
                const bPlaytime2Weeks = (_b = b.playtime_2weeks) !== null && _b !== void 0 ? _b : 0;
                if (bPlaytime2Weeks !== aPlaytime2Weeks) {
                    return bPlaytime2Weeks - aPlaytime2Weeks;
                }
                return (b.playtime_forever - a.playtime_forever);
            });
            yield writeFile(targetFilePath, JSON.stringify(mergedGames, null, 2));
            console.log(`成功合并游戏数据，并写入到 ${targetFilePath}`);
        }
        catch (error) {
            console.error("合并游戏数据时出错", error);
            throw new Error("合并游戏数据时出错");
        }
    });
}

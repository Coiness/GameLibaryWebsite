import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GameInfo } from '../../pojo/index.ts';

// 接口定义了原始JSON文件的结构
interface SteamApiResponse<T> {
    response: {
        games: T[];
    };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..', 'data');

const ownedGamesPath = path.join(dataDir, 'ownedGames.json');
const recentGamesPath = path.join(dataDir, 'recentGames.json');
const targetFilePath = path.join(dataDir, 'allGames.json');

/**
 * 合并拥有的游戏和最近玩过的游戏数据。
 * 以拥有的游戏列表为基础，用最近玩过的游戏数据进行更新。
 */
export async function m_games() {
    try {
        // 1. 读取两个JSON文件
        const ownedGamesContent = await readFile(ownedGamesPath, 'utf-8');
        const recentGamesContent = await readFile(recentGamesPath, 'utf-8');

        const ownedGamesJson: SteamApiResponse<GameInfo> = JSON.parse(ownedGamesContent);
        const recentGamesJson: SteamApiResponse<GameInfo> = JSON.parse(recentGamesContent);

        // 2. 使用Map进行高效合并，以appid为键
        const gamesMap = new Map<number, GameInfo>();

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
            gamesMap.set(game.appid, {
                ...existingGame, // 保留原有属性（如playtime_forever）
                appid: game.appid,
                name: game.name,
                img_icon_url: game.img_icon_url,
                playtime_2weeks: game.playtime_2weeks, // 使用最近游戏的数据
                // 如果游戏是最近玩的，但不在拥有列表（例如免费周末），也会被添加进来
                playtime_forever: existingGame?.playtime_forever ?? game.playtime_forever,
            });
        }

        // 3. 将Map的值转换为数组并写入新文件
        const mergedGames = Array.from(gamesMap.values());

        mergedGames.sort((a,b)=>{
            const aPlaytime2Weeks = a.playtime_2weeks ?? 0;
            const bPlaytime2Weeks = b.playtime_2weeks ?? 0;

            if(bPlaytime2Weeks !== aPlaytime2Weeks){
                return bPlaytime2Weeks - aPlaytime2Weeks
            }

            return (b.playtime_forever - a.playtime_forever)
        })

        await writeFile(targetFilePath, JSON.stringify(mergedGames, null, 2));
        console.log(`成功合并游戏数据，并写入到 ${targetFilePath}`);

    } catch (error) {
        console.error("合并游戏数据时出错", error);
        throw new Error("合并游戏数据时出错");
    }
}
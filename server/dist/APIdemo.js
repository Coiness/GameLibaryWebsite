var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { steamAPI } from "./scripts/steamAPI.js";
import { steamid } from "./config.js";
import { Console } from 'node:console';
import * as fs from 'node:fs';
const output = fs.createWriteStream('./stdout.log', { flags: 'w' });
const errorOutput = fs.createWriteStream('./stderr.log', { flags: 'w' });
const logger = new Console({ stdout: output, stderr: errorOutput });
global.console = logger;
// 延时函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// 测试所有API
function testAllAPIs() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            // 测试1: 获取好友列表
            console.log("\n===== 测试好友列表 =====");
            const friendList = yield steamAPI.getFriendList(steamid);
            console.log(JSON.stringify(friendList, null, 2));
            // 延时2秒
            yield delay(2000);
            // 测试2: 获取最近玩过的游戏
            console.log("\n===== 测试最近玩过的游戏 =====");
            const recentGames = yield steamAPI.getRecentlyPlayedGames(steamid, 5);
            console.log(JSON.stringify(recentGames, null, 2));
            yield delay(2000);
            // 测试3: 获取玩家拥有的游戏
            console.log("\n===== 测试玩家拥有的游戏 =====");
            const ownedGames = yield steamAPI.getOwnedGames(steamid, true, true);
            console.log("拥有游戏数量:", ((_a = ownedGames === null || ownedGames === void 0 ? void 0 : ownedGames.response) === null || _a === void 0 ? void 0 : _a.game_count) || "未知");
            // 只显示前2个游戏详情，避免输出过多
            if ((_b = ownedGames === null || ownedGames === void 0 ? void 0 : ownedGames.response) === null || _b === void 0 ? void 0 : _b.games) {
                console.log("前2个游戏详情:", JSON.stringify(ownedGames.response.games.slice(0, 2), null, 2));
            }
            console.log("GetOwnedGames的响应结构", JSON.stringify(ownedGames));
            yield delay(2000);
            // 测试4: 获取Steam等级
            console.log("\n===== 测试Steam等级 =====");
            const steamLevel = yield steamAPI.getSteamLevel(steamid);
            console.log(JSON.stringify(steamLevel, null, 2));
            yield delay(2000);
            // 测试5: 获取玩家概要
            console.log("\n===== 测试玩家概要 =====");
            // 使用当前steamid和好友列表中的第一个id(如果有)
            let playerIds = [steamid.toString()];
            if (((_d = (_c = friendList === null || friendList === void 0 ? void 0 : friendList.friendslist) === null || _c === void 0 ? void 0 : _c.friends) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                playerIds.push(friendList.friendslist.friends[0].steamid);
            }
            const playerSummaries = yield steamAPI.getPlayersSummaries(playerIds);
            console.log(JSON.stringify(playerSummaries, null, 2));
            yield delay(2000);
            // 测试6: 获取单个游戏游玩时间
            // 使用第一个拥有的游戏(如果有)
            if (((_f = (_e = ownedGames === null || ownedGames === void 0 ? void 0 : ownedGames.response) === null || _e === void 0 ? void 0 : _e.games) === null || _f === void 0 ? void 0 : _f.length) > 0) {
                const firstGameId = ownedGames.response.games[0].appid;
                console.log(`\n===== 测试游戏ID ${firstGameId} 游玩时间 =====`);
                const singleGameTime = yield steamAPI.getSingleGamePlaytime(steamid, firstGameId);
                console.log(JSON.stringify(singleGameTime, null, 2));
            }
        }
        catch (error) {
            console.error("API测试过程中出错:", error);
        }
    });
}
// 运行测试
console.log("开始测试Steam API...");
testAllAPIs().then(() => {
    console.log("\n所有API测试完成!");
});
console.log("APIdemo.ts file loaded successfully");
console.log("Config file loaded. SteamID is:", steamid); // 修改打印内容以确认

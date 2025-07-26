import { steamAPI } from "./scripts/steamAPI.js";
import { steamid } from "./config.js";
import {Console} from 'node:console';
import * as fs from 'node:fs'

const output = fs.createWriteStream('./stdout.log',{flags:'w'})
const errorOutput = fs.createWriteStream('./stderr.log',{flags:'w'})

const logger = new Console({stdout:output,stderr:errorOutput})
global.console = logger

// 延时函数
const delay = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

// 测试所有API
async function testAllAPIs() {
  try {
    // 测试1: 获取好友列表
    console.log("\n===== 测试好友列表 =====");
    const friendList = await steamAPI.getFriendList(steamid);
    console.log(JSON.stringify(friendList, null, 2));
    
    // 延时2秒
    await delay(2000);
    
    // 测试2: 获取最近玩过的游戏
    console.log("\n===== 测试最近玩过的游戏 =====");
    const recentGames = await steamAPI.getRecentlyPlayedGames(steamid, 5);
    console.log(JSON.stringify(recentGames, null, 2));
    
    await delay(2000);
    
    // 测试3: 获取玩家拥有的游戏
    console.log("\n===== 测试玩家拥有的游戏 =====");
    const ownedGames = await steamAPI.getOwnedGames(steamid, true, true);
    console.log("拥有游戏数量:", ownedGames?.response?.game_count || "未知");
    // 只显示前2个游戏详情，避免输出过多
    if (ownedGames?.response?.games) {
      console.log("前2个游戏详情:", JSON.stringify(ownedGames.response.games.slice(0, 2), null, 2));
    }
    console.log("GetOwnedGames的响应结构",JSON.stringify(ownedGames))
    
    await delay(2000);
    
    // 测试4: 获取Steam等级
    console.log("\n===== 测试Steam等级 =====");
    const steamLevel = await steamAPI.getSteamLevel(steamid);
    console.log(JSON.stringify(steamLevel, null, 2));
    
    await delay(2000);
    
    // 测试5: 获取玩家概要
    console.log("\n===== 测试玩家概要 =====");
    // 使用当前steamid和好友列表中的第一个id(如果有)
    let playerIds = [steamid.toString()];
    if (friendList?.friendslist?.friends?.length > 0) {
      playerIds.push(friendList.friendslist.friends[0].steamid);
    }
    
    const playerSummaries = await steamAPI.getPlayersSummaries(playerIds);
    console.log(JSON.stringify(playerSummaries, null, 2));
    
    await delay(2000);
    
    // 测试6: 获取单个游戏游玩时间
    // 使用第一个拥有的游戏(如果有)
    if (ownedGames?.response?.games?.length > 0) {
      const firstGameId = ownedGames.response.games[0].appid;
      console.log(`\n===== 测试游戏ID ${firstGameId} 游玩时间 =====`);
      const singleGameTime = await steamAPI.getSingleGamePlaytime(steamid, firstGameId);
      console.log(JSON.stringify(singleGameTime, null, 2));
    }
    
  } catch (error) {
    console.error("API测试过程中出错:", error);
  }
}

// 运行测试
console.log("开始测试Steam API...");
testAllAPIs().then(() => {
  console.log("\n所有API测试完成!");
});

console.log("APIdemo.ts file loaded successfully");
console.log("Config file loaded. SteamID is:", steamid); // 修改打印内容以确认
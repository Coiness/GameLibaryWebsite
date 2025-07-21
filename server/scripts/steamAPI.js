var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { steamapi_key } from "../config.ts"; // 修正了导入路径并移除了未使用的 steamid
const combineUrlParams = (baseUrl, params) => {
    if (!params || Object.keys(params).length === 0)
        return baseUrl;
    const queryParts = [];
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            // 将数组转换为逗号分隔的字符串
            const arrayValues = value.map(item => String(item)).join(',');
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(arrayValues)}`);
        }
        else {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
    }
    const queryString = queryParts.join('&');
    const connector = baseUrl.includes('?') ? '&' : '?';
    return queryString ? `${baseUrl}${connector}${queryString}` : baseUrl;
};
const callSteamAPI = (endpoint, params) => __awaiter(void 0, void 0, void 0, function* () {
    const apiParams = Object.assign(Object.assign({}, params), { key: steamapi_key });
    const url = combineUrlParams(`https://api.steampowered.com/${endpoint}`, apiParams);
    const res = yield fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res.json();
});
export const steamAPI = {
    getRecentlyPlayedGames: (steamid, count = 0) => {
        return callSteamAPI('IPlayerService/GetRecentlyPlayedGames/v1/', {
            steamid,
            count
        });
    },
    getSingleGamePlaytime(steamid, appid) {
        return callSteamAPI('IPlayerService/GetSingleGamePlaytime/v1/', {
            steamid,
            appid
        });
    },
    // 修正了 appids_filter 的类型并简化了逻辑
    getOwnedGames(steamid, include_appinfo = true, include_played_free_games = false, appids_filter) {
        const params = {
            steamid,
            include_appinfo,
            include_played_free_games,
        };
        // 只有在提供了 appids_filter 时才将其添加到参数中
        if (appids_filter && appids_filter.length > 0) {
            params.appids_filter = appids_filter;
        }
        return callSteamAPI('IPlayerService/GetOwnedGames/v1/', params);
    },
    getSteamLevel(steamid) {
        return callSteamAPI('IPlayerService/GetSteamLevel/v1/', {
            steamid
        });
    },
    getFriendList(steamid) {
        return callSteamAPI('ISteamUser/GetFriendList/v1/', {
            steamid
        });
    },
    getPlayersSummaries: (steamids) => {
        return callSteamAPI('ISteamUser/GetPlayerSummaries/v2/', {
            steamids
        });
    }
};
console.log("steamAPI file successfully loaded. API object");

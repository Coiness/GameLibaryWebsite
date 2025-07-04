import { steamapi_key } from "../config.ts"; // 修正了导入路径并移除了未使用的 steamid

type ParamValue = string | number | boolean | string[] | number[];

interface URLParams {
    [key: string]: ParamValue;
}

const combineUrlParams = (baseUrl: string, params: URLParams): string => {
    if (!params || Object.keys(params).length === 0)
        return baseUrl;

    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }

        if (Array.isArray(value)) {
            // 将数组转换为逗号分隔的字符串
            const arrayValues = value.map(item => String(item)).join(',');
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(arrayValues)}`);
        } else {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
    }

    const queryString = queryParts.join('&');
    const connector = baseUrl.includes('?') ? '&' : '?';

    return queryString ? `${baseUrl}${connector}${queryString}` : baseUrl;
};

const callSteamAPI = async (endpoint: string, params: Omit<URLParams, 'key'>) => {
    const apiParams = {
        ...params,
        key: steamapi_key
    };

    const url = combineUrlParams(`https://api.steampowered.com/${endpoint}`, apiParams);

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return res.json();
};

export const steamAPI = {
    getRecentlyPlayedGames: (steamid: string, count: number = 0) => {
        return callSteamAPI('IPlayerService/GetRecentlyPlayedGames/v1/', {
            steamid,
            count
        });
    },

    getSingleGamePlaytime(steamid: string, appid: number) {
        return callSteamAPI('IPlayerService/GetSingleGamePlaytime/v1/', {
            steamid,
            appid
        });
    },

    // 修正了 appids_filter 的类型并简化了逻辑
    getOwnedGames(steamid: string, include_appinfo: boolean = true, include_played_free_games: boolean = false, appids_filter?: number[]) {
        const params: URLParams = {
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

    getSteamLevel(steamid: string) {
        return callSteamAPI('IPlayerService/GetSteamLevel/v1/', {
            steamid
        });
    },

    getFriendList(steamid: string) {
        return callSteamAPI('ISteamUser/GetFriendList/v1/', {
            steamid
        });
    },

    getPlayersSummaries: (steamids: string[]) => {
        return callSteamAPI('ISteamUser/GetPlayerSummaries/v2/', {
            steamids
        });
    }
};

console.log("steamAPI file successfully loaded. API object")
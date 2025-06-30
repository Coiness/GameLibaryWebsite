//iplayserver接口
import { steamapi_key,steamid } from "./config";
//GET https://partner.steam-api.com/IPlayerService/GetRecentlyPlayedGames/v1/
//key,steamid,count

const GetRecentlyPlayedGames = async(key,steamid) =>{
    
    const GetRecentlyPlayedGames_url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${key}&steamid=${steamid}&count=6`;

    try{
        const res = await fetch(GetRecentlyPlayedGames_url,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })

        if(!res.ok){
            console.log(`HTTP错误`)
            throw new Error(`HTTP错误：${res.status}`);
        }

        const data = await res.json();
        console.log(data.response.games[0]);
        return data
    }catch(error){
        console.log('获取数据出错:',error)
        throw error;
    }
}

//GET https://partner.steam-api.com/ISteamUser/GetPlayerSummaries/v2/
//key,steamids

const GetPlayerSummaries = async(key,steamids)=>{
    try{
        const GetPlayerSummaries_url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamids}`

        const res = await fetch(GetPlayerSummaries_url,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })

        if(!res.ok){
            console.log("HTTP请求失败",res.status)
        }

        const data = await res.json();
        
        console.log(data)
        return data
    }catch(error){
        console.log("HTTP请求失败",error)
    }
}

//封装
GetRecentlyPlayedGames(steamapi_key,steamid);
await new Promise(resolve => setTimeout(resolve,1000));
GetPlayerSummaries(steamapi_key,steamid)
export interface game {
    appid:number;
    name:string;
    playtime_2weeks:number;
    playtime_forever:number;
    img_icon_url: string,
    playtime_windows_forever: number,
    playtime_mac_forever: number,
    playtime_linux_forever: number,
    playtime_deck_forever: number
}

export interface getRecentlyPlayedGamesResponse{
    total_count:number;
    games:game[]
}
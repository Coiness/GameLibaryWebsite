export * from './friendlist.js'
export * from './ownedgames.js'
export * from './playersummaries.js'
export * from './recentgames.js'
export * from './steamlevel.js'

export interface GameInfo{
    appid:number;
    name:string;
    playtime_forever:number;
    img_icon_url:string;
    playtime_2weeks?:number;
}
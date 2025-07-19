export * from './friendlist.ts'
export * from './ownedgames.ts'
export * from './playersummaries.ts'
export * from './recentgames.ts'
export * from './steamlevel.ts'

export interface GameInfo{
    appid:number;
    name:string;
    playtime_forever:number;
    img_icon_url:string;
    playtime_2weeks?:number;
}
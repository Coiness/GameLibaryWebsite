export interface PlayerSummary {
    /** 玩家的64位SteamID */
    steamid: string;
    /** 个人资料的可见性状态。1=私密, 2=仅好友可见, 3=公开 */
    communityvisibilitystate: number;
    /** 如果设置了个人资料，则为1 */
    profilestate: number;
    /** 玩家的昵称 */
    personaname: string;
    /** 个人资料页的URL */
    profileurl: string;
    /** 32x32像素头像的URL */
    avatar: string;
    /** 64x64像素头像的URL */
    avatarmedium: string;
    /** 184x184像素头像的URL */
    avatarfull: string;
    /** 头像的哈希值 */
    avatarhash: string;
    /** 玩家最后下线的Unix时间戳 */
    lastlogoff: number;
    /** 玩家的在线状态。0=离线, 1=在线, 2=忙碌, 3=离开, 4=打盹, 5=想交易, 6=想玩 */
    personastate: number;
    /** 玩家的主要部落ID (可选) */
    primaryclanid?: string;
    /** 账户创建的Unix时间戳 (可选) */
    timecreated?: number;
    /** 玩家状态的附加标志 */
    personastateflags: number;
    /** 如果正在游戏中，显示游戏名称 (可选) */
    gameextrainfo?: string;
    /** 如果正在游戏中，显示游戏的AppID (可选) */
    gameid?: string;
    /** 玩家所在国家的ISO 3166-1代码 (可选) */
    loccountrycode?: string;
    /** 评论权限 (如果可用) */
    commentpermission?: number;
}

/**
 * 代表 GetPlayerSummaries API 返回的顶层响应结构
 */
export interface GetPlayerSummariesResponse {
    response: {
        players: PlayerSummary[];
    };
}
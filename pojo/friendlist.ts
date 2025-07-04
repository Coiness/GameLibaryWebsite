export interface friend{
    steamid:string;
    relationship:string;
    friend_since:number;
}

export interface friendslist{
    friends:friend[];
}

export interface GetFriendListResponse{
    friendlist:friendslist
}


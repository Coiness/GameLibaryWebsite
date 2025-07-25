/**
 * 数据加载与初始化
 * 1.【完成】异步加载所有json文件
 * 2.【完成】数据整合处理，将所有的游戏整合为一个统一的游戏列表
 * 
 * 页面内容填充
 * 1.【更改实现方式】填充个人信息卡片 头像 名字 好友代码
 * 2.填充我的游戏库模块 小图标无限滚动 
 * 3.填充游戏时长统计模块 遍历计算total_time 可以在数据整合处计算
 * 4.填充最近两周模块 动态创建div 胶囊图+游戏最近游戏时长+总游戏时长+进度条展示
 * 
 * 用户交互响应
 * 1.实现导航栏滚动变色
 * 2.实现导航栏平滑滚动
 * 3.实现好友代码点击复制功能
 * 4.实现数据查询与排序功能
 */


/**
 * code review
 * 1.职责分离，不要在populateGames函数中统计数据
 * 2.全局变量问题
 * 3.DOM节点的重复查询问题
 * 4.事件监听器的代码重复
 */

//接口定义

interface GameInfo{
    appid:number;
    name:string;
    playtime_forever:number;
    img_icon_url:string;
    playtime_2weeks?:number;
}

interface AppData{
    allGames:GameInfo[];
}

interface StatsData{
    gamesNumber:number;
    totalPlaytimeMins:number;
    recentPlaytimeMins:number;
    maxPlaytimeForever:number;
    maxPlaytimeRecent:number;
}

//模块化函数

async function loadAllData():Promise<AppData>{
    try{
        const [allGames] = await Promise.all([fetch('/src/data/allGames.json')
            .then(res => res.json())
        ])

        return{allGames};
    }catch (error){
        console.log("数据加载出错",error)
        throw new Error("加载数据出错")
    }
}

//从游戏数据中计算统计信息
function calculateStats(games:GameInfo[]):StatsData{
//     使用for循环实现
//     let ans:StatsData = {
//         gamesNumber:0,
//         totalPlaytimeMins:0,
//         recentPlaytimeMins:0,
//         maxPlaytimeForever:0,
//         maxPlaytimeRecent:0
//     }
//     for(const game of games){
//         ans.gamesNumber++;
//         ans.totalPlaytimeMins+=game.playtime_forever
//         ans.recentPlaytimeMins += game.playtime_2weeks ?? 0
//         ans.maxPlaytimeForever = Math.max(ans.maxPlaytimeForever,game.playtime_forever)
//         ans.maxPlaytimeRecent = Math.max(ans.maxPlaytimeRecent,game.playtime_2weeks??0)
//     }
//     return ans;
// 

//     使用reduce实现
    return games.reduce((stats,game) => {
        // 'stats' 就是上一次循环返回的累加器对象
        // 'game' 是当前正在处理的游戏,games的遍历对象
        stats.gamesNumber++
        stats.totalPlaytimeMins += game.playtime_forever
        stats.recentPlaytimeMins += game.playtime_2weeks ?? 0
        stats.maxPlaytimeForever = Math.max(stats.maxPlaytimeForever,game.playtime_forever)
        stats.maxPlaytimeRecent = Math.max(stats.maxPlaytimeRecent,game.playtime_2weeks??0)
        return stats
    },{ 
        // reduce中第一个参数stats的初始值
        gamesNumber:0,
        totalPlaytimeMins:0,
        recentPlaytimeMins:0,
        maxPlaytimeForever:0,
        maxPlaytimeRecent:0,
    }
    )

}

function displayStats(stats:StatsData){
    try{
        const span_games_number = document.getElementById("games_number")
        const span_total_playtime = document.getElementById("total_playtime")
        const span_recent_playtime = document.getElementById("recent_playtime")

        if(span_games_number) span_games_number.textContent = `${stats.gamesNumber}`
        if(span_total_playtime) span_total_playtime.textContent = `${(stats.totalPlaytimeMins /60).toFixed(1)}`
        if(span_recent_playtime) span_recent_playtime.textContent = `${(stats.recentPlaytimeMins / 60).toFixed(1)}`
    }catch(error){
        console.log("增加统计数据时出错",error)
    }
}

function populateGameIcons(allGames:GameInfo[]){
    try{
        const scroller = document.getElementById("game-icon-scroller")
        if(!scroller){
            console.log("未找到id为game-icon-scroller的元素")
            return
        }
        
        // 1. 创建内部包裹层
        const scrollerInner = document.createElement('div');
        scrollerInner.className = 'scroller__inner';

        // 2. 创建一个文档片段来高效地添加元素
        const fragment = document.createDocumentFragment();
        for(const game of allGames){
            const icon = document.createElement("img");

            icon.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`;
            icon.alt = game.name;
            icon.title = game.name;
            icon.className = 'game-icon';
            icon.loading = 'lazy'; // 懒加载图片

            fragment.appendChild(icon);
        }

        // 3. 复制并添加两遍图标，以实现无缝滚动
        scrollerInner.appendChild(fragment.cloneNode(true));
        scrollerInner.appendChild(fragment.cloneNode(true));

        // 4. 将包裹层添加到主容器中
        scroller.appendChild(scrollerInner);

    }catch(error){
        console.log("小图标创建失败",error)
    }
}

function createGameItem(Game:GameInfo,maxLogPlaytimeforever:number,maxLogPlaytimerecent:number):HTMLElement{
    const item = document.createElement("div");
    item.className = "game-item"

    const playtime_forever_hour = (Game.playtime_forever / 60).toFixed(1)
    const playtime_recent_hour = (Game.playtime_2weeks?(Game.playtime_2weeks/60).toFixed(1):0) 

    item.dataset.totalplaytime = `${playtime_forever_hour}`;
    item.dataset.recentplaytime = `${playtime_recent_hour}`;

    const icon = document.createElement("img")
    icon.src = `http://media.steampowered.com/steam/apps/${Game.appid}/header.jpg`
    icon.alt = Game.name
    icon.className = 'game-item__icon'
    icon.loading = 'lazy'

    const game_info = document.createElement("div")
    game_info.className = "game-item__info"

    const name = document.createElement("div")
    name.textContent = Game.name
    name.className = "game-item__name"

    const playtime_f = document.createElement("div")
    playtime_f.className="game-item__playtime game-item__playtime--forever"
    playtime_f.textContent = `总游戏时长：${playtime_forever_hour}h`

    const playtime_r = document.createElement("div")
    playtime_r.className="game-item__playtime game-item__playtime--recent"
    playtime_r.textContent = `最近两周游戏时长：${playtime_recent_hour}h`

    const progressBarForever = document.createElement("div");
    progressBarForever.className = "progress-bar"


    /* 进度条 */
    const progressBarFillForever = document.createElement("div");
    progressBarFillForever.className = "progress-bar__fill progress-bar__fill--forever"
    const GameLogPlaytimeForever = Math.log(Game.playtime_forever + 1)
    const progressPercentForever = maxLogPlaytimeforever > 0? (GameLogPlaytimeForever/maxLogPlaytimeforever)*100:0;
    progressBarFillForever.style.width = `${progressPercentForever}%`


    const progressBarRecent = document.createElement("div");
    progressBarRecent.className = "progress-bar"

    const progressBarFillRecent = document.createElement("div");
    progressBarFillRecent.className = "progress-bar__fill progress-bar__fill--recent"
    const GameLogPlaytimeRecent = Math.log(Game.playtime_2weeks?(Game.playtime_2weeks+1):1)
    const progressPercentRecent = maxLogPlaytimerecent > 0 ?(GameLogPlaytimeRecent/maxLogPlaytimerecent)*100:0;
    progressBarFillRecent.style.width = `${progressPercentRecent}%`

    progressBarForever.append(progressBarFillForever)
    progressBarRecent.append(progressBarFillRecent)

    game_info.append(name,playtime_f,progressBarForever,playtime_r,progressBarRecent)

    item.append(icon,game_info)
    return item;
}

function createGameItemList(stats:StatsData,allGames:GameInfo[],container:HTMLElement){
    try{
        if(!container){
            console.log("未找到id为game-item-list的元素")
            return
        }
        const fragment = document.createDocumentFragment();

        const maxLogPlaytimeforever = Math.log(stats.maxPlaytimeForever+1)
        const maxLogPlaytimerecent = Math.log(stats.maxPlaytimeRecent+1)
        for(const game of allGames){
            fragment.append(createGameItem(game,maxLogPlaytimeforever,maxLogPlaytimerecent));
        }
        container.append(fragment)
    }catch(error){
        console.log("游戏列表创建失败",error)
    }
}

function sortGameList(container:HTMLElement,sortBy:'totalplaytime'|'recentplaytime'){
    const items = Array.from(container.querySelectorAll('.game-item')) as HTMLElement[];

    items.sort((a,b)=>{
        const timeA = Number(a.dataset[sortBy] || 0);
        const timeB = Number(b.dataset[sortBy]||0);
        return timeB - timeA;
    })

    items.forEach(items => container.appendChild(items))
}

function setupNavbarScrollEffect(){
    const header = document.querySelector('header');
    if(!header) return; 
    console.log("1")

    window.addEventListener('scroll',()=>{
        if(window.scrollY > 150){
            header.classList.add('scrolled')
        }else{
            header.classList.remove('scrolled')
        }
    })
}

function handlesteamid(mySteamFriendId:number,div_steamfriendid:HTMLElement,isCopying:boolean){
    if(isCopying) return
    const idToCopy = div_steamfriendid?.textContent
    if(!idToCopy){
        console.log("好友代码区块里一定要有好友代码")
        return
    }

    navigator.clipboard.writeText(idToCopy).then(()=>{
        const originalContent = `${mySteamFriendId}`;
        div_steamfriendid.textContent = '成功复制';
        div_steamfriendid.classList.add('copied');
        isCopying = true;

        setTimeout(()=>{
            div_steamfriendid.textContent = originalContent;
            div_steamfriendid.classList.remove("copied");
            isCopying = false;
        },1500)
    })
}

function debounce<T extends(...args:any[])=>void>(
    func:T ,
    delay:number
):(this:ThisParameterType<T>,...args:Parameters<T>) => void{
    let timeoutId: number|undefined;
    return function(this:ThisParameterType<T>,...args:Parameters<T>){
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(()=>{
            func.apply(this,args);
        },delay)
    }
}

async function main(){
    try{
        console.log("程序开始执行")
        //1.加载数据
        const{allGames} = await loadAllData();
        const mySteamFriendId= 1085391635
        let isCopying = false;

        //2.统一进行DOM节点查询
        const gameListContainer = document.getElementById('game-list-container')
        const sortTotalButton = document.getElementById('sort-by-total')
        const sortRecentButton = document.getElementById('sort-by-recent')
        const div_steamfriendid = document.getElementById('steamfriendid')

        //3.统计数据
        const stats = calculateStats(allGames)
        displayStats(stats)

        //4.渲染游戏库图片
        populateGameIcons(allGames)

        //5.渲染游戏列表并设置监听
        if(gameListContainer){

            createGameItemList(stats,allGames,gameListContainer);

            sortGameList(gameListContainer,'totalplaytime')

            const handleSortClick = (sortBy:'totalplaytime'|'recentplaytime',clickedButton:HTMLElement)=>{
                sortGameList(gameListContainer,sortBy)
                document.querySelector('.sort-button.active')?.classList.remove('active');
                clickedButton.classList.add('active')
            }

            sortTotalButton?.addEventListener('click',() => handleSortClick('totalplaytime',sortTotalButton))
            sortRecentButton?.addEventListener('click',() => handleSortClick('recentplaytime',sortRecentButton))
            
        }

        //6.其他的事件监听
        setupNavbarScrollEffect();
        div_steamfriendid?.addEventListener('click',()=>handlesteamid(mySteamFriendId,div_steamfriendid,isCopying))
    }catch(error){
        console.log("main.js出错",error)
    }
}

main();

export{}

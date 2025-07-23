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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var total_playtime_mins = 0;
var recent_playtime_mins = 0;
var games_number = 0;
var max_playtime_forever = 0;
var max_playtime_recent = 0;
function loadAllData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [allGames] = yield Promise.all([fetch('/src/data/allGames.json')
                    .then(res => res.json())
            ]);
            return { allGames };
        }
        catch (error) {
            console.log("数据加载出错", error);
            throw new Error("加载数据出错");
        }
    });
}
function populateGameIcons(allGames) {
    try {
        const scroller = document.getElementById("game-icon-scroller");
        if (!scroller) {
            console.log("未找到id为game-icon-scroller的元素");
            return;
        }
        // 1. 创建内部包裹层
        const scrollerInner = document.createElement('div');
        scrollerInner.className = 'scroller__inner';
        // 2. 创建一个文档片段来高效地添加元素
        const fragment = document.createDocumentFragment();
        for (const game of allGames) {
            //顺便统计几个数据
            games_number++;
            total_playtime_mins += game.playtime_forever;
            if (max_playtime_forever < game.playtime_forever) {
                max_playtime_forever = game.playtime_forever;
                console.log("max_playtime_forever:", max_playtime_forever);
            }
            if (game.playtime_2weeks) {
                recent_playtime_mins += game.playtime_2weeks;
                max_playtime_recent = (max_playtime_recent - game.playtime_2weeks) > 0 ? max_playtime_recent : game.playtime_2weeks;
                console.log("max_playtime_recent:", max_playtime_recent);
            }
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
    }
    catch (error) {
        console.log("小图标创建失败", error);
    }
}
function add_some_data() {
    try {
        const span_games_number = document.getElementById("games_number");
        const span_total_playtime = document.getElementById("total_playtime");
        const span_recent_playtime = document.getElementById("recent_playtime");
        if (!span_games_number) {
            console.log("未找到id为span_games_number的元素");
            return;
        }
        if (!span_total_playtime) {
            console.log("未找到id为total_playtime的元素");
            return;
        }
        if (!span_recent_playtime) {
            console.log("未找到id为recent_playtime的元素");
            return;
        }
        const total_playtime_hours = (total_playtime_mins / 60).toFixed(1);
        const recent_playtime_hours = (recent_playtime_mins / 60).toFixed(1);
        span_games_number.textContent = `${games_number}`;
        span_total_playtime.textContent = `${total_playtime_hours}`;
        span_recent_playtime.textContent = `${recent_playtime_hours}`;
    }
    catch (error) {
        console.log("增加统计数据时出错", error);
    }
}
function createGameItem(Game, maxLogPlaytimeforever, maxLogPlaytimerecent) {
    const item = document.createElement("div");
    item.className = "game-item";
    const playtime_forever_hour = (Game.playtime_forever / 60).toFixed(1);
    const playtime_recent_hour = (Game.playtime_2weeks ? (Game.playtime_2weeks / 60).toFixed(1) : 0);
    item.dataset.totalplaytime = `${playtime_forever_hour}`;
    item.dataset.recentplaytime = `${playtime_recent_hour}`;
    const icon = document.createElement("img");
    icon.src = `http://media.steampowered.com/steam/apps/${Game.appid}/header.jpg`;
    icon.alt = Game.name;
    icon.className = 'game-item-icon';
    icon.loading = 'lazy';
    const game_info = document.createElement("div");
    game_info.className = "game-item-info";
    const name = document.createElement("div");
    name.textContent = Game.name;
    name.className = "game-item-name";
    const playtime_f = document.createElement("div");
    playtime_f.className = "game-item-time_forever";
    playtime_f.textContent = `总游戏时长：${playtime_forever_hour}h`;
    const playtime_r = document.createElement("div");
    playtime_r.className = "game-item-time_recent";
    playtime_r.textContent = `最近两周游戏时长：${playtime_recent_hour}h`;
    const progressBarForever = document.createElement("div");
    progressBarForever.className = "progess-bar";
    const progressBarFillForever = document.createElement("div");
    progressBarFillForever.className = "progress-bar-fill-forever";
    const GameLogPlaytimeForever = Math.log(Game.playtime_forever + 1);
    const progressPercentForever = maxLogPlaytimeforever > 0 ? (GameLogPlaytimeForever / maxLogPlaytimeforever) * 100 : 0;
    progressBarFillForever.style.width = `${progressPercentForever}%`;
    const progressBarRecent = document.createElement("div");
    progressBarRecent.className = "progess-bar";
    const progressBarFillRecent = document.createElement("div");
    progressBarFillRecent.className = "progress-bar-fill-recent";
    const GameLogPlaytimeRecent = Math.log(Game.playtime_2weeks ? (Game.playtime_2weeks + 1) : 1);
    const progressPercentRecent = maxLogPlaytimerecent > 0 ? (GameLogPlaytimeRecent / maxLogPlaytimerecent) * 100 : 0;
    progressBarFillRecent.style.width = `${progressPercentRecent}%`;
    progressBarForever.append(progressBarFillForever);
    progressBarRecent.append(progressBarFillRecent);
    game_info.append(name, playtime_f, progressBarForever, playtime_r, progressBarRecent);
    item.append(icon, game_info);
    return item;
}
function createGameItemList(allGames, container) {
    try {
        if (!container) {
            console.log("未找到id为game-item-list的元素");
            return;
        }
        const fragment = document.createDocumentFragment();
        const maxLogPlaytimeforever = Math.log(max_playtime_forever + 1);
        const maxLogPlaytimerecent = Math.log(max_playtime_recent + 1);
        for (const game of allGames) {
            fragment.append(createGameItem(game, maxLogPlaytimeforever, maxLogPlaytimerecent));
        }
        container.append(fragment);
    }
    catch (error) {
        console.log("游戏列表创建失败", error);
    }
}
function sortGameList(container, sortBy) {
    const items = Array.from(container.querySelectorAll('.game-item'));
    items.sort((a, b) => {
        const timeA = Number(a.dataset[sortBy] || 0);
        const timeB = Number(b.dataset[sortBy] || 0);
        return timeB - timeA;
    });
    items.forEach(items => container.appendChild(items));
}
function setupNavbarScrollEffect() {
    const header = document.querySelector('header');
    if (!header)
        return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            header.classList.add('scrolled');
        }
        else {
            header.classList.remove('scrolled');
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            console.log("程序开始执行");
            const { allGames } = yield loadAllData();
            setupNavbarScrollEffect();
            populateGameIcons(allGames);
            add_some_data();
            const gameListContainer = document.getElementById('game-list-container');
            if (gameListContainer) {
                console.log("找到了container");
                createGameItemList(allGames, gameListContainer);
                sortGameList(gameListContainer, 'totalplaytime');
                (_a = document.getElementById('sort-by-total')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                    var _a, _b;
                    sortGameList(gameListContainer, 'totalplaytime');
                    (_a = document.querySelector('.sort-button.active')) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
                    (_b = document.getElementById('sort-by-total')) === null || _b === void 0 ? void 0 : _b.classList.add('active');
                });
                (_b = document.getElementById('sort-by-recent')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
                    var _a, _b;
                    sortGameList(gameListContainer, 'recentplaytime');
                    (_a = document.querySelector('.sort-button.active')) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
                    (_b = document.getElementById('sort-by-recent')) === null || _b === void 0 ? void 0 : _b.classList.add('active');
                });
                (_c = document.getElementById('steamfriendid')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
                    const div_steamfriendid = document.getElementById('steamfriendid');
                    const idToCopy = div_steamfriendid === null || div_steamfriendid === void 0 ? void 0 : div_steamfriendid.textContent;
                    if (!idToCopy) {
                        console.log("好友代码区块里一定要有好友代码");
                        return;
                    }
                    navigator.clipboard.writeText(idToCopy).then(() => {
                        const originalContent = div_steamfriendid.textContent;
                        div_steamfriendid.textContent = '成功复制';
                        div_steamfriendid.classList.add('copied');
                        setTimeout(() => {
                            div_steamfriendid.textContent = originalContent;
                            div_steamfriendid.classList.remove("copied");
                        }, 1500);
                    });
                });
            }
        }
        catch (error) {
            console.log("main.js出错", error);
        }
    });
}
main();
export {};

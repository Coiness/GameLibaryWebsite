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
        const fragment = document.createDocumentFragment();
        for (const game of allGames) {
            const icon = document.createElement("img");
            icon.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`;
            icon.alt = game.name;
            icon.title = game.name;
            icon.className = 'game-icon';
            icon.loading = 'lazy';
            icon.onerror = () => icon.remove;
            fragment.appendChild(icon);
        }
        scroller.appendChild(fragment);
    }
    catch (error) {
        console.log("小图标创建失败", error);
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("程序开始执行");
            const { allGames } = yield loadAllData();
            populateGameIcons(allGames);
        }
        catch (error) {
            console.log("main.js出错", error);
        }
    });
}
main();
export {};

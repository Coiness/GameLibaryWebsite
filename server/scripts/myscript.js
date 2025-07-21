var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { s_friendlists, s_ownedgames, s_playersummaries, s_recentgames, s_steamlevel, m_games } from "./fetchsript/index.ts";
//依次轮询数据内容
//将数据分离开来，不同的接口用不同的文件存储
//因为一起存储在覆盖这方面可能会出问题
//分开存储还可以选择性地更新数据，降低耦合性
//脚本请求是不是也要分开？
const s_queue = [
    s_friendlists,
    s_ownedgames,
    s_playersummaries,
    s_recentgames,
    s_steamlevel
];
function myscripts(s_queue) {
    return __awaiter(this, void 0, void 0, function* () {
        /*while(s_queue.length > 0){
            const scriptToRun = s_queue.shift();
    
            if(scriptToRun){
                try{
                    console.log(`[${new Date().toLocaleTimeString()}] Running script: ${scriptToRun.name}`);
                    await scriptToRun();
                    console.log(`[${new Date().toLocaleTimeString()}] Finished script: ${scriptToRun.name}`);
                    await new Promise(resolve => setTimeout(resolve,1000))
                }catch(error){
                    console.error(`[${new Date().toLocaleTimeString()}] Error in script: ${scriptToRun.name}. Re-queuing.`, error);
                    s_queue.push(scriptToRun);
                    await new Promise(resolve => setTimeout(resolve,5000))
                }
            }
        }*/
        m_games();
        console.log("脚本执行完毕");
    });
}
myscripts([...s_queue]);

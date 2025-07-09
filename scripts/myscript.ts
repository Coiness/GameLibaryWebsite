import { steamAPI } from "./steamAPI.ts";
import {}from "./../pojo/index.ts"
import {Console} from 'node:console';
import * as fs from 'node:fs'

const errorOutput = fs.createWriteStream('./../src/data/script_err.log')

//依次轮询数据内容
//将数据分离开来，不同的接口用不同的文件存储
//因为一起存储在覆盖这方面可能会出问题
//分开存储还可以选择性地更新数据，降低耦合性

//脚本请求是不是也要分开？

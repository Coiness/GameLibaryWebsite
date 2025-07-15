/**
 * 通用守卫元素
 * 
 * 泛型和元编程
 * 
 * function(object,interfaceName)不可行，因为ts的类型在编译后会被完全擦除，最终在JS运行时是不存在的。
 * 为了解决这个问题，我们需要在运行时创建一个真实存在的值，这个值能够描述我们期待的接口结构。
 * 最简单的方法就创建一个形状对象，形状对象的键是属性名，值是类型名（字符串形式）
 */

import { error } from "node:console";

/**
 * 这是一个通用的、可复用的类型守卫函数
 * 它通过一个“形状对象”来验证一个未知对象的结构
 * @param obj 要验证的对象
 * @param shape 应该描述期望结构的“形状对象”，键是属性名，值是类型字符串
 * @returns 如果对象符合形状，则返回true
 */

// export function isOfType<T>(
//     obj:any,
//     shape:{[K in keyof T]:'string'|'number'|'boolean'|'object'}
// ):obj is T{
//     //必须是一个非 null 对象
//     if(typeof obj !== 'object' || obj ===null){
//         return false;
//     }

//     for(const key in shape){
//         if(typeof obj[key] !== shape[key]){
//             return false;
//         }
//     }
//     return true
// }

/**
 * obj is T 是语法保证，告诉ts如果返回true，保证obj是类型T
 * 
 * 形状对象定义：
 * keyofT 索引类型查询 操作符:获取类型T的所有公共属性名，并把他们组成一个联合类型
 * 什么是联合类型：也就是K:string|number，使用|连接的这种，K只能是他们其中的一种
 * keyof A的结果就是 "a"|"b"|"c"|"d"（假设abcd是类A的属性名）
 * 那么任何一个类型为 keyof A的变量，它的值必须是 "a"、"b"、"c"、"d"这些字符串中的某一个，而不能是其他的字符串
 */


/**
 * 上面的类型守卫函数是一个很基础的类型守卫函数，只能检查四种基本类型的对象。
 * 而对于我自定义的类型，无法检查，所以需要更强的，可递归的类型守卫
 */

// 定义一个更强大的“形状”类型
// type Shape = {
//     [key: string]: 'string' | 'number' | 'boolean' | Shape | [Shape] | ['string'] | ['number'] | ['boolean'];
// };

// /**
//  * 递归的、可处理嵌套对象和数组的通用类型守卫
//  * @param obj 要验证的未知对象
//  * @param shape 描述期望结构的“形状对象”
//  */
// export function isDeepType(obj: any, shape: Shape): boolean {
//     // 检查 obj 是否为非 null 对象
//     if (typeof obj !== 'object' || obj === null) {
//         return false;
//     }

//     // 遍历形状定义中的每一个期望的键
//     for (const key in shape) {
//         const shapeValue = shape[key];
//         const objValue = obj[key];

//         // 检查对象中是否存在这个键
//         if (!(key in obj)) {
//             return false;
//         }

//         // 情况1: 期望的是一个数组
//         if (Array.isArray(shapeValue)) {
//             const arrayShape = shapeValue[0];
//             if (!Array.isArray(objValue)) return false; // obj 的值也必须是数组

//             // 检查数组中的每一个元素
//             for (const item of objValue) {
//                 if (typeof arrayShape === 'string') {
//                     // 如果期望的是基本类型数组 (e.g., ['string'])
//                     if (typeof item !== arrayShape) return false;
//                 } else {
//                     // 如果期望的是对象数组 (e.g., [ { id: 'number' } ])
//                     // 递归调用 isDeepType 来检查数组中的每个对象
//                     if (!isDeepType(item, arrayShape)) return false;
//                 }
//             }
//         } 
//         // 情况2: 期望的是一个嵌套对象
//         else if (typeof shapeValue === 'object' && shapeValue !== null) {
//             // 递归调用 isDeepType 来检查这个嵌套对象
//             if (!isDeepType(objValue, shapeValue)) return false;
//         } 
//         // 情况3: 期望的是一个基本类型
//         else {
//             if (typeof objValue !== shapeValue) {
//                 return false;
//             }
//         }
//     }

//     return true; // 所有检查都通过了
// }

// 检查时，是typeof objValue和shapeValue进行对比，因为shapeValue存储的是类型
// 函数思路
//1.通过key来遍历shape，并查询obj中是否包含key
//2.通过shapeValue和typeof objValue判断二者类型是否相同
//3.遇到数组时，shapeValue = shape[key]同样也应该是数组类型，包含相同的结构
//以shape[key][0]也就是shapeValue[0]作为数组里的判断依据,也就是arrayshape
//4.遇到对象时，递归验证
//5.普通基本类型，typeof objValue === shapeValue

export type Shape = {
    [key:string]:'string'|'number'|'boolean'|Shape|[Shape]|['string']|['number']|['boolean'];
}

// ...existing code...
export function isDeepType(
    obj:any,
    shape:Shape
): boolean { // 明确返回类型为 boolean
    //检查空类型
    if(typeof obj !== "object" || obj === null){
        return false    
    }

    for(const shapeKey in shape){
        let realKey = shapeKey;
        const isOptional = shapeKey.endsWith('?');

        if (isOptional) {
            realKey = shapeKey.slice(0, -1); // 移除末尾的 '?' 获取真实键名
        }

        // 如果键是可选的，并且在对象中不存在，则跳过此键的检查
        if (isOptional && !(realKey in obj)) {
            continue;
        }

        // 如果键是必需的，但对象中不存在，则验证失败
        if (!(realKey in obj)) {
            throw new Error(`对象中不存在键${shapeKey}`)
            return false;
        }

        const objValue = obj[realKey];
        const shapeValue = shape[shapeKey];

        if(Array.isArray(shapeValue)){
            if(!(Array.isArray(objValue))){
                throw new Error(`对象的键不是数组${shapeKey}`)
                return false
            }

            const arrayShape = shapeValue[0];
            for(const item of objValue){
                if(typeof arrayShape === "string"){
                    if(typeof item !== arrayShape){
                        throw new Error(`对象中的键类型不匹配${shapeKey}`)
                        return false
                    }
                }else{
                    // 递归检查数组中的对象
                    if(!(isDeepType(item, arrayShape as Shape))){
                        throw new Error(`递归检查未通过${shapeKey}`)
                        return false
                    }
                }
            }
        }else if(typeof shapeValue === 'object' && shapeValue !== null && !Array.isArray(shapeValue)){
            // 递归检查嵌套对象
            if(!(isDeepType(objValue, shapeValue as Shape))){
                throw new Error(`递归检查未通过${shapeKey}`)
                return false
            }
        }else{
            // 检查基本类型
            if(typeof objValue !== shapeValue){
                throw new Error(`基本类型检查未通过${shapeKey}`)
                return false;
            }
        }
    }


    return true
}

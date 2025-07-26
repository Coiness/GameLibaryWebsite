/**
 * 通用守卫元素
 *
 * 泛型和元编程
 *
 * function(object,interfaceName)不可行，因为ts的类型在编译后会被完全擦除，最终在JS运行时是不存在的。
 * 为了解决这个问题，我们需要在运行时创建一个真实存在的值，这个值能够描述我们期待的接口结构。
 * 最简单的方法就创建一个形状对象，形状对象的键是属性名，值是类型名（字符串形式）
 */
// ...existing code...
export function isDeepType(obj, shape) {
    //检查空类型
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    for (const shapeKey in shape) {
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
            throw new Error(`对象中不存在键${shapeKey}`);
            return false;
        }
        const objValue = obj[realKey];
        const shapeValue = shape[shapeKey];
        if (Array.isArray(shapeValue)) {
            if (!(Array.isArray(objValue))) {
                throw new Error(`对象的键不是数组${shapeKey}`);
                return false;
            }
            const arrayShape = shapeValue[0];
            for (const item of objValue) {
                if (typeof arrayShape === "string") {
                    if (typeof item !== arrayShape) {
                        throw new Error(`对象中的键类型不匹配${shapeKey}`);
                        return false;
                    }
                }
                else {
                    // 递归检查数组中的对象
                    if (!(isDeepType(item, arrayShape))) {
                        throw new Error(`递归检查未通过${shapeKey}`);
                        return false;
                    }
                }
            }
        }
        else if (typeof shapeValue === 'object' && shapeValue !== null && !Array.isArray(shapeValue)) {
            // 递归检查嵌套对象
            if (!(isDeepType(objValue, shapeValue))) {
                throw new Error(`递归检查未通过${shapeKey}`);
                return false;
            }
        }
        else {
            // 检查基本类型
            if (typeof objValue !== shapeValue) {
                throw new Error(`基本类型检查未通过${shapeKey}`);
                return false;
            }
        }
    }
    return true;
}

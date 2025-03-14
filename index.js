import webSnap from './web-snap.js';

// 添加单例实例变量
let instance = null;

class WebSnap {

    /**
     * 初始化WebSnap
     * @param {WebSnapConfig} config - 配置选项
     */
    static init(config = {}) {
        if (!instance) {
            instance = new webSnap(config);
        }
    }

    // 添加常用方法的静态版本
    /**
     * 添加元素历史记录
     * @param {...any} args - 传递给实例方法的参数
     * @returns {Promise} 返回实例方法的执行结果
     * @throws {Error} 如果实例未初始化则抛出错误
     */
    static addElementHistory(...args) {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.addElementHistory(...args);
    }

    /**
     * 获取元素历史记录
     * @param {...any} args - 传递给实例方法的参数
     * @returns {Promise} 返回实例方法的执行结果
     * @throws {Error} 如果实例未初始化则抛出错误
     */
    static getElementHistory(...args) {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.getElementHistory(...args);
    }
    /**
     * 获取所有历史记录
     * @returns {Promise} 返回所有历史记录的结果
     * @throws {Error} 如果实例未初始化则抛出错误
     */
    static getAllHistory() {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.getAllHistory();
    }
    /**
     * 获取存储的键列表
     * @returns {Promise} 返回存储键列表的结果
     * @throws {Error} 如果实例未初始化则抛出错误
     */
    static getStoreKeys() {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.getStoreKeys();
	}
	
	/**
	 * 获取存储的键信息
	 * @returns {Promise} 返回存储键信息的结果
	 * @throws {Error} 如果实例未初始化则抛出错误
	 */
	static getStoreKeysInfo() {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.getStoreKeysInfo();
	}
	
	/**
	 * 获取分组后的键列表
	 * @returns {Promise} 返回分组后的键列表的结果
	 * @throws {Error} 如果实例未初始化则抛出错误	
	 */
	static getStoreKeysGroupedByUser(...args) {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.getStoreKeysGroupedByUser(...args);
	}

	/**
	 * 获取过滤后的分页记录
	 * @returns {Promise} 返回过滤后的分页记录的结果
	 * @throws {Error} 如果实例未初始化则抛出错误
	 */
	static getFilteredPaginatedRecords(...args) {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.getFilteredPaginatedRecords(...args);
    }
	
    /**
	 * 删除元素历史记录
	 * @param {...any} args - 传递给实例方法的参数
	 * @returns {Promise} 返回实例方法的执行结果
	 * @throws {Error} 如果实例未初始化则抛出错误
	 */
    static deleteElementHistory(...args) {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.deleteElementHistory(...args);
    }

	/**
	 * 清空所有历史记录
	 * @returns {Promise} 返回实例方法的执行结果
	 * @throws {Error} 如果实例未初始化则抛出错误
	 */
    static clearAllHistory() {
        if (!instance) {
            throw new Error('WebSnap instance not initialized. Please call WebSnap.init() first.');
        }
        return instance.clearAllHistory();
    }
}

// 导出WebSnap类
export default WebSnap;
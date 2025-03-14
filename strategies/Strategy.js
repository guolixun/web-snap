/*
 * @Author: Bennent_G
 * @Date: 2025-02-19 18:38:54
 * @LastEditTime: 2025-02-27 12:00:52
 * @Description: 
 */
class Strategy {
    getID(element) {
        throw new Error('Strategy method not implemented');
    }
    getValue(element) {
        throw new Error('Strategy method not implemented');
    }
    getClickID(eventEl) {
        throw new Error('Strategy method not implemented');
    }
}

export default Strategy;
import Strategy from './Strategy.js';

class LibraryCStrategy extends Strategy {
    getName(element) {
        if (element.type === 'radio') {
            return this.getRadioGroupNameC(element);
        }
        return element.id || element.name;
    }

    getRadioGroupNameC(element) {
        // 实现 Library C 的逻辑
        return element.id || element.name;
    }
}

export default LibraryCStrategy;
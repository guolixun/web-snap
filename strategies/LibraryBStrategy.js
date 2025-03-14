import Strategy from './Strategy.js';

class LibraryBStrategy extends Strategy {
    getName(element) {
        if (element.type === 'radio') {
            return this.getRadioGroupNameB(element);
        }
        return element.id || element.name;
    }

    getRadioGroupNameB(element) {
        // 实现 Library B 的逻辑
        return element.id || element.name;
    }
}

export default LibraryBStrategy;
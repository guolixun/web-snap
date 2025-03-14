/*
 * @Author: Bennent_G
 * @Date: 2025-02-19 18:38:54
 * @LastEditTime: 2025-03-12 14:17:21
 * @Description: 
 */
import Strategy from './Strategy.js';

class ElementPlusStrategy extends Strategy {
	/**
	 * 获取元素的名称，根据元素类型调用相应的获取名称的方法。
	 * @param {HTMLElement} element - 目标元素对象
	 * @returns {string} - 元素的名称
	 */
	getID(element) {
		const { type } = element;
		if (type === 'radio') {
			return this.getRadioGroupName(element);
		}
		if (type === 'checkbox' && !element.id) {
			return this.getCheckboxGroupName(element);
		}
		return element.id || element.name;
	}

	/**
	 * 获取元素的值，根据元素类型调用相应的获取值的方法。
	 * @param {HTMLElement} element - 目标元素对象
	 * @returns {string | Array} - 元素的值或复选框的值数组
	 */
	getValue(element) {
		const { type } = element;
		if (type === 'checkbox') {
			return this.getCheckboxGroupValues(element);
		}
		return element.value;
	}

	/**
	 * 获取元素的标签名。
	 * @param {HTMLElement} element - 目标元素对象
	 * @returns {string} - 元素的标签名
	*/
	getClickID(eventEl) {
		// 过滤表单元素
		// if (eventEl.target.tagName.toLowerCase() === 'input') {
		// 	return false;
		// }
		// 过滤原始a标签
		if (event.target.tagName.toLowerCase() === 'a') return false;
		// a标签嵌套或者router-link组件
		// el-button组件:dom结构button>span
		// router-link组件:dom结构a>button>span
		const path = eventEl.composedPath ? eventEl.composedPath() : eventEl.path;
		// 过滤a及其嵌套
		if(path[1].nodeName?.toLowerCase() === 'a' || path[2].nodeName?.toLowerCase() === 'a') return false;
		// 返回el-button：因为button会包含一个span, 点击行为会触发button的点击事件
		if(path[1].nodeName.toLowerCase() === 'button' && path[2].nodeName.toLowerCase() !== 'a') {
			const elId = path[1].id;
			// 过滤elmentplus的id,预防其元素被追踪造成问题
			return elId && !elId.startsWith('el-') ? elId : false;
		}
		// 过滤elmentplus的id,预防其元素被追踪造成问题
		return eventEl.target.id && !eventEl.target.id.startsWith('el-') ? eventEl.target.id : false;
	}

	/**
	 * 获取单选按钮组的名称。
	 * @param {Object} element - 单选按钮元素对象
	 * @returns {string} - 单选按钮组的名称
	 */
	getRadioGroupName(element) {
		const radioGroup = element.closest('.el-radio-group');
		return radioGroup ? radioGroup.id : element.id || element.name;
	}

	/**
	 * 获取复选框组的名称。
	 * @param {Object} element - 复选框元素对象
	 * @returns {string} - 复选框组的名称
	 */
	getCheckboxGroupName(element) {
		const checkboxGroup = element.closest('.el-checkbox-group');
		return checkboxGroup ? checkboxGroup.id : element.id || element.name;
	}

	/**
	 * 获取复选框组的值数组。
	 * @param {HTMLElement} element - 复选框元素对象
	 * @returns {Array} - 复选框组的值数组
	 */
	getCheckboxGroupValues(element) {
		const checkboxGroup = element.closest('.el-checkbox-group');
		if (checkboxGroup) {
			const checkboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]:checked');
			const values = Array.from(checkboxes).map(checkbox => checkbox.value);
			return values.length > 0 ? values.join(';') : "";
		}
		return element.checked ? element.value : "";
	}
}

export default ElementPlusStrategy;
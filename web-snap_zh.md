# WebSnap

WebSnap 是一个基于 IndexedDB的表单历史记录的javascript管理库。它提供了一个简单而强大的方式来存储和检索表单元素的历史值，支持分页查询和过滤功能。

## Features

- 📝 支持多用户数据隔离
- 🔒 自动绑定表单元素change事件
- 🎯 自动绑定元素click事件(真实DOM含ID属性的html标签，除a标签及其嵌套元素之外)
- 🔄 支持多种 UI 框架（默认支持 Element Plus）
- 📊 提供灵活的数据查询接口
- 🎯 支持分页和过滤功能
- 💾 基于 IndexedDB 实现持久化存储

## 安装
下载后直接引入即可

## 基础用法
### 初始化

```javascript
import WebSnap from "@/utils/web-snap/index";

WebSnap.init({
	user: "user1",
	maxHistoryLength: 10,
	uiLibrary: "elementplus",
});
```
### 配置选项
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| user | string | null | 用户标识(必填) |
| maxHistoryLength | number | null | 每个元素最大历史记录数 |
| uiLibrary | string | 'elementplus' | UI框架类型 |

## API 参考
### 添加历史记录
```javascript
import WebSnap from "@/utils/web-snap/index";
// 添加元素历史记录
await webSnap.addElementHistory(
  '#/route/path',    // 路由路径
  'inputName',       // 元素标识
  'inputValue',       // 元素值
  'type'			// 元素类型 form(default) | click | browser
);
```
### 查询历史记录
获取元素历史
```javascript
// 获取指定元素的历史记录
const history = await webSnap.getElementHistory('route/path@inputName');

```
获取所有历史记录
```javascript
// 获取所有历史记录
const allHistory = await webSnap.getAllHistory();

// 返回数据结构示例:
{
  "user123@#/route/path1": [
    {
      element: "input1",
      value: "value1",
      timestamp: 1623456789
    },
    {
      element: "input2", 
      value: "value2",
      timestamp: 1623456790
    }
  ],
  "user123@#/route/path2": [
    {
      element: "input3",
      value: "value3", 
      timestamp: 1623456791
    }
  ]
}

```

获取存储键
```javascript
// 获取所有存储键
const keys = await webSnap.getStoreKeys();

// 获取带详细信息的键列表
const keysInfo = await webSnap.getStoreKeysInfo();

// 获取按用户分组的键
const groupedKeys = await webSnap.getStoreKeysGroupedByUser();

// 获取特定用户的键
const userKeys = await webSnap.getUserStoreKeys('user123');

```

### 分页查询
分页选项
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 当前页码 |
| pageSize | number | 10 | 每页记录数 |
| sortBy | string | 'timestamp' | 排序字段 |
| sortOrder | string | 'desc' | 排序方向('asc'/'desc') |

基础分页查询

```javascript
const result = await webSnap.getFilteredPaginatedRecords(
  'user123@#/route/path',
  {},  // 无过滤条件
  {
    page: 1,
    pageSize: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  }
);

```
带过滤条件的分页查询
```javascript
const result = await webSnap.getFilteredPaginatedRecords(
  'user123@#/route/path',
  {
    element: 'input1',           // 精确匹配
    timestamp: { min: 1623456789 }, // 范围过滤
    value: ['value1', 'value2']     // 数组匹配
  },
  {
    page: 1,
    pageSize: 10
  }
);

```
分页结果结构
```javascript
interface PaginatedResult {
  records: Array<any>;     // 当前页记录
  total: number;           // 总记录数
  currentPage: number;     // 当前页码
  totalPages: number;      // 总页数
  pageSize: number;        // 每页大小
}


```
删除历史记录

```javascript
// 删除指定元素的历史记录
await webSnap.deleteElementHistory('route/path@inputName');

// 清空所有历史记录
await webSnap.clearAllHistory();

```
## 错误处理
所有方法都包含错误处理,建议使用 try-catch 进行异常捕获:

```javascript
try {
  await webSnap.addElementHistory(route, name, value);
} catch (error) {
  console.error('操作失败:', error);
}

```

## 浏览器支持
需要支持 IndexedDB 的现代浏览器。

## 许可证
MIT

## 贡献指南
欢迎提交 Issue 和 Pull Request。

## 特别说明

以ElementPlus为例

- 📝 扩展仅对设置了id属性的元素进行监听追踪
- 🔒 基础表单元素(el-select除外)仅需设置id,无需额外配置

```javascript
// 特例:手动添加,否则无法监听追踪
<el-select id="test6" @change="onChange1">
	<el-option label="track" value="1" />
</el-select>

const onChange = (value) => {
	recorder.addElementHistory('#/', 'test6', value || '' )
}
```





// 查询所有用户树形结构数据转换
export const treeDataTransform = (data) => {
	return data.map((item) => {
		const node = {
			type: item.isLine == undefined ? 'user' : 'department', // 标记节点类型
			...item,
			children: item.children ? treeDataTransform(item.children) : [],
		};

		// 如果有用户，将用户作为叶子节点添加到当前节点
		if (item.userList && item.userList.length > 0) {
			item.userList.forEach((user) => {
				node.children.push({
					...user,
					type: 'user',
				});
			});
		}
		return node;
	});
};


// 添加禁用节点的方法
export const disabledNode = (data) => {
	if (data.type === 'department') {
		const isEmpty = (!data.userList || data.userList.length === 0) &&
			(!data.children || data.children.length === 0);
		return isEmpty;
	}
	return false;
};


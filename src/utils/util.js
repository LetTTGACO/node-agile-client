/**
 * 从节点数组随机选择一个节点
 * @param nodes
 * @returns {*}
 */
function randomNode(nodes) {
  return nodes[Math.floor(Math.random() * nodes.length)];
}

/**
 * 数组乱序
 * @param nodes
 * @returns {*}
 */
function shuffle(nodes) {
  let m = nodes.length;
  while (m > 1){
    let index = Math.floor(Math.random() * m--);
    [nodes[m] , nodes[index]] = [nodes[index] , nodes[m]]
  }
  return nodes;
}

exports.randomNode = randomNode;
exports.shuffle = shuffle;

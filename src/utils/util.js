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
  while (m > 1) {
    let index = Math.floor(Math.random() * m--);
    [nodes[m], nodes[index]] = [nodes[index], nodes[m]]
  }
  return nodes;
}

/**
 * 生成url
 * @param options
 * @param isWs 是否生成wsUrl
 * @returns {string[]|*[]}
 */
function generateUrl(options, isWs) {
  const {nodes, tag, name, appid, env} = options;
  let urlList
  if (Array.isArray(nodes)) {
    urlList = shuffle(nodes)
  } else {
    urlList = [nodes]
  }
  if (isWs) {
    // ws连接
    return urlList.map(item => {
      if (item.startsWith('https:')) {
        item = item.replace('https:', 'wss:')
      } else {
        item = item.replace('http:', 'ws:')
      }
      return `${item}/ws?client_name=${name}&client_tag=${tag}`
    })
  }
  // api调用
  return urlList.map(item => {
    return `${item}/api/Config/app/${appid}?env=${env}`
  })
}

/**
 * 获取当前时间格式化
 * @returns {string}
 */
function getTime() {
  const date = new Date();
  let nowMonth = date.getMonth() + 1;
  let strDate = date.getDate();
  if (nowMonth >= 1 && nowMonth <= 9) {
    nowMonth = "0" + nowMonth;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${date.getFullYear()}-${nowMonth}-${strDate} ${hour}:${minute}:${second}`
}

exports.randomNode = randomNode;
exports.shuffle = shuffle;
exports.generateUrl = generateUrl;
exports.getTime = getTime;

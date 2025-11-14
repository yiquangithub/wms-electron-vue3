// 更新浏览器图标
export function updateFavicon(logoUrl) {
  if (!logoUrl) return
  try {
    // 移除所有现有的favicon相关链接
    const existingLinks = document.querySelectorAll('link[rel*="icon"]')
    existingLinks.forEach((link) => link.remove())

    // 创建新的favicon链接
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/x-icon'
    link.href = logoUrl + '?t=' + Date.now()
    document.head.appendChild(link)
    const shortcutLink = document.createElement('link')
    shortcutLink.rel = 'shortcut icon'
    shortcutLink.type = 'image/x-icon'
    shortcutLink.href = logoUrl + '?t=' + Date.now()
    document.head.appendChild(shortcutLink)
  } catch (error) {
    console.error('更新浏览器图标失败:', error)
  }
}

// 获取系统配置
export function getSystemConfig() {
  try {
    const config = localStorage.getItem('systemConfig')
    return config ? JSON.parse(config) : null
  } catch (error) {
    console.error('获取系统配置失败:', error)
    return null
  }
}

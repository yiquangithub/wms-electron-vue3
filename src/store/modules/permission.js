// permission.js
import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore(
  'permission',
  {
    state: () => ({
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: [],
      originalSidebarRouters: [],
      currentModuleName: '' // 新增：当前模块名称
    }),
    actions: {
      setRoutes(routes) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
        // 保存原始侧边栏路由
        if (this.originalSidebarRouters.length === 0) {
          this.originalSidebarRouters = [...routes]
        }
      },
      // 新增：设置当前模块名称
      setCurrentModuleName(name) {
        this.currentModuleName = name
        // 保存到 sessionStorage，防止刷新丢失
        if (name) {
          sessionStorage.setItem('currentModuleName', name)
        } else {
          sessionStorage.removeItem('currentModuleName')
        }
      },
      // 新增：从存储中恢复当前模块名称
      restoreCurrentModuleName() {
        const savedName = sessionStorage.getItem('currentModuleName')
        if (savedName) {
          this.currentModuleName = savedName
        }
      },
      // 修改：根据菜单名称设置当前模块的路由
      setCurrentModuleRoutes(menuName) {
        if (!menuName) {
          this.resetSidebarRoutes()
          return
        }


        // 保存当前模块名称
        this.setCurrentModuleName(menuName)

        // 在侧边栏路由中查找匹配的模块
        const findModuleByName = (routes, name) => {
          for (const route of routes) {
            // 检查当前路由是否匹配
            if (route.name === name) {
              return route
            }
            // 检查子路由是否匹配
            if (route.children && route.children.length > 0) {
              const foundInChildren = findModuleByName(route.children, name)
              if (foundInChildren) return foundInChildren
            }
          }
          return null
        }

        // 在动态路由中查找
        let targetModule = findModuleByName(this.addRoutes, menuName)

        // 如果在动态路由中没找到，在原始侧边栏路由中查找
        if (!targetModule) {
          targetModule = findModuleByName(this.originalSidebarRouters, menuName)
        }


        if (targetModule) {
          // 如果找到的是父级模块（有children），直接显示该模块
          if (targetModule.children && targetModule.children.length > 0) {
            this.sidebarRouters = [targetModule]
          } else {
            // 如果找到的是子级菜单，找到它的父级模块
            const parentModule = this.findParentModule(menuName)
            if (parentModule) {
              this.sidebarRouters = [parentModule]
            } else {
              // 没找到父级，只显示当前菜单
              this.sidebarRouters = [targetModule]
            }
          }
        } else {
          // 没找到模块，显示原始侧边栏
          console.warn(`未找到菜单名称为 ${menuName} 的路由`)
          this.resetSidebarRoutes()
        }
      },
      // 新增：恢复当前模块的路由（用于刷新后）
      restoreCurrentModuleRoutes() {
        if (this.currentModuleName) {
          this.setCurrentModuleRoutes(this.currentModuleName)
        } else {
          this.resetSidebarRoutes()
        }
      },
      // 修改：重置为原始侧边栏
      resetSidebarRoutes() {
        this.sidebarRouters = [...this.originalSidebarRouters]
        this.setCurrentModuleName('')
      },
      // 修改 generateRoutes 方法
      generateRoutes(roles) {
        return new Promise(resolve => {
          // 向后端请求路由数据
          getRouters().then(res => {
            const sdata = JSON.parse(JSON.stringify(res.data))
            const rdata = JSON.parse(JSON.stringify(res.data))
            const defaultData = JSON.parse(JSON.stringify(res.data))

            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)

            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => { router.addRoute(route) })

            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)

            // 恢复当前模块状态
            this.restoreCurrentModuleName()
            this.restoreCurrentModuleRoutes()

            resolve(rewriteRoutes)
          })
        })
      },
      // 查找父级模块（保持不变）
      findParentModule(menuName) {
        const findParent = (routes, targetName, parent = null) => {
          for (const route of routes) {
            if (route.name === targetName) {
              return parent
            }
            if (route.children && route.children.length > 0) {
              const found = findParent(route.children, targetName, route)
              if (found) return found
            }
          }
          return null
        }

        let parent = findParent(this.addRoutes, menuName)
        if (!parent) {
          parent = findParent(this.originalSidebarRouters, menuName)
        }
        return parent
      }
    }
  })

// 其他函数保持不变...
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el))
        return
      }
    }
    children = children.concat(el)
  })
  return children
}

export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
}

export default usePermissionStore
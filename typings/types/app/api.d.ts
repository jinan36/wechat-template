declare namespace Api {
  /**
   * 请求配置
   */
  interface RequestConfig {
      /**
       * 基础 URL
       */
      urlBase?: string
      /**
       * 请求头数据
       */
      headers?: Record<string, any>
      /**
       * 是否使用认证
       */
      useAuth?: boolean
      /**
       * 是否弹出提示
       */
      showToast?: boolean
      /**
       * 是否显示加载框
       */
      showLoading?: boolean
      /**
       * 加载框标题
       */
      loadingTitle?: string
      /**
       * 是否重认证
       */
      reAuth?: boolean
  }

  /**
   * 请求方法
   */
  type RequestMethod =
      | 'OPTIONS'
      | 'GET'
      | 'HEAD'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'TRACE'
      | 'CONNECT'

  /**
   * 请求参数
   */
  type IParams = Record<string, any>

  /**
   * 请求主体
   */
  type IBody = Record<string, any> | Array<Record<string, any>>

  /**
   * 响应基础
   */
  interface IResBase {
      /**
       * 返回代码
       */
      code: number
      /**
       * 返回消息
       */
      message: string
  }

  /**
   * 响应结果
   * @type T 响应数据类型
   */
  interface IRes<T = any> extends IResBase {
      /**
       * 响应数据
       */
      data: T
  }

  /**
   * 路由请求函数
   * @type P 请求参数类型
   * @type B 请求主体类型
   * @type R 响应数据类型
   * @param params 请求参数
   * @param body 请求主体
   * @param config 请求配置
   * @returns 响应结果
   */
  type RouteRequestFunc<
      P extends IParams | undefined | null = IParams,
      B extends IBody | undefined | null = IBody,
      R = any
      > = (
          params?: Partial<P>,
          body?: B,
          config?: RequestConfig
      ) => Promise<Api.IRes<R>>

  /**
   * 路由请求函数, 只含参数
   * @type P 请求参数类型
   * @type R 响应数据类型
   * @param params 请求参数
   * @param config 请求配置
   * @returns 响应结果
   */
  type RouteRequestFuncP<
      P extends IParams | undefined | null = IParams,
      R = any
      > = (
          params?: Partial<P>,
          config?: RequestConfig
      ) => Promise<Api.IRes<R>>

  /**
   * 路由请求函数, 只含主体
   * @type B 请求主体类型
   * @type R 响应数据类型
   * @param body 请求主体
   * @param config 请求配置
   * @returns 响应结果
   */
  type RouteRequestFuncB<
      B extends IBody | undefined | null = IBody,
      R = any
      > = (
          body?: B,
          config?: RequestConfig
      ) => Promise<Api.IRes<R>>

  /**
   * 路由请求函数, 不含参数与实体
   * @type R 响应数据类型
   * @param config 请求配置
   * @returns 响应结果
   */
  type RouteRequestFuncZ<
      R = any
      > = (
          config?: RequestConfig
      ) => Promise<Api.IRes<R>>

  /**
   * 请求函数
   * @type P 请求参数类型
   * @type B 请求主体类型
   * @type R 响应数据类型
   * @param url 请求地址
   * @param params 请求参数
   * @param body 请求主体
   * @param method 请求方法
   * @param config 请求配置
   * @returns 响应结果
   */
  type RequestFunc<
      P extends IParams | undefined | null = IParams,
      B extends IBody | undefined | null = IBody,
      R = any
      > = (
          url: string,
          params?: Partial<P>,
          body?: B,
          method?: RequestMethod,
          config?: RequestConfig
      ) => Promise<Api.IRes<R>>

  /**
   * 路由处理器
   */
  type RouteHandler = RouteRequestFunc & {
      /**
       * 路由处理器
       * @name routeName 路由名称
       */
      [routeName: string]: RouteHandler
  }

  /**
   * 路由根处理器
   */
  type RouteRootHandler = RequestFunc & {
      /**
       * 路由处理器
       * @name routeName 路由名称
       */
      [routeName: string]: RouteHandler
  }

  /**
   * POST 请求函数
   * @type P 请求参数类型
   * @type R 响应数据类型
   */
  type PostFunc<P extends IParams = IParams, R = any> = {
      post: RouteRequestFunc<P, R>
  }
  /**
   * GET 请求函数
   * @type P 请求参数类型
   * @type R 响应数据类型
   */
  type GetFunc<P extends IParams = IParams, R = any> = {
      get: RouteRequestFunc<P, R>
  }
  /**
   * PUT 请求函数
   * @type P 请求参数类型
   * @type R 响应数据类型
   */
  type PutFunc<P extends IParams = IParams, R = any> = {
      put: RouteRequestFunc<P, R>
  }
  /**
   * DELETE 请求函数
   * @type P 请求参数类型
   * @type R 响应数据类型
   */
  type DelFunc<P extends IParams = IParams, R = any> = {
      del: RouteRequestFunc<P, R>
  }
}

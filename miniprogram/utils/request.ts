import qs from 'qs'

export const globalRequestConfig = {
    urlBase: '',
    appId: '',
    whiteList: [] as string[],
    getSessionFunc: async (_?: boolean) => '' as string | undefined,
    updateLastTimeFunc: () => { },
}

/**
 * 最大重认证次数
 */
const reAuthMaxTimes = 3

type InnerRequestConfig = Api.RequestConfig & {
    __reAuthCount: number
}

const defaultConfig: InnerRequestConfig = {
    headers: {},
    useAuth: true,
    showToast: true,
    showLoading: false,
    loadingTitle: '加载中...',
    reAuth: false,
    __reAuthCount: 0,
}

/**
 * 连接URL
 * @param urlBase 基础URL
 * @param url URL
 */
export function combineUrl(urlBase: string, url: string, params: Api.IParams): string {
    if (!url) {
        throw Error("url can't be empty")
    }
    if (urlBase.endsWith('/')) {
        urlBase = urlBase.substr(0, urlBase.length - 1)
    }
    let resUrl: string
    if (url.startsWith('http://') || url.startsWith('https://')) {
        resUrl = url
    } else {
        if (!url.startsWith('/')) {
            url = '/' + url
        }
        resUrl = `${urlBase}${url}`
    }
    const paramsStr = qs.stringify(params || {})
    if (paramsStr) {
        resUrl += '?' + paramsStr
    }
    return resUrl
}

/**
 * 网络请求
 * @param url URL
 * @param params 参数数据
 * @param body 请求主体
 * @param method 请求方法
 * @param config 请求配置
 */
export async function request<T extends any = any>(
    url: string,
    params: Record<string, any> = {},
    body?: Api.IBody,
    method: Api.RequestMethod = 'POST',
    config: Api.RequestConfig = {}
): Promise<Api.IRes<T>> {
    const mixedConfig = Object.assign(
        { urlBase: globalRequestConfig.urlBase },
        defaultConfig,
        config
    ) as Required<InnerRequestConfig>

    const requestUrl = combineUrl(mixedConfig.urlBase, url, params)

    const urlInWhiteList = globalRequestConfig.whiteList.includes(url)

    const requestHeaders = Object.assign(
        {
            'Content-Type': 'application/json',
        },
        mixedConfig.headers
    )
    if (mixedConfig.useAuth && !urlInWhiteList) {
        requestHeaders['Session-Key'] = await globalRequestConfig.getSessionFunc(mixedConfig.reAuth)
    }

    const { showToast, showLoading, loadingTitle } = mixedConfig

    return new Promise<Api.IRes<T>>((resolve, reject) => {
        // 是否显示loading
        if (showLoading) {
            wx.showLoading({
                title: loadingTitle,
                mask: true,
            })
        }

        wx.request({
            url: requestUrl,
            data: body,
            header: requestHeaders,
            method: method,
            success: (res) => {
                if (showLoading) {
                    wx.hideLoading()
                }

                // 服务器 非200 错误
                if (res.statusCode != 200) {
                    showToast &&
                        wx.showToast({
                            title: '服务器 ' + res.statusCode + ' 错误',
                            icon: 'error',
                        })
                    reject(res)
                    return
                }

                const apiRes = res.data as Api.IRes<T>

                if (apiRes.code === 401 && mixedConfig.__reAuthCount < reAuthMaxTimes) {
                    const reAuthConfig = Object.assign({}, config, {
                        reAuth: true,
                        __reAuthCount: mixedConfig.__reAuthCount + 1
                    })
                    request(url, params, body, method, reAuthConfig)
                        .then(resolve)
                        .catch(reject)
                    return
                }

                if (apiRes.code !== 0 && apiRes.code !== 1000 && apiRes.code !== 1001 && apiRes.code !== 1002 && apiRes.code !== 1003 && apiRes.code !== 1004) {
                    // 业务状态非0 是否提示
                    showToast &&
                        wx.showToast({
                            title: apiRes.message,
                            icon: 'none',
                        })

                    reject(apiRes)
                }

                globalRequestConfig.updateLastTimeFunc()
                resolve(apiRes)
            },

            fail: (err) => {
                if (showLoading) {
                    wx.hideLoading()
                }

                if (err.errMsg.indexOf('url not in domain list') > -1) {
                    showToast &&
                        wx.showToast({
                            title: '请求url不在合法域名中，请打开调试模式',
                            icon: 'none',
                        })
                }

                reject(err)
            },
        })
    })
}

/**
 * GET请求
 * @param url URL
 * @param params 参数数据
 * @param body 请求主体
 * @param config 请求配置
 */
export function get<T extends any>(
    url: string,
    params: Record<string, any> = {},
    body?: Api.IBody,
    config: Api.RequestConfig = {}
): Promise<Api.IRes<T>> {
    return request(url, params, body, 'GET', config)
}

/**
 * POST请求
 * @param url URL
 * @param params 参数数据
 * @param body 请求主体
 * @param config 请求配置
 */
export function post<T extends any>(
    url: string,
    params: Record<string, any> = {},
    body?: Api.IBody,
    config: Api.RequestConfig = {}
): Promise<Api.IRes<T>> {
    return request(url, params, body, 'POST', config)
}

/**
 * PUT请求
 * @param url URL
 * @param params 参数数据
 * @param body 请求主体
 * @param config 请求配置
 */
export function put<T extends any>(
    url: string,
    params: Record<string, any> = {},
    body?: Api.IBody,
    config: Api.RequestConfig = {}
): Promise<Api.IRes<T>> {
    return request(url, params, body, 'PUT', config)
}

/**
 * DELETE请求
 * @param url URL
 * @param params 参数数据
 * @param body 请求主体
 * @param config 请求配置
 */
export function del<T extends any>(
    url: string,
    params: Record<string, any> = {},
    body?: Api.IBody,
    config: Api.RequestConfig = {}
): Promise<Api.IRes<T>> {
    return request(url, params, body, 'DELETE', config)
}

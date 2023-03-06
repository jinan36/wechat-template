import { request } from '../utils/request'

const apiRequest =
	(url: string, params = {}, body = undefined, method = 'POST', config = {}) => {
		return request(url, params, body, method as Api.RequestMethod, config)
	}

const createPathProxy = (path: string): Api.RouteHandler => {
	const lastSplitIndex = path.lastIndexOf('/')
	let url = path.substring(0, lastSplitIndex)
	let method = path.substring(lastSplitIndex + 1).toUpperCase()
	let type = ''
	const endChar = method[method.length - 1]
	if (['P', 'B', 'Z'].includes(endChar)) {
		type = endChar
		method = method.substring(0, method.length - 1);
	}
	switch (method) {
		case 'GET':
		case 'POST':
		case 'PUT':
		case 'DELETE':
			break
		case 'DEL':
			method = 'DELETE'
			break
		default:
			url = path
			method = 'POST'
			break
	}
	const ops = {} as Record<string, Api.RouteHandler> & Object
	let pathRequest
	switch (type) {
		case 'P':
			pathRequest = (param = {}, config = {}) => request(url, param, undefined, method as Api.RequestMethod, config)
			break;
		case 'B':
			pathRequest = (body = undefined, config = {}) => request(url, {}, body, method as Api.RequestMethod, config)
			break;
		case 'Z':
			pathRequest = (config = {}) => request(url, {}, undefined, method as Api.RequestMethod, config)
			break;
		default:
			pathRequest = (param = {}, body = undefined, config = {}) => request(url, param, body, method as Api.RequestMethod, config)
			break;
	}

	return new Proxy(pathRequest, {
		get: function (_target, property: string) {
			if (!ops.hasOwnProperty(property)) {
				ops[property] = createPathProxy(path + '/' + property)
			}
			return ops[property]
		},
	}) as Api.RouteHandler
}

let apiRoot: ApiTree

export const createApiProxy = () => {
	if (apiRoot) return apiRoot

	const ops = {} as Record<string, Api.RouteHandler> & Object
	apiRoot = new Proxy(apiRequest, {
		get: function (_target, property: string) {
			if (typeof property != "string") {
				return undefined
			}
			if (!ops.hasOwnProperty(property)) {
				ops[property] = createPathProxy('/' + property)
			}
			return ops[property]
		},
	}) as ApiTree

	return apiRoot
}

const api = createApiProxy()

export default api

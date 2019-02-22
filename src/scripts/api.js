import service from './request'


export const doLogin = data => { return service({ url: `/user/login`, method: 'post', data})};
export const doLogout = data => { return service({ url: '/user/logout', method: 'post', data})};

export const getUserMenu = data => { return service({ url: `/user/getmenu`, method: 'post', data})};

//项目列表相关
export const getUserProjectList = data => { return service({ url: `/project/getuserprojectlist`, method: 'post', data})};
export const getAllUserProjectList = data => { return service({ url: `/project/getuserallproject`, method: 'post', data})};
export const getUserProjectAndModule = data => { return service({ url: `/project/getprojectandmodule`, method: 'post', data})};
export const getModuleByPid = data => { return service({ url: `/project/getmodule`, method: 'post', data})};
export const getProjectVersions = data => { return service({ url: `/project/getprojectversions`, method: 'post', data})};
export const addProject = data => { return service({ url: `/project/addproject`, method: 'post', data })};
export const addVersion = data => { return service({ url: `/project/addversion`, method: 'post', data })};
export const editProject = data => { return service({ url: `/project/edit`, method: 'post', data })};
export const deleteVersion = data => { return service({ url: `/project/deleteversion`, method: 'post', data })};
export const deleteAll = data => { return service({ url: `/project/deleteall`, method: 'post', data })};

// 测试用例相关
export const getTestCaseByPid = data => { return service({ url: `/testcase/getlist`, method: 'post', data })};
export const getProjectHostByUid = data => { return service({ url: `/testcase/hosts`, method: 'post', data })};
export const getProjectsByUid = data => { return service({ url: `/testcase/getprojects`, method: 'post', data })};

export const saveProjectHost = data => { return service({ url: `/testcase/savehost`, method: 'post', data })};
export const deleteProjectHost = data => { return service({ url: `/testcase/deletehost`, method: 'post', data })};
//api相关
export const getUserApiList = data => { return service({ url: `/testapi/getlist`, method: 'post', data })};
export const saveTestApi = data => { return service({ url: `/testapi/savetestapi`, method: 'post', data })};
export const getTestApiInfo = data => { return service({ url: `/testapi/getapiinfo`, method: 'post', data })};
export const saveTestApiInfo = data => { return service({ url: `/testapi/saveapiinfo`, method: 'post', data })};
export const deleteTestApi = data => { return service({ url: `/testapi/deletetestapi`, method: 'post', data })};
export const changeTestApiStatus = data => { return service({ url: `/testapi/changeapistatus`, method: 'post', data })};
export const getApiByProjectId = data => { return service({ url: `/testapi/getapibypid`, method: 'post', data })};

export const debugTestApi = data => { return service({ url: `/testapi/debugtestapi`, method: 'post', data })};

//测试用例相关
export const saveCaseByModuleId = data => { return service({ url: `/testcase/savecase`, method: 'post', data })};
export const getCaseStepsByCaseId = data => { return service({ url: `/testcase/getsteps`, method: 'post', data })};





//document.write("<script type='text/javascript' charset='utf-8' src='./json2.js'></script>");
//document.write("<script type='text/javascript' charset='utf-8' src='./jquery-1.8.1.min.js'></script>");
//document.write("<script type='text/javascript' charset='utf-8' src='/nls3N/include/jquery-1.8.1.js'></script>");

//load check
var check_load=true;

//환경 설정
var g_params = "";
var g_localDemonAddr = "http://sso.sk.com:10000/interface/ToktokLogout.jsp";
var g_CallBack = null;
var g_PortValue = 17489;
var g_ReqInstallRetryCnt = 1;     //TimeOut발생시 Retry카운트
var g_GetTimeout = 5000;
//var g_GetTimeout = 2000;   //NC와 통신 TimeOut
var g_NCTimeOut = 5000;
//var g_NCTimeOut = 5000;    //NC와 데몬 통신하는 API호출시 TimeOut을 5초로 동작하게 하자
var g_form = null;
var g_PortScanRetryCnt = 0;
//var g_NCVersion = "4.7.1.0";
var g_NCVersion = "4.8.5.7";
var sitelist = "sk.com";

function requestData()
{
	var url = "";
	var func = "";
	var param = "";
	var callback = null;
	var protocolName = "GET";
	var retrycnt = 2;
}

function responseData()
{
	var resultCode = "";
	var msg = "";
	var status = "";
}

//////////////////////////////////////////////////

function MakeSendData(requestData)
{

	if(requestData != null)
	{			
		var filter = new Array();
		filter[0] = "func";
		filter[1] = "param";
		if(requestData.protocolName == "IFRAMEPOST")
		{
			requestData.param = JSON.stringify(requestData, filter);
		}
		else
		{
		    
			requestData.param = encodeURIComponent(requestData.param);
			
			requestData.param = "data=" + JSON.stringify(requestData, filter);
			
		}
		
	}
	else
	{
		
	
	}		
}

function DM_SendRequest(reqData,nNCtoDamon,bSync)
{
	if(reqData != null)
	{
		if (reqData.protocolName == "GET")
		{
		    if (bSync == true)
		        jsonpGetSync(reqData,nNCtoDamon);
		    else
		    	jsonpGet(reqData,nNCtoDamon);
		}
		/*
		else if (reqData.protocolName == "AJAXPOST")
		{
			g_reqData = reqData;			
			var reqDataTemp = new requestData();
			reqDataTemp.url = g_localDemonAddr;
			reqDataTemp.func = "isRunning";
			reqDataTemp.param = "";
			reqDataTemp.callback = checkDemonService_CB;
			reqDataTemp.protocolName = getProtocolName(reqDataTemp.func);
			reqDataTemp.retrycnt = 3;
			MakeSendData(reqDataTemp);	
			DM_SendRequest(reqDataTemp);
		}
		else if (reqData.protocolName == "IFRAMEPOST")
		{
			g_reqData = reqData;		
			var reqDataTemp = new requestData();
			reqDataTemp.url = g_localDemonAddr;
			reqDataTemp.func = "isRunning";
			reqDataTemp.param = "";
			reqDataTemp.callback = checkDemonService_CB;
			reqDataTemp.protocolName = getProtocolName(reqDataTemp.func);
			reqDataTemp.retrycnt = 3;
			MakeSendData(reqDataTemp);	
			DM_SendRequest(reqDataTemp);
		}
		*/
		else
		{
		    alert("프로토콜 오류");
		}
	}
}

function jsonpGet(reqData,nNCtoDamon) 
{
	try 
	{
		if (nNCtoDamon == 1)
		{
			$.ajax({
			url:reqData.url,
			data:reqData.param,
			timeout:g_NCTimeOut,			
			dataType:"jsonp",
			type:"GET",
			cache:false,
			jsonpCallback:"nexessCallBack"+parseInt(Math.random() * 999999 % 999999),
			success: function(res)
			{
				if(reqData.callback != null)
				{
					var resData = new responseData();					
					//우리 포맷이 아니다.
					resData.resultCode = res.nexessres;
					resData.msg = res.data;
					
				    
					reqData.callback(resData);
					
				}
			},
			error: function(request, status, error)
			{
				if(reqData.callback != null)
				{
    			    
					reqData.retrycnt = reqData.retrycnt -1;
					if(reqData.retrycnt <= 0)
					{
						var resData = new responseData();	
						//설치되어 있지 않는 경우 0
						//그 이외의 SSL 인증서 에러 및 설치는 되어 있지만 외부 상태로 발생하는 오류는 3 메시지 표시한다.
						if(status == "parsererror")
							resData.resultCode = "0";
						else if(status == "timeout")
							resData.resultCode = "0";
						else if(status == "error")
							resData.resultCode = "0";
							
						resData.status = status;
						resData.msg = error;
						reqData.callback(resData);
					}
					else
					{
						DM_SendRequest(reqData,nNCtoDamon,false);
					}
					
					
				}	
			}
		});
				
		}
		else
		{
			$.ajax({
			url:reqData.url,
			data:reqData.param,
			timeout:g_GetTimeout,			
			dataType:"jsonp",
			type:"GET",
			cache:false,
			jsonpCallback:"nexessCallBack"+parseInt(Math.random() * 999999 % 999999),
			success: function(res)
			{
				if(reqData.callback != null)
				{
					var resData = new responseData();					
					//우리 포맷이 아니다.
					resData.resultCode = res.nexessres;
					resData.msg = res.data;
					
				    
					reqData.callback(resData);
					
				}
			},
			error: function(request, status, error)
			{
				if(reqData.callback != null)
				{
    			    
					reqData.retrycnt = reqData.retrycnt -1;
					if(reqData.retrycnt <= 0)
					{
						var resData = new responseData();	
						//설치되어 있지 않는 경우 0
						//그 이외의 SSL 인증서 에러 및 설치는 되어 있지만 외부 상태로 발생하는 오류는 3 메시지 표시한다.
						if(status == "parsererror")
							resData.resultCode = "0";
						else if(status == "timeout")
							resData.resultCode = "0";
						else if(status == "error")
							resData.resultCode = "0";
							
						resData.status = status;
						resData.msg = error;
						reqData.callback(resData);
					}
					else
					{
						DM_SendRequest(reqData,nNCtoDamon,false);
					}
					
					
				}	
			}
		});
			
		}
		
	}
	catch(e) 
	{
	    alert("error");
		alert("catch" + e);
	}
}


function jsonpGetSync(reqData,nNCtoDamon) 
{
	try 
	{
		if (nNCtoDamon == 1)
		{
			$.ajax({
			url:reqData.url,
			data:reqData.param,
			timeout:g_NCTimeOut,			
			dataType:"jsonp",
			type:"GET",
			async:false,
			jsonpCallback:"nexessCallBack"+parseInt(Math.random() * 999999 % 999999),
			success: function(res)
			{
				if(reqData.callback != null)
				{
					var resData = new responseData();					
					//우리 포맷이 아니다.
					resData.resultCode = res.nexessres;
					resData.msg = res.data;
					
				    
					reqData.callback(resData);
					
				}
			},
			error: function(request, status, error)
			{
				if(reqData.callback != null)
				{
    			    
					reqData.retrycnt = reqData.retrycnt -1;
					if(reqData.retrycnt <= 0)
					{
						var resData = new responseData();	
						//설치되어 있지 않는 경우 0
						//그 이외의 SSL 인증서 에러 및 설치는 되어 있지만 외부 상태로 발생하는 오류는 3 메시지 표시한다.
						if(status == "parsererror")
							resData.resultCode = "0";
						else if(status == "timeout")
							resData.resultCode = "0";
						else if(status == "error")
							resData.resultCode = "0";
							
						resData.status = status;
						resData.msg = error;
						reqData.callback(resData);
					}
					else
					{
						DM_SendRequest(reqData,nNCtoDamon,false);
					}
					
					
				}	
			}
		});
				
		}
		else
		{
			$.ajax({
			url:reqData.url,
			data:reqData.param,
			timeout:g_GetTimeout,			
			dataType:"jsonp",
			type:"GET",
			async:false,
			jsonpCallback:"nexessCallBack"+parseInt(Math.random() * 999999 % 999999),
			success: function(res)
			{
				if(reqData.callback != null)
				{
					var resData = new responseData();					
					//우리 포맷이 아니다.
					resData.resultCode = res.nexessres;
					resData.msg = res.data;
					
				    
					reqData.callback(resData);
					
				}
			},
			error: function(request, status, error)
			{
				if(reqData.callback != null)
				{
    			    
					reqData.retrycnt = reqData.retrycnt -1;
					if(reqData.retrycnt <= 0)
					{
						var resData = new responseData();	
						//설치되어 있지 않는 경우 0
						//그 이외의 SSL 인증서 에러 및 설치는 되어 있지만 외부 상태로 발생하는 오류는 3 메시지 표시한다.
						if(status == "parsererror")
							resData.resultCode = "0";
						else if(status == "timeout")
							resData.resultCode = "0";
						else if(status == "error")
							resData.resultCode = "0";
							
						resData.status = status;
						resData.msg = error;
						reqData.callback(resData);
					}
					else
					{
						DM_SendRequest(reqData,nNCtoDamon,false);
					}
					
					
				}	
			}
		});
			
		}
		
	}
	catch(e) 
	{
	    alert("error");
		alert("catch" + e);
	}
}

function portScanning()
{
	g_PortScanRetryCnt = 0;

	g_localDemonAddr = "https://127.0.0.1:" + g_PortValue;
		
	var reqData = new requestData();
	reqData.url = g_localDemonAddr;
	reqData.func = "isRunning";
	reqData.param = g_NCVersion;
	reqData.callback = result_portscanCB;
	reqData.protocolName = "GET";
	
	reqData.retrycnt = g_ReqInstallRetryCnt;
	MakeSendData(reqData);
	DM_SendRequest(reqData,0,false); // 
	

}
function Nexess_api_dispatcher(callfuc,callback)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = callfuc;
  reqData.param = "";
  reqData.callback = callback;
  reqData.protocolName = "GET";
		
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetMAC(callback)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetMAC";
  
  reqData.param = "";
  reqData.callback = callback;
  reqData.protocolName = "GET";
		
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetTicket(callback)
{
   g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetTicket";
  
  reqData.param = "";
  reqData.callback = callback;
  reqData.protocolName = "GET";
		
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}
function Test()
{
    alert("Test");
}

function Nexess_RefreshSessionKey(callback)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "RefreshSessionKey";
  
  reqData.param = "";
  reqData.callback = callback;
  reqData.protocolName = "GET";
		
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,1,false);
}

function Nexess_IsLogin(callback)
{
    ////////////////////////////////////////
    //테스트 코드
    ///////////////////////////////////////
    //pref("network.negotiate-auth.trusted-uris", sitelist);
    ////////////////////////////////////////////////////////////
    
  g_CallBack = callback;
  alert("IsLogin");
  
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "IsLogin";
  reqData.param = "";
  reqData.callback = callback;
  reqData.protocolName = "GET";
		
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);

}

function Nexess_GetLoginToa(callback)
{
  g_CallBack = callback;
  //alert("GetLoginToa");
  
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetLoginToa";
  reqData.param = "";
  reqData.callback = callback;
  reqData.protocolName = "GET";
		
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_FinalizeLogin(callback,param1,param2)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "FinalizeLogin";
  reqData.param = param1+"~"+param2;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,true);

}

function Nexess_PrepareResession(callback,param)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "PrepareResession";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,1,false);
}

function Nexess_PrepareResessionGP(callback,param)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "PrepareResessionGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,1,false);
}

function Nexess_SetLoginProcessStatus(callback,param)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "SetLoginProcessStatus";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_ResessionSuccess(callback,param)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "ResessionSuccess";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_setProviderID(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "setProviderID";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}




function Nexess_SecureUpdate(callback,param)
{
  //SK는 POC중에는 하지 말자.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "SecureUpdateFiles";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function result_IsLogin(responseData)
{
  alert("result_IsLogin 리절트");
  alert(responseData.resultCode);
  if (responseData.msg == "")
    alert("비었음");
  else 
    alert(responseData.msg);
    
	if(responseData != null)
	{
		// 설치 페이지로 이동하는 실패 (데몬이 설치되어 있지 않는 경우)
		if( responseData.resultCode == "0" || responseData.resultCode === undefined )
		{
			
			if(g_PortValue >= 17888)
				g_PortValue = 15888;
			else
				g_PortValue = g_PortValue + 1000;

			g_PortScanRetryCnt = g_PortScanRetryCnt + 1;
			if(g_PortScanRetryCnt >= 3)
			{ 
				// 설치 페이지로 이동한다.
				g_CallBack(1, "");
			}
			else
			{
				g_localDemonAddr = "https://127.0.0.1:" + g_PortValue;
				var reqData = new requestData();
				reqData.url = g_localDemonAddr;
				reqData.func = "isRunning";
				reqData.param = "";
				reqData.callback = result_portscanCB;
				reqData.protocolName = getProtocolName(reqData.func);
				reqData.retrycnt = g_ReqInstallRetryCnt;
				MakeSendData(reqData);
				DM_SendRequest(reqData,0,false);
			}
		}
		// 성공
		else if ( responseData.resultCode == "1")
		{
            g_CallBack(resonseData.data);
		}
	}
		
	
}

function result_portscanCB(responseData)
{
    
  	if(responseData != null)
	{
		// 설치 페이지로 이동하는 실패 (데몬이 설치되어 있지 않는 경우)

		if( responseData.resultCode == "0" || responseData.resultCode === undefined )
		{
			

			g_PortScanRetryCnt = g_PortScanRetryCnt + 1;
			if(g_PortScanRetryCnt >= 1)
			{ 
				// 설치 페이지로 이동한다.
				g_CallBack(0, "");
			}
			else
			{
				g_localDemonAddr = "https://127.0.0.1:" + g_PortValue;
				var reqData = new requestData();
				reqData.url = g_localDemonAddr;
				reqData.func = "isRunning";
				reqData.param = "";
				reqData.callback = result_portscanCB;
				reqData.protocolName = "GET";
				reqData.retrycnt = g_ReqInstallRetryCnt;
				MakeSendData(reqData);
				DM_SendRequest(reqData,0,false);
			}
		}
		// 성공
		else if ( responseData.resultCode == "1")
		{
		    g_CallBack(1, "")
			
			
		}
		//버젼 업데이트 필요.
		else if ( responseData.resultCode == "2")
		{
			g_CallBack(2, "");
		}
		// 그 이외의 
		// 1. SSL 인증서가 등록 안되어 있거나 
		// 2. 서버 Response 형식이 JSON 형태가 아니거나
		// 3. Get 방식일때 CallBack을 잘못 파싱하였거나
		// 4. 향상된 보호모드가 설정되어 있거나
		else 
		{
			alert(responseData.msg);
		}
	}
}


function Nexess_InstallCheck(callback)
{	
	g_CallBack = callback;
	//g_form = form;	
	portScanning();	
}


function result_getVersionCB(responseData)
{
  alert("겟버젼");
  
	if(responseData != null)
	{
		// 설치 페이지로 이동하는 실패 (데몬이 설치되어 있지 않는 경우)
		if( responseData.resultCode == "0" )
		{
			g_CallBack(6, responseData.msg);
		}
		// 성공
		else if ( responseData.resultCode == "1")
		{
			if(checkMoaSignSetup(responseData.msg))
			{
				//정상적으로 설치 됨
				g_CallBack(0, "");
			}
			else
			{
				//업데이트 필요함
				g_CallBack(2, "");
			}
		}
		// 그 이외의 
		// 1. SSL 인증서가 등록 안되어 있거나 
		// 2. 서버 Response 형식이 JSON 형태가 아니거나
		// 3. Get 방식일때 CallBack을 잘못 파싱하였거나
		// 4. 향상된 보호모드가 설정되어 있거나
		else 
		{
			g_CallBack(5, responseData.msg);
		}
	}
}

//////////////////////////////////////////////////////
//2015.11.23 추가
function Nexess_Logout(callback,param)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "Logout";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,true);
}

function Nexess_LogoutWithOption(callback,param)
{
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "LogoutWithOption";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,true);
}	

function Nexess_ReConfirmGP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "ReConfirmGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_IsLoginGP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "IsLoginGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_RefreshSessionKeyGP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "RefreshSessionKeyGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_ErrorReport(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "ErrorReport";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_SetAttribute(callback,param,param2)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "SetAttribute";
  reqData.param = param+ '~' + param2;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetActiveDirectoryName(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetActiveDirectoryName";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetUserName(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetUserName";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_FinalizeLoginGP(callback,param,param2,param3,param4)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "FinalizeLoginGP";
  reqData.param = param+ '~'+ param2 + '~' + param3 + '~' + param4;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,1,true);
}

function Nexess_GetTicketGP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetTicketGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetActiveLocalIP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetActiveLocalIP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetLoginIDGP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetLoginIDGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_Encrypt(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "Encrypt";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}

function Nexess_GetAccountGP(callback,param)
{
  //SK는 해당 함수 없다.
  g_CallBack = callback;
  var reqData = new requestData();
  reqData.url = g_localDemonAddr;
  reqData.func = "GetAccountGP";
  reqData.param = param;
  reqData.callback = callback;
  reqData.protocolName = "GET";
  reqData.retrycnt = g_ReqInstallRetryCnt;
  MakeSendData(reqData);
  DM_SendRequest(reqData,0,false);
}




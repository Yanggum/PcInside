var gNameCtrl = null;
var gEnabled = false;

$(document).ready(function () {

    try {
        if (gPresenceUseYN === 'Y') { }
        else { return; }
    } catch (e) { return; }



    if (window.ActiveXObject || 'ActiveXObject' in window) {
        try {
            gNameCtrl = new ActiveXObject("Name.NameCtrl.1");
        }
        catch (e) {
            gNameCtrl = null;
        }
    }

    try {
        if (gNameCtrl) {
            //gNameCtrl.OnStatusChange = this.onStatusChange.bind(this);
            gNameCtrl.OnStatusChange = function (name, status, id) {

                var status = getPresenceStatus(name);

                //$names = $('span[name=presence][data-presence-emailaddress="' + name + '"]');
                $names = $('span[name=presence],span.presence_name_card').filter('[data-presence-emailaddress="' + name + '"]');
                $names.removeClass('status_access status_online status_offline status_leftseat status_busy status_return status_linesbusy status_donotdisturb').addClass(status);
            };
            gEnabled = true;
        }
    }
    catch (e) {
        gEnabled = false;
    }
    try {
        // 2016-06-29(gylee) - class presence_name_card에 대해 카드가 생성되도록 합니다.
        ApplyPresenceNamecard();

        // 2016-10-24 H.M.N  포탈 프리젠스가 오피스2010, IE10환경에서 동작하지 않음... ApplyPresencePrepare 호출해서 gNameCtrl.GetStatus() 함수를 한 번씩 호출해주고 다시 ApplyPresence() 함수를 호출한다.
        ApplyPresencePrepare();
        setTimeout("ApplyPresence()", 100);
    }
    catch (e) {
        var a = e;
    }
});

function isEnabled() {
    return !!(gEnabled == true && gNameCtrl);
}

function getPresenceStatus(name) {
    if (!isEnabled()) return '';
    if (!gNameCtrl) return '';
    try {
        var status = gNameCtrl.GetStatus(name, '');
        return getStatusClass(status);
    }
    catch (e) {
        return '';
    }
}

function getStatusClass(state) {
    /*****
    * SK이노베이션 NateOn Biz 기준 상태 코드 값
        - 대화가능 0
        - 방해금지 9
        - 다른용무중 3
        - 곧 돌아오겠음 4
        - 자리비움 2
        - 통화중 5
        - 오프라인 1
    : 상태표시 클래스
    - .status_access : 상태 공통 클래스
    - .status_online : 초록색		대화 가능
    - .status_donotdisturb :		방해 금지
    - .status_busy : 빨간색			다른 용무 중
    - .status_return : 주황색			곧 돌아오겠음
    - .status_leftseat : 			자리 비움
    - .status_linesbusy : 			통화 중
    - .status_offline : 회색			오프라인 표시
    *****/
    switch (state) {
        case 0:
            return 'status_access status_online';
        case 1:
            return 'status_access status_offline';
        case 2:
            return 'status_access status_leftseat';
        case 3:
            return 'status_access status_busy';
        case 4:
            return 'status_access status_return';
        case 5:
            return 'status_access status_linesbusy';
        case 9:
            return 'status_access status_donotdisturb';

            /*
            https://msdn.microsoft.com/en-us/library/office/bb802706(v=office.14).aspx
            A Long that indicates the online status, which can be one of the following values:
            0 - Online
            1 - Offline
            2 - Away
            3 - Busy
            4 - Be Right Back
            5 - On the Phone
            6 - Out to Lunch    
            */
            /************
            * SK이노베이션 버전으로 수정하기 전 기존 코드 백업... 2016-12-29  H.M.N
            switch (state) {
                case 0:
                    // available
                    return 'status_access status_online';
                case 1:
                    // offline
                    //return 'status_access status_default';
                    return 'status_access status_offline';
                case 2:
                case 4:
                case 16:
                    // away
                    //return 'away';
                case 3:
                case 5:
                    // inacall
                    //return 'inacall';
                case 6:
                case 7:
                case 8:
                    // outofoffice
                    //return 'outofoffice';
                case 10:
                    // busy
                    return 'status_access status_busy';
                case 9:
                case 15:
                    return 'status_access status_offline';
            ***********/
    }
}

function ApplyPresence() {
    if (window.CSSBS_ie == 1 && typeof window.CSSBS_edge == 'undefined' && gPresenceUseYN == 'Y') {
        //$('span[name=presence]').each(function () {
        //span[name=presence],span.presence_name_card
        $('span[name=presence],span.presence_name_card').each(function () {
            if ($(this).hasClass('presenced') == false) {
                $(this).addClass('presenced');
                var emailAddress = $(this).data('presence-emailaddress');
                var className = getPresenceStatus(emailAddress);
                $(this).addClass(className);
            }
        });
    }
}

function ApplyPresencePrepare() {
    //$('span[name=presence]').each(function () {
    $('span[name=presence],span.presence_name_card').each(function () {
        var emailAddress = $(this).data('presence-emailaddress');
        //그냥 한번 호출
        getPresenceStatus(emailAddress);
    });
}

function ApplyPresenceNamecard() {

    if (window.CSSBS_ie == 1 && typeof window.CSSBS_edge == 'undefined' && gPresenceUseYN == 'Y') {

        // 2016-06-29(gylee) - class presence_name_card에 대해 카드가 생성되도록 합니다.
        $('.presence_area').off('mouseover').off('mouseout');
        $('.presence_area').on('mouseover', 'span.presence_name_card', function (e) {
            var emailAddress = $(e.target).data('presence-emailaddress');

            var obj = this;
            var objSpan = obj;
            var objOOUI = obj;
            var oouiX = 0, oouiY = 0;
            var objRet = IMNGetOOUILocation(obj);

            objSpan = objRet.objSpan;
            objOOUI = objRet.objOOUI;
            oouiX = objRet.oouiX;
            oouiY = objRet.oouiY - 5;

            gNameCtrl.ShowOOUI(emailAddress, 0, oouiX, oouiY);
        });
        $('.presence_area').on('mouseout', 'span.presence_name_card', function (e) {
            setTimeout("gNameCtrl.HideOOUI()", 100);

            //gNameCtrl.HideOOUI();
            // 네임카드 사라진 이후에 윈도우 포커스를 잃는 문제는 해결
            try { window.top.focus(); }
            catch (e) { console.debug(e); }
        });

    }
}

function PresenceControlGetOOUILocation(obj) {
    var objRet = new Object;
    var objSpan = obj;
    var objOOUI = obj;
    var oouiX = 0, oouiY = 0, objDX = 0;
    var scrollTopY = (document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop : (document.body.scrollTop ? document.body.scrollTop : 0);
    var fRtl = document.dir == "rtl";

    while (objSpan && objSpan.tagName != "SPAN" && objSpan.tagName != "TABLE") {
        objSpan = objSpan.parentNode;
    }

    if (objSpan) {
        var collNodes = objSpan.tagName == "TABLE" ? objSpan.rows(0).cells(0).childNodes : objSpan.childNodes;
        var i;
        for (i = 0; i < collNodes.length; ++i) {
            if (collNodes.item(i).tagName == "IMG" && collNodes.item(i).id) {
                objOOUI = collNodes.item(i);
                break;
            }

            if (collNodes.item(i).tagName == "A" &&
                    collNodes.item(i).childNodes.length > 0 &&
                    collNodes.item(i).childNodes.item(0).tagName == "IMG" &&
                    collNodes.item(i).childNodes.item(0).id) {
                objOOUI = collNodes.item(i).childNodes.item(0);
                break;
            }
        }
    }

    obj = objOOUI;
    while (obj) {
        if (fRtl) {
            if (obj.scrollWidth >= obj.clientWidth + obj.scrollLeft)
                objDX = obj.scrollWidth - obj.clientWidth - obj.scrollLeft;
            else
                objDX = obj.clientWidth + obj.scrollLeft - obj.scrollWidth;

            oouiX += obj.offsetLeft + objDX;
        }

        else
            oouiX += obj.offsetLeft - obj.scrollLeft;

        // Changed  Fixed scroll up coordination problem due to master page
        //oouiY+=obj.offsetTop - obj.scrollTop;
        oouiY += obj.offsetTop;
        obj = obj.offsetParent;

    }

    try {
        obj = window.frameElement;
        while (obj) {
            if (fRtl) {
                if (obj.scrollWidth >= obj.clientWidth + obj.scrollLeft)
                    objDX = obj.scrollWidth - obj.clientWidth - obj.scrollLeft;
                else
                    objDX = obj.clientWidth + obj.scrollLeft - obj.scrollWidth;
                oouiX += obj.offsetLeft + objDX;
            }

            else
                oouiX += obj.offsetLeft - obj.scrollLeft;

            // Changed  Fixed scroll up coordination problem due to master page
            // oouiY+=obj.offsetTop -
            obj.scrollTop;
            oouiY += obj.offsetTop;
            obj = obj.offsetParent;
        }

    } catch (e) {

    };

    objRet.objSpan = objSpan;
    objRet.objOOUI = objOOUI;
    objRet.oouiX = oouiX;
    //!!! This is the code change:
    // Changed  Fixed scroll up coordination problem due to master page
    //objRet.oouiY=oouiY
    objRet.oouiY = oouiY - scrollTopY;

    if (fRtl)
        objRet.oouiX += objOOUI.offsetWidth;

    return objRet;
}

function IMNGetOOUILocation(obj) {
    var objRet = new Object;
    var objSpan = obj;
    var objOOUI = obj;
    var oouiX = 0, oouiY = 0, objDX = 0;
    var scrollTopY = (document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop : (document.body.scrollTop ? document.body.scrollTop : 0);
    var fRtl = document.dir == "rtl";
    while (objSpan && objSpan.tagName != "SPAN" && objSpan.tagName != "TABLE") {
        objSpan = objSpan.parentNode;
    }
    if (objSpan) {
        var collNodes = objSpan.tagName == "TABLE" ?
			objSpan.rows(0).cells(0).childNodes :
			objSpan.childNodes;
        var i;
        for (i = 0; i < collNodes.length; ++i) {
            if (collNodes.item(i).tagName == "IMG" && collNodes.item(i).id) {
                objOOUI = collNodes.item(i);
                break;
            }
            if (collNodes.item(i).tagName == "A" &&
				collNodes.item(i).childNodes.length > 0 &&
				collNodes.item(i).childNodes.item(0).tagName == "IMG" &&
				collNodes.item(i).childNodes.item(0).id) {
                objOOUI = collNodes.item(i).childNodes.item(0);
                break;
            }
        }
    }
    obj = objOOUI;
    while (obj) {
        if (fRtl) {
            if (obj.scrollWidth >= obj.clientWidth + obj.scrollLeft)
                objDX = obj.scrollWidth - obj.clientWidth - obj.scrollLeft;
            else
                objDX = obj.clientWidth + obj.scrollLeft - obj.scrollWidth;
            oouiX += obj.offsetLeft + objDX;
        }
        else
            oouiX += obj.offsetLeft - obj.scrollLeft;

        // Changed  Fixed scroll up coordination problem due to master page
        //oouiY+=obj.offsetTop - obj.scrollTop;
        oouiY += obj.offsetTop;
        obj = obj.offsetParent;
    }
    try {
        obj = window.frameElement;
        while (obj) {
            if (fRtl) {
                if (obj.scrollWidth >= obj.clientWidth + obj.scrollLeft)
                    objDX = obj.scrollWidth - obj.clientWidth - obj.scrollLeft;
                else
                    objDX = obj.clientWidth + obj.scrollLeft - obj.scrollWidth;
                oouiX += obj.offsetLeft + objDX;
            }
            else
                oouiX += obj.offsetLeft - obj.scrollLeft;
            // Changed  Fixed scroll up coordination problem due to master
            //oouiY+=obj.offsetTop - obj.scrollTop;
            oouiY += obj.offsetTop;
            obj = obj.offsetParent;
        }
    } catch (e) {
    };

    objRet.objSpan = objSpan;
    objRet.objOOUI = objOOUI;
    objRet.oouiX = oouiX;

    obj = objOOUI;
    while (obj) {
        if (obj.tagName == "DIV" && obj.scrollTop > 0) {
            scrollTopY = scrollTopY + obj.scrollTop;
        }
        obj = obj.parentNode;
    }
    objRet.oouiY = oouiY - scrollTopY;

    if (fRtl)
        objRet.oouiX += objOOUI.offsetWidth;

    return objRet;
}
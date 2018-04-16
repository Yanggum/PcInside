
/*
Author : Mik.GEUN
Created : 2016-03-07
DESC : 팝업 오픈을 위한 함수 모음
*/


// ======================================================================
// [팝업 공통] ~시작
// ======================================================================

// 팝업 Stack 관리를 위한 준비작업

// top 포함 모든 팝업 관련 페이지에서는 콜백을 위한 팝업 루트정보를 링크한다.
window.MikPopupCurrentInfo = {
    $: $,
    IsTopWindow: (window == window.top),
    PopupStackInfo: window.top.MikPopupStackInfo,
    ChildPopup: [],
}

// window.top 여부에 따라서 생성하는 정보가 달라진다. top 일때 전체 팝업 정보를 생성한다.
if (window.MikPopupCurrentInfo.IsTopWindow) {
    // 전역 설정 할당
    window.top.MikPopupStackInfo = {
        OnPopup: false,
        Scroll: { overflow: null, offset: 0 },
        PopupList: [],
        ParentWindowMap: {},
    }
    // 팝업 활성화시 배경 스크롤 방지 코드
    $(window).scroll(function () {
        if (window.top.MikPopupStackInfo.OnPopup) {
            $w = $(this);
            $w.scrollTop(window.top.MikPopupStackInfo.Scroll.offset);
        }
    });
    $('html,body').on('scroll touchmove mousewheel', function (e) {
        if (window.top.MikPopupStackInfo.OnPopup) {
            e.preventDefault(); e.stopPropagation(); return false;
        }
    });
}

// 현재 페이지가 팝업용 페이지인지 체크 후 팝업페이지 리스트 등록한다.
$(function () {
    if (PopupCommon.isDimmedPopupPage()) {
        window.top.MikPopupStackInfo.PopupList.push(window);
    }
});

// !!!!
var PopupCommon = window.MikPopupCommonInfo = {
    WrapID: 'MikCommonPopupWarp',
    ContainerClass: 'mik_popup_container',
    PopupClassIdKey: 'POPCLSID', // POPCLSID 값은 변경하지 않도록 주의해주세요. ServerSide Page behind코드에서 해당 값을 기준으로 팝업 여부를 판단합니다.
    PopupTitle: function () {
        if (typeof (gWebInfo) != 'undefined' && typeof (gWebInfo.SiteName) != 'undefined' && gWebInfo.SiteName != null) return gWebInfo.SiteName;
        else return 'Hi 실트론';
    },

    //getPopupStackInfo: function () { return window.top.MikPopupStackInfo; },
    //getPopupCurrentInfo: function () { return window.MikPopupCurrentInfo; },

    lockTopPageScroll: function (lock) {
        // 중첩 lock 무시
        if (window.top.MikPopupStackInfo.OnPopup && lock) return;

        // css처리         
        $h = $('html', window.top.document);
        $w = $(window, window.top);
        if (lock) {
            var of = $h.css('overflow');
            if (typeof (of) == 'undefined' || of == null) of = '';
            window.top.MikPopupStackInfo.Scroll.overflow = of;
            $h.css('overflow', 'hidden');
            window.top.MikPopupStackInfo.Scroll.offset = $w.scrollTop();
            $('body', window.top.document).css('overflow-y', 'scroll');
        }
        else {
            $h.css('overflow', window.top.MikPopupStackInfo.Scroll.overflow);
            $w.scrollTop(window.top.MikPopupStackInfo.Scroll.offset);
            $('body', window.top.document).css('overflow-y', '');
        }


        // lock flag 처리
        window.top.MikPopupStackInfo.OnPopup = lock;
    },

    showPopup: function (popup, popupClassId) {

        // 현재 윈도우 가영역 배경처리
        //$('#' + PopupCommon.WrapID).show();

        // 신규 팝업의 unique key 를 생성
        if (typeof (popupClassId) == 'undefined' || popupClassId == null || popupClassId.length <= 0) popupClassId = (new Date()).getTime();
        //var ticks = (new Date()).getTime();
        var ticks = popupClassId;

        // 개별 팝업을 감싸는 컨테이너 생성
        $instance = $('<div class="mik_popup_instance ignore_slideup skignb_ignore_slideup ignore_hide" data-popup-rel="' + ticks + '"></div>');

        // 중첩 팝업시 뒤쪽 팝업이 동작하지 않도록 실드 생성
        //$shield = $(document.createElement('div'));
        $shield = $('<div class="mik_shield" data-popup-rel="' + ticks + '"></div>');
        $shield.css('position', 'fixed').css('top', '0px').css('left', '0px').css('padding', '0px').css('margin', '0px')
        .css('background-color', '#000').css('opacity', '0.7')
        .width('100%').height('100%')
        // 마우스휠 스크롤 방지
        $shield.on('scroll touchmove mousewheel', function (e) { e.preventDefault(); e.stopPropagation(); return false; });

        // 인스턴스에 실드 추가
        $instance.append($shield);

        // 인스턴스에 팝업 추가 - 순서는 실드->팝업 순으로 처리해야함.. 실드가 배경으로 처리되도록
        $instance.append(popup);
        $(popup).attr('data-popup-rel', ticks);

        // 인스턴스를 팝업 컨테이너에 추가
        $('#' + PopupCommon.WrapID, window.top.document).show().append($instance);

        window.top.MikPopupStackInfo.ParentWindowMap[ticks] = window;

        // 포커스 정리
        popup.find('.mik_closer').focus();
        popup.find('IFRAME').focus();

        // 위치 보정
        this.adjustPopup(popup);

        // 배경 스크롤 방지코드 호출
        PopupCommon.lockTopPageScroll(true);

    },

    closePopup: function (popup) {

        // PopupCommon 참조, IE버그로 현재 전역변수 바로 호출할때 undefined 오류가 발생함
        var safetyCommonInfo = window.MikPopupCommonInfo;
        var safetyCurrentInfo = window.MikPopupCurrentInfo;

        // 팝업 조회
        $popup = $(popup);

        // 팝업 감싸는 인스턴스 조회
        $instance = $popup.parent();

        // 현재 인스턴스 뒤로 팝업인스턴스가 더 존재하는지 확인한다. 존재하면 우선 숨김처리만 한다.
        if ($instance.next('.mik_popup_instance').length > 0) {
            $instance.removeClass('mik_popup_instance').addClass('removeReady').hide();
            return;
        }

        // removeReady 인 인스턴스 제거
        //$instance.siblings('.removeReady').remove();

        // 이시점에 $ 체크할 필요가 있음.
        // 현재 팝업이 중첩 팝업인 경우 부모 iframe이 위 단계에서 삭제됨으로서 window 현재 모든 객체가 undefine으로 길을 잃어버리는 IE버그가 존재함.

        // 부모 팝업 제거를 후순위로 미룸



        // 팝업 인스턴스 제거 (팝업/실드 제거됨)
        //$instance.remove();
        // 현재 팝업도 바로 지윚 않고 대기상태로 보낸다. 일부 페이지에서 팝업을 닫고나서 이상한 동작을 하는곳이 있음.
        $instance.removeClass('mik_popup_instance').addClass('removeReady').hide();

        // 현재 페이지의 가배경 영역은 showPopup 단계에서 활성화 시키지 않았음..
        // 대신 전체 팝업 인스턴스의 shield 가 해당 역할을 수행함

        // 더이상 팝업이 존재하지 않는 경우 모든 팝업 데이터 클리어
        $wrap = $('#' + safetyCommonInfo.WrapID, window.top.document);
        if ($wrap.find('.mik_popup_instance').length <= 0) {
            // 팝업 해제
            $wrap.hide();

            // 스크롤락 해제
            PopupCommon.lockTopPageScroll(false);

            // 위 단계에서 미뤄뒀던 중첩 부모 팝업 해제를 이곳에서 해준다.
            setTimeout(function () {
                $($wrap.find('.removeReady iframe')).attr('src', '');
                $wrap.find('.removeReady').remove();
            }, 500);
        }

    },

    getParentWindow: function () {


        return window.top.MikPopupStackInfo.ParentWindowMap[this.getUrlParam(this.PopupClassIdKey)];

        //var $windows = $('.mik_popup_container', window.top.document);
        //if ($windows.length <= 1) return window.top;
        //else {
        //    var $parent = $windows.last();
        //    do {
        //        $parent = $parent.prev();
        //    } while ($parent.hasClass('mik_popup_container') == false);
        //    try { return $parent.find('IFRAME').get(0).contentWindow; }
        //    catch (e) { return window.top; }
        //}

        try {
            $windows = $('.mik_popup_instance,.removeReady', window.top.document);
            if ($windows.length <= 1) {
                return window.top;
            }
            else {

                $parentPopup = $($windows.filter('[data-popup-rel="' + this.getUrlParam(this.PopupClassIdKey) + '"]').first()[0]).prev();
                var returnWindow = $parentPopup.find('IFRAME').get(0).contentWindow;
                if (typeof (returnWindow) == 'undefined' || returnWindow == null) return window.top;
                return returnWindow;
                //return $windows.last().prev().find('IFRAME').get(0).contentWindow;
            }
        } catch (e) { return window.top; }

    },
    adjustPopups: function () {
        var me = this;
        $window = $(window.top);
        $wrap = $('#' + PopupCommon.WrapID);
        $wrap.find('.' + PopupCommon.ContainerClass).each(function () {
            me.adjustPopup($(this));
        });
    },
    adjustPopup: function ($container, $window) {
        if (typeof ($window) == 'undefined' || $window == null) $window = $(window.top);
        if (typeof ($container) != 'undefined' && $container != null && $container.length > 0) {

            var inHeaderHeight = $container.find('.pop_header').height();
            var finalHeight = $container.outerHeight() + inHeaderHeight;
            var top = ($window.innerHeight() - finalHeight) / 2;
            var left = ($window.innerWidth() - $container.outerWidth()) / 2;

            // 사이즈 보정 (100% 이상으로 커진경우..)            
            if ($window.innerHeight() <= finalHeight) {
                top = 5;
                $container.height($window.innerHeight() - inHeaderHeight - 10);
            }

            // 상단 위치 지정
            $container.css('top', (top < 0 ? 0 : top) + 'px');

            // 2017-03-10 gyuyeol - mik_pop_new 클래스가 있으면 좌우 조절을 하지 않습니다.
            if (!$container.hasClass('mik_pop_new'))
                $container.css('left', (left < 0 ? 0 : left) + 'px');
        }
    },

    getRealPopupWrap: function () {
        return $('#' + PopupCommon.WrapID, window.top.document);
    },

    createGuid: function () {
        //return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        //    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        //    return v.toString(16);
        //});
        try {
            return MikCommon.createGuid();
        }
        catch (e) {
            return (new Date()).getTime();
        }
    },

    getUrlParam: function (name, location) {
        if (location == null || typeof (location) != 'string') {
            location = document.location;
        }
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1] || 0;
        }
    },

    isDimmedPopupPage: function () {
        var clsid = this.getUrlParam(this.PopupClassIdKey);
        if (clsid != null && typeof (clsid) == 'string') return true;
        else return false;
    },

    closeSelfPopup: function () {
        var clsid = this.getUrlParam(this.PopupClassIdKey);
        var self = this.getRealPopupWrap().find('.' + this.ContainerClass + '.' + clsid + ' .mik_closer').click();
    }
};
window.MikPopupCommon = PopupCommon;

function CloseSelfDimmedPopupFromParent() {
    PopupCommon.closeSelfPopup();
}

$(function () {
    // 팝업 전용 영역 미리 준비해두자    
    $pop_warp = $('<div id="' + PopupCommon.WrapID + '" class="mik_pop_wrap" style="z-index:5000;position:fixed;top:0px;left:0px;" ><div class="bg_light" ></div></div>');
    $('body').append($pop_warp);

    // 윈도우 리사이즈 이벤트
    $(window).resize(function () {
        PopupCommon.adjustPopups();
    });

});

// ======================================================================
// [팝업 공통] ~종료
// ======================================================================


// ======================================================================
// [메시지 팝업] ~시작
// ======================================================================

var MikMessagePopupMethod = function () { };
MikMessagePopupMethod.defaults = {
    title: {
        use: true,
        isHtml: false,
        text: 'Hi 실트론'
    },
    resources: {
        ok: 'OK',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No',
    }
};
MikMessagePopupMethod.prototype = {

    iconType: {
        none: '', confirm: 'ico_alert_all_confirm', accessDenied: 'ico_alert_all_denied1', accessDeniedCross: 'ico_alert_all_denied2', security: 'ico_alert_all_security',
        error: 'ico_alert_all_error1', disabled: 'ico_alert_all_error2', notfound: 'ico_alert_all_notfound', info: 'ico_alert_all_info',
        upload: 'ico_alert_all_upload', download: 'ico_alert_all_download', secession: 'ico_alert_all_secession', favorite: 'ico_alert_all_favorite',
        notification: 'ico_alert_all_notification', help: 'ico_alert_all_help'
    },

    generateMessagePopupContainer: function () {
        var me = this;
        // 컨테이너 생성
        var $container = $(document.createElement('div'));
        $container.addClass('pop_container pop_layer pop_layer_s ' + PopupCommon.ContainerClass);
        $container.css('margin', '0px').css('position', 'fixed');
        // 타이틀
        {
            // 타이틀바
            {
                $title = $('<div class="pop_header mik_closer_mark_1"><div class="left_area"><div class="pop_title mik_title"></div></div><div class="right_area"><button class="btn_close mik_closer" style="display:none;" onclick="return false;"><span class="ico_popup ico_popup_close"></span></button></div></div>');
                if (MikMessagePopupMethod.defaults.title.isHtml) { $title.find('.mik_title').html(MikMessagePopupMethod.defaults.title.text); }
                else { $title.find('.mik_title').text(MikMessagePopupMethod.defaults.title.text); }
                $container.append($title);
            }
            // alert 전용 X 마커
            {
                $title = $('<button class="btn_close mik_closer_mark_2 mik_closer" style="display:none;" onclick="return false;"><span class="ico_popup ico_popup_alert_close"></span></button>');
                $container.append($title);
            }
        }
        // 컨텐츠
        {
            $content = $(document.createElement('div'));
            $content.addClass('pop_body').css('padding-left', '10px').css('padding-right', '10px');
            $container.append($content);

            // 메시지 영역
            {
                $messageSection = $('<div class="sect_message"></div>');
                $content.append($messageSection);
                // 상단 - 아이콘
                {
                    $top = $('<div class="top_area"><span class="ico_alert_all mik_ico"></span></div>');
                    $messageSection.append($top);
                }
                // 하단 - 텍스트
                {
                    $bottom = $('<div class="bottom_area"><div class="alert_title mik_message"></div><div class="alert_desc mik_desc"></div></div>');
                    $messageSection.append($bottom);
                }
            }
            // 버튼 영역
            {
                $buttonSection = $('<div class="sect_button mik_buttons"></div>');
                //$buttonSection.append('<div class="left_area mik_buttons_left"></div>');
                //$buttonSection.append('<div class="center_area mik_buttons_center"></div>');
                //$buttonSection.append('<div class="right_area mik_buttons_right"></div>');
                // 무조건 중앙 정렬 (by designed)
                $buttonSection.append('<div class="center_area mik_buttons_left mik_buttons_center mik_buttons_right"></div>');
                $content.append($buttonSection);
            }
        }

        //return $container.show().draggable({ containment: '#MikCommonPopupWarp', cancel: '.mik_shield,.mik_closer,.bottom_area' });
        return $container.show();
    },

    close: function (popup) {
        PopupCommon.closePopup(popup);
    },

    html: function (html, closingCallback, closedCallback) {
        var me = this;
        if (typeof (closingCallback) != 'function' || closingCallback == null) closingCallback = function () { };
        if (typeof (closedCallback) != 'function' || closedCallback == null) closedCallback = function () { };
        var $container = this.generateMessagePopupContainer();

        $container.find('.ico_alert').addClass('ico_alert_info');
        $container.find('.mik_message').html(html);

        $buttons = $container.find('.mik_buttons_right');
        $buttons.append('<button class="btn_type_a btn_color_04 mik_btn_ok" onclick="return false;"><span class="btn_txt"></span></div>');

        $buttons.find('.mik_btn_ok').click(function () {
            closingCallback();
            me.close($container);
            closedCallback();
            //}).find('.btn_txt').text(GetMultiLanguage('Ok'));
        }).find('.btn_txt').text(MikMessagePopupMethod.defaults.resources.ok);

        PopupCommon.showPopup($container);
        $buttons.find('.mik_btn_ok').focus();
    },

    // 베이스 템플릿 함수
    singleButton: function (message, description_opt, closingCallback, closedCallback, iconClass, buttonText, useTitlebar) {
        var me = this;
        if (typeof (description_opt) == 'function') {
            closedCallback = closingCallback;
            closingCallback = description_opt;
            description_opt = '';
        } else if (typeof (description_opt) == 'undefined' || description_opt == null) description_opt = '';
        if (typeof (closingCallback) != 'function' || closingCallback == null) closingCallback = function () { };
        if (typeof (closedCallback) != 'function' || closedCallback == null) closedCallback = function () { };
        if (typeof (iconClass) != 'string' || iconClass == null) iconClass = '';
        if (typeof (buttonText) != 'string' || buttonText == null) buttonText = MikMessagePopupMethod.defaults.resources.ok;
        if (typeof (useTitlebar) != 'boolean' || useTitlebar == null) useTitlebar = MikMessagePopupMethod.defaults.title.use;
        var $container = this.generateMessagePopupContainer();

        var closerFunction = function () {
            closingCallback();
            me.close($container);
            closedCallback();
        };

        if (useTitlebar) {
            $container.find('.mik_closer_mark_1 .mik_closer').show().click(closerFunction);
            $container.find('.mik_closer_mark_2').hide();
        }
        else {
            // 타이틀바 감추기
            $container.find('.mik_closer_mark_1').hide();
            $container.find('.mik_closer_mark_2.mik_closer').show().click(closerFunction);
            $container.addClass('pop_alert');
        }

        $container.find('.mik_ico').addClass(iconClass);
        $container.find('.mik_message').text(message);
        if (description_opt.length > 0) $container.find('.mik_desc').text(description_opt);

        $buttons = $container.find('.mik_buttons_right');
        $buttons.append('<button class="btn_type_a btn_color_04 mik_btn_ok" onclick="return false;"><span class="btn_txt"></span></div>');

        $buttons.find('.mik_btn_ok').click(closerFunction).find('.btn_txt').text(buttonText);

        PopupCommon.showPopup($container);
        $buttons.find('.mik_btn_ok').focus();
    },


    // 실제 호출 템플릿 함수
    confirm: function (message, description_opt, closingCallback, closedCallback) {
        var me = this;
        if (typeof (description_opt) == 'function') {
            closedCallback = closingCallback;
            closingCallback = description_opt;
            description_opt = '';
        } else if (typeof (description_opt) == 'undefined' || description_opt == null) description_opt = '';
        if (typeof (closingCallback) != 'function' || closingCallback == null) closingCallback = function () { };
        if (typeof (closedCallback) != 'function' || closedCallback == null) closedCallback = function () { };
        var $container = this.generateMessagePopupContainer();

        $container.find('.mik_ico').addClass('ico_alert_all_confirm');
        $container.find('.mik_message').text(message);
        if (description_opt.length > 0) $container.find('.mik_desc').text(description_opt);

        $buttons = $container.find('.mik_buttons_right');
        $buttons.append('<button class="btn_type_a btn_color_04 mik_btn_yes" onclick="return false;"><span class="btn_txt"></span></div>');
        $buttons.append('<button class="btn_type_a btn_color_03 mik_btn_no" style="margin-left:5px;" onclick="return false;"><span class="btn_txt"></span></div>');

        $buttons.find('.mik_btn_yes').click(function () {
            closingCallback(true);
            me.close($container);
            closedCallback(true);
        }).find('.btn_txt').text(MikMessagePopupMethod.defaults.resources.yes);

        $buttons.find('.mik_btn_no').click(function () {
            closingCallback(false);
            me.close($container);
            closedCallback(false);
        }).find('.btn_txt').text(MikMessagePopupMethod.defaults.resources.no);

        PopupCommon.showPopup($container);

        $buttons.find('.mik_btn_yes').focus();

    },

    password: function (message, description_opt, closingCallback, closedCallback) {
        var me = this;
        if (typeof (description_opt) == 'function') {
            closedCallback = closingCallback;
            closingCallback = description_opt;
            description_opt = '';
        } else if (typeof (description_opt) == 'undefined' || description_opt == null) description_opt = '';
        if (typeof (closingCallback) != 'function' || closingCallback == null) closingCallback = function () { };
        if (typeof (closedCallback) != 'function' || closedCallback == null) closedCallback = function () { };
        var $container = this.generateMessagePopupContainer();

        $container.find('.mik_ico').addClass('ico_alert_all_security');
        $container.find('.mik_message').text(message);
        if (description_opt.length > 0) $container.find('.mik_desc').text(description_opt);

        $container.find('div.bottom_area').append($('<div class="input_box password"><input type="password" style="width: 100%"></div>'));

        $buttons = $container.find('.mik_buttons_right');
        $buttons.append('<button class="btn_type_a btn_color_04 mik_btn_yes" onclick="return false;"><span class="btn_txt"></span></div>');
        $buttons.append('<button class="btn_type_a btn_color_03 mik_btn_no" style="margin-left:5px;" onclick="return false;"><span class="btn_txt"></span></div>');

        $buttons.find('.mik_btn_yes').click(function () {
            var password = $container.find('div.bottom_area input[type="password"]').val();
            closingCallback(true, password);
            me.close($container);
            closedCallback(true, password);
        }).find('.btn_txt').text(MultiLanguageScript.Confirm);

        $buttons.find('.mik_btn_no').click(function () {
            var password = $container.find('div.bottom_area input[type="password"]').val();
            closingCallback(false, password);
            me.close($container);
            closedCallback(false, password);
        }).find('.btn_txt').text(MikMessagePopupMethod.defaults.resources.no);

        PopupCommon.showPopup($container);

        $buttons.find('.mik_btn_yes').focus();

    },

    alert: function (message, description_opt, closingCallback, closedCallback) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, this.iconType.error, null);
    },
    alertWithUnknown: function (closedCallback) {
        this.alert(GetMultiLanguage('Common_Message_FailedUnknown'), null, null, closedCallback);
    },

    info: function (message, description_opt, closingCallback, closedCallback) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, this.iconType.info, null);
    },

    accessDenied: function (message, description_opt, closingCallback, closedCallback) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, this.iconType.accessDenied, null);
    },

    security: function (message, description_opt, closingCallback, closedCallback) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, this.iconType.security, null);
    },

    notFound: function (message, description_opt, closingCallback, closedCallback) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, this.iconType.notfound, null);
    },

    favorite: function (message, description_opt, closingCallback, closedCallback) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, this.iconType.favorite, null);
    },

    single: function (icon, message, description_opt, closingCallback, closedCallback, buttonText, useTitlebar) {
        this.singleButton(message, description_opt, closingCallback, closedCallback, icon, buttonText, useTitlebar);
    },


};
var MikMessagePopup = new MikMessagePopupMethod();



// ======================================================================
// [메시지 팝업] ~종료
// ======================================================================



// ======================================================================
// [토스트 팝업] ~시작
// ======================================================================

var MikToastMessagePopupMethod = function () { };
MikToastMessagePopupMethod.prototype = {

    ToastLevel: {
        Normal: 'normal',
        Warn: 'warn',
        Error: 'error',
        Emphasis: 'emphasis'
    },
    ToastConfiguration: {
        Delay: 1000,
        Duration: 5000,
        TMP: 0
    },

    generateToastPopupContaienr: function () {
        $toastContainer = $(document.createElement('ul'));
        $toastContainer.attr('id', 'CommonToastContainer');
        $body.append($toastContainer);
    },

    adjustTostPopup: function () {

        $toastContainer = this.generateToastPopupContaienr();

        if ($toastContainer.find('.toast').length > 0) {
            // 토스트 컨테이너 사이즈 조정
            $toastContainer.width($(window).width() * 0.5);
            $toastContainer.css('left', ($(window).width() / 2 - ($toastContainer.width() / 2)) + 'px');
            // 토스트 개별 사이즈 조정
            $toastContainer.find('.toast').each(function () {
                var toast = $(this);
            });
        }
        else {
            $toastContainer.hide();
        }
    },

    toast: function (message) {
    }

}
var MikToastMessagePopup = new MikToastMessagePopupMethod();

// ======================================================================
// [토스트 팝업] ~종료
// ======================================================================



// ======================================================================
// [윈도우 팝업] ~시작
// ======================================================================

var MikWindowPopupMethod = function () { };
MikWindowPopupMethod.prototype = {

    options: {
        width: '70%',
        height: '70%',
        title: { isHtml: false, text: PopupCommon.PopupTitle() },
        //body: { url: null, html: null },
        functions: {
            closing: function () { },
            closed: function () { },
        },
    },

    refreshTitle: function () { this.options.title.isHtml = false; this.options.title.text = PopupCommon.PopupTitle(); },

    memory: {
        $container: null,
    },

    generateMessagePopupContainer: function () {
        var me = this;
        // 컨테이너 생성
        var $container = $(document.createElement('div'));
        $container.addClass('pop_container pop_layer ' + PopupCommon.ContainerClass);
        $container.css('margin', '0px').css('position', 'fixed');
        // 헤더
        {
            $header = $(document.createElement('div'));
            $container.append($header);
            $header.addClass('pop_header');
            $header.css('cursor', 'pointer');
            $header.append('<div class="left_area"><div class="pop_title mik_title"></div></div>');
            $header.append('<div class="right_area"><button class="btn_close mik_closer"><span class="ico_popup ico_popup_close"></span></button></div>');
            $header.find('.mik_closer').click(function () { me.close($container); });
        }
        // 바디
        {
            $body = $(document.createElement('div'));
            $container.append($body);
            $body.addClass('pop_body mik_body');
            $body.css('padding', '0px').css('margin', '0px');
        }

        this.memory.$container = $container;

        // draggable 적용시 팝업이 갑자기 사라지는 현상이 있음. 디자인 스타일 속성관 관련이있을듯 하지만 일단 제거한다.
        //return $container.show().draggable({ containment: '#MikCommonPopupWarp', cancel: '.mik_shield,.mik_closer,.mik_body' });
        return $container.show();
    },

    close: function (popup) {
        if (this.options.functions.closing) this.options.functions.closing();
        PopupCommon.closePopup(popup);
        if (this.options.functions.closed) this.options.functions.closed();
    },

    closeSelf: function () {
        PopupCommon.closePopup(this.memory.$container);
    },

    show: function (url, opt) {

        var me = this;
        if (typeof (url) == 'undefined' || url == null || url === '') return;
        if (typeof (opt) == 'undefined' || opt == null) opt = {};

        $.extend(this.options, opt);

        var $container = this.generateMessagePopupContainer();
        $container.width(this.options.width);
        $container.height(this.options.height);

        var pclsid = 'popup-' + PopupCommon.createGuid();
        $container.addClass(pclsid);
        url += (url.indexOf('?') >= 0 ? '&' : '?') + PopupCommon.PopupClassIdKey + '=' + pclsid + '&IsDlg=1';

        // 타이틀        
        // MIK.Geun :: 직저 타이틀 지정시 해당 타이틀 허용
        //this.refreshTitle();
        if (this.options.title.isHtml) $container.find('.mik_title').html(this.options.title.text);
        else $container.find('.mik_title').text(this.options.title.text);

        // 바디
        $body = $container.find('.mik_body');
        $body.css('overflow', 'hidden').css("height", "100%");
        // 윈도우 iframe
        {
            //$iframe = $(document.createElement('iframe'));
            //$iframe.css('width', '100%').css('height', '99%').css('margin', '0px').css('padding', '0px');
            //$iframe.attr('src', url);
            $iframe = $(String.format('<iframe style="width:100%;height:100%;margin:0px;padding:0px;" src="{0}"></iframe>', url));
            $body.append($iframe);
        }

        PopupCommon.showPopup($container, pclsid);

        // [팝업높이보정]
        // 본문 영역을 팝업과 100% 일치시켜주고
        $body.css("height", $container.height());
        // 타이틀이 존재하는 경우 팝업 사이즈를 타이틀만큼 증겨
        if (($header = $container.find('.pop_header')).length > 0) {
            $container.height($container.height() + $header.height());
        }
    },

    show2: function (url, opt) {

        var me = this;
        if (typeof (url) == 'undefined' || url == null || url === '') return;
        if (typeof (opt) == 'undefined' || opt == null) opt = {};

        $.extend(this.options, opt);

        var template = '<div class="mik_pop_new pop_container pop_layer pop_layer_folder" style="transition:0.2s opacity ease; position:fixed;"> <div class="pop_header"><div class="left_area"><div class="pop_title"></div></div><div class="right_area"><button class="btn_close mik_closer"><span class="ico_popup ico_popup_close"></span></button></div></div><div class="pop_body" style="height:100%"><div class="iframe_content"></div><div style="height:5px; width:100%;"></div></div></div>';
        var $template = $(template);

        // 종료 이벤트 등록
        $template.find('.mik_closer').click(function () { me.close($template); });

        // 드래그 가능하도록 지정
        $template.draggable();

        var pclsid = 'popup-' + PopupCommon.createGuid();
        $template.addClass(pclsid);
        url += (url.indexOf('?') >= 0 ? '&' : '?') + PopupCommon.PopupClassIdKey + '=' + pclsid + '&IsDlg=1';

        // # options 반영

        // 팝업 타이틀
        if (this.options.title.text) {
            if (this.options.title.isHtml)
                $template.find('.pop_title').html(this.options.title.text);
            else
                $template.find('.pop_title').text(this.options.title.text);
        }

        // 창 사이즈 지정
        if (this.options.width === '')
            $template.css('width', '');
        else
            $template.css('width', this.options.width)

        if (this.options.height === '')
            $template.find('.iframe_content').css('height', '');
        else
            $template.find('.iframe_content').css('height', this.options.height)

        var $iframeElement = $('<iframe style="width: 100%; height: 100%; margin: 0px; padding: 0px;"></iframe>');
        $iframeElement.attr('src', url);

        $template.find('.iframe_content').append($iframeElement);


        PopupCommon.showPopup($template, pclsid);

        // 팝업높이보정
        //var $headerHeight = $template.find('.pop_header');
        //$template.height($template.height() + $headerHeight.height());
    },

}

var MikWindowPopupHelper = {
    openWindow: function (url, opt) {
        var popup = new MikWindowPopupMethod();
        popup.show(url, opt);
        return popup;
    },
    openWindowNew: function (url, opt) {
        var popup = new MikWindowPopupMethod();
        popup.show2(url, opt);
        return popup;
    }
};

// ======================================================================
// [윈도우 팝업] ~종료
// ======================================================================


function PopupBox() {
    var self = this;
    this.TitleHtml = null;
    this.TitleText = PopupCommon.PopupTitle();
    this.SetTitle = function (isHtml, title) { self.TitleHtml = null; self.TitleText = null; if (isHtml === true) self.TitleHtml = title; else self.TitleText = title; };
    // 본문처리
    this.BodyURL = null;
    this.BodyHtml = null;
    this.BodyText = null;
    this.SetBodyPage = function (url) { self.BodyHtml = null; self.BodyText = null; self.BodyURL = url; };
    this.SetBodyMessage = function (isHtml, message) { if (isHtml === true) self.BodyHtml = message; else self.BodyText = message; self.BodyURL = null; };
    // 사이징
    this.Size = { Width: Math.max($(document).width() * 0.2, 300), Height: Math.max($(document).height() * 0.2, 100) };
    this.SetSize = function (width, height) {
        self.Size = { Width: width, Height: height };
    };
    // 팝업
    this.Show = function () {

        MikWindowPopupHelper.openWindow(this.BodyURL, {
            width: this.Size.Width,
            height: this.Size.Height,
            title: { isHtml: this.TitleHtml != null, text: this.TitleHtml != null ? this.TitleHtml : this.TitleText },
            body: { url: URL, html: null },
            functions: {
                closing: function () { },
                closed: function () { },
            },
        });

    };
    // 콜백 등록
    this.Function_Opening = null;
    this.Function_Opend = null;
    this.Function_Closing = null;
    this.Function_Closed = null;
};












// 2017-03-04 Gyuyeol 새로운 PortalPopupHelper PP 생성
if (typeof PP === 'undefined') {

    // iframe 상태일 때 parent window에 PortalPopupHelper가 있다면 이용합니다.
    if (window !== window.parent) {
        if (typeof window.parent.PP === 'object')
            window.PP = window.parent.PP;
    } else {    // 현재 window가 root window인 경우 PP를 초기화 합니다.
        window.PP = new function () {
            this.rootWindow = window;
            this.baseZIndex = 1000;
            this.layerLevel = -1;

            this.popups = [];
            this.$bgScreen = $('<div></div>');
            this._defaultOptions = (function () {

                return {
                    title: (typeof gWebInfo !== 'undefined' && gWebInfo.SiteName) ? gWebInfo.SiteName : '', // 기본 값 설정
                    useCloseButton: false,  // 팝업 우측 상단의 X 버튼 사용 여부
                    iconClassName: 'ico_alert_all_confirm',       // 팝업에 표시되는 아이콘의 Class 명입니다.
                    size: { width: '', height: '' },
                    buttons: [  // 하단에 그릴 버튼 목록입니다.
                        {
                            buttonClassName: 'btn_color_04',    // btn_color_04: 오렌지색 버튼, btn_color_03: 회색 버튼
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Confirm : 'Confirm',   // 기본 값 설정
                            action: 'close' // action의 typeof 값이 'function'인 경우 메소드를 호출하고 문자열 'close'인 경우 팝업을 닫습니다.
                        }
                    ]
                };
            })();

            this._showBgScreen = function () {
                // layerLevel 증가
                this.layerLevel++;

                var $bg = this.$bgScreen;
                $bg.css('z-index', this.baseZIndex + (this.layerLevel * 1000)); // z-index 레벨에 따라 1000 만큼 증가

                if (this.layerLevel === 0) {
                    var lastScrollTop = window.scrollY;
                    $('body').append($bg);
                    // 스크롤 이벤트를 막습니다.
                    var rootWindow = this.rootWindow;
                    var self = this;
                    $(window).scroll((function () {
                        return function (e) {
                            if (self.layerLevel > -1)
                                $(rootWindow.document).find('body, html').scrollTop(lastScrollTop);
                        }
                    })());
                    setTimeout(function () {
                        $bg.css('opacity', '1');
                    }, 1);
                }

                console.log(this.layerLevel);
            }

            this.closeCurrentLayer = function () {
                if (this.layerLevel == -1)
                    return false;

                // 현재 layerLeve에 있는 DOM 개체를 제거
                var $currentLayerItem = this.popups[this.layerLevel].element;
                $currentLayerItem.css('opacity', 0);
                setTimeout(function () {
                    $currentLayerItem.detach();
                }, 200);

                if (typeof this.popups[this.layerLevel].afterRemove === 'function') {
                    this.popups[this.layerLevel].afterRemove(this.popups[this.layerLevel].popupBody);
                }

                // layerLevel 감소
                this.layerLevel--;

                var $bg = this.$bgScreen;

                if (this.layerLevel === -1) {
                    $bg.css('opacity', '0');

                    var rootWindow = this.rootWindow;
                    setTimeout(function () {
                        $('html').css('overflow-y', '');
                        $bg.detach();
                        $bg.css('z-index', this.baseZIndex + (this.layerLevel * 1000));

                        // 스크롤 이벤트를 해제합니다.
                        $(window).unbind('scroll');
                    }, 200);
                } else {
                    $bg.css('z-index', this.baseZIndex + (this.layerLevel * 1000));
                }

                console.log(this.layerLevel);
                return true;
            }

            this.closeAll = function () {
                if (this.layerLevel < 0)
                    return;

                while (this.closeCurrentLayer()) {

                }
            }

            this._addLayerItem = function (item) {
                this.popups[this.layerLevel] = item;
                item.element.css('z-index', this.baseZIndex + (this.layerLevel * 1000) + 1);
                $('body').append(item.element);

                var marginTop = -1 * (item.element.height() / 2)
                item.element.css('margin-top', marginTop);

                setTimeout(function () {
                    item.element.css('opacity', '');
                }, 1);

                item.element.draggable();
            }

            // 초기화
            var defaultBackgroundStyle = {
                'background-color': 'rgba(0, 0, 0, 0.8)',
                'opacity': 0,
                'position': 'fixed',
                'left': '0',
                'top': '0',
                'width': '100%',
                'height': '100%',
                'transition': '0.2s opacity ease'
            }

            this.$bgScreen.css(defaultBackgroundStyle);

            // 주석을 해제하면 배경화면 클릭 시 팝업이 닫힙니다.
            // this.$bgScreen.click($.proxy(this.closeCurrentLayer, this));


            // 타이틀과 버튼이 있는 팝업
            this._showPopup = function (message, desc, options) {
                // show background screen
                this._showBgScreen();

                var $buttonTemplate = $('<button class="btn_type_a"><span class="btn_txt"></span></button>');

                var template = '<div class="pop_container pop_layer pop_layer_s" style="transition:0.2s opacity ease; opacity:0; position:fixed;" > <div class="pop_header"><div class="left_area"><div class="pop_title"></div></div><div class="right_area"><button class="btn_close"><span class="ico_popup ico_popup_close"></span></button></div></div><div class="pop_body" style="height:100%"><div class="sect_message"><div class="top_area"><span class="ico_alert_all"></span></div><div class="bottom_area"><div class="alert_title"></div><div class="alert_desc"></div></div></div><div class="sect_button"><div class="center_area"></div></div></div></div>';
                var $template = $(template);

                // 메시지
                if (message)
                    $template.find('.alert_title').text(message);

                // 설명
                if (desc)
                    $template.find('.alert_desc').text(desc);

                // # options 반영

                // 팝업 타이틀
                if (options.title)
                    $template.find('.pop_title').text(options.title);

                // 닫기 버튼 설정 - 사용 시 닫기 이벤트 등록, 사용하지 않으면 삭제
                if (options.useCloseButton)
                    $template.find('.btn_close').click($.proxy(this.closeCurrentLayer, this));
                else
                    $template.find('.btn_close').remove();

                // icon 설정
                if (options.iconClassName)
                    $template.find('span.ico_alert_all').addClass(options.iconClassName);

                // buttons 등록
                if (options.buttons.length > 0) {
                    var $buttonArea = $template.find('div.sect_button div.center_area');
                    var closeEvent = $.proxy(this.closeCurrentLayer, this);

                    var popupContext = this;
                    for (var i = 0; i < options.buttons.length; i++) {
                        (function () {    // btnOption.action 이벤트 등록 시 btnOption의 scope 문제로 인하여 buttons의 마지막 아이템의 action이 수행되는 현상 방지를 위해 새로운 scope 생성
                            var btnOption = options.buttons[i];

                            var $newButton = $buttonTemplate.clone();

                            // 버튼 클래스 설정
                            if (btnOption.buttonClassName)
                                $newButton.addClass(btnOption.buttonClassName);

                            // 버튼 텍스트 설정
                            if (btnOption.name)
                                $newButton.find('.btn_txt').text(btnOption.name);

                            // 버튼 옵션의 action 값이 'close'면 닫기 이벤트 등록, typeof 값이 'function'이면 해당 이벤트 등록
                            if (btnOption.action) {

                                if (btnOption.action === 'close')
                                    $newButton.click(closeEvent);
                                else if (typeof btnOption.action === 'function')
                                    $newButton.click(function () {
                                        // 반환 값이 true이면 팝업을 닫습니다.
                                        if (btnOption.action(popupContext))
                                            closeEvent();
                                    });
                            }
                            $buttonArea.append($newButton);
                            $buttonArea.append(' ');    // 버튼 태그 사이에 공백이 없으면 버튼이 붙어서 나옵니다.
                        })();
                    }
                }

                if (typeof options.postProcess === 'function')
                    options.postProcess($template);

                // DOM에 추가하고 표시합니다.
                this._addLayerItem({ element: $template });
            }

            this.confirm = function (message, desc, callback) {
                var options = $.extend({}, this._defaultOptions, {
                    iconClassName: 'ico_alert_all_confirm',
                    buttons: [
                        {
                            buttonClassName: 'btn_color_04',
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Confirm : 'Confirm',
                            action: function (context) {
                                return callback(true, context);
                            }
                        },
                        {
                            buttonClassName: 'btn_color_03',
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Cancel : 'Cancel',
                            action: function (context) {
                                return callback(false, context);
                            }
                        }
                    ]
                });
                this._showPopup(message, desc, options);
            }

            this.alert = function (message, desc, callback) {
                var options = $.extend({}, this._defaultOptions, {
                    iconClassName: 'ico_alert_all_error1',
                    buttons: [
                        {
                            buttonClassName: 'btn_color_04',
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Confirm : 'Confirm',
                            action: (typeof callback === 'function') ? function (context) {
                                return callback(context);
                            } : 'close'
                        }
                    ]
                });
                this._showPopup(message, desc, options);
            }

            this.info = function (message, desc, callback) {
                var options = $.extend({}, this._defaultOptions, {
                    iconClassName: 'ico_alert_all_info',
                    buttons: [
                        {
                            buttonClassName: 'btn_color_04',
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Confirm : 'Confirm',
                            action: (typeof callback === 'function') ? function (context) {
                                return callback(context);
                            } : 'close'
                        }
                    ]
                });
                this._showPopup(message, desc, options);
            }

            this.password = function (message, desc, callback) {
                var options = $.extend({}, this._defaultOptions, {
                    iconClassName: 'ico_alert_all_security',
                    postProcess: function ($template) {
                        // password 입력 창 추가
                        $template.find('div.bottom_area').append($('<div class="input_box password"><input type="password" style="width: 100%"></div>'));
                    },
                    buttons: [
                        {
                            buttonClassName: 'btn_color_04',
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Confirm : 'Confirm',
                            action: function (context) {
                                var password = context.popups[context.layerLevel].element.find('div.password input[type="password"]').val();
                                return callback(context, password);
                            }
                        },
                        {
                            buttonClassName: 'btn_color_03',
                            name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Cancel : 'Cancel',
                            action: 'close'
                        }
                    ]
                });
                this._showPopup(message, desc, options);
            }




            // Extended popups

            // iframe test
            this._showIframePopup = function (address, message, options) {
                // show background screen
                this._showBgScreen();

                var $buttonTemplate = $('<button class="btn_type_a"><span class="btn_txt"></span></button>');

                var template = '<div class="pop_container pop_layer pop_layer_s pop_layer_folder" style="transition:0.2s opacity ease; opacity:0; position:fixed;"> <div class="pop_header"><div class="left_area"><div class="pop_title"></div></div><div class="right_area"><button class="btn_close"><span class="ico_popup ico_popup_close"></span></button></div></div><div class="pop_body" style="height:100%"><div class="pop_guide"><div class="pop_guide_text"></div></div><div class="iframe_content"></div><div class="sect_button"><div class="center_area"></div></div></div></div>';
                var $template = $(template);

                // 메시지
                if (message)
                    $template.find('.pop_guide_text').text(message);
                else
                    $template.find('.pop_guide').remove();

                // # options 반영

                // 팝업 타이틀
                if (options.title)
                    $template.find('.pop_title').text(options.title);

                // 닫기 버튼 설정 - 사용 시 닫기 이벤트 등록, 사용하지 않으면 삭제
                if (options.useCloseButton)
                    $template.find('.btn_close').click($.proxy(this.closeCurrentLayer, this));
                else
                    $template.find('.btn_close').remove();

                // 창 사이즈 지정
                if (options.size.width === '')
                    $template.css('width', '');
                else
                    $template.css('width', options.size.width)

                if (options.size.height === '')
                    $template.find('.iframe_content').css('height', '');
                else
                    $template.find('.iframe_content').css('height', options.size.height)

                var $iframeElement = $('<iframe style="width: 100%; height: 100%; margin: 0px; padding: 0px;"></iframe>');
                $iframeElement.attr('src', address);

                $template.find('.iframe_content').append($iframeElement);

                // buttons 등록
                if (options.buttons.length > 0) {
                    var $buttonArea = $template.find('div.sect_button div.center_area');
                    var closeEvent = $.proxy(this.closeCurrentLayer, this);

                    var popupContext = this;
                    var iframeContext = $iframeElement[0];
                    for (var i = 0; i < options.buttons.length; i++) {
                        (function () {    // btnOption.action 이벤트 등록 시 btnOption의 scope 문제로 인하여 buttons의 마지막 아이템의 action이 수행되는 현상 방지를 위해 새로운 scope 생성
                            var btnOption = options.buttons[i];

                            var $newButton = $buttonTemplate.clone();

                            // 버튼 클래스 설정
                            if (btnOption.buttonClassName)
                                $newButton.addClass(btnOption.buttonClassName);

                            // 버튼 텍스트 설정
                            if (btnOption.name)
                                $newButton.find('.btn_txt').text(btnOption.name);

                            // 버튼 옵션의 action 값이 'close'면 닫기 이벤트 등록, typeof 값이 'function'이면 해당 이벤트 등록
                            if (btnOption.action) {

                                if (btnOption.action === 'close') {
                                    $newButton.click(closeEvent);
                                }
                                else if (typeof btnOption.action === 'function') {
                                    $newButton.click(function () {
                                        // 반환 값이 true이면 팝업을 닫습니다.
                                        if (btnOption.action(popupContext, iframeContext))
                                            closeEvent();
                                    });
                                }
                            }
                            $buttonArea.append($newButton);
                            $buttonArea.append(' ');    // 버튼 태그 사이에 공백이 없으면 버튼이 붙어서 나옵니다.
                        })();
                    }
                }

                // DOM에 추가하고 표시합니다.
                this._addLayerItem({ element: $template });
            }

            this.showFolderSelector = function (address, message, callback) {
                var options = $.extend({}, this._defaultOptions,
                    {
                        size: { width: '500px', height: '400px' },
                        buttons: [
                            {
                                buttonClassName: 'btn_color_04',
                                name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Move : 'Move',
                                action: function (popupContext, iframeContext) {
                                    return callback(popupContext, iframeContext);
                                }
                            },
                            {
                                buttonClassName: 'btn_color_03',
                                name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Cancel : 'Cancel',
                                action: 'close'
                            }
                        ]
                    });
                this._showIframePopup(address, message, options);
            }

            this.showReceiverSelector = function (address, callback) {
                var options = $.extend({}, this._defaultOptions,
                    {
                        size: { width: '800px', height: '590px' },
                        buttons: [
                            {
                                buttonClassName: 'btn_color_04',
                                name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Selection : 'Selection',
                                action: function (popupContext, iframeContext) {
                                    return callback(popupContext, iframeContext);
                                }
                            },
                            {
                                buttonClassName: 'btn_color_03',
                                name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Cancel : 'Cancel',
                                action: 'close'
                            }
                        ]
                    });
                this._showIframePopup(address, '', options);
            }

            // 
            this._showEmptyPopup = function ($popupBody, options) {
                // show background screen
                this._showBgScreen();

                var $buttonTemplate = $('<button class="btn_type_a"><span class="btn_txt"></span></button>');

                var template = '<div class="pop_container pop_layer pop_layer_s" style="transition:0.2s opacity ease; opacity:0; position:fixed;"> <div class="pop_header"><div class="left_area"><div class="pop_title"></div></div><div class="right_area"><button class="btn_close"><span class="ico_popup ico_popup_close"></span></button></div></div><div class="pop_body" style="height:100%"><div class="sect_button"><div class="center_area"></div></div></div></div>';
                var $template = $(template);

                // # options 반영

                // 팝업 타이틀
                if (options.title)
                    $template.find('.pop_title').text(options.title);

                // 닫기 버튼 설정 - 사용 시 닫기 이벤트 등록, 사용하지 않으면 삭제
                if (options.useCloseButton)
                    $template.find('.btn_close').click($.proxy(this.closeCurrentLayer, this));
                else
                    $template.find('.btn_close').remove();

                // 창 사이즈 지정
                if (options.size.width === '')
                    $template.css('width', '');
                else
                    $template.css('width', options.size.width)

                if (options.size.height === '')
                    $template.find('.iframe_content').css('height', '');
                else
                    $template.find('.iframe_content').css('height', options.size.height)

                $template.find('.pop_body').prepend($popupBody);

                // buttons 등록
                if (options.buttons.length > 0) {
                    var $buttonArea = $template.find('div.sect_button div.center_area');
                    var closeEvent = $.proxy(this.closeCurrentLayer, this);

                    var popupContext = this;
                    for (var i = 0; i < options.buttons.length; i++) {
                        (function () {    // btnOption.action 이벤트 등록 시 btnOption의 scope 문제로 인하여 buttons의 마지막 아이템의 action이 수행되는 현상 방지를 위해 새로운 scope 생성
                            var btnOption = options.buttons[i];

                            var $newButton = $buttonTemplate.clone();

                            // 버튼 클래스 설정
                            if (btnOption.buttonClassName)
                                $newButton.addClass(btnOption.buttonClassName);

                            // 버튼 텍스트 설정
                            if (btnOption.name)
                                $newButton.find('.btn_txt').text(btnOption.name);

                            // 버튼 옵션의 action 값이 'close'면 닫기 이벤트 등록, typeof 값이 'function'이면 해당 이벤트 등록
                            if (btnOption.action) {

                                if (btnOption.action === 'close') {
                                    $newButton.click(closeEvent);
                                }
                                else if (typeof btnOption.action === 'function') {
                                    $newButton.click(function () {
                                        // 반환 값이 true이면 팝업을 닫습니다.
                                        if (btnOption.action(popupContext))
                                            closeEvent();
                                    });
                                }
                            }
                            $buttonArea.append($newButton);
                            $buttonArea.append(' ');    // 버튼 태그 사이에 공백이 없으면 버튼이 붙어서 나옵니다.
                        })();
                    }
                }

                // DOM에 추가하고 표시합니다.
                this._addLayerItem({ element: $template, popupBody: $popupBody, afterRemove: options.afterRemove });
            }




            this.showCopFolderSelector = function (popupBody, callback) {
                var $copCopyPopupBody = $(popupBody);

                if ($copCopyPopupBody.length === 0)
                    return;

                var options = $.extend({}, this._defaultOptions,
                    {
                        //size: { width: '', height: '' },
                        afterRemove: function ($element) {
                            $('div.pop_wrap').append($element);
                        },
                        buttons: [
                            {
                                buttonClassName: 'btn_color_04',
                                name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Copy : 'Copy',
                                action: function (popupContext) {
                                    return callback(popupContext);
                                }
                            },
                            {
                                buttonClassName: 'btn_color_03',
                                name: (typeof MultiLanguageScript !== 'undefined') ? MultiLanguageScript.Cancel : 'Cancel',
                                action: 'close'
                            }
                        ]
                    });

                this._showEmptyPopup($copCopyPopupBody, options);

            }




            //function fnOpenChangeFolder() {
            //    var url = String.format('{0}Board/Pages/Folders/FolderSelector.aspx?BID={1}&CID={2}', gWebInfo.PortalWebURL, boardId, folderId);
            //    MikWindowPopupHelper.openWindow(url, 
            //        { 
            //            width: 350,
            //            height: 425,
            //            title: {isHtml :false, text: MultiLanguageScript.ChangeFolder},
            //            functions: { closed: null }
            //        });
            //}





            this.denied1 = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_denied1');
            }

            this.denied2 = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_denied2');
            }

            this.security = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_security');
            }

            this.error1 = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_error1');
            }

            this.error2 = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_error2');
            }

            this.notFound = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_notfound');
            }


            this.upload = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_upload');
            }

            this.download = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_download');
            }

            this.secession = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_secession');
            }

            this.favorite = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_favorite');
            }

            this.noti = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_notification');
            }

            this.help = function (title, subject, message, confirmCallback, cancelCallback) {
                this._showAlert(title, subject, message, confirmCallback, cancelCallback, 'ico_alert_all_help');
            }

        }

    }

}

MikCommonMethod = function () {
};

MikCommonMethod.prototype =
{
    // 기존 함수 유지하도록 함..
    alert: function (message, description) {
        MikMessagePopup.alert(message, description, null);
    },

    // hash parameter 처리
    parameters: {
        data: {},
        fnGet: function (key, defaultValue) { return this.data[key] || (defaultValue || ''); },
    },

    // GUID 생성
    createGuid: function () {
        //return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        //    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        //    return v.toString(16);
        //});
        return (new Date()).getTime();
    },

    createShortcutGuid: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    },

    getUrlParam: function (name, location) {
        if (location == null || typeof (location) != 'string') {
            location = document.location;
        }
        var results = new RegExp('[\?&]' + name + '=([^&#]*)', 'gi').exec(location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1] || 0;
        }
    },

    goNextUrl: function (url) {
        var key = 'MspRk' + this.createGuid();
        $.cookie(key, document.location.href, { path: '/' });
        if (url.indexOf('#') >= 0) { url += '!ruk:' + key + '!'; }
        else { url += '#!ruk:' + key + '!'; }
        document.location.href = url;

        return false;
    },

    goPreviousUrl: function (defaultUrl) {
        var key = this.parameters.fnGet('ruk');
        var url = $.cookie(key);
        if (url) document.location.href = url;
        else if (defaultUrl && defaultUrl.length > 0) document.location.href = defaultUrl;
        else window.history.back();

        return false;
    },

    // GNB 메뉴 이름을 페이지 제목div에 할당
    //renderPageTitleFromGNB: function () {
    //    var contentGnbTitleArea = document.getElementById("ContentGnbTitle");
    //    if (contentGnbTitleArea != null) {
    //        if (typeof selectedmenulongname != typeof undefined) {
    //            contentGnbTitleArea.innerText = selectedmenulongname;
    //        }
    //    }
    //},

    print: function(selector){
        $(selector).print();
    },

    openWindowCenter: function (url, title, w, h) {
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'toolbar=no, scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

        // Puts focus on the newWindow
        if (window.focus) {
            newWindow.focus();
        }
    },

    openOrgChart: function (option) {
        // TODO : 통합로그 : OrgChart / View
        $.ajax({
            url: "/IF/StatisticsIF/StatisticsResponse.aspx/SetOrgChartLogQueue",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ url: window.location.href }),
            error: function (jqXHR, textStatus, errorThrown) {
                MikPackContents.alert(jqXHR);
            },
            success: function (data, textStatus, jqXHR) {
                try { }
                catch (ex) { MikPackContents.alert(ex); }
            }
        });

        om_OpenOrgChart(option);
    },

    getTagRemovedString: function (str) {
        var temp = str;
        temp = temp.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/ig, "")

        return temp;
    },

    getStringdifyedUrl: function (str) {
        var temp = str;
        temp = temp.replace(/\'/gi, "\\'");
        return temp;
    },

    refineHtmlToText: function (html) {
        return $(document.createElement('div')).html(html).text();
    },

    renderLnbMenu: function (container) {
        var $container = $(container);
        // 하위메뉴 보기 클릭시 하위메뉴 열리고 아이콘 변경
        var toggleDown = "<span class='mark_lower_menu'><span class='ico_lnb ico_lnb_down'></span></span>";
        $('.lnb_menu ul').closest('.lnb_item').find('>.lnb_anchor').prepend(toggleDown);
        $('.lnb_menu .lnb_anchor').click(function (e) {
            var $list = $(this).closest('.lnb_item');
            if ($list.hasClass('open')) {
                $list.removeClass('open');
                $(this).find('.ico_lnb').addClass('ico_lnb_down').removeClass('ico_lnb_up');
                $(this).siblings('ul').slideUp(200);
                $(this).siblings('ul').find('ul').slideUp(200);
                $(this).siblings('ul').find('.ico_lnb').removeClass('ico_lnb_up').addClass('ico_lnb_down');
                $(this).siblings('ul').find('.lnb_item').removeClass('open');

                //tree
                $(this).siblings('.tree').slideUp(200);
            } else {
                $list.addClass('open');
                $(this).find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
                $(this).siblings('ul').slideDown(200);

                //tree
                $(this).siblings('.tree').slideDown(200);
            }
            e.stopPropagation();
        });

        // active 표시
        if ($('.lnb_menu li').hasClass('active')) {
            $('.lnb_menu li.active').closest('.lnb_item.depth1').addClass('open');
            $('.lnb_menu li.active').closest('.lnb_item.depth2').addClass('open');
            $('.lnb_menu li.active').closest('.lnb_item.depth3').addClass('open');
            $('.lnb_menu li.active > .lnb_anchor').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
        }

        // LNB의 depth2의 전체 메뉴 열기
        if ($('.lnb_menu').hasClass('lnb_menu_open')) {
            $('.lnb_list.depth2').css('display', 'block');
            $('.tree').css('display', 'block'); //treemenu
            $('.lnb_item.depth1').addClass('open');
            $('.open.depth1 .lnb_anchor.depth1').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
        }

        // LNB의 depth2 메뉴 열기
        if ($('.lnb_item').hasClass('lnb_item_open')) {
            $('.lnb_item_open .lnb_list.depth2').css('display', 'block');
            $('.lnb_item_open .tree').css('display', 'block'); //treemenu
            $('.lnb_item_open').addClass('open');
            $('.lnb_item_open .lnb_anchor.depth1').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
        }
    },
    renderSlidedown: function (obj) {
        // FOR C&C 제공 함수, obj 객체에 슬라이드다운 효과를 적용한다.
        var $obj = $(obj);
        $obj.find('.btn_slidedown').unbind("click").bind("click", function (e) {
            var $slidedown = $(this).closest('.slidedown'),
                $box = $slidedown.find('.box_slidedown');

            //다른 slidedown 요소 접기
            $obj.not($slidedown).find('.box_slidedown').slideUp(200);
            $obj.not($slidedown).removeClass('active');

            if ($slidedown.hasClass('active')) {
                $box.slideUp(200);
                $slidedown.removeClass('active');
            } else {
                $box.slideDown(200);
                $slidedown.addClass('active');
                //nanoscroller 실행
                if ($slidedown.find('.nano').length > 0) {
                    $slidedown.find('.nano').nanoScroller({ "alwaysVisible": "true" });
                };
            }
            e.stopPropagation();
        });
        $(window).unbind("click").bind("click", function (e) {
            $obj.find('.box_slidedown').slideUp(200);
            $obj.removeClass('active');
            e.stopPropagation();
        });
    },
    clearSlidedown: function (obj) {
        var $obj = $(obj);
        $obj.find('.btn_slidedown').unbind('click');
    },
    communityLnbSet: function () {
        // 하위메뉴 보기 클릭시 하위메뉴 열리고 아이콘 변경
        var toggleDown = "<span class='mark_lower_menu'><span class='ico_lnb ico_lnb_down'></span></span>";
        $('.lnb_menu ul').closest('.lnb_item').find('>.lnb_anchor').prepend(toggleDown);
        $('.lnb_menu .lnb_anchor').click(function (e) {
            var $list = $(this).closest('.lnb_item');
            if ($list.hasClass('open')) {
                $list.removeClass('open');
                $(this).find('.ico_lnb').addClass('ico_lnb_down').removeClass('ico_lnb_up');
                $(this).siblings('ul').slideUp(200);
                $(this).siblings('ul').find('ul').slideUp(200);
                $(this).siblings('ul').find('.ico_lnb').removeClass('ico_lnb_up').addClass('ico_lnb_down');
                $(this).siblings('ul').find('.lnb_item').removeClass('open');

                //tree
                $(this).siblings('.tree').slideUp(200);
            } else {
                $list.addClass('open');
                $(this).find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
                $(this).siblings('ul').slideDown(200);

                //tree
                $(this).siblings('.tree').slideDown(200);
            }
            e.stopPropagation();
        });

        // active 표시
        if ($('.lnb_menu li').hasClass('active')) {
            $('.lnb_menu li.active').closest('.lnb_item.depth1').addClass('open');
            $('.lnb_menu li.active').closest('.lnb_item.depth2').addClass('open');
            $('.lnb_menu li.active').closest('.lnb_item.depth3').addClass('open');
            $('.lnb_menu li.active > .lnb_anchor').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
        }

        // LNB의 depth2의 전체 메뉴 열기
        if ($('.lnb_menu').hasClass('lnb_menu_open')) {
            $('.lnb_list.depth2').css('display', 'block');
            $('.tree').css('display', 'block'); //treemenu
            $('.lnb_item.depth1').addClass('open');
            $('.open.depth1 .lnb_anchor.depth1').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
        }

        // LNB의 depth2 메뉴 열기
        if ($('.lnb_item').hasClass('lnb_item_open')) {
            $('.lnb_item_open .lnb_list.depth2').css('display', 'block');
            $('.lnb_item_open .tree').css('display', 'block'); //treemenu
            $('.lnb_item_open').addClass('open');
            $('.lnb_item_open .lnb_anchor.depth1').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
        }
    },
    communityExpandAll: function () {
        var $parent = $('ul.lnb_list.depth2').parent();
        //if (!$parent.hasClass('open')) {
        $parent.children("ul").show(300);
        setTimeout(function () {
            $parent.addClass('open');
        }, 200);
        //}
    },
    generateMenuButton: function (btnText, callbackEvt) {
        var $button = $('<a href="javascript:void(0)" class="btn_lnb"></a>');
        $button.text(btnText);
        $button.click(function () {
            callbackEvt();
            return false;
        });
        var $outerDiv = $('<div class="lnb_button"></div>');
        $outerDiv.append($button);
        return $outerDiv;
    },
    isStringIncludes: function (targetStr, includedStr) {
        for (var i = 0; i < targetStr.length ; i++) {

        }
    }
};
var MikCommon = new MikCommonMethod();

(function (hash) {
    if (!hash) hash = '';
    var hashdata = hash.split('!');
    $.each(hashdata, function () {
        if (this == '#' || this == '') return;
        var kv = this.split(':', 2);
        MikCommon.parameters.data[kv[0]] = kv[1];
    });
})(document.location.hash);


// C# String.Format 메서드와 동일하게 동작시키기 위한 함수
String.format = function () {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    return theString;
}

// C# Date.Format 메서드와 동일하게 동작시키기 위한 함수
Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";

    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            default: return $1;
        }
    });
};

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };


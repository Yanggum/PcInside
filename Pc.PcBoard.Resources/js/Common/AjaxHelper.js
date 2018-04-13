
var PR_AJAX_LOAD_MASK_BODY_CONTAINER_IDENTITY = 'VirtualLoadingMaskContainer';
var PR_AJAX_LOAD_MASK_CONTAINER_CLASS = 'ajaxLoadingMaskContainer';
var PR_AJAX_LOAD_MASK_IMG_CLASS = 'ajaxLoadingMaskImage';
var PR_AJAX_LOAD_MASK_BG_CLASS = 'ajaxLoadingMaskBackground';

var IPR_AJAX_LOAD_CALLED_COUNT = 'called-count';

$(document).ready(function () {
    var virtualDiv = $(document.createElement('div'));
    virtualDiv.attr('id', PR_AJAX_LOAD_MASK_BODY_CONTAINER_IDENTITY);
    virtualDiv.css('position', 'absolute');
    virtualDiv.css('top', '0px');
    virtualDiv.css('left', '0px');
    virtualDiv.width(1);
    virtualDiv.height(1);
    $('BODY').prepend(virtualDiv);
    //$('BODY').append(virtualDiv);
});

function fnGetLoadingImageUrl(type) {
    if (type == null || typeof (type) == 'undefined') type = '';
    var loadingImageUrl = '';
    if (gWebInfo && gWebInfo.ResourceWebURL) {
        loadingImageUrl = gWebInfo.ResourceWebURL;
    }
    else {
        // 사이트별로 AjaxHelper.js 단독 사용시... 아래 주소를 맞게 수정해주세요.
        loadingImageUrl = '/PortalResources';
    }
    switch (type) {
        case 'random':
            // 이건 랜덤5종류 로더 이미지 사용하는 샘플
            loadingImageUrl = String.format('{0}/images/preloader/{1}.gif', loadingImageUrl, 'preloader.' + ((((Math.random() * 10) % 5) + 1) + '').substr(0, 1) + '.0.0');
            break;
        case 'global':
            // 이건 실드범위가 글로벌/로컬에 따른 로더 이미지 사용하는 샘플
            loadingImageUrl = String.format('{0}/images/preloader/{1}.gif', loadingImageUrl, isGlobalShield ? 'preloader' : 'preloader');
            break;
        default:
            // 이건 동일 기본 로더 이미지 사용하는 샘플
            loadingImageUrl = String.format('{0}/images/preloader/{1}.gif', loadingImageUrl, 'preloader');
            break;
    }
    return loadingImageUrl;
}

function WrapLoadingMask(sectionSelector) {
    var isGlobalShield = false;
    if ($(sectionSelector).length <= 0) {
        sectionSelector = 'BODY #' + PR_AJAX_LOAD_MASK_BODY_CONTAINER_IDENTITY;
        isGlobalShield = true;
    }

    // 로더 이미지 베이스 경로 처리
    var loadingImageUrl = fnGetLoadingImageUrl();

    var mask = $(sectionSelector).find('.' + PR_AJAX_LOAD_MASK_CONTAINER_CLASS);
    if (mask.length <= 0) {
        mask = $(document.createElement('div'))
            .addClass(PR_AJAX_LOAD_MASK_CONTAINER_CLASS)
            .data('target', sectionSelector)
            .data(IPR_AJAX_LOAD_CALLED_COUNT, 0)
            .data('isglobalshield', isGlobalShield)
            .css('position', 'absolute')
            .css('z-index', '9100');
        var background = $(document.createElement('div'))
            .addClass('background')
            .addClass(PR_AJAX_LOAD_MASK_BG_CLASS)
            .css('position', 'relative')
            .css('padding', '0px')
            .css('margin', '0px')
            .css('background-color', 'translate')
            .css('background-color', '#000')
            .css('opacity', '0.50')
            .css('width', '100%')
            .css('height', '100%');
        var img = $(document.createElement('img'))
            .addClass(PR_AJAX_LOAD_MASK_IMG_CLASS)
            .attr('src', loadingImageUrl)
            .css('position', 'absolute')
            .css('z-index', '9300')
            .css('border-radius', '50%')
            .css('border', '3px solid #ccc')//d42222
            .css('width', isGlobalShield ? '150px' : '100px')
            .css('height', isGlobalShield ? '150px' : '100px');
        // element 처리
        mask.append(img);
        mask.append(background);
        $(sectionSelector).append(mask);
    }
    mask.data(IPR_AJAX_LOAD_CALLED_COUNT, mask.data(IPR_AJAX_LOAD_CALLED_COUNT) + 1);

    RefineLoadingMask(mask);
    mask.show();

    setTimeout(function () { RefineLoadingMask(mask); }, 50);

    return mask;
}
function RefineLoadingMask(mask) {

    var backgroundReference = $(window);
    var visibleHeight = backgroundReference.height();
    var visibleWidth = backgroundReference.width();

    if (mask == null || typeof (mask) == 'undefined') {
        mask = $('.' + PR_AJAX_LOAD_MASK_CONTAINER_CLASS);
    }

    mask.each(function () {

        try {
            var current = $(this);
            var img = current.find('.' + PR_AJAX_LOAD_MASK_IMG_CLASS);
            var bg = current.find('.' + PR_AJAX_LOAD_MASK_BG_CLASS);
            var parent = current.parent();

            if (parent.attr('id') === PR_AJAX_LOAD_MASK_BODY_CONTAINER_IDENTITY) {
                // 전역에 위치한 경우 ==> window(화면)상 고정을 위해 fixed 처리
                current.css('position', 'fixed');
                img.css('position', 'fixed');

                // 배경의 위치(0,0:고정)/사이즈를 화면상에 고정한다.
                current.height(visibleHeight);
                current.width(visibleWidth);

                // 이미지의 위치를 화면상에 고정한다.
                img.css('top', ((visibleHeight / 2) - (img.height() / 2)) + 'px');
                img.css('left', ((visibleWidth / 2) - (img.width() / 2)) + 'px');
            }
            else {
                // 특정 요소 밑에 위치한경우 ==> document상 고정을 위해 absolute 처리
                current.css('position', 'absolute');
                img.css('position', 'absolute');

                // 배경의 위치를 특정 document에 고정한다.
                current.offset(parent.offset());
                // 배경의 사이즈를 요소에 맞게 조정한다.
                var $target = $(current.data('target'));
                if ($target.length > 0) {
                    current.height($target.height());
                    current.width($target.width());
                }

                // 이미지의 위치를 특정 document에 고정한다.                
                img.css('top', ((parent.height() / 2) - (img.height() / 2)) + 'px');
                img.css('left', ((parent.width() / 2) - (img.width() / 2)) + 'px');


            }
        }
        catch (e) { }

    });

}
function UnWrapLoadingMask(mask) {
    if (mask != null && typeof (mask) != 'undefined' && mask.length > 0) {
        if (mask.data(IPR_AJAX_LOAD_CALLED_COUNT) <= 1) {
            mask.data(IPR_AJAX_LOAD_CALLED_COUNT, 0);
            mask.remove();
        }
        else {
            mask.data(IPR_AJAX_LOAD_CALLED_COUNT, mask.data(IPR_AJAX_LOAD_CALLED_COUNT) - 1)
        }
    }
}

$(window).resize(function () {
    RefineLoadingMask();
});

$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});

function AjaxHelperCallBox() {
    this.URL = '';
    this.IsPost = true;
    this.IsAsync = true;
    this.IsAndroidFileUp = false;
    this.UseLoadingMask = true;
    this.LoadingMaskSectionSelector = null;
    this.Data = null;
    this.ReturnDataType = '';
    this.ContentType = null;
    this.Function_Success = null;
    this.Function_Error = null;
    this.Function_Before = null;
    this.Function_Complete = null;
    this.InternalAjax = null;
    this.ParseJson = function (data) {
        var json = null;
        if (typeof (d) == 'string') json = JSON.parse(d);
        else if (typeof (data) == 'object' && typeof (data.d) == 'string') json = JSON.parse(data.d);
        else if (typeof (data) == 'object' && typeof (data.d) == 'object') json = data.d;
        else json = data;
        return json;
    };
    this.Send = function () {

        var caller = this;
        var temporaryLoadingMask = null;
        this.InternalAjax = $.ajax({
            // 전송타입 POST or GET
            type: (caller.IsPost == true) ? 'POST' : 'GET',
            // 대상 URL
            url: caller.URL,
            // Async-Sync 처리
            async: (caller.IsAsync == true) ? true : false,
            // 전송할 데이터
            data: (caller.Data != null) ? (typeof (caller.Data) == 'string' ? caller.Data : JSON.stringify(caller.Data)) : '',
            // 캐시 사용안함
            cache: false,
            // 컨텐츠 타입
            contentType: (caller.ContentType != null) ? caller.ContentType : 'application/json; charset=utf-8',
            // 전송전 이벤트
            beforeSend: function () {
                try {// 로딩마스크 사용할 경우
                    if (caller.UseLoadingMask == true) {
                        //WrapLoadingMask(caller.LoadingMaskSection);
                        temporaryLoadingMask = WrapLoadingMask(caller.LoadingMaskSectionSelector);
                    }
                    if (caller.Function_Before != null) caller.Function_Before();
                } catch (e) { console.error(e); }
            },
            // 전송후 이벤트
            complete: function () {
                try {
                    if (caller.UseLoadingMask == true) {
                        UnWrapLoadingMask(temporaryLoadingMask);
                    }
                    if (caller.Function_Complete != null) caller.Function_Complete();
                } catch (e) { console.error(e); }
            },
            // 페이지 호출 성공시, 페이내 결과와는 별개
            success: function (d, s, x) {
                try {
                    if (caller.Function_Success != null)
                        caller.Function_Success(d, s, x);
                } catch (e) { console.error(e); }
            },
            // 페이지 호출 실패시, 401, 500 오류등..
            error: function (d, s, e) {
                try {
                    if (caller.Function_Error != null)
                        caller.Function_Error(d, s, e);
                } catch (e) { console.error(e); }
            },
            // 리턴 데이터타입
            dataType: (caller.ReturnDataType == 'JSON') ? 'JSON' : (caller.ReturnDataType == 'XML') ? 'XML' : ''
        });
    };
    this.Cancel = function () { if (this.InternalAjax != null) this.InternalAjax.abort(); };
};


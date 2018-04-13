/*==================================================================================
 UI & design consuting - FOR C&C (주)에프오알씨앤씨 - UI Creative Team 
www.forcnc.co.kr  / (02)322-0637
jquery.ui.js
==================================================================================*/

var windowWidthS = 1165;

//Resize
$(window).resize(function(){
    timeline();
});



/**
 * GNB
 * - 함수 : gnbmenuSet(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
 */
function gnbmenuSet(obj){
	var $obj = $(obj);
	
    $obj.find('.gnb_sub').css({'opacity':'0', 'display':'none'});
    //1depth Over시 하위메뉴 보임
    $obj.find('.gnb_item').bind({
        mouseenter: function() {
            $(this).find('.gnb_sub').css('display', 'block');
            $(this).find('.gnb_sub').stop().animate({
                opacity: '1'
            },200);
            $(this).find('.gnb_item').addClass('active');
        },
        mouseleave: function() {
            $(this).find('.gnb_sub').css('display', 'none');
            $(this).find('.gnb_sub').stop().animate({
                opacity: '0'
            },200);
            $(this).find('.gnb_item').removeClass('active');
        }
    });
};

/**
 * GNB submenu 중앙 정렬 (gnb_sub_type1)
 * - 함수 : gnbsubAlign(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
 */
function gnbsubAlign(obj){
    var $obj = $(obj),
        $gnb_item = $obj.find('.gnb_item');
    
    $gnb_item.mouseenter(function(){
        var liIndex = $(this).index();
        gnbsubAlignExec(liIndex);
    });
    
    function gnbsubAlignExec(liIndex){
        var $gnb_item = $obj.find('.gnb_item').eq(liIndex),
            leftW = 0,
            gnbsubW = 0,
            gnbitemW = $gnb_item.width();
        // 1depth 메뉴의 왼쪽 넓이 
        for ( var i=0; i<liIndex; i++){
            leftW = leftW + $obj.find('.gnb_item').eq(i).width();
        };
        // 2depth 메뉴의 전체넓이
        for ( var j=0; j<$gnb_item.find('.sub_item.depth2').length; j++ ){
            gnbsubW = gnbsubW + $gnb_item.find('.sub_item.depth2').width();
        };
        if ( leftW + gnbitemW/2 - gnbsubW/2 > 0 ){
            $gnb_item.find('.sub_item:first-child').css('margin-left', leftW + gnbitemW/2 - gnbsubW/2 );
        }
    };
}


/**
 * LNB
 * - 함수 : lnbSet()
 * --------------------------------------------------
 */
function lnbSet(){
    // 하위메뉴 보기 클릭시 하위메뉴 열리고 아이콘 변경
    var toggleDown = "<span class='mark_lower_menu'><span class='ico_lnb ico_lnb_down'></span></span>";
    $('.lnb_menu ul').closest('.lnb_item').find('>.lnb_anchor').prepend(toggleDown);
    $('.lnb_menu .lnb_anchor').click(function(e){
        var $list = $(this).closest('.lnb_item');
        if ( $list.hasClass('open') ){
            $list.removeClass('open');
            $(this).find('.ico_lnb').addClass('ico_lnb_down').removeClass('ico_lnb_up');
            $(this).siblings('ul').slideUp(200);
            $(this).siblings('ul').find('ul').slideUp(200);
            $(this).siblings('ul').find('.ico_lnb').removeClass('ico_lnb_up').addClass('ico_lnb_down');
            $(this).siblings('ul').find('.lnb_item').removeClass('open');
        } else {
            $list.addClass('open');
            $(this).find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
            $(this).siblings('ul').slideDown(200);
        }
        e.stopPropagation();
    });
    
    // mail의 LNB는 하위 메뉴 열기
    if ( $('.lnb_menu').hasClass('lnb_menu_open') ){
        $('.lnb_list.depth2').css('display', 'block');
        $('.lnb_item.depth1').addClass('open');
        $('.open').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
    }
};


/**
 * Timeline
 * - 함수 : timeline()
 * --------------------------------------------------
 */
// 공통사용
var objMargin = 15,
	objTop,
	prevTop,
	prev2Top,
	prevHeight,
	prev2Height,
	prev_num,
	compareTarget1,//비교 타겟 위치(Top+Height)
	compareTarget2,//비교 타겟2 위치(Top+Height)
	nextTop,//다음 요소 위치 기준
	targetIndex,//비교1의 Index
	arr_align = [],//정렬 방향
	total_top = [],//전체 리스트의 Top
	$prev,
	$prev2;

function prefixSet (objNum){
    var prev = objNum-1;
    if ( total_top[objNum] - total_top[prev] < 30 ){
        $('.social_item').eq(objNum).find('.index').css('top', '35px')
    };
}

function timeline(){
    $('.board_social').closest('.sect_content').css('padding-bottom', '5px')
    
	//재실행시.. total_top에
    $('.social_list').css('visibility', 'hidden');

    // 타임라인 배치
    $('.social_list .social_item').each(function (index) {
        $(this).removeClass("left");
        $(this).removeClass("right");
		timelineItemSet('.social_item', index);

    });
	
	function timelineItemSet(objItem, itemNum){
		var $objItem = $(objItem),
			index = itemNum,
			$thisItem = $objItem.eq(index),
			objTop;
		
		if(index==0){//0번째
			$thisItem.css('top', 0);
			$thisItem.addClass('left');
			arr_align[index] = 'left';
			total_top[index] = 0;
			compareTarget1 = total_top[index] + $thisItem.outerHeight();
			targetIndex = index;
		} else if(index==1){//1번째
			objTop = objMargin+35;
			$thisItem.css('top', objTop+'px');
			$thisItem.addClass('right');
			arr_align[index] = 'right';
			total_top[index] = $thisItem.css('top');
			compareTarget2 = objTop + $thisItem.outerHeight();
			nextTop = compareTarget2;
			if(compareTarget1 <= compareTarget2){
				nextTop = compareTarget1;
				compareTarget1 = compareTarget2;
				targetIndex = index;
			};
		} else {//n번째
			//현재 요소 배치
			objTop = nextTop+objMargin;
			$thisItem.css('top', objTop+'px');
			total_top[index] = objTop;

			//비교한 target 정렬이 왼쪽이면 오른쪽 아니면 왼쪽
			if(arr_align[targetIndex] == 'left' ){
				arr_align[index] = 'right';
				$thisItem.addClass('right');
			} else {
				arr_align[index] = 'left';
				$thisItem.addClass('left');
			};
			compareTarget2 = objTop + $thisItem.outerHeight();
			nextTop = compareTarget2;
			if(compareTarget1 <= compareTarget2){
				nextTop = compareTarget1;
				compareTarget1 = compareTarget2;
				targetIndex = index;
			};
		};
        prefixSet(index);
	};
    
    $('.social_item').css('visibility', 'visible');
    // 전체 높이 설정
    var boxHeight,
        last,//마지막에 배치된 리스트의 번호
        $left_last,
        $right_last;
    last = $('.social_item').length;
    
    if ( $('.social_item:nth-last-child(2)').outerHeight()+(total_top[total_top.length-2]) > $('.social_item:last-child').outerHeight()+(total_top[total_top.length-1]) ){
        boxHeight = total_top[total_top.length-2] + $('.social_item:nth-last-child(2)').outerHeight() + 30;
    } else {
        boxHeight = $('.social_item:last-child').outerHeight()+(total_top[total_top.length-1])+30;
    };
    $('.social_list').css('height', boxHeight + 'px').css('visibility', 'visible');
    $('.social_item').removeAttr('rtarget');
    
    //sect_content 높이
    $('.board_social').closest('.sect_content').css('margin-bottom', $('.board_social').height() + 30 );
    //$('.board_social').closest('#lay_contents').css('height', $('.board_social').height() + $('.board_social').closest('.sect_content').outerHeight() );
}




/**
 * SlideDown 메뉴
 * - 함수 : fn_slideDown(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
 */
function fn_slideDown(obj){
    var $obj = $(obj);
    $obj.find('.btn_slidedown').click(function(e){
        var $slidedown = $(this).closest('.slidedown'),
            $box = $slidedown.find('.box_slidedown');
        
        //다른 slidedown 요소 접기
        $obj.not($slidedown).find('.box_slidedown').slideUp(200);
        $obj.not($slidedown).removeClass('active');
        
        if ( $slidedown.hasClass('active') ){
            $box.slideUp(200);
            $slidedown.removeClass('active');
        } else {
            $box.slideDown(200);
            $slidedown.addClass('active');
            //nanoscroller 실행
            if ( $slidedown.find('.nano').length > 0 ){
                $slidedown.find('.nano').nanoScroller({ "alwaysVisible": "true" });
            }
        }
        e.stopPropagation();
    });
    $(window).click(function(e){
        $obj.find('.box_slidedown').slideUp(200);
        $obj.removeClass('active');
        e.stopPropagation();
    });
}


/**
 * Banner Replace
 * - 함수 : fn_bannerReplace(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * - 용도 : 메인화면의 webpart_rolling_type2의 이미지를 화면 넓이에 따라 적용
 * --------------------------------------------------
*/
function fn_bannerReplace(obj){
    var $obj = $(obj);
    
    var arrSrc = [],
        arrNewSrc = [],
        arrExt = [".jpg", ".png", ".bmp", "gif"],
        strFileName,
        strNewFileName;
    
    $obj.find('.img_box img').each(function(){
        arrSrc.push( $(this).attr('src') );
        
        for (var i=0; i<arrExt.length; i++ ){
            if ( $(this).attr('src').split(arrExt[i]).length > 1 ){
                strFileName = $(this).attr('src').split(arrExt[i])[0];
                strNewFileName = strFileName + "_replace" + arrExt[i];
                arrNewSrc.push(strNewFileName);
            }
        }
    });
    
    fn_exeBannerReplace();
    function fn_exeBannerReplace(){
        var fileNum = 0;
        if ( $(window).width() < windowWidthS ){
            $obj.find('.img_box img').each(function(){
                $(this).attr('src', arrNewSrc[fileNum]);
                fileNum = fileNum + 1;
            });
        } else {
            $obj.find('.img_box img').each(function(){
                $(this).attr('src', arrSrc[fileNum]);
                fileNum = fileNum + 1;
            });
        }
    }
    
    $(window).resize(function(){
        fn_exeBannerReplace();
    })
}

    

/**
 * Tree Menu
 * - 함수 : tree(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
*/
function tree(obj){ 
    $tree = $(obj);
    var togglePlus = "<button class='toggle plus'></button>",
        toggleMinus = "<button class='toggle minus'></button>";
    
    //default
    $tree.find('ul').siblings('.tree_item_wrap').find('.tree_elbow').replaceWith(togglePlus);
    $tree.find('.toggle').siblings('a').find('.ico').addClass('folder');
    
    //click toggle
    $tree.find('.toggle').click(function(e){
        var $item = $(this).closest('.tree_item'),
            $ico = $(this).siblings('a').find('.ico');
        $item.toggleClass('open');
        if ( $item.hasClass('open') ){
            $(this).removeClass('plus').addClass('minus');
            $ico.removeClass('folder').addClass('folder_open');
            $item.find('>ul').slideDown(200);
        } else {
            $(this).removeClass('minus').addClass('plus');
            $ico.removeClass('folder_open').addClass('folder');
            $item.find('>ul').slideUp(200);
        }
        e.stopPropagation();
    });
};





/**
 * fn_popup
 * - 함수 : fn_popup(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
*/
function fn_popup(obj){
    var $obj = $(obj);
    $obj.click(function(){
        var _pop_container = ".pop_container[rel='" + $obj.attr('id') + "']",
            $popup = $(_pop_container);
        $('.pop_wrap').fadeIn(200);
        $popup.fadeIn(200);
        
        fn_popup_set();
        function fn_popup_set(){
            $popup.css('margin-top', - $popup.outerHeight()/2 );
            if ( $popup.hasClass('pop_layer') ){
                if ($popup.find('.pop_footer').length > 0){
                    $popup.find('.pop_body').css('height', $popup.outerHeight()-$popup.find('.pop_header').outerHeight() - $popup.find('.pop_footer').outerHeight() );
                } else {
                    $popup.find('.pop_body').css('height', $popup.outerHeight()-$popup.find('.pop_header').outerHeight() );
                }
            };
        }
        if ( $popup.find('.nano').length > 0 ){
            $('.nano').nanoScroller({ "alwaysVisible": "true" });
        }
        
        $popup.find('.btn_close').click(function(){
            $('.pop_wrap').fadeOut(200);
            $popup.fadeOut(200);
        });
        
        //Resize
        $(window).resize(function(){
            fn_popup_set();
        });
    });
    $('.bg').click(function(){
        $('.pop_wrap').fadeOut(200);
        $('.pop_container').fadeOut(200);
    });
}




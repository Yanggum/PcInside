/*==================================================================================
 UI & design consuting - FOR C&C (주)에프오알씨앤씨 - UI Creative Team 
www.forcnc.co.kr  / (02)322-0637
jquery.ui.js
==================================================================================*/
//함수 실행 - 모든 페이지
$(document).ready(function(){
    fn_slideDown('.slidedown');
	fn_slidelist(168);
    
    //fn_mainLayout();
    fn_mainWebpart()
});

$(window).resize(function(){
    //fn_mainLayout();
})


/**
 * GNB
 * - 함수 : gnbmenuSet(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
 */
function gnbmenuSet(obj){
	var $obj = $(obj);
	
    $obj.find('.gwp_gnb_sub').css({'opacity':'0', 'display':'none'});
    //1depth Over시 하위메뉴 보임
    $obj.find('.gwp_gnb_item').bind({
        mouseenter: function() {
            $(this).find('.gwp_gnb_item').addClass('active');
        },
        mouseleave: function() {
            $(this).find('.gwp_gnb_item').removeClass('active');
        }
    });
    $obj.bind({
        mouseenter: function() {
            $(this).find('.gwp_gnb_sub').css('display', 'block');
            $(this).find('.gwp_gnb_sub').stop().animate({
                opacity: '1'
            },200);
        },
        mouseleave: function() {
            $(this).find('.gwp_gnb_sub').css('display', 'none');
            $(this).find('.gwp_gnb_sub').stop().animate({
                opacity: '0'
            },200);
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
    if ( $('.lnb_menu li').hasClass('active') ){
        $('.lnb_menu li.active').closest('.lnb_item.depth1').addClass('open');
        $('.lnb_menu li.active').closest('.lnb_item.depth2').addClass('open');
		$('.lnb_menu li.active').closest('.lnb_item.depth3').addClass('open');
        $('.lnb_menu li.active > .lnb_anchor').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
    }
    
    // LNB의 depth2의 전체 메뉴 열기
    if ( $('.lnb_menu').hasClass('lnb_menu_open') ){
        $('.lnb_list.depth2').css('display', 'block');
        $('.tree').css('display', 'block'); //treemenu
        $('.lnb_item.depth1').addClass('open');
        $('.open.depth1 .lnb_anchor.depth1').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
    }
    
    // LNB의 depth2 메뉴 열기
    if ( $('.lnb_item').hasClass('lnb_item_open') ){
        $('.lnb_item_open .lnb_list.depth2').css('display', 'block');
        $('.lnb_item_open .tree').css('display', 'block'); //treemenu
        $('.lnb_item_open').addClass('open');
        $('.lnb_item_open .lnb_anchor.depth1').find('.ico_lnb').removeClass('ico_lnb_down').addClass('ico_lnb_up');
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
        // 이미지 있을 경우 클래스 추가
        if ( $(this).find('.item_img').length > 0 ){
            $(this).addClass('social_item_image')
        }
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
            total_top[index] = parseInt(total_top[index], 10);
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
        console.log('if');
    } else {
        boxHeight = $('.social_item:last-child').outerHeight()+(total_top[total_top.length-1])+30;
    };
    $('.social_list').css('height', boxHeight + 'px').css('visibility', 'visible');
    $('.social_item').removeAttr('rtarget');
    
    //sect_content 높이
    //$('.board_social').closest('.sect_content').css('margin-bottom', $('.board_social').height() + 30 );
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
    $obj.find('.btn_slidedown').unbind("click").bind("click", function(e){
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
            };
        }
        e.stopPropagation();
    });
    $(window).unbind("click").bind("click", function(e){
        $obj.find('.box_slidedown').slideUp(200);
        $obj.removeClass('active');
        e.stopPropagation();
    });
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
    
    //open 되어있는 li가 있을 경우
    $tree.find('.tree_item.active').parents('.tree_item').addClass('active');
    $tree.find('.tree_item.active').find('>ul').css('display', 'block');
    $tree.find('.tree_list').each(function(){
        if ( $(this).css('display') == 'block' ){
            $(this).siblings('.tree_item_wrap').find('.toggle').removeClass('plus').addClass('minus');
            $(this).siblings('.tree_item_wrap').find('.ico').removeClass('folder').addClass('folder_open')
        };
    });
    
    //open 되어있는 li가 있을 경우
    $tree.find('.tree_item.open').parents('.tree_item').addClass('open');
    $tree.find('.tree_item.open').find('>ul').css('display', 'block');
    $tree.find('.tree_list').each(function(){
        if ( $(this).css('display') == 'block' ){
            $(this).siblings('.tree_item_wrap').find('.toggle').removeClass('plus').addClass('minus');
            $(this).siblings('.tree_item_wrap').find('.ico').removeClass('folder').addClass('folder_open')
        };
    });
    
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
            $popup.css('height', 'auto');
            $popup.find('.pop_body').css('height', 'auto');
            $popup.css('margin-top', - $popup.outerHeight()/2 );
            if ( $popup.hasClass('pop_layer') ){
                if ($popup.find('.pop_footer').length > 0){
                    $popup.find('.pop_body').css('height', $popup.outerHeight()-$popup.find('.pop_header').outerHeight() - $popup.find('.pop_header_tab').outerHeight() - $popup.find('.pop_footer').outerHeight() );
                } else {
                    $popup.find('.pop_body').css('height', $popup.outerHeight()-$popup.find('.pop_header').outerHeight() - $popup.find('.pop_header_tab').outerHeight());
                }
            };
        }
        //nano실행
        if ( $popup.find('.nano').length > 0 ){
            //$('.nano').nanoScroller({ "alwaysVisible": "true" });
			$('.nano').nanoScroller();
        }
        //select실행
        //fn_reSetSelect();
        
        $popup.find('.btn_close').click(function(){
            $('.pop_wrap').fadeOut(200);
            $popup.fadeOut(200);
        });
        
        //Resize
        $(window).resize(function(){
			console.log('a');
            fn_popup_set();
        });
    });
    $('.bg').click(function(){
        $('.pop_wrap').fadeOut(200);
        $('.pop_container').fadeOut(200);
    });
}


/**
 * Spinner
 * - 함수 : fn_spinner(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id', '.class')
 * --------------------------------------------------
 */
function fn_spinner(obj){
    var $obj = $(obj),
        maxH = 30,
        minH = 16,
        topplus = "+=8",
        topminus = "-=8",
        anitime = 400,
        delaytime = 120;
    $('.rect1').delay(delaytime * 0);
    $('.rect2').delay(delaytime * 1);
    $('.rect3').delay(delaytime * 3);
    $('.rect4').delay(delaytime * 4);
    $('.rect5').delay(delaytime * 5);
    $('.rect6').delay(delaytime * 6);
    function loop(){
         $obj.find('.rect').animate({
            height : minH,
            top : topplus
        }, anitime).animate({
            height : maxH,
            top : topminus
        }, anitime, function(){
            loop();     
        });
    }
    loop();
}


/**
 * Input File
 * - 함수 : fn_input_file(obj)
 * - obj : 요소 ID명 또는 Class명 ('#id' or '.class')
 * --------------------------------------------------
 */
function fn_input_file(obj){
	var $obj = $(obj),
		fileval = $obj.val();
	$obj.closest('.input_file').find('.file_value').attr('value', fileval);
}


/**
 * -
 * - 함수 : fn_slidelis(objW)
 * - obj : -
 * --------------------------------------------------
 */
function fn_slidelist(objW){
	var _moveVal = 0,
		_itemD = objW,
		_itemNum = $('.slides');
	function moveslide(a){
		_moveVal = a;
		//moveVal = _itemD;
		$('.slides').css('margin-left', _moveVal+'px');
	}
	$('.slide_prev').click(function(){
		_moveVal = _moveVal - _itemD;
		moveslide(_moveVal);
	});
}


/**
 * Accordian Board
 * - 함수 : fn_accordianboard()
 * --------------------------------------------------
 */
function fn_accordianboard(){
	var $anchor = $('.board_accordian .board_accordian_item');
	$anchor.click(function(){
		if( $(this).hasClass('active') ){
			$(this).removeClass('active');
		} else {
			$(this).addClass('active');
		}
	});
}


/**
 * Main Page Responsive Layout
 * - 함수 : fn_mainLayout()
 * --------------------------------------------------
 */
function fn_mainLayout(){
    var $gwpSearch = $('.gwp_header_search'),
        $button = $gwpSearch.find('.btn_search');
    if ( $(window).width() < 1180 && $('body').hasClass('main') ){
        $gwpSearch.addClass('folded');
        $button.click(function(){
            if( $gwpSearch.hasClass('folded') ){
                $gwpSearch.removeClass('folded');
            }
        });
        $(window).click(function(){
            $gwpSearch.removeClass('folded');
        });
            
    } else {
        $gwpSearch.removeClass('folded');
    };
    
    $(window).click(function(e){
        if(!$($gwpSearch).has(e.target).length){
            $gwpSearch.addClass('folded')
        }
    });
}


/**
 * Main Page 펼쳐지고, 닫혀지고 ~
 * - 함수 : fn_mainWebpart()
 * --------------------------------------------------
 */
function fn_mainWebpart(){
    var $wpt01 = $('.webpart01'),
        $button = $wpt01.find('.btn_expand');
    $wpt01.removeClass('expand');
    $button.click(function(){
        if ( $wpt01.hasClass('expand') ) {
            $wpt01.removeClass('expand');
        } else {
            $wpt01.addClass('expand');
        }
    });
    
    $(window).resize(function(){
        if ( $(window).width() >= 1180 ){
            $wpt01.removeClass('expand');
        }
    });
}




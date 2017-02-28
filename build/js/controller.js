var loading = (function($){

    // ����Ԫ��
    function init(){

        if( $('.loading').length ) return; // �Ѿ�����ʾ .loading��

        $('body').append('<div class="loading"><div class="loading-mark"></div></div>');

        var _temp = Math.PI / 8; //  2 * PI / 16
        var _angleArr = [ _temp, 3*_temp, 5*_temp, 7*_temp, 9*_temp, 11*_temp, 13*_temp, 15*_temp];// 8����ĽǶ�

        // ���� ���ص�
        for( var i=0; i < 8; i++ ){

            $loadingSpot = $('<div class="loading-spot"></div>');

            // ���ص�λ��ɢ��
            $loadingSpot.css({
                top : Math.sin( _angleArr[i] ) * 2.5 + 'rem', // 2.5�ǰ뾶
                left : Math.cos( _angleArr[i] ) * 2.5 + 'rem'
            });

            $('.loading').append( $loadingSpot );
        }

        // ���� ���ص�λ�� ��Ļ����
        $('.loading-spot').css({
            top : '+=' + $(window).height() / 2.5 + 'px',
            left : '+=' + $(window).width() / 2 + 'px'
        })

    }

    function show(){
        init();
        console.log('loading show');
    }

    function hide(){
        $('.loading').remove();
        console.log('loading hide');
    }

    return{ // �ⲿ����
        show : show,
        hide : hide
    }

})( jQuery );

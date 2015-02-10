<?php
/**
 * Created by PhpStorm.
 * User: user
 * Date: 08.12.14
 * Time: 10:48
 */

return array(
    'base_url' => 'http://admin.shein.pravda.local/',
    'blocked_ip_time' => '5 minutes',
    'block_time_interval' => '5 minutes',
    'number_failed_to_block' => 5,
    'captcha' => array(
            'captcha_path' => PATH_INDEX.'images/captcha',
            'captcha_url_image_directory' => 'http://admin.shein.pravda.local/images/captcha',
            'font_path' => PATH_PROJECT_FONT,
            'font' => 'Montserrat-Regular.ttf',
            'symbol_count' => 5,
            'width'=> 130,
            'height' => 36
    ),
    'system_support' => array(
        'xmpp' => array(
            'host' => '',
            'port' => '',
            'user' => '',
            'password' => '',
            'resource' => '',
            'server' => ''
        ),
    ),
//    'visitors' => array(
//        'AddArticle' => array(
//            'Request' => array(
//                'defaultAddArticleRequestVisitor'
//            ),
//            'Response' => array(
//                'defaultAddArticleResponseVisitor'
//            )
//        ),
//        'DeleteArticle' => array(
//            'Request' => array(
//                'defaultDeleteArticleRequestVisitor'
//            ),
//            'Response' => array(
//                'defaultDeleteArticleResponseVisitor'
//            )
//        ),
//        'GetArticle' => array(
//            'Request' => array(
//                'defaultGetArticleRequestVisitor'
//            ),
//            'Response' => array(
//                'defaultGetArticleResponseVisitor'
//            )
//        ),
//        'UpdateArticle' => array(
//            'Request' => array(
//                'defaultUpdateArticleRequestVisitor'
//            ),
//            'Response' => array(
//                'defaultUpdateArticleResponseVisitor'
//            )
//        )
//    )
);
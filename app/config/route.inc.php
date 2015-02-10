<?php
/**
 * Created by PhpStorm.
 * User: user
 * Date: 03.12.14
 * Time: 17:34
 */

RouterRewrite::me()
    /** Auth */
    ->addRoute(
        'in Admin',
        RouterTransparentRule::create('/')
            ->setDefaults(
                array(
                    'area' => 'AdministrationPanel',
                    'action' => 'index'
                )
            )
    )
    ->addRoute(
        'index action Authorization',
        RouterTransparentRule::create('/auth')
            ->setDefaults(
                array(
                    'area' => 'Authorization',
                    'action' =>'index'
                )
            )
    )
    ->addRoute(
        'sign in',
        RouterTransparentRule::create('/signin')
            ->setDefaults(
                array(
                    'area' => 'Authorization',
                    'action' =>'signin'
                )
            )
    )
    ->addRoute(
        'logout',
        RouterTransparentRule::create('/logout')
            ->setDefaults(
                array(
                    'area' => 'Authorization',
                    'action' => 'logout'
                )
            )
    )
    ->addRoute(
        'send code',
        RouterTransparentRule::create('/sendcode')
            ->setDefaults(
                array(
                    'area' => 'Authorization',
                    'action' => 'sendCode'
                )
            )
    )
    /** Articles */
    ->addRoute(
        'articles list',
        RouterTransparentRule::create('/articles/:responseType')
            ->setDefaults(
                array(
                    'area' => 'Articles',
                    'action' => 'index',
                    'responseType' => null
                )
            )
    )

    ->addRoute(
        'article editor',
        RouterTransparentRule::create('/articles/editor/:responseType')
            ->setDefaults(
                array(
                    'area' => 'Articles',
                    'action' => 'editor',
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'article add',
        RouterTransparentRule::create('/articles/add/:responseType')
            ->setDefaults(
                array(
                    'area' => 'Articles',
                    'action' => 'addDraft',
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'article get',
        RouterTransparentRule::create('/articles/get/:articleId/:responseType/')
            ->setRequirements(
                array(
                    'articleId' => '\d+'
                )
            )
            ->setDefaults(
                array(
                    'area' => 'Articles',
                    'action' => 'getDraft',
                    'articleId' => null,
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'article save',
        RouterTransparentRule::create('/articles/save/:responseType')
            ->setDefaults(
                array(
                    'area' => 'Articles',
                    'action' => 'saveDraft',
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'article list',
        RouterTransparentRule::create('/articles/list/:responseType')
        ->setDefaults(
                array(
                    'area' => 'Articles',
                    'action' => 'getList',
                    'responseType' => null
                )
            )

    )
 /** News  */
    ->addRoute(
        'news list',
        RouterTransparentRule::create('/news/:responseType')
            ->setDefaults(
                array(
                    'area' => 'News',
                    'action' => 'index',
                    'responseType' => null
                )
            )
    )

    ->addRoute(
        'news editor',
        RouterTransparentRule::create('/news/editor/:responseType')
            ->setDefaults(
                array(
                    'area' => 'News',
                    'action' => 'editor',
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'news add',
        RouterTransparentRule::create('/news/add/:responseType')
            ->setDefaults(
                array(
                    'area' => 'News',
                    'action' => 'addDraft',
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'news get',
        RouterTransparentRule::create('/news/get/:newsId/:responseType/')
            ->setRequirements(
                array(
                    'newsId' => '\d+'
                )
            )
            ->setDefaults(
                array(
                    'area' => 'News',
                    'action' => 'getDraft',
                    'articleId' => null,
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'news save',
        RouterTransparentRule::create('/news/save/:responseType')
            ->setDefaults(
                array(
                    'area' => 'News',
                    'action' => 'saveDraft',
                    'responseType' => null
                )
            )
    )
    ->addRoute(
        'news ',
        RouterTransparentRule::create('/news/list/:responseType')
        ->setDefaults(
                array(
                    'area' => 'News',
                    'action' => 'getList',
                    'responseType' => null
                )
            )

    )
    /** rubrics */
    ->addRoute(
        'get json rubrics',
        RouterTransparentRule::create('/rubrics/get')
            ->setDefaults(
                array(
                    'area' => 'Rubrics',
                    'action' => 'getJsonRubric'
                )
            )
    )

//    ->addRoute(
//        'Main Controller variables in action',
//        RouterTransparentRule::create('/action/:variables')
//            ->setRequirements(
//                array(
//                    'variables' => '\d+'
//                )
//            )
//            ->setDefaults(
//                array(
//                    'area' => 'Main',
//                    'action' => 'in',
//                    'variables' => null
//                )
//            )
//    )

;
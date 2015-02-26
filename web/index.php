<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 27.09.14
 * Time: 21:44
 */

//header('HTTP/1.0 404 Not Found');
if (!gc_enabled()) {
    gc_enable();
}


require_once '../app/include_project.inc.php';
require_once '../../platform/include_platform.inc.php';
require_once PATH_PROJECT . 'config/route.inc.php';

//error_reporting(E_ALL | E_STRICT);


error_reporting(-1);
ini_set('display_errors', 1);
//ini_set('session.save_path', PATH_PROJECT.'/sessions/');
ini_set('session.gc_maxlifetime', 10000);
ini_set('session.cookie_lifetime', 10000);
setlocale(LC_CTYPE, "ru_RU.UTF8");
setlocale(LC_TIME, "ru_RU.UTF8");
//date_default_timezone_set('America/Los_Angeles');

//mb_internal_encoding(DEFAULT_ENCODING);
//mb_regex_encoding(DEFAULT_ENCODING);
//require_once PATH_MISC . 'router.php';

//ini_set('xdebug.max_nesting_level',1000);



//var_dump(PATH_PLATFORM_CLASSES);die;


Logger::me()
    ->setLevel(LogLevel::finest())
    ->add(
        GrayLogLogger2::create(GraylogPublisher::create(GRAYLOG_HOST))
            ->setFacility(getenv('PROJECT_SERVER_TYPE'))
    );

try {
    Session::start();

    Platform::create()->init();

    $request = HttpRequest::create()
        ->setGet($_GET)
        ->setPost($_POST)
        ->setCookie($_COOKIE)
        ->setServer($_SERVER)
        ->setFiles($_FILES);

    if (!empty($_SESSION)) {
        $request->setSession($_SESSION);
    }

    PlatformRequestHelper::me()->setHttpRequest($request);

    $request = RouterRewrite::me()
        ->route($request);

    $application = WebApplication::create()
        ->dropVar(WebApplication::OBJ_REQUEST)
        ->setRequest($request)
        ->setPathWeb(PATH_PROJECT_WEB)
        ->setPathController(PATH_PROJECT_CONTROLLERS)
        ->setPathTemplate(PATH_PROJECT_TEMPLATES)
        ->setPathTemplateDefault(PATH_PROJECT_TEMPLATES)
        ->setServiceLocator(ServiceLocator::create())
        ->add(WebAppBufferHandler::create())
        ->add(
            WebAppSessionHandler::create()
                ->setCookieDomain(COOKIE_HOST_NAME)
                ->setSessionName(SESSION_HOST_NAME)
        )
        ->add(WebAppControllerResolverHandler::create())
        ->add(WebAppControllerHandler::create())
        ->add(WebAppViewHandler::create());

    $application->run();
} catch (Exception $e) {
    Logger::me()->exception($e);
}

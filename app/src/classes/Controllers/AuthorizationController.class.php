<?php
/***************************************************************************
 *   Контроллер авторизации                                                *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/

class AuthorizationController extends ProjectMethodMappedController
{

    protected $error = array();

    private $viewName = 'authorization/index';

    protected $captcha = NULL;

    protected $fatalErrorCode = FALSE;

    /**
     * @param boolean $fatalErrorCode
     */
    public function setFatalErrorCode($fatalErrorCode)
    {
        $this->fatalErrorCode = $fatalErrorCode;
    }

    /**
     * @return boolean
     */
    public function getFatalErrorCode()
    {
        return $this->fatalErrorCode;
    }

    /**
     * @param null $captcha
     */
    public function setCaptcha($captcha)
    {
        $this->captcha = $captcha;
    }

    /**
     * @return null
     */
    public function getCaptcha()
    {
        return $this->captcha;
    }


    /**
     * return view Name
     *
     * @return string
     */
    protected function getViewName()
    {
        return $this->viewName;
    }

    /**
     * @param $field
     * @param $errorText
     */
    public function setError($field, $errorText)
    {
        $this->error[$field] = $errorText;
    }

    /**
     * @return array
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * Индексная станица авторизации
     *
     * @return ModelAndView
     */
    public function indexAction()
    {
        return
            ModelAndView::create()
                ->setModel($this->getModel())
                ->setView($this->getViewName());
    }

    /**
     * Авторизация
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function signInAction(HttpRequest $request)
    {
        try {
            Session::assign('access', FALSE);

            $config = ProjectConfig::create()->setConfig('project');

            $form = $this->getValidatedForm($request->getPost())->import($request->getPost());

            PlatformRequestHelper::me()
                ->getAdminAuthLogsRequest()
                ->setIp($request->getServerVar('REMOTE_ADDR'))
                ->setEntryAt(TimestampTZ::makeNow());

            if (!empty($request->getPost()['captcha'])) {
                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setCaptcha($request->getPostVar('captcha'))
                    ->setLogin($request->getPostVar('login'))
                    ->setPassword($request->getPostVar('password'));

                if ($form->getError('captcha'))
                    $this->setError('captcha', $form->getTextualErrorFor('captcha'));

                if (
                    strtoupper($request->getPostVar('captcha')) != Session::get('captcha')
                    && empty($this->getError()['captcha'])
                )
                    $this->setError('captcha', PlatformAuthAdminErrorEnum::getErrorCaptchaNoEqImages()->getName());
            }

            $generationText = PlatformGenerator::create()->upStrNum(
                $config->getItemConfig('captcha')->getItem('symbol_count')
            );

            Session::assign('captcha', $generationText);

            $this->setCaptcha(
                PlatformCaptcha::create()
                    ->init($config)
                    ->generateСaptcha($generationText)
            );

            if (PlatformAuthAdminProcessor::isBlackList($request)) {
                $this->setError('ipBlackList', PlatformAuthAdminErrorEnum::getErrorIpAddressInBlackList()->getName());

                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setLogin($request->getPostVar('login'))
                    ->setPassword($request->getPostVar('password'))
                    ->setSuccessful(FALSE)
                    ->setBlockedIp(TRUE)
                    ->setBlackListId(PlatformUsersBlackIpList::getIdByIp($request->getServerVar('REMOTE_ADDR')));
            }

            if (
                PlatformLogsAdminAuthLogs::checkingQuantityInputs(
                    $request->getServerVar('REMOTE_ADDR'),
                    TimestampTZ::makeNow()->modify(
                        PlatformMathString::minus($config->getItemConfig('block_time_interval'))
                    ),
                    $config->getItemConfig('number_failed_to_block'))
                && empty($this->getError()['ipBlackList'])
                && PlatformAuthAdminProcessor::isWhiteList($request) == FALSE
            ) {
                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setDateBlockingIp(TimestampTZ::makeNow());

                PlatformAuthAdminProcessor::addIpBlackList(
                    $request->getServerVar('REMOTE_ADDR'),
                    TimestampTZ::makeNow()->modify(
                        PlatformMathString::plus($config->getItemConfig('blocked_ip_time'))
                    )
                );
            }

            if (
                $form->getError('login')
                && empty($this->getError()['ipBlackList'])
                && empty($this->getError()['captcha'])
            ) {
                $this->setError('login', $form->getTextualErrorFor('login'));

                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setLogin($request->getPostVar('login'))
                    ->setPassword($request->getPostVar('password'))
                    ->setSuccessful(FALSE);
            }

            if (
                $form->getError('password')
                && empty($this->getError()['login'])
            ) {
                $this->setError('password', $form->getTextualErrorFor('password'));

                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setLogin($request->getPostVar('login'))
                    ->setPassword($request->getPostVar('password'))
                    ->setSuccessful(FALSE);
            }

            $authAdminRequest = PlatformAuthAdminRequest::create()
                ->setLogin($form->getValue('login'))
                ->setMd5Password(md5($form->getValue('password')))
                ->setUserIp($request->getServerVar('REMOTE_ADDR'));

            if (
                !PlatformAuthAdminProcessor::create()->checkUser($authAdminRequest)->isResult()
                && empty($this->getError()['login'])
                && empty($this->getError()['password'])
                && empty($this->getError()['ipBlackList'])
                && empty($this->getError()['captcha'])
            ) {
                $this->setError('noUser', PlatformAuthAdminErrorEnum::gerErrorNoUser()->getName());

                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setLogin($request->getPostVar('login'))
                    ->setPassword($request->getPostVar('password'))
                    ->setSuccessful(FALSE);
            }

            if (
                !PlatformAuthAdminProcessor::create()->authorizedUser($authAdminRequest)->isResult()
                && empty($this->getError())
            ) {
                $this->setError('authError', PlatformAuthAdminErrorEnum::getErrorNoAuth()->getName());

                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setSystemUser(TRUE)
                    ->setAdminId(PlatformAuthAdminProcessor::create()->getAdminId($authAdminRequest))
                    ->setSuccessful(FALSE);
            }

            if (PlatformAuthAdminProcessor::isWhiteList($request) == TRUE)
                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setWhiteIpListId(
                        PlatformUsersWhiteIpList::dao()->getByIp($request->getServerVar('REMOTE_ADDR'))->getId()
                    )
                    ->setSuccessful(TRUE);

            if (!is_null(PlatformRequestHelper::me()->getAdminAuthLogsRequest()->getSuccessful()))
                PlatformAuthAdminProcessor::saveLog(
                    PlatformRequestHelper::me()->getAdminAuthLogsRequest()
                );

            if (!empty($this->getError()))
                return ModelAndView::create()
                    ->setModel($this->getModel())
                    ->setView($this->getViewName());

            if (PlatformAuthAdminProcessor::isWhiteList($request) == FALSE) {
                return $this->sendCode($authAdminRequest);
            }

            PlatformAuthAdminProcessor::saveLog(
                PlatformRequestHelper::me()
                    ->getAdminAuthLogsRequest()
                    ->setAdminId(PlatformAuthAdminProcessor::create()->getAdminId($authAdminRequest))
                    ->setSystemUser(TRUE)
                    ->setSuccessful(TRUE)
            );

            Session::assign('access', TRUE);

            return
                ModelAndView::create()
                    ->setModel(Model::create())
                    ->setView(CleanRedirectView::create('/'));
        } catch (Exception $e) {
            Logger::me()->exception($e);
        }
        return
            ModelAndView::create()
                ->setModel(Model::create())
                ->setView(CleanRedirectView::create('/'));
    }


    /**
     * Отправка сообщения с кодом на соответствующий сервис SMS XMPP
     *
     * @param PlatformAuthAdminRequest $request
     * @return ModelAndView
     */
    private function sendCode(PlatformAuthAdminRequest $request)
    {
        $code = PlatformGenerator::create()->num(5);

        PlatformSendAdminCodeProcessors::create()->send(
            PlatformSendCodeRequest::create()
                ->setType(PlatformUsersAdminCodeTypeEnum::smsServices())
                ->setCode($code)
        );

        PlatformRequestHelper::me()->getAdminAuthLogsRequest()
            ->setAdminId(PlatformAuthAdminProcessor::create()->getAdminId($request))
            ->setSystemUser(TRUE)
            ->setSuccessful(FALSE)
            ->setAdminCodeId(
                PlatformUsersAdminCode::dao()
                    ->getCodeByUidAndCodeAndActive(
                        Session::get('uId'),
                        $code
                    )
                    ->getId()
            );

        PlatformAuthAdminProcessor::saveLog(
            PlatformRequestHelper::me()->getAdminAuthLogsRequest()
        );

        return
            ModelAndView::create()
                ->setModel($this->getModelCode())
                ->setView('authorization/sendAuthorizationCode');
    }

    /**
     * Проверка вводимого кода
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function sendCodeAction(HttpRequest $request)
    {
        try {
            $form = $this->getValidatedFormCode()->import($request->getPost());

            if ($form->getError('code'))
                $this->setError('code', $form->getTextualErrorFor('code'));

            if (
                PlatformAuthAdminProcessor::checkAdminCode($request->getPostVar('code')) == FALSE
                && empty($this->getError()['code'])
            )
                $this->setFatalErrorCode(TRUE);

            if (
                !empty($this->getError())
                || $this->getFatalErrorCode()
            )
                return ModelAndView::create()
                    ->setModel($this->getModelCode())
                    ->setView('authorization/sendAuthorizationCode');

            Session::assign('access', TRUE);

            return
                ModelAndView::create()
                    ->setModel(Model::create())
                    ->setView(CleanRedirectView::create('/'));
        } catch (Exception $e) {
            /**  */
        }
        return
            ModelAndView::create()
                ->setModel(Model::create())
                ->setView(CleanRedirectView::create('/auth'));
    }

    /**
     * Выход
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function logoutAction(HttpRequest $request)
    {
        try {
            PlatformAuthAdminProcessor::create()->logout();
        } catch (Exception $e) {
            /** */
        }
        return
            ModelAndView::create()
                ->setModel(Model::create())
                ->setView(CleanRedirectView::create('/auth'));
    }

    /**
     * Валидация формы авторизации
     *
     * @param HttpRequest $request
     * @return Form
     */
    protected function getValidatedForm($request)
    {
        $form = Form::create()
            ->add(
                Primitive::string('login')
                    ->setMin(5)
                    ->setMax(32)
                    ->required()
            )
            ->addCustomLabel('login', Form::WRONG, PlatformAuthAdminErrorEnum::getErrorLogin()->getName())
            ->addMissingLabel('login', PlatformAuthAdminErrorEnum::getErrorRequiredLogin()->getName())
            ->add(
                Primitive::string('password')
                    ->setMin(5)
                    ->setMax(32)
                    ->required()
            )
            ->addCustomLabel('password', Form::WRONG, PlatformAuthAdminErrorEnum::getErrorPassword()->getName())
            ->addMissingLabel('password', PlatformAuthAdminErrorEnum::getErrorRequiredPassword()->getName());

        if (!empty($request['captcha']))
            $form->add(
                Primitive::string('captcha')
                    ->setMin(5)
                    ->setMax(5)
                    ->required()
            )
                ->addCustomLabel('captcha', Form::WRONG, PlatformAuthAdminErrorEnum::getErrorCaptcha()->getName())
                ->addMissingLabel('captcha', PlatformAuthAdminErrorEnum::getErrorRequiredCaptcha()->getName());

        return $form;
    }

    /**
     * Форма валидации html формы отправки кода
     *
     * @return Form
     */
    public function getValidatedFormCode()
    {
        return Form::create()
            ->add(
                Primitive::string('code')
                    ->setMin(5)
                    ->setMax(5)
                    ->required()
            )
            ->addCustomLabel('code', Form::WRONG, PlatformAuthAdminErrorEnum::getErrorCode()->getName())
            ->addMissingLabel('code', PlatformAuthAdminErrorEnum::getErrorRequiredCode()->getName());
    }


    /**
     * @return Model
     */
    public function getModel()
    {
        return Model::create()
            ->set('error', $this->getError())
            ->set('captcha', $this->getCaptcha());
    }

    /**
     * @return Model
     */
    public function getModelCode()
    {
        return Model::create()
            ->set('error', $this->getError())
            ->set('fatal', $this->getFatalErrorCode());
    }

    protected function initiateMisc()
    {
        $this->setDefaultAction('signin');
        $this->setViewResolver(PhpViewResolver::create(PATH_PROJECT_TEMPLATES, EXT_TPL));
    }


    /**
     * Мапинг методов конроллера
     * Можно вернуть пустой массив если брать с учетом
     * что экшен будет тот который прописан в роут конфиге
     *
     * @return mixed
     */
    protected function /* array */
    getMapping()
    {
        return array(
            'index' => 'indexAction',
            'signin' => 'signInAction',
            'logout' => 'logoutAction',
            'sendCode' => 'sendCodeAction'
        );
    }
}
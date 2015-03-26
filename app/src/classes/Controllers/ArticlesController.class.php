<?php

/***************************************************************************
 *   Статьи                                                                *
 * @author Schon Dewid  2015                                               *
 ***************************************************************************/
class ArticlesController extends ProjectAuthMappedController
{

    use ResponseView;

    /** @var  Form $form */
    protected $form;

    /** @var  Module */
    protected $module;

    /**
     * @param mixed $form
     */
    public function setForm(Form $form)
    {
        $this->form = $form;
    }

    /**
     * @return Form
     */
    public function getForm()
    {
        return $this->form;
    }

    /**
     * @return Module
     */
    protected function getModule()
    {
        if (is_null($this->module))
            $this->module = Module::create()->setModule(ModulesEnum::article());
        return $this->module;
    }


    public function indexAction(HttpRequest $request)
    {
        return ModelAndView::create()
            ->setView('articles/articles')
            ->setModel(Model::create());
    }

    /**
     * @param HttpRequest $request
     * @param ProjectResponseView $responseView
     * @return ModelAndView
     */
    public function editorAction(HttpRequest $request, ProjectResponseView $responseView = NULL)
    {
        if (is_null($responseView))
            $responseView =
                ProjectResponseView::create()
                    ->setOperation('add')
                    ->setData('titlePage', PlatformArticleTitleEnum::addArticle()->getName());

        return $this->getModelAndView(
            $responseView
                ->setTpl('articles/editor')
        );
    }

    /**
     * Добавить новый черновик
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function addDraftAction(HttpRequest $request)
    {
        if (!empty($request->getPostVar('articleId')))
            return $this->saveDraftAction($request);

        /** @var  ProjectResponseView $responseView */
        $responseView = ProjectResponseView::create();
        $responseView->setOperation('add');

        $this->setForm(
            $this
                ->getValidatedFormSaveArticles()
                ->import($request->getPost())
        );


        $responseView->setDataArray($request->getPost());

        if (empty($rubric = $this->getRubricFromRequest($request)))
            $responseView->setError('rubrics', PlatformSaveArticleErrorEnum::getErrorRequiredRubric()->getName());

        if ($this->getForm()->getError('title'))
            $responseView->setError('title', $this->getForm()->getTextualErrorFor('title'));

        if ($this->getForm()->getError('anons'))
            $responseView->setError('anons', $this->getForm()->getTextualErrorFor('anons'));

        if ($this->getForm()->getError('text'))
            $responseView->setError('text', $this->getForm()->getTextualErrorFor('text'));

        if ($this->getForm()->getError('published_at'))
            $responseView->setError('published_at', $this->getForm()->getTextualErrorFor('published_at'));

        if ($this->getForm()->getError('meta_description'))
            $responseView->setError('meta_description', $this->getForm()->getTextualErrorFor('meta_description'));

        if ($this->getForm()->getError('meta_keywords'))
            $responseView->setError('meta_keywords', $this->getForm()->getTextualErrorFor('meta_keywords'));

        if ($this->getForm()->getError('author'))
            $responseView->setError('author', $this->getForm()->getTextualErrorFor('author'));

        if (!empty($responseView->getError()))
            return $this->editorAction($request, $responseView->setSuccess(FALSE));

        $createdAt = TimestampTZ::makeNow();

        $this->getModule()->getModuleObject()->setRequest(
            ModuleArticleAddOperationRequest::create()
                ->setAnons($this->getForm()->get('anons')->getValue())
                ->setTitle($this->getForm()->get('title')->getValue())
                ->setProjectId($this->getProject()->getId())
                ->setText($this->getForm()->get('text')->getValue())
                ->setCreatedAt($createdAt)
                ->setRubrics(Hstore::make($this->getRubricFromRequest($request)))
                ->setPublishedAt($this->getForm()->get('published_at')->getValue())
                ->setMetaDescription($this->getForm()->get('meta_description')->getValue())
                ->setMetaKeywords($this->getForm()->get('meta_keywords')->getValue())
                ->setAuthor($this->getForm()->get('author')->getValue())
                ->setAdminId($this->getAdmin()->getId())
        );

        $this->getModule()->init(ArticleOperationEnum::add());

        /** @var ModuleArticleAddOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getResponse();
        return $this->getModelAndView(
            ProjectResponseView::create()
                ->setMessage('resultMessage', PlatformArticleMessageEnum::saveMessage()->getName())
                ->setData('title', PlatformArticleMessageEnum::saveTitle()->getName())
                ->setData('articleId', $response->getArticleId())
                ->setData('createdAt', $createdAt)
                ->setTpl('articles/message')
        );
    }

    /**
     * Обновить существующий черновик
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function saveDraftAction(HttpRequest $request)
    {
        /** @var  ProjectResponseView $responseView */
        $responseView = ProjectResponseView::create();

        $this->setForm(
            $this
                ->getValidatedFormSaveArticles()
                ->add(Primitive::string('articleId')->required())
                ->addMissingLabel('articleId', 'No request Update')
                ->import($request->getPost())
        );

        $responseView->setDataArray($request->getPost());

        if (empty($rubric = $this->getRubricFromRequest($request)))
            $responseView->setError('rubrics', PlatformSaveArticleErrorEnum::getErrorRequiredRubric()->getName());

        if ($this->getForm()->getError('text'))
            $responseView->setError('text', $this->getForm()->getTextualErrorFor('text'));

        if ($this->getForm()->getError('articleId'))
            $responseView->setError('articleId', $this->getForm()->getTextualErrorFor('articleId'));

        if ($this->getForm()->getError('published_at'))
            $responseView->setError('published_at', $this->getForm()->getTextualErrorFor('published_at'));

        if ($this->getForm()->getError('meta_description'))
            $responseView->setError('meta_description', $this->getForm()->getTextualErrorFor('meta_description'));

        if ($this->getForm()->getError('meta_keywords'))
            $responseView->setError('meta_keywords', $this->getForm()->getTextualErrorFor('meta_keywords'));

        if ($this->getForm()->getError('author'))
            $responseView->setError('author', $this->getForm()->getTextualErrorFor('author'));

        if (!empty($responseView->getError()))
            return $this->editorAction($request, $responseView->setSuccess(FALSE));

        $this->getModule()->getModuleObject()->setRequest(
            ModuleArticleAddOperationRequest::create()
                ->setArticleId($this->getForm()->get('articleId')->getValue())
                ->setAnons($this->getForm()->get('anons')->getValue())
                ->setTitle($this->getForm()->get('title')->getValue())
                ->setProjectId($this->getProject()->getId())
                ->setText($this->getForm()->get('text')->getValue())
                ->setCreatedAt(TimestampTZ::makeNow())
                ->setRubrics(Hstore::make($this->getRubricFromRequest($request)))
                ->setPublishedAt($this->getForm()->get('published_at')->getValue())
                ->setMetaDescription($this->getForm()->get('meta_description')->getValue())
                ->setMetaKeywords($this->getForm()->get('meta_keywords')->getValue())
                ->setAuthor($this->getForm()->get('author')->getValue())
                ->setAdminId($this->getAdmin()->getId())
        );

        $this->getModule()->init(ArticleOperationEnum::save());

        /** @var  ModuleArticleSaveOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getRequest();

        return $this->getModelAndView(
            ProjectResponseView::create()
                ->setMessage('resultMessage', PlatformArticleMessageEnum::saveTitle()->getName())
                ->setData('title', PlatformArticleMessageEnum::saveMessage()->getName())
                ->setData('articleId', $response->getArticleId())
                ->setData('createdAt', $response->getModifiedAt())
                ->setTpl('articles/message')
        );
    }

    /**
     * Получить черновик по id статьи
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function getDraftAction(HttpRequest $request)
    {
        $rubrics = array();
        $this->getModule()->getModuleObject()->setRequest(
            ModuleArticleGetOperationRequest::create()
                ->setArticleId($request->getAttachedVar('articleId'))
                ->setProjectId($this->getProject()->getId())
        );

        $this->getModule()->init(ArticleOperationEnum::get());

        /** @var ModuleArticleGetOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getResponse();
        $responseView = ProjectResponseView::create();

        $responseView
            ->setData('articleId', $response->getArticleId())
            ->setData('title', $response->getTitle())
            ->setData('anons', $response->getAnons())
            ->setData('text', $response->getText())
            ->setData('published_at', $response->getPublishedAt()->toFormatString('Y-m-d H:i'))
            ->setData('meta_description', $response->getMetaDescription())
            ->setData('author', $response->getAuthor())
            ->setData('meta_keywords', $response->getMetaKeywords());

        foreach ($response->getRubrics()->getList() as $k => $v)
            $rubrics[$k] = array(
                'short_name' => PlatformCommonRubric::dao()->getById($v)->getRubricData()->getShortName(),
                'name' => PlatformCommonRubric::dao()->getById($v)->getName(),
            );

        $responseView->setData('rubrics', $rubrics);

        $responseView->setOperation('save');
        $responseView->setData('titlePage', PlatformArticleTitleEnum::saveAticle()->getName());

        return
            $this->editorAction(
                $request,
                $responseView
            );
    }

    /**
     * Установка правил валидации формы
     *
     * @return Form
     */
    protected function getValidatedFormSaveArticles()
    {
        return Form::create()
            ->add(Primitive::string('title')->required())
            ->addMissingLabel('title', PlatformSaveArticleErrorEnum::getErrorRequiredTitle()->getName())
            ->add(Primitive::string('anons')->required())
            ->addMissingLabel('anons', PlatformSaveArticleErrorEnum::getErrorRequiredAnons()->getName())
            ->add(Primitive::string('text')->required())
            ->addMissingLabel('text', PlatformSaveArticleErrorEnum::getErrorRequiredText()->getName())
            ->add(Primitive::timestampTZ('published_at')->required())
            ->addMissingLabel('published_at', PlatformSaveArticleErrorEnum::getErrorRequiredPublishedAt()->getName())
            ->add(Primitive::string('meta_description')->setMax(256)->required())
            ->addCustomLabel('meta_description', Form::WRONG, PlatformSaveArticleErrorEnum::getErrorMetaDescription()->getName())
            ->addMissingLabel('meta_description', PlatformSaveArticleErrorEnum::getErrorRequiredMetaDescription()->getName())
            ->add(Primitive::string('meta_keywords')->setMax(256)->required())
            ->addCustomLabel('meta_keywords', Form::WRONG, PlatformSaveArticleErrorEnum::getErrorMetaKeywords()->getName())
            ->addMissingLabel('meta_keywords', PlatformSaveArticleErrorEnum::getErrorRequiredMetaKeywords()->getName())
            ->add(Primitive::string('author')->required())
            ->addMissingLabel('author', PlatformSaveArticleErrorEnum::getErrorRequiredAuthor()->getName());
    }

    /**
     * Получаю рубрики из отправленной формы в виде массива
     *
     * @param HttpRequest $request
     * @return array
     */
    protected function getRubricFromRequest(HttpRequest $request)
    {
        $result = array();
        for ($i = 1; $i <= 3; $i++) {
            try {
                $result['rubric_' . $i] =
                    PlatformCommonRubric::dao()->getByName($request->getPostVar('rubric_' . $i))->getId();
            } catch (BaseException $e) {
                continue;
            }
        }
        return $result;
    }

    /**
     * Получение списка статей можно передать фильтр для поиска
     * пока предпологается сделать так
     *
     * @param HttpRequest $request
     * @return ModelAndView
     */
    public function getListAction(HttpRequest $request)
    {
        $requestModule = ModuleArticleSearchOperationRequest::create();

        $this->setForm($this->getValidatedSearchForm()->import($request->getGet()));

        $this->getModule()->getModuleObject()->setRequest(
            $requestModule
                ->setDraw($this->getForm()->get('draw')->getValue())
                ->setOffset($this->getForm()->get('start')->getValue())
                ->setLimit($this->getForm()->get('length')->getValue())
                ->setToCreatedAt($this->getForm()->get('to_created_at')->getValue())
                ->setOfCreatedAt($this->getForm()->get('of_created_at')->getValue())
                ->setToModifiedAt($this->getForm()->get('to_modified_at')->getValue())
                ->setOfModifiedAt($this->getForm()->get('of_modified_at')->getValue())
                ->setToPublishedAt($this->getForm()->get('to_published_at')->getValue())
                ->setOfPublishedAt($this->getForm()->get('of_published_at')->getValue())
                ->setTitle($this->getForm()->get('title')->getValue())
                ->setAnons($this->getForm()->get('anons')->getValue())
                ->setText($this->getForm()->get('text')->getValue())
                ->setProjectId($this->getProject()->getId())
        );

        $this->getModule()->init(ArticleOperationEnum::search());

        /** @var ModuleArticleSearchOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getResponse();

        return ModelAndView::create()
            ->setModel(
                Model::create()
                    ->set('draw', $response->getDraw())
                    ->set('recordsTotal', $response->getRecordsTotal())
                    ->set('recordsFiltered', $response->getRecordsFiltered())
                    ->set('data', $response->getData())
            )
            ->setView(JsonView::create());
    }


    /**
     * Форма валидации поиска
     *
     * @return Form
     */
    public function getValidatedSearchForm()
    {
        return Form::create()
            ->add(Primitive::integer('draw')->required())
            ->add(Primitive::integer('start')->required())
            ->add(Primitive::integer('length')->required())
            ->add(Primitive::string('title'))
            ->add(Primitive::string('anons'))
            ->add(Primitive::string('text'))
            ->add(Primitive::timestampTZ('of_created_at'))
            ->add(Primitive::timestampTZ('to_created_at'))
            ->add(Primitive::timestampTZ('of_modified_at'))
            ->add(Primitive::timestampTZ('to_modified_at'))
            ->add(Primitive::timestampTZ('to_published_at'))
            ->add(Primitive::timestampTZ('of_published_at'));
    }


    /**
     * Мапинг методов конроллера
     * Можно вернуть пустой массив если брать с учетом
     * что экшен будет тот который прописан в роут конфиге
     *
     * @return mixed
     */
    protected function getMapping()
    {
        return array(
            'index' => 'indexAction',
            'editor' => 'editorAction',
            'getList' => 'getListAction',
            'dropArticle' => 'dropArticleAction',
            'addDraft' => 'addDraftAction',
            'saveDraft' => 'saveDraftAction',
            'getDraft' => 'getDraftAction',
        );
    }
}
<?php

/***************************************************************************
 *   Рубрики                                                               *
 * @author Schon Dewid  2015                                             *
 ***************************************************************************/
class RubricsController extends ProjectAuthMappedController
{
    /**  */
    use ResponseView;
    use StringHelper;

    /** @var Module */
    protected $module = null;

    /** @var  Form */
    protected $form;


    /**
     * @return Form
     */
    protected function getForm()
    {
        return $this->form;
    }

    /**
     * @param Form $form
     */
    protected function setForm(Form $form)
    {
        $this->form = $form;
    }

    /**
     * @return Module
     */
    protected function getModule()
    {
        if (is_null($this->module))
            $this->module = Module::create()->setModule(ModulesEnum::rubrics());
        return $this->module;
    }


    /**
     * @param HttpRequest $request
     * @return JsonView|ModelAndView
     */
    public function indexAction(HttpRequest $request)
    {
        return $this
            ->getModelAndView(
                ProjectResponseView::create()->setTpl('rubrics/index')
            );
    }


    public function addAction(HttpRequest $request)
    {
        /** @var  ProjectResponseView $responseView */
        $responseView = ProjectResponseView::create();
        $this->setForm(
            $this->getFormAddValidation()->import($request->getPost())
        );

        if ($this->getForm()->getError('short_name'))
            $responseView->setError('short_name', $this->getForm()->getTextualErrorFor('short_name'));

        if ($this->getForm()->getError('description'))
            $responseView->setError('description', $this->getForm()->getTextualErrorFor('description'));

        if ($this->getForm()->getError('meta_description'))
            $responseView->setError('meta_description', $this->getForm()->getTextualErrorFor('meta_description'));

        if ($this->getForm()->getError('meta_keywords'))
            $responseView->setError('meta_keywords', $this->getForm()->getTextualErrorFor('meta_keywords'));

        if (!empty($responseView->getError()))
            return $this->getModelAndView($responseView->setSuccess(false));

        if (!empty($request->getPostVar('rubric_id')))
            return $this->saveRubricAction($request);

        $requestModule = ModuleRubricsAddOperationRequest::create();

        if (array_key_exists('parent', $request->getPost()))
            $requestModule->setParent($request->getPostVar('parent'));

        $this->getModule()->getModuleObject()->setRequest(
            $requestModule->setProjectId($this->getProject()->getId())
                ->setName(
                    ucfirst(
                        $this->transliterate(
                            $this->getForm()->get('short_name')->getValue()
                        )
                    )
                )
                ->setShortName($this->getForm()->get('short_name')->getValue())
                ->setCreatedAt(TimestampTZ::makeNow())
                ->setEnabled(true)
                ->setMetaKeywords($this->getForm()->get('meta_keywords')->getValue())
                ->setMetaDescription($this->getForm()->get('meta_description')->getValue())
                ->setDescription($this->getForm()->get('description')->getValue())
        );

        $this->getModule()->init(RubricsOperationEnum::add());
        return $this->getModelAndView($responseView->setSuccess(true));
    }

    public function saveRubricAction(HttpRequest $request)
    {
        $responseView = ProjectResponseView::create();
        $requestModule = ModuleRubricsSaveOperationRequest::create();

        if (array_key_exists('parent', $request->getPost()))
            $requestModule->setParent($request->getPostVar('parent'));

        $this->getModule()->getModuleObject()->setRequest(
            $requestModule
                ->setProjectId($this->getProject()->getId())
                ->setRubricId($request->getPostVar('rubric_id'))
                ->setName(
                    ucfirst(
                        $this->transliterate(
                            $this->getForm()->get('short_name')->getValue()
                        )
                    )
                )
                ->setShortName($this->getForm()->get('short_name')->getValue())
                ->setModifiedAt(TimestampTZ::makeNow())
                ->setEnabled(true)
                ->setMetaKeywords($this->getForm()->get('meta_keywords')->getValue())
                ->setMetaDescription($this->getForm()->get('meta_description')->getValue())
                ->setDescription($this->getForm()->get('description')->getValue())
        );

        $this->getModule()->init(RubricsOperationEnum::save());
        return $this->getModelAndView($responseView->setSuccess(true));
    }

    /**
     * @param HttpRequest $request
     * @return ModelAndView
     * @throws PlatfromModuleException
     */
    public function getRubricsAction(HttpRequest $request)
    {
        /** @var  ProjectResponseView $responseView */
        $responseView = ProjectResponseView::create();

        $this
            ->getModule()
            ->getModuleObject()
            ->setRequest(
                ModuleRubricsGetAllListOperationRequest::create()
                    ->setProjectId($this->getProject()->getId())
            );

        $this->getModule()->init(RubricsOperationEnum::getAllList());

        /** @var ModuleRubricsGetAllListOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getResponse();

        foreach ($response->getData() as $key => $rubric) {
            if ($key == 0) continue;
            /** @var PlatformCommonRubric $rubric */
            $responseView->setData(
                $rubric->getName(),
                $this->replacedBySpace($rubric->getPath()) . $rubric->getRubricData()->getShortName()
            );
        };

        return $this->getModelAndView(
            $responseView
        );
    }


    /**
     * @param HttpRequest $request
     * @return ModelAndView
     * @throws PlatfromModuleException
     */
    public function getRubricsListAction(HttpRequest $request)
    {
        $this->setForm($this->getValidatedSearchForm()->import($request->getGet()));

        $this->getModule()->getModuleObject()->setRequest(
            ModuleRubricsSearchOperationRequest::create()
                ->setDraw($this->getForm()->get('draw')->getValue())
                ->setOffset($this->getForm()->get('start')->getValue())
                ->setLimit($this->getForm()->get('length')->getValue())
        );

        $this->getModule()->init(RubricsOperationEnum::search());
        /** @var ModuleRubricsSearchOperationsResponse $response */
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

    public function getByIdAction(HttpRequest $request)
    {
        try {
            $responseView = ProjectResponseView::create();

            $this->getModule()->getModuleObject()->setRequest(
                ModuleRubricsGetOperationRequest::create()
                    ->setRubricId($request->getAttachedVar('id'))
            );

            $this->getModule()->init(RubricsOperationEnum::get());

            /** @var ModuleRubricsGetOperationResponse $responseModule */
            $responseModule = $this->getModule()->getModuleObject()->getResponse();

            $responseView
                ->setSuccess(true)
                ->setData('rubric_id', $responseModule->getRubricId())
                ->setData('short_name', $responseModule->getShortName())
                ->setData('description', $responseModule->getDescription())
                ->setData('meta_description', $responseModule->getMetaDescription())
                ->setData('meta_keywords', $responseModule->getMetaKeywords())
                ->setData('parent', $responseModule->getParentRubricName());

            return $this->getModelAndView($responseView);
        } catch (ObjectNotFoundException $e) {
            return $this->getModelAndView(
                ProjectResponseView::create()->setSuccess(false)
            );
        }
    }

    /**
     * @return Form
     */
    protected function getFormAddValidation()
    {
        return Form::create()
            ->add(Primitive::string('short_name')->required())
            ->addMissingLabel('short_name', PlatformRubricErrorEnum::getErrorRequiredShortName()->getName())
            ->add(Primitive::string('description')->required())
            ->addMissingLabel('description', PlatformRubricErrorEnum::getErrorRequiredDescription()->getName())
            ->add(Primitive::string('meta_description')->required())
            ->addMissingLabel('meta_description', PlatformRubricErrorEnum::getErrorRequiredMetaDescription()->getName())
            ->add(Primitive::string('meta_keywords')->required())
            ->addMissingLabel('meta_keywords', PlatformRubricErrorEnum::getErrorRequiredMetaKeywords()->getName());

    }

    /**
     * @return Form
     */
    protected function getValidatedSearchForm()
    {
        return Form::create()
            ->add(Primitive::integer('draw')->required())
            ->add(Primitive::integer('start')->required())
            ->add(Primitive::integer('length')->required());
    }

    /**
     * @param $path
     * @return string
     */
    protected function replacedBySpace($path)
    {
        return implode('', array_pad(array(), count(explode('.', $path)), '&nbsp&nbsp'));
    }


    /**
     * Мапинг методов конроллера
     * Можно вернуть пустой массив если брать с учетом
     * что экшен будет тот который прописан в роут конфиге
     *
     * @return array
     */
    protected function /* array */
    getMapping()
    {
        return [
            'index' => 'indexAction',
            'getRubrics' => 'getRubricsAction',
            'add' => 'addAction',
            'getRubricsList' => 'getRubricsListAction',
            'getById' => 'getByIdAction'
        ];
    }
}